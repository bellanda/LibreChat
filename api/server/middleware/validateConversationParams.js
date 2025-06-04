const { getCachedGroupsConfig } = require('./groupsMiddleware');
const {
  filterEndpointsByGroup,
  filterModelsByGroup,
  getUserGroup,
  getGroupPermissions,
} = require('~/server/services/Config/GroupsService');
const { logger } = require('~/config');

/**
 * Validate conversation parameters against user group permissions
 * This middleware checks if the user has permission to use the endpoint and model
 * specified in URL parameters when accessing a conversation
 */
const validateConversationParams = async (req, res, next) => {
  try {
    // Only validate if user is authenticated
    if (!req.user) {
      return next();
    }

    // Extract URL parameters that could specify restricted endpoints/models
    const { endpoint, model } = req.query;

    // If no endpoint/model specified in URL, continue
    if (!endpoint && !model) {
      return next();
    }

    // Get groups configuration
    const groupsConfig = await getCachedGroupsConfig();
    if (!groupsConfig) {
      return next();
    }

    const userGroup = getUserGroup(req.user, groupsConfig);
    const permissions = getGroupPermissions(userGroup, groupsConfig);

    let hasValidPermissions = true;
    let invalidReason = '';

    // Validate endpoint permission
    if (endpoint) {
      if (!permissions.endpoints || !permissions.endpoints.includes('*')) {
        if (!permissions.endpoints.includes(endpoint)) {
          hasValidPermissions = false;
          invalidReason = `endpoint '${endpoint}'`;
        }
      }
    }

    // Validate model permission if endpoint is also specified or can be inferred
    if (model && endpoint && hasValidPermissions) {
      const endpointPermissions = permissions.models && permissions.models[endpoint];

      if (endpointPermissions) {
        if (!endpointPermissions.includes('*')) {
          if (!endpointPermissions.includes(model)) {
            hasValidPermissions = false;
            invalidReason = `model '${model}' for endpoint '${endpoint}'`;
          }
        }
      } else {
        // If endpoint is not in group permissions, model is also not allowed
        hasValidPermissions = false;
        invalidReason = `model '${model}' for endpoint '${endpoint}' (endpoint not allowed)`;
      }
    }

    // If permissions are invalid, remove the restricted parameters and log
    if (!hasValidPermissions) {
      logger.warn(
        `[validateConversationParams] User '${req.user.email}' in group '${userGroup}' attempted to access restricted ${invalidReason}`,
      );

      // Remove restricted parameters from query
      delete req.query.endpoint;
      delete req.query.model;

      // Also remove other related parameters that might be set
      const relatedParams = [
        'agent_id',
        'assistant_id',
        'temperature',
        'max_tokens',
        'top_p',
        'frequency_penalty',
        'presence_penalty',
        'stop',
        'topP',
        'topK',
        'maxOutputTokens',
        'region',
        'maxTokens',
        'instructions',
      ];

      relatedParams.forEach((param) => {
        if (req.query[param]) {
          delete req.query[param];
        }
      });

      // Redirect to the same conversation without restricted parameters
      const baseUrl = req.path;
      const remainingParams = new URLSearchParams(req.query).toString();
      const redirectUrl = remainingParams ? `${baseUrl}?${remainingParams}` : baseUrl;

      return res.redirect(302, redirectUrl);
    }

    next();
  } catch (error) {
    logger.error('[validateConversationParams] Error validating conversation parameters:', error);
    // Continue without validation to avoid breaking the application
    next();
  }
};

module.exports = validateConversationParams;
