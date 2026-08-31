const path = require('path');
const { v4 } = require('uuid');
const axios = require('axios');
const { logger } = require('@librechat/data-schemas');
const { getCodeBaseURL } = require('@librechat/agents');
const { logAxiosError, getBasePath } = require('@librechat/api');
const {
  Tools,
  FileContext,
  FileSources,
  imageExtRegex,
  EToolResources,
  mergeFileConfig,
} = require('librechat-data-provider');
const { toResourceId } = require('~/app/clients/tools/structured/CodeExecutor');
const { primeSkillFiles } = require('~/server/services/Files/Code/skills');
const { filterFilesByAgentAccess } = require('~/server/services/Files/permissions');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');
const { convertImage } = require('~/server/services/Files/images/convert');
const { getBufferMetadata } = require('~/server/utils/files');
const { createFile, getFiles, updateFile } = require('~/models/File');

/** Note: code environment sessions expire 24 hours after creation */
const CODE_SESSION_TTL_MS = 86400000;

/**
 * Last-resort attachment: a live proxy straight to the code environment.
 *
 * This used to be the *primary* delivery path for every non-image output, which
 * made every generated .pptx/.xlsx depend on the code environment still holding
 * the bytes — and it silently dies after 24h. Files are now persisted into
 * LibreChat's own storage (see `processCodeOutput`), and this is only used when
 * that cannot happen: the configured strategy has no `saveBuffer`, the file is
 * over the size limit, or the download itself failed.
 *
 * @param {Object} params
 * @returns {{ filename: string, filepath: string, expiresAt: number, conversationId: string, toolCallId: string, messageId: string }}
 */
const createDownloadFallback = ({ id, name, session_id, conversationId, toolCallId, messageId }) => ({
  filename: name,
  filepath: `${getBasePath()}/api/files/code/download/${session_id}/${id}`,
  expiresAt: Date.now() + CODE_SESSION_TTL_MS,
  conversationId,
  toolCallId,
  messageId,
});

/**
 * Process OpenAI image files, convert to target format, save and return file metadata.
 * @param {ServerRequest} params.req - The Express request object.
 * @param {string} params.id - The file ID.
 * @param {string} params.name - The filename.
 * @param {string} params.apiKey - The code execution API key.
 * @param {string} params.toolCallId - The tool call ID that generated the file.
 * @param {string} params.session_id - The code execution session ID.
 * @param {string} params.conversationId - The current conversation ID.
 * @param {string} params.messageId - The current message ID.
 * @returns {Promise<MongoFile & { messageId: string, toolCallId: string } | { filename: string; filepath: string; expiresAt: number; conversationId: string; toolCallId: string; messageId: string } | undefined>} The file metadata or undefined if an error occurs.
 */
const processCodeOutput = async ({
  req,
  id,
  name,
  apiKey,
  toolCallId,
  conversationId,
  messageId,
  session_id,
}) => {
  const appConfig = req.config;
  const currentDate = new Date();
  const baseURL = getCodeBaseURL();
  const fileExt = path.extname(name);
  const isImage = Boolean(fileExt) && imageExtRegex.test(name);
  const fallbackParams = { id, name, session_id, conversationId, toolCallId, messageId };

  try {
    const formattedDate = currentDate.toISOString();
    /* Same contract as Code/crud.js: `kind`/`id` are mandatory, and the real
     * authorization comes from `User-Id` via the service's auth context. */
    const downloadParams = new URLSearchParams({ kind: 'user', id: req.user.id });
    const response = await axios({
      method: 'get',
      url: `${baseURL}/download/${session_id}/${id}?${downloadParams.toString()}`,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'LibreChat/1.0',
        'User-Id': req.user.id,
      },
      timeout: 15000,
    });

    const buffer = Buffer.from(response.data, 'binary');
    const file_id = v4();

    if (isImage) {
      const _file = await convertImage(req, buffer, 'high', `${file_id}${fileExt}`);
      const file = {
        ..._file,
        file_id,
        usage: 1,
        filename: name,
        conversationId,
        user: req.user.id,
        type: `image/${appConfig.imageOutputType}`,
        createdAt: formattedDate,
        updatedAt: formattedDate,
        source: appConfig.fileStrategy,
        context: FileContext.execute_code,
      };
      createFile(file, true);
      /** Note: `messageId` & `toolCallId` are not part of file DB schema; message object records associated file ID */
      return Object.assign(file, { messageId, toolCallId });
    }

    /* Everything else (pptx, xlsx, docx, pdf, csv, ...) is persisted into
     * LibreChat's own storage so the attachment outlives the code environment's
     * 24h session. */
    const fileConfig = mergeFileConfig(appConfig.fileConfig);
    const sizeLimit = fileConfig?.serverFileSizeLimit;
    if (sizeLimit && buffer.length > sizeLimit) {
      logger.warn(
        `[processCodeOutput] "${name}" is ${buffer.length} bytes, over the ${sizeLimit} limit; serving the code environment proxy link instead`,
      );
      return createDownloadFallback(fallbackParams);
    }

    const { saveBuffer } = getStrategyFunctions(appConfig.fileStrategy);
    if (!saveBuffer) {
      logger.warn(
        `[processCodeOutput] File strategy "${appConfig.fileStrategy}" has no saveBuffer; serving the code environment proxy link instead`,
      );
      return createDownloadFallback(fallbackParams);
    }

    const { bytes, type } = await getBufferMetadata(buffer);
    /* Stored under a uuid to keep user-supplied names out of the filesystem,
     * while `filename` preserves what the model called it. */
    const filepath = await saveBuffer({
      userId: req.user.id,
      buffer,
      fileName: `${file_id}${fileExt}`,
      basePath: 'uploads',
    });

    const file = {
      file_id,
      bytes,
      usage: 1,
      filename: name,
      filepath,
      conversationId,
      user: req.user.id,
      type: type && type !== 'unknown' ? type : 'application/octet-stream',
      createdAt: formattedDate,
      updatedAt: formattedDate,
      source: appConfig.fileStrategy,
      context: FileContext.execute_code,
    };
    await createFile(file, true);

    /* The client fetches `filepath` as an authenticated GET and turns the body
     * into a blob (see client useCodeOutputDownload). `file.filepath` is the
     * storage location, which is not reachable over HTTP — so the attachment
     * carries the generic download route instead, leaving the DB record's
     * storage path intact for `getDownloadStream`. */
    return {
      ...file,
      filepath: `${getBasePath()}/api/files/download/${req.user.id}/${file_id}`,
      messageId,
      toolCallId,
    };
  } catch (error) {
    logAxiosError({
      message: 'Error downloading code environment file',
      error,
    });
    /* Images previously returned undefined here, which dropped the attachment
     * entirely; non-images never reached this path because they short-circuited
     * before the download. Both now degrade to the proxy link instead of
     * silently producing no attachment at all. */
    return createDownloadFallback(fallbackParams);
  }
};

function checkIfActive(dateString) {
  const givenDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate - givenDate;
  const hoursPassed = timeDifference / (1000 * 60 * 60);
  return hoursPassed < 23;
}

/**
 * Retrieves the `lastModified` time string for a specified file from Code Execution Server.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.fileIdentifier - The identifier for the file (e.g., "session_id/fileId").
 * @param {string} params._apiKey - Unused; auth travels in the `User-Id` header now.
 * @param {string} params.userId - LibreChat user id, the isolation identity.
 *
 * @returns {Promise<string|null>}
 *          A promise that resolves to the `lastModified` time string of the file if successful, or null if there is an
 *          error in initialization or fetching the info.
 */
async function getSessionInfo(fileIdentifier, _apiKey, userId) {
  try {
    const baseURL = getCodeBaseURL();
    const [path, queryString] = fileIdentifier.split('?');
    const session_id = path.split('/')[0];

    let queryParams = {};
    if (queryString) {
      queryParams = Object.fromEntries(new URLSearchParams(queryString).entries());
    }
    /* Agent-scoped identifiers already carry `kind=agent&id=<agentId>`; anything
     * else is the uploading user's own bucket. */
    if (!queryParams.kind) {
      queryParams = { ...queryParams, kind: 'user', id: userId };
    }

    const response = await axios({
      method: 'get',
      url: `${baseURL}/files/${session_id}`,
      params: {
        detail: 'summary',
        ...queryParams,
      },
      headers: {
        'User-Agent': 'LibreChat/1.0',
        'User-Id': userId,
      },
      timeout: 5000,
    });

    return response.data.find((file) => file.name.startsWith(path))?.lastModified;
  } catch (error) {
    logAxiosError({
      message: `Error fetching session info: ${error.message}`,
      error,
    });
    return null;
  }
}

/**
 *
 * @param {Object} options
 * @param {ServerRequest} options.req
 * @param {Agent['tool_resources']} options.tool_resources
 * @param {string} [options.agentId] - The agent ID for file access control
 * @param {string} apiKey
 * @returns {Promise<{
 * files: Array<{ id: string; session_id: string; name: string }>,
 * toolContext: string,
 * }>}
 */
const primeFiles = async (options, apiKey) => {
  const { tool_resources, req, agentId } = options;
  const file_ids = tool_resources?.[EToolResources.execute_code]?.file_ids ?? [];
  const agentResourceIds = new Set(file_ids);
  const resourceFiles = tool_resources?.[EToolResources.execute_code]?.files ?? [];

  // Get all files first
  const allFiles = (await getFiles({ file_id: { $in: file_ids } }, null, { text: 0 })) ?? [];

  // Filter by access if user and agent are provided
  let dbFiles;
  if (req?.user?.id && agentId) {
    dbFiles = await filterFilesByAgentAccess({
      files: allFiles,
      userId: req.user.id,
      role: req.user.role,
      agentId,
    });
  } else {
    dbFiles = allFiles;
  }

  dbFiles = dbFiles.concat(resourceFiles);

  const files = [];
  const sessions = new Map();
  let toolContext = '';

  /* Skill packs go in before the user's own files, for two reasons: the sandbox
   * lists them in that order in the working directory, and the tenant-wide
   * baseline reads better ahead of "just attached by user" in the prompt.
   * These are `kind: 'skill'`, so no agent has to carry them as attachments. */
  const skills = primeSkillFiles();
  for (const file of skills.files) {
    if (!toolContext) {
      toolContext = `- Note: The following files are available in the "${Tools.execute_code}" tool environment:`;
    }
    toolContext += `\n\t- /mnt/data/${file.name}`;
    files.push(file);
  }

  for (let i = 0; i < dbFiles.length; i++) {
    const file = dbFiles[i];
    if (!file) {
      continue;
    }

    if (file.metadata.fileIdentifier) {
      const [path, queryString] = file.metadata.fileIdentifier.split('?');
      const [session_id, id] = path.split('/');

      let queryParams = {};
      if (queryString) {
        queryParams = Object.fromEntries(new URLSearchParams(queryString).entries());
      }
      /* Agent-scoped identifiers carry `kind=agent&id=<agentId>`; `entity_id` is
       * the legacy spelling from metadata written before that change. Anything
       * without a scope belongs to the requesting user. */
      const kind = queryParams.kind ?? (queryParams.entity_id ? 'agent' : 'user');
      const resourceId =
        kind === 'agent'
          ? (queryParams.id ?? queryParams.entity_id)
          : toResourceId(options.req.user.id);

      const pushFile = () => {
        if (!toolContext) {
          toolContext = `- Note: The following files are available in the "${Tools.execute_code}" tool environment:`;
        }
        toolContext += `\n\t- /mnt/data/${file.filename}${
          agentResourceIds.has(file.file_id) ? '' : ' (just attached by user)'
        }`;
        /* `RequestFile` shape — see service/src/types/service.ts. `id` is the
         * storage uuid; `resource_id` is the owning entity and is what drives
         * the service's sessionKey derivation. Keeping them separate matters:
         * sending the storage id as the resource id fails authorization on
         * every shared-kind /exec. */
        files.push({
          id,
          resource_id: resourceId,
          storage_session_id: session_id,
          name: file.filename,
          kind,
        });
      };

      if (sessions.has(session_id)) {
        pushFile();
        continue;
      }

      const reuploadFile = async () => {
        try {
          const { getDownloadStream } = getStrategyFunctions(file.source);
          const { handleFileUpload: uploadCodeEnvFile } = getStrategyFunctions(
            FileSources.execute_code,
          );
          const stream = await getDownloadStream(options.req, file.filepath);
          const fileIdentifier = await uploadCodeEnvFile({
            req: options.req,
            stream,
            filename: file.filename,
            /* Identifiers now carry `kind=agent&id=<agentId>`; `entity_id` is the
             * legacy spelling still accepted from older stored metadata. */
            entity_id:
              queryParams.kind === 'agent' ? queryParams.id : queryParams.entity_id,
            apiKey,
          });

          // Preserve existing metadata when adding fileIdentifier
          const updatedMetadata = {
            ...file.metadata, // Preserve existing metadata (like S3 storage info)
            fileIdentifier, // Add fileIdentifier
          };

          await updateFile({
            file_id: file.file_id,
            metadata: updatedMetadata,
          });
          sessions.set(session_id, true);
          pushFile();
        } catch (error) {
          logger.error(
            `Error re-uploading file ${id} in session ${session_id}: ${error.message}`,
            error,
          );
        }
      };
      const uploadTime = await getSessionInfo(
        file.metadata.fileIdentifier,
        apiKey,
        options.req.user.id,
      );
      if (!uploadTime) {
        logger.warn(`Failed to get upload time for file ${id} in session ${session_id}`);
        await reuploadFile();
        continue;
      }
      if (!checkIfActive(uploadTime)) {
        await reuploadFile();
        continue;
      }
      sessions.set(session_id, true);
      pushFile();
    }
  }

  /* Files primed into /mnt/data land in the sandbox's working directory, so a
   * `.py` among them is an importable module — but nothing told the model that,
   * and it would re-implement helpers that were sitting right next to it. This
   * whole string is joined into a system message before the tool runs (see
   * packages/api/src/agents/run.ts), which makes it the natural place to say so.
   * Deliberately generic: what a given module offers belongs in the agent's own
   * instructions, not hardcoded here. */
  /* A pack's own note goes after the file list so the indented list stays intact.
   * This is where a brand pack says what its module is for — kept in the pack's
   * `skill.json` rather than here, so adding a theme is data, not code. */
  for (const note of skills.notes) {
    toolContext += `\n- ${note}`;
  }

  const pythonModules = files
    .filter((file) => file.name.toLowerCase().endsWith('.py'))
    .map((file) => file.name.replace(/\.py$/i, ''));
  if (toolContext && pythonModules.length > 0) {
    toolContext += `\n- These are importable Python modules in the working directory: ${pythonModules
      .map((name) => `\`import ${name}\``)
      .join(', ')}. Prefer them over reimplementing what they already provide.`;
  }

  return { files, toolContext };
};

module.exports = {
  primeFiles,
  processCodeOutput,
};
