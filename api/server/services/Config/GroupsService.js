const { Constants } = require('librechat-data-provider');
const { logger } = require('~/config');

// Import dinâmico para evitar problemas de conexão
let GroupsConfigs = null;
try {
  GroupsConfigs = require('~/models/GroupsConfigs');
} catch (error) {
  logger.warn('[GroupsService] Could not load GroupsConfigs model:', error.message);
}

/**
 * Load the groups configuration from the MongoDB collection
 * @returns {Promise<Object>} The groups configuration object
 */
async function loadGroupsConfig() {
  try {
    logger.info('[GroupsService] Loading groups configuration from MongoDB collection');
    // Carregar da collection do MongoDB
    if (GroupsConfigs) {
      logger.info('[GroupsService] GroupsConfigs model loaded');
      const dbConfig = await GroupsConfigs.findOne({}).lean();

      if (dbConfig) {
        logger.info('[GroupsService] Groups configuration loaded from MongoDB collection');
        return dbConfig;
      }
    }

    // Se não houver dados no MongoDB, usar configuração padrão
    logger.warn(
      '[GroupsService] No groups configuration found in MongoDB, using default configuration',
    );
    return getDefaultGroupsConfig();
  } catch (error) {
    logger.error('[GroupsService] Error loading groups configuration:', error);
    return getDefaultGroupsConfig();
  }
}

/**
 * Get the default groups configuration
 * @returns {Object} Default configuration object
 */
function getDefaultGroupsConfig() {
  return {
    defaultGroup: 'default',
    groups: {
      default: {
        name: 'Default Users',
        description: 'Standard user group with basic access',
        permissions: {
          endpoints: ['*'],
          models: {
            agents: ['*'],
            HPEAgents: ['*'],
            azureOpenAI: ['*'],
            openAI: ['*'],
            google: ['*'],
            anthropic: ['*'],
            deepseek: ['*'],
            NVIDIA: ['*'],
            Groq: ['*'],
          },
          assistants: false,
          plugins: [],
          mcpServers: ['*'],
        },
      },
    },
  };
}

/**
 * Get user group from user data, fallback to default group
 * @param {Object} user - The user object
 * @param {Object} groupsConfig - The groups configuration
 * @returns {string} The user's group name
 */
function getUserGroup(user, groupsConfig) {
  if (!user || !user.group) {
    return groupsConfig.defaultGroup || 'default';
  }

  // Check if the user's group exists in the configuration
  if (groupsConfig.groups && groupsConfig.groups[user.group]) {
    return user.group;
  }

  // Fallback to default group if user's group doesn't exist
  return groupsConfig.defaultGroup || 'default';
}

/**
 * Get group permissions for a specific group
 * @param {string} groupName - The group name
 * @param {Object} groupsConfig - The groups configuration
 * @returns {Object} The group permissions
 */
function getGroupPermissions(groupName, groupsConfig) {
  if (!groupsConfig.groups || !groupsConfig.groups[groupName]) {
    logger.warn(`[GroupsService] Group '${groupName}' not found, using default group`);
    const defaultGroup = groupsConfig.defaultGroup || 'default';
    return groupsConfig.groups[defaultGroup]?.permissions || {};
  }

  return groupsConfig.groups[groupName].permissions || {};
}

/**
 * Filter endpoints based on user group permissions
 * @param {Object} endpointsConfig - The full endpoints configuration
 * @param {Object} user - The user object
 * @param {Object} groupsConfig - The groups configuration
 * @returns {Object} Filtered endpoints configuration
 */
function filterEndpointsByGroup(endpointsConfig, user, groupsConfig) {
  if (!user || !groupsConfig) {
    return endpointsConfig;
  }

  const userGroup = getUserGroup(user, groupsConfig);
  const permissions = getGroupPermissions(userGroup, groupsConfig);

  if (!permissions.endpoints) {
    return {};
  }

  // If user has access to all endpoints
  if (permissions.endpoints.includes('*')) {
    return endpointsConfig;
  }

  // Filter endpoints based on allowed list
  const filteredConfig = {};
  for (const endpoint of permissions.endpoints) {
    if (endpointsConfig[endpoint]) {
      filteredConfig[endpoint] = endpointsConfig[endpoint];
    }
  }

  return filteredConfig;
}

/**
 * Filter models based on user group permissions
 * @param {Object} modelsConfig - The full models configuration
 * @param {Object} user - The user object
 * @param {Object} groupsConfig - The groups configuration
 * @returns {Object} Filtered models configuration
 */
function filterModelsByGroup(modelsConfig, user, groupsConfig) {
  if (!user || !groupsConfig) {
    return modelsConfig;
  }

  const userGroup = getUserGroup(user, groupsConfig);
  const permissions = getGroupPermissions(userGroup, groupsConfig);

  if (!permissions.models) {
    return {};
  }

  const filteredConfig = {};

  // Iterate through each endpoint's models
  for (const [endpoint, models] of Object.entries(modelsConfig)) {
    const endpointPermissions = permissions.models[endpoint];

    if (!endpointPermissions) {
      // If endpoint is not in group permissions, skip it
      continue;
    }

    // If user has access to all models for this endpoint
    if (endpointPermissions.includes('*')) {
      filteredConfig[endpoint] = models;
      continue;
    }

    // Filter models based on allowed list
    if (Array.isArray(models)) {
      filteredConfig[endpoint] = models.filter((model) => endpointPermissions.includes(model));
    } else {
      filteredConfig[endpoint] = models;
    }
  }

  return filteredConfig;
}

/**
 * Check if user has access to assistants
 * @param {Object} user - The user object
 * @param {Object} groupsConfig - The groups configuration
 * @returns {boolean} Whether user has assistants access
 */
function hasAssistantsAccess(user, groupsConfig) {
  if (!user || !groupsConfig) {
    return false;
  }

  const userGroup = getUserGroup(user, groupsConfig);
  const permissions = getGroupPermissions(userGroup, groupsConfig);

  return permissions.assistants === true;
}

/**
 * Get allowed plugins for user
 * @param {Object} user - The user object
 * @param {Object} groupsConfig - The groups configuration
 * @returns {Array} Array of allowed plugin names
 */
function getAllowedPlugins(user, groupsConfig) {
  if (!user || !groupsConfig) {
    return [];
  }

  const userGroup = getUserGroup(user, groupsConfig);
  const permissions = getGroupPermissions(userGroup, groupsConfig);

  return permissions.plugins || [];
}

/**
 * Filter MCP servers based on user group permissions
 * @param {Object} mcpConfig - The full MCP servers configuration
 * @param {Object} user - The user object
 * @param {Object} groupsConfig - The groups configuration
 * @returns {Object} Filtered MCP configuration
 */
function filterMcpServersByGroup(mcpConfig, user, groupsConfig) {
  if (!mcpConfig || !groupsConfig) {
    return mcpConfig;
  }

  const userGroup = getUserGroup(user, groupsConfig);
  const permissions = getGroupPermissions(userGroup, groupsConfig);
  const allowedServers = permissions.mcpServers;

  if (!Array.isArray(allowedServers)) {
    return mcpConfig;
  }

  if (allowedServers.length === 0) {
    return {};
  }

  if (allowedServers.includes('*')) {
    return mcpConfig;
  }

  return Object.fromEntries(
    Object.entries(mcpConfig).filter(([serverName]) => allowedServers.includes(serverName)),
  );
}

/**
 * Enforce group MCP permissions and auto-enable servers the group allows.
 * @param {Object} params
 * @param {string[]} [params.requested] - MCP servers requested by the client or model spec
 * @param {Object} params.user - The user object
 * @param {Object} [params.groupsConfig] - The groups configuration
 * @param {string[]} [params.configuredServers] - MCP server names visible to the user
 * @returns {string[]} Final MCP server names to use
 */
function resolveMcpServersForUser({
  requested = [],
  user,
  groupsConfig,
  configuredServers = [],
}) {
  const sanitizedRequested = requested.filter(Boolean);

  if (sanitizedRequested.length === 1 && sanitizedRequested[0] === Constants.mcp_clear) {
    return [];
  }

  if (!groupsConfig) {
    return [...new Set(sanitizedRequested)];
  }

  const permissions = getGroupPermissions(getUserGroup(user, groupsConfig), groupsConfig);
  const allowed = permissions.mcpServers;

  if (!Array.isArray(allowed)) {
    return [...new Set(sanitizedRequested)];
  }

  if (allowed.length === 0) {
    return [];
  }

  const allowsAll = allowed.includes('*');
  const allows = (name) => allowsAll || allowed.includes(name);
  const result = new Set();

  for (const name of sanitizedRequested) {
    if (name !== Constants.mcp_clear && allows(name)) {
      result.add(name);
    }
  }

  const autoEnable = allowsAll
    ? configuredServers
    : allowed.filter((name) => name !== '*');

  for (const name of autoEnable) {
    if (configuredServers.length === 0 || configuredServers.includes(name)) {
      result.add(name);
    }
  }

  return [...result];
}

module.exports = {
  loadGroupsConfig,
  getDefaultGroupsConfig,
  getUserGroup,
  getGroupPermissions,
  filterEndpointsByGroup,
  filterModelsByGroup,
  hasAssistantsAccess,
  getAllowedPlugins,
  filterMcpServersByGroup,
  resolveMcpServersForUser,
};
