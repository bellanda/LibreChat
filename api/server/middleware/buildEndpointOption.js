const {
  parseCompactConvo,
  EModelEndpoint,
  isAgentsEndpoint,
  EndpointURLs,
  Constants,
} = require('librechat-data-provider');
const azureAssistants = require('~/server/services/Endpoints/azureAssistants');
const { getModelsConfig } = require('~/server/controllers/ModelController');
const assistants = require('~/server/services/Endpoints/assistants');
const gptPlugins = require('~/server/services/Endpoints/gptPlugins');
const { processFiles } = require('~/server/services/Files/process');
const anthropic = require('~/server/services/Endpoints/anthropic');
const bedrock = require('~/server/services/Endpoints/bedrock');
const openAI = require('~/server/services/Endpoints/openAI');
const agents = require('~/server/services/Endpoints/agents');
const custom = require('~/server/services/Endpoints/custom');
const google = require('~/server/services/Endpoints/google');
const { handleError } = require('~/server/utils');
const { getCachedGroupsConfig } = require('./groupsMiddleware');
const { getUserGroup, getGroupPermissions } = require('~/server/services/Config/GroupsService');
const { isEnabled, extractEnvVariable } = require('~/server/utils');
const { logger } = require('~/config');

const buildFunction = {
  [EModelEndpoint.openAI]: openAI.buildOptions,
  [EModelEndpoint.google]: google.buildOptions,
  [EModelEndpoint.custom]: custom.buildOptions,
  [EModelEndpoint.agents]: agents.buildOptions,
  [EModelEndpoint.bedrock]: bedrock.buildOptions,
  [EModelEndpoint.azureOpenAI]: openAI.buildOptions,
  [EModelEndpoint.anthropic]: anthropic.buildOptions,
  [EModelEndpoint.gptPlugins]: gptPlugins.buildOptions,
  [EModelEndpoint.assistants]: assistants.buildOptions,
  [EModelEndpoint.azureAssistants]: azureAssistants.buildOptions,
};

async function buildEndpointOption(req, res, next) {
  const { endpoint, endpointType } = req.body;
  let parsedBody;
  try {
    parsedBody = parseCompactConvo({ endpoint, endpointType, conversation: req.body });
  } catch (error) {
    return handleError(res, { text: 'Error parsing conversation' });
  }

  // Validate group permissions for endpoint and model
  if (req.user) {
    try {
      const groupsConfig = await getCachedGroupsConfig();
      if (groupsConfig) {
        const userGroup = getUserGroup(req.user, groupsConfig);
        const permissions = getGroupPermissions(userGroup, groupsConfig);

        // Check endpoint permission
        if (endpoint && permissions.endpoints && !permissions.endpoints.includes('*')) {
          if (!permissions.endpoints.includes(endpoint)) {
            logger.warn(
              `[buildEndpointOption] User '${req.user.email}' in group '${userGroup}' attempted to use restricted endpoint '${endpoint}'`,
            );
            return handleError(res, {
              text: 'Access denied: endpoint not allowed for your user group',
            });
          }
        }

        // Check model permission
        if (parsedBody.model && endpoint && permissions.models) {
          const endpointPermissions = permissions.models[endpoint];
          if (endpointPermissions && !endpointPermissions.includes('*')) {
            if (!endpointPermissions.includes(parsedBody.model)) {
              logger.warn(
                `[buildEndpointOption] User '${req.user.email}' in group '${userGroup}' attempted to use restricted model '${parsedBody.model}' for endpoint '${endpoint}'`,
              );
              return handleError(res, {
                text: 'Access denied: model not allowed for your user group',
              });
            }
          } else if (!endpointPermissions) {
            logger.warn(
              `[buildEndpointOption] User '${req.user.email}' in group '${userGroup}' attempted to use model '${parsedBody.model}' for endpoint '${endpoint}' (endpoint not allowed)`,
            );
            return handleError(res, {
              text: 'Access denied: endpoint not allowed for your user group',
            });
          }
        }
      }
    } catch (error) {
      logger.error('[buildEndpointOption] Error validating group permissions:', error);
      // Continue without validation to avoid breaking the application
    }
  }

  if (req.app.locals.modelSpecs?.list && req.app.locals.modelSpecs?.enforce) {
    /** @type {{ list: TModelSpec[] }}*/
    const { list } = req.app.locals.modelSpecs;
    const { spec } = parsedBody;

    if (!spec) {
      return handleError(res, { text: 'No model spec selected' });
    }

    const currentModelSpec = list.find((s) => s.name === spec);
    if (!currentModelSpec) {
      return handleError(res, { text: 'Invalid model spec' });
    }

    if (endpoint !== currentModelSpec.preset.endpoint) {
      return handleError(res, { text: 'Model spec mismatch' });
    }

    if (
      currentModelSpec.preset.endpoint !== EModelEndpoint.gptPlugins &&
      currentModelSpec.preset.tools
    ) {
      return handleError(res, {
        text: `Only the "${EModelEndpoint.gptPlugins}" endpoint can have tools defined in the preset`,
      });
    }

    try {
      currentModelSpec.preset.spec = spec;
      if (currentModelSpec.iconURL != null && currentModelSpec.iconURL !== '') {
        currentModelSpec.preset.iconURL = currentModelSpec.iconURL;
      }
      parsedBody = parseCompactConvo({
        endpoint,
        endpointType,
        conversation: currentModelSpec.preset,
      });
    } catch (error) {
      return handleError(res, { text: 'Error parsing model spec' });
    }
  }

  try {
    const isAgents =
      isAgentsEndpoint(endpoint) || req.baseUrl.startsWith(EndpointURLs[EModelEndpoint.agents]);
    const endpointFn = buildFunction[isAgents ? EModelEndpoint.agents : (endpointType ?? endpoint)];
    const builder = isAgents ? (...args) => endpointFn(req, ...args) : endpointFn;

    // TODO: use object params
    req.body.endpointOption = await builder(endpoint, parsedBody, endpointType);

    // TODO: use `getModelsConfig` only when necessary
    const modelsConfig = await getModelsConfig(req);
    req.body.endpointOption.modelsConfig = modelsConfig;
    if (req.body.files && !isAgents) {
      req.body.endpointOption.attachments = processFiles(req.body.files);
    }
    next();
  } catch (error) {
    return handleError(res, { text: 'Error building endpoint option' });
  }
}

module.exports = buildEndpointOption;
