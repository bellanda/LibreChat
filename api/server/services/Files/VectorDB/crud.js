const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { logger } = require('@librechat/data-schemas');
const { FileSources, mergeFileConfig } = require('librechat-data-provider');
const { logAxiosError, generateShortLivedToken } = require('@librechat/api');

/**
 * Checks if a file type is supported by the RAG API
 * @param {string} mimetype - The MIME type to check
 * @param {Object} fileConfig - The file configuration object
 * @returns {boolean} - Whether the file type is supported
 */
function isFileTypeSupported(mimetype, fileConfig) {
  return fileConfig.checkType(mimetype);
}

/**
 * Creates a temporary .txt file with the same content for unsupported file types
 * @param {string} originalPath - Path to the original file
 * @param {string} originalName - Original filename
 * @returns {Promise<{path: string, mimetype: string, originalname: string}>} - Modified file info
 */
async function createTxtFallback(originalPath, originalName) {
  try {
    // Read the original file content
    const content = await fs.promises.readFile(originalPath);

    // Create a new filename with .txt extension
    const nameWithoutExt = path.parse(originalName).name;
    const txtFilename = `${nameWithoutExt}.txt`;

    // Create a temporary file path
    const tempDir = path.dirname(originalPath);
    const txtPath = path.join(tempDir, `temp_${Date.now()}_${txtFilename}`);

    // Write content to the new .txt file
    await fs.promises.writeFile(txtPath, content);

    logger.info(`Created .txt fallback for unsupported file: ${originalName} -> ${txtFilename}`);

    return {
      path: txtPath,
      mimetype: 'text/markdown',
      originalname: txtFilename,
      isFallback: true,
    };
  } catch (error) {
    logger.error('Error creating .txt fallback:', error);
    throw error;
  }
}

/**
 * Cleans up temporary fallback files
 * @param {string} filePath - Path to the temporary file
 */
async function cleanupTempFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
    logger.debug(`Cleaned up temporary file: ${filePath}`);
  } catch (error) {
    logger.warn(`Failed to cleanup temporary file ${filePath}:`, error);
  }
}

/**
 * Deletes a file from the vector database. This function takes a file object, constructs the full path, and
 * verifies the path's validity before deleting the file. If the path is invalid, an error is thrown.
 *
 * @param {ServerRequest} req - The request object from Express.
 * @param {MongoFile} file - The file object to be deleted. It should have a `filepath` property that is
 *                           a string representing the path of the file relative to the publicPath.
 *
 * @returns {Promise<void>}
 *          A promise that resolves when the file has been successfully deleted, or throws an error if the
 *          file path is invalid or if there is an error in deletion.
 */
const deleteVectors = async (req, file) => {
  if (!file.embedded || !process.env.RAG_API_URL) {
    return;
  }
  try {
    const jwtToken = generateShortLivedToken(req.user.id);

    return await axios.delete(`${process.env.RAG_API_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: [file.file_id],
    });
  } catch (error) {
    logAxiosError({
      error,
      message: 'Error deleting vectors',
    });
    if (
      error.response &&
      error.response.status !== 404 &&
      (error.response.status < 200 || error.response.status >= 300)
    ) {
      logger.warn('Error deleting vectors, file will not be deleted');
      throw new Error(error.message || 'An error occurred during file deletion.');
    }
  }
};

/**
 * Uploads a file to the configured Vector database
 *
 * @param {Object} params - The params object.
 * @param {Object} params.req - The request object from Express. It should have a `user` property with an `id` representing the user
 * @param {Express.Multer.File} params.file - The file object, which is part of the request. The file object should
 *                                     have a `path` property that points to the location of the uploaded file.
 * @param {string} params.file_id - The file ID.
 * @param {string} [params.entity_id] - The entity ID for shared resources.
 * @param {Object} [params.storageMetadata] - Storage metadata for dual storage pattern.
 *
 * @returns {Promise<{ filepath: string, bytes: number }>}
 *          A promise that resolves to an object containing:
 *            - filepath: The path where the file is saved.
 *            - bytes: The size of the file in bytes.
 */
async function uploadVectors({ req, file, file_id, entity_id, storageMetadata }) {
  if (!process.env.RAG_API_URL) {
    throw new Error('RAG_API_URL not defined');
  }

  let fileToUpload = file;
  let tempFilePath = null;

  try {
    logger.debug(`Processing file: ${file.originalname}, MIME type: ${file.mimetype}`);

    // Get file configuration from request
    const appConfig = req.config;
    const fileConfig = mergeFileConfig(appConfig.fileConfig);

    // Check if the file type is supported by RAG API specifically
    // Some MIME types cause issues with RAG APIs even though they're technically supported
    const problematicTypes = ['text/plain', 'application/xml'];
    const isRAGCompatible =
      isFileTypeSupported(file.mimetype, fileConfig) && !problematicTypes.includes(file.mimetype);

    if (!isRAGCompatible) {
      logger.info(
        `File type ${file.mimetype} needs conversion for RAG compatibility: ${file.originalname}. Converting to .txt format for RAG processing.`,
      );

      // Create a .txt fallback version
      const fallbackFile = await createTxtFallback(file.path, file.originalname);

      // Update file info for upload
      fileToUpload = {
        ...file,
        path: fallbackFile.path,
        mimetype: fallbackFile.mimetype,
        originalname: fallbackFile.originalname,
      };

      tempFilePath = fallbackFile.path;
      logger.debug(
        `Converted file: ${fallbackFile.originalname}, new MIME type: ${fallbackFile.mimetype}`,
      );
    }

    const jwtToken = generateShortLivedToken(req.user.id);
    const formData = new FormData();
    formData.append('file_id', file_id);
    formData.append('file', fs.createReadStream(fileToUpload.path));
    if (entity_id != null && entity_id) {
      formData.append('entity_id', entity_id);
    }

    // Include storage metadata for RAG API to store with embeddings
    if (storageMetadata) {
      formData.append('storage_metadata', JSON.stringify(storageMetadata));
    }

    const formHeaders = formData.getHeaders();

    const response = await axios.post(`${process.env.RAG_API_URL}/embed`, formData, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        accept: 'application/json',
        ...formHeaders,
      },
    });

    const responseData = response.data;
    logger.debug('Response from embedding file', responseData);

    if (responseData.known_type === false) {
      throw new Error(
        `File embedding failed. The filetype ${fileToUpload.mimetype} is not supported`,
      );
    }

    if (!responseData.status) {
      throw new Error('File embedding failed.');
    }

    return {
      bytes: file.size, // Use original file size
      filename: file.originalname, // Use original filename for display
      filepath: FileSources.vectordb,
      embedded: Boolean(responseData.known_type),
    };
  } catch (error) {
    logAxiosError({
      error,
      message: 'Error uploading vectors',
    });
    throw new Error(error.message || 'An error occurred during file upload.');
  } finally {
    // Clean up temporary file if it was created
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }
  }
}

module.exports = {
  deleteVectors,
  uploadVectors,
};
