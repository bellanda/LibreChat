const path = require('path');
const fs = require('fs');
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
} = require('librechat-data-provider');
const { filterFilesByAgentAccess } = require('~/server/services/Files/permissions');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');
const { convertImage } = require('~/server/services/Files/images/convert');
const { createFile, getFiles, updateFile } = require('~/models');

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
  if (!id || typeof id !== 'string') {
    logger.warn('[processCodeOutput] Called with invalid id:', { id, session_id });
    return null;
  }
  if (!session_id || typeof session_id !== 'string') {
    logger.warn('[processCodeOutput] Called with invalid session_id:', { session_id, id });
    return null;
  }
  const appConfig = req.config;
  const currentDate = new Date();
  const baseURL = getCodeBaseURL();
  const basePath = getBasePath();
  const fileExt = path.extname(name);
  if (!fileExt || !imageExtRegex.test(name)) {
    // Ensure filepath always starts with /api/ for proper routing
    const filepath = `${basePath}/api/files/code/download/${session_id}/${id}`;

    // Validate that filepath is correct (should start with /api/)
    if (!filepath.startsWith('/api/')) {
      logger.error('[processCodeOutput] Invalid filepath generated:', {
        filepath,
        basePath,
        session_id,
        id,
        name,
      });
      // Fallback to a valid path
      const fallbackPath = `/api/files/code/download/${session_id}/${id}`;
      logger.warn('[processCodeOutput] Using fallback filepath:', fallbackPath);
    }

    const fileMetadata = {
      filename: name,
      filepath: filepath.startsWith('/api/')
        ? filepath
        : `/api/files/code/download/${session_id}/${id}`,
      /** Note: expires 24 hours after creation */
      expiresAt: currentDate.getTime() + 86400000,
      conversationId,
      toolCallId,
      messageId,
      type: Tools.execute_code,
    };
    logger.debug('[processCodeOutput] Returning non-image file metadata:', {
      filename: fileMetadata.filename,
      filepath: fileMetadata.filepath,
      toolCallId: fileMetadata.toolCallId,
      messageId: fileMetadata.messageId,
      conversationId: fileMetadata.conversationId,
    });
    return fileMetadata;
  }

  try {
    const formattedDate = currentDate.toISOString();
    const response = await axios({
      method: 'get',
      url: `${baseURL}/download/${session_id}/${id}`,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'LibreChat/1.0',
        'X-API-Key': apiKey,
      },
      timeout: 15000,
    });

    const buffer = Buffer.from(response.data, 'binary');

    const file_id = v4();
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
  } catch (error) {
    logAxiosError({
      message: 'Error downloading code environment file',
      error,
    });
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
 * @param {string} params.apiKey - The API key for authentication.
 *
 * @returns {Promise<string|null>}
 *          A promise that resolves to the `lastModified` time string of the file if successful, or null if there is an
 *          error in initialization or fetching the info.
 */
async function getSessionInfo(fileIdentifier, apiKey) {
  try {
    const baseURL = getCodeBaseURL();
    const [path, queryString] = fileIdentifier.split('?');
    const session_id = path.split('/')[0];

    let queryParams = {};
    if (queryString) {
      queryParams = Object.fromEntries(new URLSearchParams(queryString).entries());
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
        'X-API-Key': apiKey,
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
 * Try to load and inject the AI usage guide from the sandbox templates directory.
 * @returns {string} The usage guide content if found, or empty string if not.
 */
function loadSandboxUsageGuide() {
  try {
    // Try multiple possible locations
    const possiblePaths = [
      path.join(__dirname, '../../../packages/sandbox/templates/ai_usage_guide_ptbr.md'),
      '/opt/templates/ai_usage_guide_ptbr.md',
      path.join(process.cwd(), 'packages/sandbox/templates/ai_usage_guide_ptbr.md'),
    ];

    for (const filepath of possiblePaths) {
      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf-8');
        logger.debug(`[primeFiles] Loaded usage guide from ${filepath}`);
        return content;
      }
    }

    logger.debug('[primeFiles] Usage guide not found in standard locations');
    return '';
  } catch (error) {
    logger.warn(`[primeFiles] Error loading usage guide: ${error.message}`);
    return '';
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

  // toolContext is always generated when execute_code is active,
  // regardless of whether files are attached.
  const toolContext = `# ${Tools.execute_code} Tool Environment

**Important**: This sandbox uses \`uv\` as the Python package manager, **not \`pip\`**. The \`pip\` command is not available in this environment.

**Pre-installed Python packages available** (no installation needed):
- Data processing: numpy, pandas, polars, pyarrow
- Visualization: matplotlib, seaborn, scipy
- File handling: pillow, openpyxl, xlrd, python-pptx, python-docx, reportlab, xhtml2pdf
- Machine learning: scikit-learn
- Utilities: tabulate, pyyaml, jinja2, pypdf, pdfplumber

**You can use these packages directly** — just import them (e.g., \`from pptx import Presentation\`). Do NOT try to install packages using \`pip install\` or \`uv pip install\` as this will fail.

**Pre-installed JavaScript packages for document generation**:
- pptxgenjs, exceljs, docx, pdf-lib
- JS builders are available in \`/opt/templates/js/corporate_builders.mjs\`

**Reusable layout system available**: use \`/opt/templates\` for standardized enterprise-clean outputs:
- Python builders: \`/opt/templates/corporate_builders.py\`
- JavaScript builders: \`/opt/templates/js/corporate_builders.mjs\`
- Themes: \`executivo\`, \`operacional\`, \`board\`, \`tecnico\`
- Usage guide (with full examples): \`/opt/templates/ai_usage_guide_ptbr.md\`
- **Always use the builders** — never use raw canvas.Canvas, raw pptx without builder, or raw openpyxl without builder.
- PDF template names: \`executivo\` | \`operacional\` | \`tecnico\`

**Chart workflow**: generate with matplotlib → save PNG to \`/mnt/data/\` → pass path to builder as \`chart_path\`.

**When calling \`${Tools.execute_code}\`, follow this payload shape exactly**:
- Required: \`code\` (string)
- Optional: \`lang\` (use \`py\` or \`js\`; default to \`py\` when omitted)

**Important UI behavior**: when files are generated, the chat UI already shows the downloadable file card automatically.
- Do NOT include manual download links in your answer.
- Do NOT invent localhost links or file URLs.
- Just confirm the file was generated and briefly summarize what it contains.
- Prefer a single final artifact unless the user explicitly asks for multiple files.`;

  const fileListHeader = `\n\nThe following files are available in the "${Tools.execute_code}" tool environment:`;
  let fileListContext = '';

  for (let i = 0; i < dbFiles.length; i++) {
    const file = dbFiles[i];
    if (!file) {
      continue;
    }

    if (file.metadata.fileIdentifier) {
      const [path, queryString] = file.metadata.fileIdentifier.split('?');
      const [session_id, id] = path.split('/');

      const pushFile = () => {
        fileListContext += `\n\t- /mnt/data/${file.filename}${
          agentResourceIds.has(file.file_id) ? '' : ' (just attached by user)'
        }`;
        files.push({
          id,
          session_id,
          name: file.filename,
        });
      };

      if (sessions.has(session_id)) {
        pushFile();
        continue;
      }

      let queryParams = {};
      if (queryString) {
        queryParams = Object.fromEntries(new URLSearchParams(queryString).entries());
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
            entity_id: queryParams.entity_id,
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
      const uploadTime = await getSessionInfo(file.metadata.fileIdentifier, apiKey);
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

  // Load and inject the AI usage guide for builders
  const usageGuide = loadSandboxUsageGuide();
  const guideSection = usageGuide
    ? `\n\n## Corporate Document Builders Guide\n\n${usageGuide}`
    : '';

  const finalToolContext = toolContext + (fileListContext ? fileListHeader + fileListContext : '') + guideSection;

  return { files, toolContext: finalToolContext };
};

module.exports = {
  primeFiles,
  processCodeOutput,
};
