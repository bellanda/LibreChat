const { logger } = require('@librechat/data-schemas');
const {
  isAgentsEndpoint,
  removeNullishValues,
  Constants,
  EModelEndpoint,
} = require('librechat-data-provider');
const { getCustomEndpointConfig } = require('@librechat/api');
const { loadAgent } = require('~/models/Agent');

const buildOptions = async (req, endpoint, parsedBody, endpointType) => {
  const {
    spec,
    iconURL,
    agent_id,
    instructions,
    maxContextTokens,
    promptPrefix,
    ...model_parameters
  } = parsedBody;

  // Check if web search and/or auto mode are active in ephemeral agent
  const ephemeralAgent = req.body.ephemeralAgent;
  const isWebSearchActive = ephemeralAgent && ephemeralAgent.web_search === true;
  const isAutoMode = ephemeralAgent && ephemeralAgent.auto_mode === true;

  // Preserve user's promptPrefix and combine with endpoint configuration when web search is active
  let finalPromptPrefix = promptPrefix;

  // Aplicar promptPrefix global se não houver um específico do usuário
  if (!finalPromptPrefix) {
    const allConfig = req.config?.endpoints?.all;
    if (allConfig && allConfig.promptPrefix) {
      finalPromptPrefix = allConfig.promptPrefix;
    }
  }

  if (isWebSearchActive) {
    // Check for endpoint-specific configuration in req.config
    let endpointConfig = req.config?.endpoints?.[endpoint];

    // For custom endpoints, use getCustomEndpointConfig
    if (!endpointConfig) {
      try {
        endpointConfig = await getCustomEndpointConfig(endpoint);
      } catch (error) {
        // Not a custom endpoint or configuration not found
      }
    }

    // Combine user promptPrefix with endpoint promptPrefix when web search is active
    if (endpointConfig && endpointConfig.promptPrefix) {
      if (finalPromptPrefix) {
        // User has custom instructions, combine them with endpoint instructions
        finalPromptPrefix = `${finalPromptPrefix}\n\n${endpointConfig.promptPrefix}`;
      } else {
        // No user instructions, use endpoint instructions
        finalPromptPrefix = endpointConfig.promptPrefix;
      }
    }
  }

  // Injetar instruções do modo AUTO quando auto_mode estiver ativo
  if (isAutoMode) {
    let autoPrompt;
    try {
      // Lazy require para evitar dependência circular em tempo de carga
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const { generateAutoModeToolsPrompt } = require('@librechat/api');
      autoPrompt = generateAutoModeToolsPrompt?.();
    } catch (e) {
      // Se algo falhar ao carregar o prompt, segue sem modificar o promptPrefix
      logger.warn('[agents/build] Failed to load auto mode tools prompt', e);
    }

    if (autoPrompt && typeof autoPrompt === 'string' && autoPrompt.trim().length > 0) {
      finalPromptPrefix = finalPromptPrefix
        ? `${finalPromptPrefix}\n\n${autoPrompt}`
        : autoPrompt;
    }
  }

  // Set the final promptPrefix in req.body for ephemeral agent
  if (finalPromptPrefix) {
    req.body.promptPrefix = finalPromptPrefix;
  }
  const agentPromise = loadAgent({
    req,
    spec,
    agent_id: isAgentsEndpoint(endpoint) ? agent_id : Constants.EPHEMERAL_AGENT_ID,
    endpoint,
    model_parameters,
  }).catch((error) => {
    logger.error(`[/agents/:${agent_id}] Error retrieving agent during build options step`, error);
    return undefined;
  });

  /** @type {import('librechat-data-provider').TConversation | undefined} */
  const addedConvo = req.body?.addedConvo;

  return removeNullishValues({
    spec,
    iconURL,
    endpoint,
    agent_id,
    endpointType,
    instructions,
    maxContextTokens,
    promptPrefix: finalPromptPrefix,
    model_parameters,
    agent: agentPromise,
  });
};

module.exports = { buildOptions };
