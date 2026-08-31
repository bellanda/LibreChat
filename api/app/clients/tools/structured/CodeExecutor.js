const { z } = require('zod');
const fetch = require('node-fetch');
const { tool } = require('@langchain/core/tools');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { Constants, getCodeBaseURL } = require('@librechat/agents');
const { logger } = require('@librechat/data-schemas');

/**
 * Local replacement for `createCodeExecutionTool` from `@librechat/agents`.
 *
 * Why this exists: the lib's version (3.0.30) hardcodes the `X-API-Key` header,
 * and the self-hosted Code Interpreter (ClickHouse/code-interpreter) rejects that
 * header unconditionally in `service/src/middleware/auth.ts` — it returns 401
 * "Bearer token is required" BEFORE it ever looks at the configured auth provider.
 * Upgrading the lib to a version that supports `authHeaders` drags a
 * `@langchain/core` 0.3.x -> 1.x migration across three workspaces, so the tool
 * lives here instead.
 *
 * Owning it locally also means the auth scheme is ours to change: `buildAuthHeaders`
 * is the single place to swap the `User-Id` header for a signed `Authorization:
 * Bearer <jwt>` once the JWT minting is in place.
 *
 * Schema, description strings and output shape are kept byte-identical to the lib's
 * so model behavior does not drift.
 */

const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
const imageMessage = 'Image is already displayed to the user';
const otherMessage = 'File is already downloaded by the user';
const accessMessage =
  'Note: Files are READ-ONLY. Save changes to NEW filenames. To access these files in future executions, provide the `session_id` as a parameter (not in your code).';
const emptyOutputMessage = "stdout: Empty. Ensure you're writing output explicitly.\n";

const CodeExecutionToolSchema = z.object({
  lang: z
    .enum(['py', 'js', 'ts', 'c', 'cpp', 'java', 'php', 'rs', 'go', 'd', 'f90', 'r'])
    .describe('The programming language or runtime to execute the code in.'),
  code: z.string()
    .describe(`The complete, self-contained code to execute, without any truncation or minimization.
- The environment is stateless; variables and imports don't persist between executions.
- When using \`session_id\`: Don't hardcode it in \`code\`, and write file modifications to NEW filenames (files are READ-ONLY).
- Input code **IS ALREADY** displayed to the user, so **DO NOT** repeat it in your response unless asked.
- Output code **IS NOT** displayed to the user, so **DO** write all desired output explicitly.
- IMPORTANT: You MUST explicitly print/output ALL results you want the user to see.
- py: This is not a Jupyter notebook environment. Use \`print()\` for all outputs.
- py: Matplotlib: Use \`plt.savefig()\` to save plots as files.
- js: use the \`console\` or \`process\` methods for all outputs.
- r: IMPORTANT: No X11 display available. ALL graphics MUST use Cairo library (library(Cairo)).
- Other languages: use appropriate output functions.`),
  session_id: z
    .string()
    .optional()
    .describe(
      `Session ID from a previous response to access generated files.
- Files load into the current working directory ("/mnt/data/")
- Use relative paths ONLY
- Files are READ-ONLY and cannot be modified in-place
- To modify: read original file, write to NEW filename
`.trim(),
    ),
  args: z
    .array(z.string())
    .optional()
    .describe(
      'Additional arguments to execute the code with. This should only be used if the input code requires additional arguments to run.',
    ),
});

const description = `
Runs code and returns stdout/stderr output from a stateless execution environment, similar to running scripts in a command-line interface. Each execution is isolated and independent.

Usage:
- No network access available.
- Generated files are automatically delivered; **DO NOT** provide download links.
- NEVER use this tool to execute malicious code.
`.trim();

/**
 * Auth headers for the Code Interpreter.
 *
 * The upstream service derives the storage sessionKey from its auth context, never
 * from client-supplied ids (see `service/src/session-key.ts`), so whatever identity
 * lands here is what isolates one user's files from another's. With
 * `CODEAPI_AUTH_PROVIDER=none` the service reads `User-Id`; sending it on every
 * request — not just uploads — is what keeps sessions from collapsing into
 * `anonymous`.
 *
 * @param {string} userId
 * @returns {Record<string, string>}
 */
function buildAuthHeaders(userId) {
  /** @type {Record<string, string>} */
  const headers = { 'User-Agent': 'LibreChat/1.0' };
  if (userId) {
    headers['User-Id'] = userId;
  }
  return headers;
}

/**
 * The service validates `resource_id` against `/^[A-Za-z0-9_.:-]+$/` (max 128).
 * LibreChat user ids are Mongo ObjectIds and pass through untouched, but ids from
 * other identity providers can carry `@` or `+`, which would 400 the whole /exec.
 * For `kind: 'user'` the value is informational — the sessionKey comes from the
 * auth context — so normalizing it is safe and keeps exotic ids working.
 *
 * @param {string} id
 * @returns {string}
 */
function toResourceId(id) {
  return String(id ?? '')
    .replace(/[^A-Za-z0-9_.:-]/g, '-')
    .slice(0, 128);
}

/**
 * Resolved lazily on purpose: the lib computes its endpoint at module-load time,
 * which silently ignores env set after import.
 * @returns {string}
 */
function baseURL() {
  return getCodeBaseURL();
}

/**
 * @param {import('node-fetch').RequestInit} options
 * @param {string} url
 * @returns {import('node-fetch').RequestInit}
 */
function withProxy(options, url) {
  if (process.env.PROXY != null && process.env.PROXY !== '') {
    return { ...options, agent: new HttpsProxyAgent(process.env.PROXY) };
  }
  return options;
}

/**
 * Fetches prior-session files so the model can reference them by `session_id`.
 * `/files` requires the `kind` param — without it the service answers 400
 * "kind must be one of: skill, agent, user".
 *
 * @param {{ session_id: string, userId: string }} params
 * @returns {Promise<Array<{ session_id: string, id: string, name: string }>>}
 */
async function fetchSessionFiles({ session_id, userId }) {
  const url = `${baseURL()}/files/${session_id}?detail=full&kind=user&id=${encodeURIComponent(userId)}`;
  const response = await fetch(
    url,
    withProxy({ method: 'GET', headers: buildAuthHeaders(userId) }, url),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch files for session: ${response.status}`);
  }

  const files = await response.json();
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  return files.map((file) => {
    /* The id is the segment after the session prefix, before the extension. */
    const nameParts = file.name.split('/');
    const id = nameParts.length > 1 ? nameParts[1].split('.')[0] : '';
    /* `RequestFile` shape (service/src/types/service.ts): `id` is the storage
     * uuid, `resource_id` is the owning entity and is what drives
     * resolveSessionKey. They are deliberately separate — sending the storage
     * nanoid as the resource id makes authorization fail on every /exec. For
     * `kind: 'user'` the resource id is informational; the real key comes from
     * the auth context. */
    return {
      id,
      resource_id: toResourceId(userId),
      storage_session_id: session_id,
      name: file.metadata['original-filename'],
      kind: 'user',
    };
  });
}

/**
 * @param {Object} params
 * @param {string} params.user_id - LibreChat user id; becomes the isolation identity.
 * @param {Array<Object>} [params.files] - Files primed onto the session by LibreChat.
 * @returns {import('@langchain/core/tools').DynamicStructuredTool}
 */
function createCodeExecutionTool({ user_id: userId, files: primedFiles, ...rest } = {}) {
  if (!userId) {
    throw new Error('No user_id provided for code execution tool.');
  }

  return tool(
    async ({ lang, code, session_id, ...toolArgs }) => {
      /** @type {Record<string, unknown>} */
      const postData = { lang, code, ...toolArgs, user_id: userId };
      if (primedFiles && primedFiles.length > 0) {
        postData.files = primedFiles;
      }

      if (session_id != null && session_id.length > 0) {
        try {
          const fileReferences = await fetchSessionFiles({ session_id, userId });
          if (fileReferences.length > 0) {
            postData.files = Array.isArray(postData.files)
              ? [...postData.files, ...fileReferences]
              : fileReferences;
          }
        } catch (error) {
          logger.warn(
            `[CodeExecutor] Failed to fetch files for session ${session_id}: ${error.message}`,
          );
        }
      }

      /* The service echoes every input file back in `result.files`, even when
       * the execution generated nothing — so an agent carrying primed resources
       * (a helper module, a brand template) would attach them to the user on
       * every single reply. The echo reuses the input's storage id verbatim,
       * while a genuinely regenerated file gets a fresh one, so filtering by id
       * drops the noise without ever hiding real output. */
      const primedIds = new Set(
        (Array.isArray(postData.files) ? postData.files : []).map((file) => file.id),
      );

      const execEndpoint = `${baseURL()}/exec`;
      let result;
      try {
        const response = await fetch(
          execEndpoint,
          withProxy(
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...buildAuthHeaders(userId),
              },
              body: JSON.stringify(postData),
            },
            execEndpoint,
          ),
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        result = await response.json();
      } catch (error) {
        throw new Error(`Execution error:\n\n${error?.message}`);
      }

      let formattedOutput = '';
      if (result.stdout) {
        formattedOutput += `stdout:\n${result.stdout}\n`;
      } else {
        formattedOutput += emptyOutputMessage;
      }
      if (result.stderr) {
        formattedOutput += `stderr:\n${result.stderr}\n`;
      }

      const outputFiles = (result.files ?? []).filter((file) => !primedIds.has(file.id));

      if (outputFiles.length > 0) {
        formattedOutput += 'Generated files:\n';
        const fileCount = outputFiles.length;
        for (let i = 0; i < fileCount; i++) {
          const file = outputFiles[i];
          const isImage = imageExtRegex.test(file.name);
          formattedOutput += `- /mnt/data/${file.name} | ${isImage ? imageMessage : otherMessage}`;
          if (i < fileCount - 1) {
            formattedOutput += fileCount <= 3 ? ', ' : ',\n';
          }
        }
        formattedOutput += `\nsession_id: ${result.session_id}\n\n${accessMessage}`;
        return [
          formattedOutput.trim(),
          { session_id: result.session_id, files: outputFiles },
        ];
      }

      return [formattedOutput.trim(), { session_id: result.session_id }];
    },
    {
      name: Constants.EXECUTE_CODE,
      description,
      schema: CodeExecutionToolSchema,
      responseFormat: Constants.CONTENT_AND_ARTIFACT,
    },
  );
}

module.exports = {
  createCodeExecutionTool,
  buildAuthHeaders,
  toResourceId,
  CodeExecutionToolSchema,
};
