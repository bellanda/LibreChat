const { loadCustomEndpointsConfig } = require('@librechat/api');
const {
  CacheKeys,
  EModelEndpoint,
  isAgentsEndpoint,
  orderEndpointsConfig,
  defaultAgentCapabilities,
} = require('librechat-data-provider');
const loadDefaultEndpointsConfig = require('./loadDefaultEConfig');
const { filterEndpointsByGroup } = require('./GroupsService');
const { getCachedGroupsConfig } = require('~/server/middleware/groupsMiddleware');
const getLogStores = require('~/cache/getLogStores');
const { getAppConfig } = require('./app');
const { logger } = require('~/config');

/**
 *
 * @param {ServerRequest} req
 * @returns {Promise<TEndpointsConfig>}
 */
async function getEndpointsConfig(req) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  const cachedEndpointsConfig = await cache.get(CacheKeys.ENDPOINT_CONFIG);
  if (cachedEndpointsConfig) {
    // Apply group-based filtering to cached config
    if (req.user) {
      const groupsConfig = await getCachedGroupsConfig();
      return filterEndpointsByGroup(cachedEndpointsConfig, req.user, groupsConfig);
    }
    return cachedEndpointsConfig;
  }

  /**
   * Garante que appConfig seja sempre um objeto,
   * mesmo que getAppConfig retorne null/undefined ou req.config não esteja definido.
   * Evita erros do tipo "Cannot read properties of undefined (reading 'endpoints')".
   */
  const appConfig =
    req.config != null ? req.config : (await getAppConfig({ role: req.user?.role })) ?? {};
  const defaultEndpointsConfig = await loadDefaultEndpointsConfig(appConfig);
  const customEndpointsConfig = loadCustomEndpointsConfig(appConfig?.endpoints?.custom);

  /** @type {TEndpointsConfig} */
  const mergedConfig = {
    ...defaultEndpointsConfig,
    ...customEndpointsConfig,
  };

  if (appConfig.endpoints?.[EModelEndpoint.azureOpenAI]) {
    /** @type {Omit<TConfig, 'order'>} */
    mergedConfig[EModelEndpoint.azureOpenAI] = {
      userProvide: false,
    };
  }

  // Enable Anthropic endpoint when Vertex AI is configured in YAML
  if (appConfig.endpoints?.[EModelEndpoint.anthropic]?.vertexConfig?.enabled) {
    /** @type {Omit<TConfig, 'order'>} */
    mergedConfig[EModelEndpoint.anthropic] = {
      userProvide: false,
    };
  }

  if (appConfig.endpoints?.[EModelEndpoint.azureOpenAI]?.assistants) {
    /** @type {Omit<TConfig, 'order'>} */
    mergedConfig[EModelEndpoint.azureAssistants] = {
      userProvide: false,
    };
  }

  if (
    mergedConfig[EModelEndpoint.assistants] &&
    appConfig?.endpoints?.[EModelEndpoint.assistants]
  ) {
    const { disableBuilder, retrievalModels, capabilities, version, ..._rest } =
      appConfig.endpoints[EModelEndpoint.assistants];

    mergedConfig[EModelEndpoint.assistants] = {
      ...mergedConfig[EModelEndpoint.assistants],
      version,
      retrievalModels,
      disableBuilder,
      capabilities,
    };
  }
  if (mergedConfig[EModelEndpoint.agents] && appConfig?.endpoints?.[EModelEndpoint.agents]) {
    const { disableBuilder, capabilities, allowedProviders, ..._rest } =
      appConfig.endpoints[EModelEndpoint.agents];

    mergedConfig[EModelEndpoint.agents] = {
      ...mergedConfig[EModelEndpoint.agents],
      allowedProviders,
      disableBuilder,
      capabilities,
    };
  }

  if (
    mergedConfig[EModelEndpoint.azureAssistants] &&
    appConfig?.endpoints?.[EModelEndpoint.azureAssistants]
  ) {
    const { disableBuilder, retrievalModels, capabilities, version, ..._rest } =
      appConfig.endpoints[EModelEndpoint.azureAssistants];

    mergedConfig[EModelEndpoint.azureAssistants] = {
      ...mergedConfig[EModelEndpoint.azureAssistants],
      version,
      retrievalModels,
      disableBuilder,
      capabilities,
    };
  }

  if (mergedConfig[EModelEndpoint.bedrock] && appConfig?.endpoints?.[EModelEndpoint.bedrock]) {
    const { availableRegions } = appConfig.endpoints[EModelEndpoint.bedrock];
    mergedConfig[EModelEndpoint.bedrock] = {
      ...mergedConfig[EModelEndpoint.bedrock],
      availableRegions,
    };
  }

  const endpointsConfig = orderEndpointsConfig(mergedConfig);

  await cache.set(CacheKeys.ENDPOINT_CONFIG, endpointsConfig);

  logger.info('[getEndpointsConfig] Endpoints config:', endpointsConfig);

  // Apply group-based filtering before returning
  if (req.user) {
    const groupsConfig = await getCachedGroupsConfig();
    return filterEndpointsByGroup(endpointsConfig, req.user, groupsConfig);
  }

  return endpointsConfig;
}

/**
 * @param {ServerRequest} req
 * @param {import('librechat-data-provider').AgentCapabilities} capability
 * @returns {Promise<boolean>}
 */
const checkCapability = async (req, capability) => {
  const isAgents = isAgentsEndpoint(req.body?.endpointType || req.body?.endpoint);
  const endpointsConfig = await getEndpointsConfig(req);
  const capabilities =
    isAgents || endpointsConfig?.[EModelEndpoint.agents]?.capabilities != null
      ? (endpointsConfig?.[EModelEndpoint.agents]?.capabilities ?? [])
      : defaultAgentCapabilities;
  return capabilities.includes(capability);
};

module.exports = { getEndpointsConfig, checkCapability };
