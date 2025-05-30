const groupPermissionService = require('~/server/services/GroupPermissionService');
const { logger } = require('~/config');

/**
 * Middleware to check if user has access to a specific endpoint
 * @param {string} endpoint - Endpoint name to check
 * @returns {Function} Express middleware function
 */
const checkEndpointAccess = (endpoint) => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';

    if (!groupPermissionService.hasEndpointAccess(userGroup, endpoint)) {
      logger.warn(
        `User ${req.user?.email} (group: ${userGroup}) denied access to endpoint: ${endpoint}`,
      );
      return res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to access the ${endpoint} endpoint`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has access to a specific model
 * @param {string} endpoint - Endpoint name
 * @param {string} model - Model name (can be from req.body or req.params)
 * @returns {Function} Express middleware function
 */
const checkModelAccess = (endpoint, modelParam = 'model') => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';
    const model = req.body?.[modelParam] || req.params?.[modelParam] || req.query?.[modelParam];

    if (!model) {
      return next(); // If no model specified, let it pass (will be handled by other validation)
    }

    if (!groupPermissionService.hasModelAccess(userGroup, endpoint, model)) {
      logger.warn(
        `User ${req.user?.email} (group: ${userGroup}) denied access to model: ${model} on endpoint: ${endpoint}`,
      );
      return res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to use the ${model} model`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has access to agents
 * @returns {Function} Express middleware function
 */
const checkAgentAccess = () => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';
    const agentId = req.params?.agentId || req.body?.agentId;

    if (!groupPermissionService.hasAgentAccess(userGroup, agentId)) {
      logger.warn(`User ${req.user?.email} (group: ${userGroup}) denied access to agents`);
      return res.status(403).json({
        error: 'Access denied',
        message: "You don't have permission to access agents",
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has access to assistants
 * @returns {Function} Express middleware function
 */
const checkAssistantAccess = () => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';

    if (!groupPermissionService.hasAssistantAccess(userGroup)) {
      logger.warn(`User ${req.user?.email} (group: ${userGroup}) denied access to assistants`);
      return res.status(403).json({
        error: 'Access denied',
        message: "You don't have permission to access assistants",
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has access to a specific plugin
 * @param {string} plugin - Plugin name
 * @returns {Function} Express middleware function
 */
const checkPluginAccess = (plugin) => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';

    if (!groupPermissionService.hasPluginAccess(userGroup, plugin)) {
      logger.warn(
        `User ${req.user?.email} (group: ${userGroup}) denied access to plugin: ${plugin}`,
      );
      return res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to use the ${plugin} plugin`,
      });
    }

    next();
  };
};

/**
 * Middleware to validate model access in chat requests
 * This checks the model in the request body against user permissions
 */
const validateChatModelAccess = () => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';
    const { endpoint, model } = req.body;

    if (!endpoint || !model) {
      return next(); // Let other validation handle missing fields
    }

    // Check endpoint access
    if (!groupPermissionService.hasEndpointAccess(userGroup, endpoint)) {
      logger.warn(
        `User ${req.user?.email} (group: ${userGroup}) denied access to endpoint: ${endpoint}`,
      );
      return res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to access the ${endpoint} endpoint`,
      });
    }

    // Check model access
    if (!groupPermissionService.hasModelAccess(userGroup, endpoint, model)) {
      logger.warn(
        `User ${req.user?.email} (group: ${userGroup}) denied access to model: ${model} on endpoint: ${endpoint}`,
      );
      return res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to use the ${model} model`,
      });
    }

    next();
  };
};

/**
 * Middleware to validate conversation access
 * This checks if the user can access models/endpoints used in existing conversations
 */
const validateConversationAccess = () => {
  return async (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';
    const { endpoint, model } = req.body;

    // If this is a new conversation, validate normally
    if (!req.params.conversationId) {
      return validateChatModelAccess()(req, res, next);
    }

    // For existing conversations, we need to check if the user still has access
    // to the endpoint/model combination used in the conversation
    if (endpoint && model) {
      if (!groupPermissionService.hasEndpointAccess(userGroup, endpoint)) {
        logger.warn(
          `User ${req.user?.email} (group: ${userGroup}) lost access to endpoint: ${endpoint} in existing conversation`,
        );
        return res.status(403).json({
          error: 'Access denied',
          message: `You no longer have permission to access the ${endpoint} endpoint used in this conversation`,
        });
      }

      if (!groupPermissionService.hasModelAccess(userGroup, endpoint, model)) {
        logger.warn(
          `User ${req.user?.email} (group: ${userGroup}) lost access to model: ${model} in existing conversation`,
        );
        return res.status(403).json({
          error: 'Access denied',
          message: `You no longer have permission to use the ${model} model used in this conversation`,
        });
      }
    }

    next();
  };
};

module.exports = {
  checkEndpointAccess,
  checkModelAccess,
  checkAgentAccess,
  checkAssistantAccess,
  checkPluginAccess,
  validateChatModelAccess,
  validateConversationAccess,
};
