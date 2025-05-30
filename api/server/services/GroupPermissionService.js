const fs = require('fs');
const path = require('path');
const { logger } = require('~/config');

class GroupPermissionService {
  constructor() {
    this.groupsConfig = null;
    this.loadGroupsConfig();
  }

  /**
   * Load groups configuration from JSON file
   */
  loadGroupsConfig() {
    try {
      const configPath = path.join(process.cwd(), 'groups-config.json');

      if (!fs.existsSync(configPath)) {
        console.error('Groups config file not found at:', configPath);
        this.groupsConfig = { groups: {}, defaultGroup: 'default' };
        return;
      }

      const configData = fs.readFileSync(configPath, 'utf8');
      this.groupsConfig = JSON.parse(configData);
    } catch (error) {
      console.error('Error loading groups configuration:', error);
      this.groupsConfig = { groups: {}, defaultGroup: 'default' };
    }
  }

  /**
   * Get default configuration if file doesn't exist
   */
  getDefaultConfig() {
    return {
      groups: {
        default: {
          name: 'Default Users',
          description: 'Standard user group with basic access',
          permissions: {
            endpoints: ['*'],
            models: { '*': ['*'] },
            agents: ['*'],
            assistants: true,
            plugins: ['*'],
          },
        },
      },
      defaultGroup: 'default',
    };
  }

  /**
   * Get user's group permissions
   * @param {string} userGroup - User's group name
   * @returns {Object} Group permissions
   */
  getUserGroupPermissions(userGroup) {
    if (!this.groupsConfig || !userGroup) {
      userGroup = this.groupsConfig?.defaultGroup || 'default';
    }

    const group = this.groupsConfig.groups[userGroup];
    if (!group) {
      logger.warn(`Group '${userGroup}' not found, using default group`);
      const defaultGroup =
        this.groupsConfig.groups[this.groupsConfig.defaultGroup] ||
        this.groupsConfig.groups.default;

      // Ensure default group has valid structure
      if (!defaultGroup) {
        return this.getDefaultConfig().groups.default;
      }

      return this.ensureValidPermissions(defaultGroup);
    }

    return this.ensureValidPermissions(group);
  }

  /**
   * Ensure permissions object has valid structure
   * @param {Object} group - Group object
   * @returns {Object} Group with valid permissions
   */
  ensureValidPermissions(group) {
    const defaultPermissions = {
      endpoints: [],
      models: {},
      agents: [],
      assistants: false,
      plugins: [],
    };

    if (!group.permissions) {
      group.permissions = defaultPermissions;
    } else {
      // Ensure each permission property exists and has correct type
      if (!Array.isArray(group.permissions.endpoints)) {
        group.permissions.endpoints = [];
      }
      if (typeof group.permissions.models !== 'object' || group.permissions.models === null) {
        group.permissions.models = {};
      }
      if (!Array.isArray(group.permissions.agents)) {
        group.permissions.agents = [];
      }
      if (typeof group.permissions.assistants !== 'boolean') {
        group.permissions.assistants = false;
      }
      if (!Array.isArray(group.permissions.plugins)) {
        group.permissions.plugins = [];
      }
    }

    return group;
  }

  /**
   * Check if user has access to a specific endpoint
   * @param {string} userGroup - User's group name
   * @param {string} endpoint - Endpoint name
   * @returns {boolean} Has access
   */
  hasEndpointAccess(userGroup, endpoint) {
    console.log(`hasEndpointAccess - Checking userGroup: ${userGroup}, endpoint: ${endpoint}`);

    const permissions = this.getUserGroupPermissions(userGroup);
    console.log(
      `hasEndpointAccess - User permissions:`,
      JSON.stringify(permissions.permissions, null, 2),
    );

    const allowedEndpoints = permissions.permissions.endpoints;
    console.log(`hasEndpointAccess - Allowed endpoints:`, allowedEndpoints);

    // Check if allowedEndpoints is a valid array
    if (!Array.isArray(allowedEndpoints)) {
      console.warn(`Invalid endpoints configuration for group ${userGroup}:`, allowedEndpoints);
      return false;
    }

    const hasAccess = allowedEndpoints.includes('*') || allowedEndpoints.includes(endpoint);
    console.log(`hasEndpointAccess - Result:`, hasAccess);

    return hasAccess;
  }

  /**
   * Check if user has access to a specific model
   * @param {string} userGroup - User's group name
   * @param {string} endpoint - Endpoint name
   * @param {string} model - Model name
   * @returns {boolean} Has access
   */
  hasModelAccess(userGroup, endpoint, model) {
    console.log(
      `hasModelAccess - Checking userGroup: ${userGroup}, endpoint: ${endpoint}, model: ${model}`,
    );

    const permissions = this.getUserGroupPermissions(userGroup);
    const allowedModels = permissions.permissions.models;
    console.log(`hasModelAccess - Allowed models:`, JSON.stringify(allowedModels, null, 2));

    // Check if all models are allowed
    if (allowedModels['*'] && allowedModels['*'].includes('*')) {
      console.log(`hasModelAccess - All models allowed globally`);
      return true;
    }

    // Check if specific endpoint has all models allowed
    if (allowedModels[endpoint] && allowedModels[endpoint].includes('*')) {
      console.log(`hasModelAccess - All models allowed for endpoint ${endpoint}`);
      return true;
    }

    // Check if specific model is allowed for the endpoint
    if (allowedModels[endpoint] && allowedModels[endpoint].includes(model)) {
      console.log(`hasModelAccess - Specific model ${model} allowed for endpoint ${endpoint}`);
      return true;
    }

    console.log(`hasModelAccess - Model ${model} NOT allowed for endpoint ${endpoint}`);
    return false;
  }

  /**
   * Check if user has access to agents
   * @param {string} userGroup - User's group name
   * @param {string} agentId - Agent ID (optional)
   * @returns {boolean} Has access
   */
  hasAgentAccess(userGroup, agentId = null) {
    const permissions = this.getUserGroupPermissions(userGroup);
    const allowedAgents = permissions.permissions.agents;

    // Check if allowedAgents is a valid array
    if (!Array.isArray(allowedAgents)) {
      console.warn(`Invalid agents configuration for group ${userGroup}:`, allowedAgents);
      return false;
    }

    if (allowedAgents.includes('*')) {
      return true;
    }

    if (agentId && allowedAgents.includes(agentId)) {
      return true;
    }

    return allowedAgents.length > 0 && !agentId;
  }

  /**
   * Check if user has access to assistants
   * @param {string} userGroup - User's group name
   * @returns {boolean} Has access
   */
  hasAssistantAccess(userGroup) {
    const permissions = this.getUserGroupPermissions(userGroup);
    return permissions.permissions.assistants === true;
  }

  /**
   * Check if user has access to a specific plugin
   * @param {string} userGroup - User's group name
   * @param {string} plugin - Plugin name
   * @returns {boolean} Has access
   */
  hasPluginAccess(userGroup, plugin) {
    const permissions = this.getUserGroupPermissions(userGroup);
    const allowedPlugins = permissions.permissions.plugins;

    // Check if allowedPlugins is a valid array
    if (!Array.isArray(allowedPlugins)) {
      console.warn(`Invalid plugins configuration for group ${userGroup}:`, allowedPlugins);
      return false;
    }

    return allowedPlugins.includes('*') || allowedPlugins.includes(plugin);
  }

  /**
   * Filter endpoints based on user permissions
   * @param {string} userGroup - User's group name
   * @param {Object} endpointsConfig - Original endpoints configuration
   * @returns {Object} Filtered endpoints configuration
   */
  filterEndpointsForUser(userGroup, endpointsConfig) {
    const permissions = this.getUserGroupPermissions(userGroup);
    const allowedEndpoints = permissions.permissions.endpoints;

    // Check if allowedEndpoints is a valid array
    if (!Array.isArray(allowedEndpoints)) {
      console.warn(`Invalid endpoints configuration for group ${userGroup}:`, allowedEndpoints);
      return {};
    }

    // If all endpoints are allowed, return original config
    if (allowedEndpoints.includes('*')) {
      return endpointsConfig;
    }

    const filteredConfig = {};

    for (const [endpoint, config] of Object.entries(endpointsConfig)) {
      if (allowedEndpoints.includes(endpoint)) {
        filteredConfig[endpoint] = config;
      }
    }

    return filteredConfig;
  }

  /**
   * Filter models based on user permissions
   * @param {string} userGroup - User's group name
   * @param {Object} modelsConfig - Original models configuration
   * @returns {Object} Filtered models configuration
   */
  filterModelsForUser(userGroup, modelsConfig) {
    const permissions = this.getUserGroupPermissions(userGroup);
    const allowedModels = permissions.permissions.models;

    // If all models are allowed, return original config
    if (allowedModels['*'] && allowedModels['*'].includes('*')) {
      return modelsConfig;
    }

    const filteredConfig = {};

    for (const [endpoint, models] of Object.entries(modelsConfig)) {
      // Check if endpoint is allowed
      if (!this.hasEndpointAccess(userGroup, endpoint)) {
        continue;
      }

      // If all models for this endpoint are allowed
      if (allowedModels[endpoint] && allowedModels[endpoint].includes('*')) {
        filteredConfig[endpoint] = models;
        continue;
      }

      // Filter specific models
      if (allowedModels[endpoint] && Array.isArray(models)) {
        filteredConfig[endpoint] = models.filter((model) =>
          allowedModels[endpoint].includes(model),
        );
      } else if (allowedModels[endpoint] && typeof models === 'object') {
        filteredConfig[endpoint] = {};
        for (const [key, value] of Object.entries(models)) {
          if (Array.isArray(value)) {
            const filteredModels = value.filter((model) => allowedModels[endpoint].includes(model));
            if (filteredModels.length > 0) {
              filteredConfig[endpoint][key] = filteredModels;
            }
          } else {
            filteredConfig[endpoint][key] = value;
          }
        }
      }
    }

    return filteredConfig;
  }

  /**
   * Filter agents based on user permissions
   * @param {string} userGroup - User's group name
   * @param {Array} agentsList - Original agents list
   * @returns {Array} Filtered agents list
   */
  filterAgentsForUser(userGroup, agentsList) {
    const permissions = this.getUserGroupPermissions(userGroup);
    const allowedAgents = permissions.permissions.agents;

    // Check if allowedAgents is a valid array
    if (!Array.isArray(allowedAgents)) {
      console.warn(`Invalid agents configuration for group ${userGroup}:`, allowedAgents);
      return [];
    }

    // If all agents are allowed, return original list
    if (allowedAgents.includes('*')) {
      return agentsList;
    }

    // If no agents are allowed, return empty array
    if (allowedAgents.length === 0) {
      return [];
    }

    // Filter agents by ID and name
    return agentsList.filter((agent) => {
      return allowedAgents.includes(agent.id) || allowedAgents.includes(agent.name);
    });
  }

  /**
   * Reload configuration from file
   */
  reloadConfig() {
    this.loadGroupsConfig();
  }
}

// Create singleton instance
const groupPermissionService = new GroupPermissionService();

module.exports = groupPermissionService;
