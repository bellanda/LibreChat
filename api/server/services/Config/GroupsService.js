const fs = require('fs');
const path = require('path');
const { logger } = require('~/config');

/**
 * Load the groups configuration from the groups-config.json file
 * @returns {Promise<Object>} The groups configuration object
 */
async function loadGroupsConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'groups-config.json');

    if (!fs.existsSync(configPath)) {
      logger.warn('[GroupsService] groups-config.json not found, using default configuration');
      return getDefaultGroupsConfig();
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const groupsConfig = JSON.parse(configData);

    return groupsConfig;
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
            openai: ['*'],
            google: ['*'],
            anthropic: ['*'],
          },
          assistants: false,
          plugins: [],
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

module.exports = {
  loadGroupsConfig,
  getDefaultGroupsConfig,
  getUserGroup,
  getGroupPermissions,
  filterEndpointsByGroup,
  filterModelsByGroup,
  hasAssistantsAccess,
  getAllowedPlugins,
};
