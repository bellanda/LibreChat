const { EModelEndpoint, getEnabledEndpoints } = require('librechat-data-provider');
const loadAsyncEndpoints = require('./loadAsyncEndpoints');
const { config } = require('./EndpointService');
const { logger } = require('~/config');

/**
 * Load async endpoints and return a configuration object
 * @param {Express.Request} req - The request object
 * @returns {Promise<Object.<string, EndpointWithOrder>>} An object whose keys are endpoint names and values are objects that contain the endpoint configuration and an order.
 */
async function loadDefaultEndpointsConfig(req) {
  const { google, gptPlugins } = await loadAsyncEndpoints(req);
  const { assistants, azureAssistants, azureOpenAI, chatGPTBrowser } = config;

  const enabledEndpoints = getEnabledEndpoints();

  const endpointConfig = {
    [EModelEndpoint.openAI]: config[EModelEndpoint.openAI],
    [EModelEndpoint.agents]: config[EModelEndpoint.agents],
    [EModelEndpoint.assistants]: assistants,
    [EModelEndpoint.azureAssistants]: azureAssistants,
    [EModelEndpoint.azureOpenAI]: azureOpenAI,
    [EModelEndpoint.google]: google,
    [EModelEndpoint.chatGPTBrowser]: chatGPTBrowser,
    [EModelEndpoint.gptPlugins]: gptPlugins,
    [EModelEndpoint.anthropic]: config[EModelEndpoint.anthropic],
    [EModelEndpoint.bedrock]: config[EModelEndpoint.bedrock],
  };

  logger.debug('[loadDefaultEndpointsConfig] Endpoint config before ordering:', endpointConfig);

  const orderedAndFilteredEndpoints = enabledEndpoints.reduce((config, key, index) => {
    logger.debug(`[loadDefaultEndpointsConfig] Processing endpoint '${key}' at index ${index}`);

    if (endpointConfig[key]) {
      logger.debug(`[loadDefaultEndpointsConfig] Adding '${key}' with order ${index}`);
      config[key] = { ...(endpointConfig[key] ?? {}), order: index };
    } else {
      logger.debug(`[loadDefaultEndpointsConfig] Skipping '${key}' - no config found`);
    }
    return config;
  }, {});

  logger.debug(
    '[loadDefaultEndpointsConfig] Final ordered and filtered endpoints:',
    orderedAndFilteredEndpoints,
  );
  return orderedAndFilteredEndpoints;
}

module.exports = loadDefaultEndpointsConfig;
