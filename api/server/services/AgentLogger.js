const { logger } = require('@librechat/data-schemas');

/**
 * Clean and focused logging for agent operations
 */
class AgentLogger {
  /**
   * Log agent initialization with essential info only
   */
  static logAgentInit(agentId, conversationId, model) {
    logger.info(`🤖 Agent ${agentId} initialized | Conv: ${conversationId} | Model: ${model}`);
  }

  /**
   * Log agent message processing with token usage summary
   */
  static logAgentMessage(conversationId, model, tokenUsage, promptPreview, responsePreview) {
    logger.info(`💬 Agent Message | Conv: ${conversationId} | Model: ${model}`);

    if (
      tokenUsage &&
      tokenUsage.promptTokens !== undefined &&
      tokenUsage.completionTokens !== undefined
    ) {
      const { promptTokens, completionTokens } = tokenUsage;
      const totalTokens = promptTokens + completionTokens;
      logger.info(`📊 Tokens: ${promptTokens}p + ${completionTokens}c = ${totalTokens} total`);
    }

    if (promptPreview) {
      logger.info(`📝 Prompt: ${promptPreview}`);
    }

    if (responsePreview) {
      logger.info(`💭 Response: ${responsePreview}`);
    }
  }

  /**
   * Log agent completion with final summary
   */
  static logAgentComplete(conversationId, model, totalTokens, duration) {
    logger.info(
      `✅ Agent Complete | Conv: ${conversationId} | Model: ${model} | Tokens: ${totalTokens} | Time: ${duration}ms`,
    );
  }

  /**
   * Log agent error with context
   */
  static logAgentError(conversationId, model, error, context = '') {
    logger.error(
      `❌ Agent Error | Conv: ${conversationId} | Model: ${model} | Context: ${context}`,
    );
    logger.error(`Error: ${error.message || error}`);
  }

  /**
   * Log agent context injection
   */
  static logContextInjection(conversationId, contextType, contextValue) {
    logger.debug(
      `🔗 Context Injected | Conv: ${conversationId} | Type: ${contextType} | Value: ${contextValue}`,
    );
  }

  /**
   * Log agent tool usage
   */
  static logToolUsage(conversationId, toolName, success = true) {
    const status = success ? '✅' : '❌';
    logger.debug(`${status} Tool Used | Conv: ${conversationId} | Tool: ${toolName}`);
  }

  /**
   * Create a preview of text (first 2 lines, max 100 chars)
   */
  static createTextPreview(text, maxLines = 2, maxChars = 100) {
    if (!text) return '';

    const lines = text.split('\n').slice(0, maxLines);
    let preview = lines.join(' ').substring(0, maxChars);

    if (text.length > maxChars) {
      preview += '...';
    }

    return preview;
  }

  /**
   * Log agent startup with essential config only
   */
  static logAgentStartup() {
    logger.info('🚀 LibreChat Agent System Starting...');
  }

  /**
   * Log agent shutdown
   */
  static logAgentShutdown() {
    logger.info('🛑 LibreChat Agent System Shutting Down...');
  }
}

module.exports = AgentLogger;
