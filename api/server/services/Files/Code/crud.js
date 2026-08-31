const FormData = require('form-data');
const { getCodeBaseURL } = require('@librechat/agents');
const { createAxiosInstance, logAxiosError } = require('@librechat/api');

const axios = createAxiosInstance();

const MAX_FILE_SIZE = 150 * 1024 * 1024;

/**
 * Retrieves a download stream for a specified file.
 *
 * `kind`/`id` are required by the Code Interpreter — without them it answers
 * 400 "kind must be one of: skill, agent, user". Files written by `/exec` land
 * under the `user` kind, so that is what we ask for here. `id` is informational
 * for that kind: the service derives the real sessionKey from its auth context
 * (`User-Id`), never from this value, so a caller cannot read another user's
 * file by changing it.
 *
 * @param {string} fileIdentifier - The identifier for the file (e.g., "session_id/fileId").
 * @param {string} _apiKey - Unused; kept so existing call sites don't need reshuffling.
 * @param {string} userId - LibreChat user id, the isolation identity.
 * @returns {Promise<AxiosResponse>} A promise that resolves to a readable stream of the file content.
 * @throws {Error} If there's an error during the download process.
 */
async function getCodeOutputDownloadStream(fileIdentifier, _apiKey, userId) {
  try {
    const baseURL = getCodeBaseURL();
    const [identifier, existingQuery] = fileIdentifier.split('?');
    const params = new URLSearchParams(existingQuery ?? '');
    params.set('kind', 'user');
    params.set('id', userId ?? '');
    /** @type {import('axios').AxiosRequestConfig} */
    const options = {
      method: 'get',
      url: `${baseURL}/download/${identifier}?${params.toString()}`,
      responseType: 'stream',
      headers: {
        'User-Agent': 'LibreChat/1.0',
        'User-Id': userId,
      },
      timeout: 15000,
    };

    const response = await axios(options);
    return response;
  } catch (error) {
    throw new Error(
      logAxiosError({
        message: `Error downloading code environment file stream: ${error.message}`,
        error,
      }),
    );
  }
}

/**
 * Uploads a file to the Code Environment server.
 * @param {Object} params - The params object.
 * @param {ServerRequest} params.req - The request object from Express. It should have a `user` property with an `id` representing the user
 * @param {import('fs').ReadStream | import('stream').Readable} params.stream - The read stream for the file.
 * @param {string} params.filename - The name of the file.
 * @param {string} params.apiKey - The API key for authentication.
 * @param {string} [params.entity_id] - Optional entity ID for the file.
 * @returns {Promise<string>}
 * @throws {Error} If there's an error during the upload process.
 */
async function uploadCodeEnvFile({ req, stream, filename, apiKey, entity_id = '' }) {
  try {
    const form = new FormData();
    /* `kind`/`id` replaced the legacy `entity_id` form field upstream
     * (see service/src/service/router.ts on POST /upload). Agent-scoped files
     * are shared across users of the same agent by design; everything else is
     * scoped to the uploading user. */
    if (entity_id.length > 0) {
      form.append('kind', 'agent');
      form.append('id', entity_id);
    } else {
      form.append('kind', 'user');
      form.append('id', req.user.id);
    }
    form.append('file', stream, filename);

    const baseURL = getCodeBaseURL();
    /** @type {import('axios').AxiosRequestConfig} */
    const options = {
      headers: {
        ...form.getHeaders(),
        'Content-Type': 'multipart/form-data',
        'User-Agent': 'LibreChat/1.0',
        'User-Id': req.user.id,
      },
      maxContentLength: MAX_FILE_SIZE,
      maxBodyLength: MAX_FILE_SIZE,
    };

    const response = await axios.post(`${baseURL}/upload`, form, options);

    /** @type {{ message: string; storage_session_id: string; session_id?: string; files: Array<{ fileId: string; filename: string }> }} */
    const result = response.data;
    if (result.message !== 'success') {
      throw new Error(`Error uploading file: ${result.message}`);
    }

    /* The service renamed this field to `storage_session_id`; `session_id` is the
     * older spelling. Reading only the old one silently produced
     * "undefined/<fileId>" identifiers and broke the next /exec's file priming. */
    const storageSessionId = result.storage_session_id ?? result.session_id;
    if (!storageSessionId) {
      throw new Error('Error uploading file: response has no storage_session_id');
    }

    const fileIdentifier = `${storageSessionId}/${result.files[0].fileId}`;
    if (entity_id.length === 0) {
      return fileIdentifier;
    }

    /* Carries the scope forward in the stored metadata. Was `?entity_id=<id>`;
     * now the `kind`/`id` pair the service actually understands, so the value
     * can be forwarded verbatim to /files and /download. */
    return `${fileIdentifier}?kind=agent&id=${encodeURIComponent(entity_id)}`;
  } catch (error) {
    throw new Error(
      logAxiosError({
        message: `Error uploading code environment file: ${error.message}`,
        error,
      }),
    );
  }
}

module.exports = { getCodeOutputDownloadStream, uploadCodeEnvFile };
