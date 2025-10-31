const axios = require('axios');
const { logger } = require('@librechat/data-schemas');
const { isEnabled, generateShortLivedToken } = require('@librechat/api');

const footer = `Use the context as your learned knowledge to better answer the user.

In your response, remember to follow these guidelines:
- If you don't know the answer, simply say that you don't know.
- If you are unsure how to answer, ask for clarification.
- Avoid mentioning that you obtained the information from the context.
`;

function createContextHandlers(req, userMessageContent) {
  if (!process.env.RAG_API_URL) {
    return;
  }

  const processedFiles = [];
  const processedIds = new Set();
  const jwtToken = generateShortLivedToken(req.user.id);
  const useFullContext = isEnabled(process.env.RAG_USE_FULL_CONTEXT);

  const query = async (file) => {
    if (useFullContext) {
      logger.info(
        `📄 [createContextHandlers] Usando full context para arquivo ${file.filename} (file_id: ${file.file_id})`,
      );
      return axios.get(`${process.env.RAG_API_URL}/documents/${file.file_id}/context`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    }

    // Para "Upload as Text", usar o endpoint /text em vez de /query
    if (file.source === 'text' || file.type === 'text/plain' || file.filename?.endsWith('.txt')) {
      logger.info(
        `📄 [createContextHandlers] Usando endpoint /text para arquivo de texto ${file.filename} (file_id: ${file.file_id})`,
      );
      return axios.get(`${process.env.RAG_API_URL}/text/${file.file_id}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    }

    return axios.post(
      `${process.env.RAG_API_URL}/query`,
      {
        file_id: file.file_id,
        query: userMessageContent,
        k: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  };

  const processFile = async (file) => {
    if (file.embedded && !processedIds.has(file.file_id)) {
      try {
        processedFiles.push(file);
        processedIds.add(file.file_id);
      } catch (error) {
        logger.error(`Error processing file ${file.filename}:`, error);
      }
    }
  };

  /**
   * Process files in batches with concurrency limit
   * @param {Array} items - Items to process
   * @param {number} batchSize - Maximum concurrent operations
   * @param {Function} processor - Async function to process each item
   * @returns {Promise<Array>} Results array
   */
  const batchProcess = async (items, batchSize, processor) => {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(processor);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    return results;
  };

  const createContext = async () => {
    try {
      if (!processedFiles.length) {
        return '';
      }

      const oneFile = processedFiles.length === 1;
      const header = `The user has attached ${oneFile ? 'a' : processedFiles.length} file${
        !oneFile ? 's' : ''
      } to the conversation:`;

      const files = `${
        oneFile
          ? ''
          : `
      <files>`
      }${processedFiles
        .map(
          (file) => `
              <file>
                <filename>${file.filename}</filename>
                <type>${file.type}</type>
              </file>`,
        )
        .join('')}${
        oneFile
          ? ''
          : `
        </files>`
      }`;

      const MAX_CONCURRENT_QUERIES = 5;
      const queryProcessor = async (file) => {
        try {
          return await query(file);
        } catch (error) {
          logger.error(`Error querying file ${file.filename}:`, error);
          return null;
        }
      };

      const resolvedQueries = await batchProcess(processedFiles, MAX_CONCURRENT_QUERIES, queryProcessor);
      const validQueries = resolvedQueries.filter((result) => result !== null);

      // Log do conteúdo retornado para debug
      logger.info(`📄 [createContextHandlers] Processando ${validQueries.length} arquivos`);
      validQueries.forEach((queryResult, index) => {
        // Map back to original file by finding the matching file for this result
        const fileIndex = resolvedQueries.findIndex((r) => r === queryResult);
        const file = processedFiles[fileIndex];
        if (file) {
          logger.info(`📄 [createContextHandlers] Arquivo ${file.filename}:`);
          logger.info(
            `📄 [createContextHandlers] Tamanho dos dados: ${JSON.stringify(queryResult.data).length} caracteres`,
          );
          logger.info(
            `📄 [createContextHandlers] Dados completos: ${JSON.stringify(queryResult.data)}`,
          );
        }
      });

      // Map valid queries back to their corresponding files
      const queryFilePairs = [];
      resolvedQueries.forEach((result, index) => {
        if (result !== null) {
          queryFilePairs.push({ queryResult: result, file: processedFiles[index] });
        }
      });

      const context =
        validQueries.length === 0
          ? '\n\tThe semantic search did not return any results.'
          : queryFilePairs
              .map(({ queryResult, file }) => {
                let contextItems = queryResult.data;

                const generateContext = (currentContext) =>
                  `
          <file>
            <filename>${file.filename}</filename>
            <context>${currentContext}
            </context>
          </file>`;

                if (useFullContext) {
                  return generateContext(`\n${contextItems}`);
                }

                contextItems = queryResult.data
                  .map((item) => {
                    const pageContent = item[0].page_content;
                    return `
            <contextItem>
              <![CDATA[${pageContent?.trim()}]]>
            </contextItem>`;
                  })
                  .join('');

                return generateContext(contextItems);
              })
              .join('');

      if (useFullContext) {
        const prompt = `${header}
          ${context}
          ${footer}`;

        logger.info(`📄 [createContextHandlers] Contexto final criado:`);
        logger.info(`📄 [createContextHandlers] Tamanho do contexto: ${prompt.length} caracteres`);
        logger.info(`📄 [createContextHandlers] Contexto completo:\n${prompt}`);
        return prompt;
      }

      const prompt = `${header}
        ${files}

        A semantic search was executed with the user's message as the query, retrieving the following context inside <context></context> XML tags.

        <context>${context}
        </context>

        ${footer}`;

      return prompt;
    } catch (error) {
      logger.error('Error creating context:', error);
      throw error;
    }
  };

  return {
    processFile,
    createContext,
  };
}

module.exports = createContextHandlers;
