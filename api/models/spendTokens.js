const { logger } = require('@librechat/data-schemas');
const { createTransaction, createStructuredTransaction } = require('./Transaction');
/**
 * Creates up to two transactions to record the spending of tokens.
 *
 * @function
 * @async
 * @param {txData} txData - Transaction data.
 * @param {Object} tokenUsage - The number of tokens used.
 * @param {Number} tokenUsage.promptTokens - The number of prompt tokens used.
 * @param {Number} tokenUsage.completionTokens - The number of completion tokens used.
 * @returns {Promise<void>} - Returns nothing.
 * @throws {Error} - Throws an error if there's an issue creating the transactions.
 */
const spendTokens = async (txData, tokenUsage) => {
  const { promptTokens, completionTokens } = tokenUsage;

  logger.info('[spendTokens] 💰 CREATING TRANSACTIONS', {
    conversationId: txData.conversationId,
    context: txData?.context,
    model: txData.model,
    user: txData.user,
    promptTokens,
    completionTokens,
  });

  logger.debug(
    `[spendTokens] conversationId: ${txData.conversationId}${
      txData?.context ? ` | Context: ${txData?.context}` : ''
    } | Token usage: `,
    {
      promptTokens,
      completionTokens,
    },
  );
  logger.debug(`[spendTokens] Model: ${txData.model}, User: ${txData.user}`);
  let prompt, completion;
  try {
    if (promptTokens !== undefined) {
      logger.info('[spendTokens] 💰 Creating PROMPT transaction', {
        model: txData.model,
        rawAmount: promptTokens === 0 ? 0 : -Math.max(promptTokens, 0),
      });
      prompt = await createTransaction({
        ...txData,
        tokenType: 'prompt',
        rawAmount: promptTokens === 0 ? 0 : -Math.max(promptTokens, 0),
      });
    }

    if (completionTokens !== undefined) {
      logger.info('[spendTokens] 💰 Creating COMPLETION transaction', {
        model: txData.model,
        rawAmount: completionTokens === 0 ? 0 : -Math.max(completionTokens, 0),
      });
      completion = await createTransaction({
        ...txData,
        tokenType: 'completion',
        rawAmount: completionTokens === 0 ? 0 : -Math.max(completionTokens, 0),
      });
    }

    if (prompt || completion) {
      logger.info('[spendTokens] 💰 TRANSACTIONS CREATED', {
        user: txData.user,
        model: txData.model,
        promptRawAmount: prompt?.prompt,
        promptRate: prompt?.rate,
        completionRawAmount: completion?.completion,
        completionRate: completion?.rate,
        balance: completion?.balance ?? prompt?.balance,
      });
      logger.debug('[spendTokens] Transaction data record against balance:', {
        user: txData.user,
        prompt: prompt?.prompt,
        promptRate: prompt?.rate,
        completion: completion?.completion,
        completionRate: completion?.rate,
        balance: completion?.balance ?? prompt?.balance,
      });
    } else {
      logger.debug('[spendTokens] No transactions incurred against balance');
    }
  } catch (err) {
    logger.error('[spendTokens]', err);
  }
};

/**
 * Creates transactions to record the spending of structured tokens.
 *
 * @function
 * @async
 * @param {txData} txData - Transaction data.
 * @param {Object} tokenUsage - The number of tokens used.
 * @param {Object} tokenUsage.promptTokens - The number of prompt tokens used.
 * @param {Number} tokenUsage.promptTokens.input - The number of input tokens.
 * @param {Number} tokenUsage.promptTokens.write - The number of write tokens.
 * @param {Number} tokenUsage.promptTokens.read - The number of read tokens.
 * @param {Number} tokenUsage.completionTokens - The number of completion tokens used.
 * @returns {Promise<void>} - Returns nothing.
 * @throws {Error} - Throws an error if there's an issue creating the transactions.
 */
const spendStructuredTokens = async (txData, tokenUsage) => {
  const { promptTokens, completionTokens } = tokenUsage;

  logger.info('[spendStructuredTokens] 💰 CREATING STRUCTURED TRANSACTIONS', {
    conversationId: txData.conversationId,
    context: txData?.context,
    model: txData.model,
    user: txData.user,
    promptTokens,
    completionTokens,
  });

  logger.debug(
    `[spendStructuredTokens] conversationId: ${txData.conversationId}${
      txData?.context ? ` | Context: ${txData?.context}` : ''
    } | Token usage: `,
    {
      promptTokens,
      completionTokens,
    },
  );
  let prompt, completion;
  try {
    if (promptTokens) {
      const { input = 0, write = 0, read = 0 } = promptTokens;
      logger.info('[spendStructuredTokens] 💰 Creating STRUCTURED PROMPT transaction', {
        model: txData.model,
        inputTokens: -input,
        writeTokens: -write,
        readTokens: -read,
        totalPromptTokens: input + write + read,
      });
      prompt = await createStructuredTransaction({
        ...txData,
        tokenType: 'prompt',
        inputTokens: -input,
        writeTokens: -write,
        readTokens: -read,
      });
    }

    if (completionTokens) {
      logger.info('[spendStructuredTokens] 💰 Creating COMPLETION transaction', {
        model: txData.model,
        rawAmount: -completionTokens,
      });
      completion = await createTransaction({
        ...txData,
        tokenType: 'completion',
        rawAmount: -completionTokens,
      });
    }

    if (prompt || completion) {
      logger.info('[spendStructuredTokens] 💰 STRUCTURED TRANSACTIONS CREATED', {
        user: txData.user,
        model: txData.model,
        promptRawAmount: prompt?.prompt,
        promptRate: prompt?.rate,
        completionRawAmount: completion?.completion,
        completionRate: completion?.rate,
        balance: completion?.balance ?? prompt?.balance,
      });
      logger.debug('[spendStructuredTokens] Transaction data record against balance:', {
        user: txData.user,
        prompt: prompt?.prompt,
        promptRate: prompt?.rate,
        completion: completion?.completion,
        completionRate: completion?.rate,
        balance: completion?.balance ?? prompt?.balance,
      });
    } else {
      logger.debug('[spendStructuredTokens] No transactions incurred against balance');
    }
  } catch (err) {
    logger.error('[spendStructuredTokens]', err);
  }

  return { prompt, completion };
};

module.exports = { spendTokens, spendStructuredTokens };
