const { getConvo } = require('~/models/Conversation');
const groupPermissionService = require('~/server/services/GroupPermissionService');
const { logger } = require('~/config');

/**
 * Middleware to validate that user has access to the conversation's endpoint and model
 * This prevents users from accessing conversations that use models they no longer have permission for
 */
const validateConversationPermissions = () => {
  return async (req, res, next) => {
    const { conversationId } = req.params;

    if (!conversationId) {
      return next(); // No conversation ID, let it pass
    }

    try {
      const conversation = await getConvo(req.user.id, conversationId);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const userGroup = req.user?.userGroup || 'default';
      const { endpoint, model } = conversation;

      // Check if user still has access to the endpoint and model
      const hasEndpointAccess =
        !endpoint || groupPermissionService.hasEndpointAccess(userGroup, endpoint);
      const hasModelAccess =
        !endpoint || !model || groupPermissionService.hasModelAccess(userGroup, endpoint, model);

      // For GET requests (reading), allow access but mark as restricted if needed
      if (req.method === 'GET') {
        if (!hasEndpointAccess || !hasModelAccess) {
          conversation.isRestricted = true;
          conversation.restrictionReason = !hasEndpointAccess
            ? `No access to ${endpoint} endpoint`
            : `No access to ${model} model`;
        }

        req.conversation = conversation;
        return next();
      }

      // For non-GET requests (editing/continuing), enforce strict permissions
      if (!hasEndpointAccess) {
        logger.warn(
          `User ${req.user?.email} (group: ${userGroup}) denied write access to conversation ${conversationId} - no access to endpoint: ${endpoint}`,
        );
        return res.status(403).json({
          error: 'Access denied',
          message: `You no longer have permission to continue conversations using the ${endpoint} endpoint`,
        });
      }

      if (!hasModelAccess) {
        logger.warn(
          `User ${req.user?.email} (group: ${userGroup}) denied write access to conversation ${conversationId} - no access to model: ${model}`,
        );
        return res.status(403).json({
          error: 'Access denied',
          message: `You no longer have permission to continue conversations using the ${model} model`,
        });
      }

      // Store conversation data in request for potential use by other middleware
      req.conversation = conversation;

      next();
    } catch (error) {
      logger.error('Error validating conversation permissions:', error);
      res.status(500).json({ error: 'Error validating conversation access' });
    }
  };
};

/**
 * Middleware to filter conversations list based on user permissions
 * This ensures users only see conversations they have access to
 */
const filterConversationsByPermissions = () => {
  return (req, res, next) => {
    const userGroup = req.user?.userGroup || 'default';
    console.log('filterConversationsByPermissions - User group:', userGroup);

    // Store original json method
    const originalJson = res.json;

    // Override json method to filter conversations
    res.json = function (data) {
      console.log('filterConversationsByPermissions - Original data:', data);

      if (data && data.conversations && Array.isArray(data.conversations)) {
        console.log(
          'filterConversationsByPermissions - Processing conversations:',
          data.conversations.length,
        );

        data.conversations = data.conversations.map((conversation) => {
          const { endpoint, model } = conversation;
          console.log(
            `filterConversationsByPermissions - Checking conversation: endpoint=${endpoint}, model=${model}`,
          );

          // Check endpoint access
          const hasEndpointAccess =
            !endpoint || groupPermissionService.hasEndpointAccess(userGroup, endpoint);
          console.log(
            `filterConversationsByPermissions - Endpoint access for ${endpoint}:`,
            hasEndpointAccess,
          );

          // Check model access
          const hasModelAccess =
            !endpoint ||
            !model ||
            groupPermissionService.hasModelAccess(userGroup, endpoint, model);
          console.log(
            `filterConversationsByPermissions - Model access for ${model}:`,
            hasModelAccess,
          );

          // If user doesn't have access, mark conversation as restricted but still show it
          if (!hasEndpointAccess || !hasModelAccess) {
            console.log('filterConversationsByPermissions - Marking conversation as restricted');
            return {
              ...conversation,
              isRestricted: true,
              restrictionReason: !hasEndpointAccess
                ? `No access to ${endpoint} endpoint`
                : `No access to ${model} model`,
            };
          }

          console.log('filterConversationsByPermissions - Conversation allowed');
          return conversation;
        });

        console.log(
          'filterConversationsByPermissions - Final conversations count:',
          data.conversations.length,
        );
      }

      // Call original json method with filtered data
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  validateConversationPermissions,
  filterConversationsByPermissions,
};
