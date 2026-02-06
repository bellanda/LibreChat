/**
 * Suggested conversation starters based on the user's last conversations.
 * Uses only custom endpoints (same as chat) – no fallback to OpenAI API.
 * Enable with SUGGESTED_STARTERS_ENABLED=true.
 *
 * Tokens: esta rota chama o LLM diretamente (sem conversationId). O fluxo normal de
 * spendTokens do chat não é usado aqui, então o consumo não é debitado da cota do usuário.
 * Contexto é limitado a títulos das últimas 2 conversas (MAX_CHARS_PER_TITLE, MAX_TOTAL_CONTEXT_CHARS).
 */

const { isEnabled } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { EModelEndpoint, normalizeEndpointName } = require('librechat-data-provider');
const { getConvosByCursor } = require('~/models/Conversation');
const custom = require('~/server/services/Endpoints/custom');

const MAX_STARTERS = 6;
const MAX_STARTERS_FROM_CONTEXT = 4;
const MAX_STARTERS_ORGANIZATIONAL = 2;
const MAX_CHARS_PER_STARTER = 30;
/** Limit context size to avoid burning tokens (titles only, trimmed). */
const MAX_CHARS_PER_TITLE = 40;
const MAX_TOTAL_CONTEXT_CHARS = 150;

/** Duas últimas sugestões sempre de ambiente organizacional (não vêm do LLM). */
const ORGANIZATIONAL_STARTERS = [
  'Traduza para português',
  'Organize em tópicos',
  'Redija um email profissional',
  'Resuma em bullet points',
  'Revise o texto',
  'Explique de forma simples',
  'Crie um plano de ação',
  'Forneça uma lista de tarefas',
  'Elabore um relatório',
  'Prepare uma apresentação',
  'Escreva um artigo',
  'Prepare um e-mail',
  'Prepare um SMS',
  'Prepare um post no LinkedIn',
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Resolves endpoint + model only from custom endpoints (same as chat). No openAI fallback.
 * Prefers suggestedStartersModel / titleModel from config if that model exists in a custom endpoint;
 * otherwise uses the first custom endpoint's titleModel or first model.
 * @param {Object} appConfig - req.config
 * @returns {{ endpoint: string, model: string } | null}
 */
function getSuggestedStartersEndpointAndModel(appConfig) {
  const customEndpoints = appConfig?.endpoints?.[EModelEndpoint.custom];
  if (!Array.isArray(customEndpoints) || customEndpoints.length === 0) {
    return null;
  }

  const preferredModel =
    appConfig?.endpoints?.all?.suggestedStartersModel?.trim() ||
    appConfig?.endpoints?.all?.titleModel?.trim();

  if (preferredModel) {
    for (const ep of customEndpoints) {
      const defaultModels = ep?.models?.default;
      const hasModel =
        (Array.isArray(defaultModels) &&
          defaultModels.some((m) => (typeof m === 'string' ? m : m?.name) === preferredModel)) ||
        ep?.titleModel === preferredModel;
      if (hasModel && ep?.name) {
        return {
          endpoint: normalizeEndpointName(ep.name),
          model: preferredModel,
        };
      }
    }
  }

  const first = customEndpoints[0];
  const name = first?.name;
  const defaultModels = first?.models?.default;
  const model =
    first?.titleModel?.trim() ||
    (Array.isArray(defaultModels) && defaultModels[0] != null
      ? typeof defaultModels[0] === 'string'
        ? defaultModels[0]
        : defaultModels[0]?.name
      : null);
  if (!name || !model) {
    return null;
  }
  return { endpoint: normalizeEndpointName(name), model };
}

/**
 * Calls the same custom endpoint client as the chat. No openAI fallback.
 */
async function fetchSuggestedStartersFromLLM({ context, req, res }) {
  const appConfig = req.config ?? null;
  const resolved = getSuggestedStartersEndpointAndModel(appConfig);
  if (!resolved) {
    if (process.env.DEBUG_LOGGING === 'true') {
      logger.debug('[suggestedStarters] No custom endpoint available, skipping');
    }
    return null;
  }

  const { endpoint, model } = resolved;
  const reqForInit = {
    ...req,
    body: {
      model,
      endpoint,
    },
  };
  const endpointOption = { modelOptions: { model } };

  let client;
  try {
    const initialized = await custom.initializeClient({
      req: reqForInit,
      res,
      endpointOption,
      overrideEndpoint: endpoint,
    });
    client = initialized?.client;
  } catch (err) {
    logger.warn('[suggestedStarters] Failed to initialize client', { endpoint, message: err?.message });
    return null;
  }

  if (!client) {
    return null;
  }

  const systemPrompt = `You suggest short phrases to start a new chat. Reply with exactly ${MAX_STARTERS_FROM_CONTEXT} phrases, one per line. Each phrase max ${MAX_CHARS_PER_STARTER} characters, no numbering, no quotes. Always write the phrases in Portuguese (Brazil).`;
  const userPrompt = `Com base nestes títulos de conversas recentes, sugira exatamente ${MAX_STARTERS_FROM_CONTEXT} frases curtas para iniciar uma nova conversa (em português do Brasil):\n\n${context}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const content = await client.chatCompletion({
      payload: messages,
      abortController: new AbortController(),
    });
    const text = typeof content === 'string' ? content.trim() : '';
    if (!text) {
      return null;
    }
    const contextLines = text
      .split(/\n/)
      .map((line) => line.replace(/^[\d.)\-\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, MAX_STARTERS_FROM_CONTEXT)
      .map((line) => line.slice(0, MAX_CHARS_PER_STARTER));
    if (contextLines.length < 2) {
      return null;
    }
    const organizational = shuffle([...ORGANIZATIONAL_STARTERS]).slice(0, MAX_STARTERS_ORGANIZATIONAL);
    return [...contextLines, ...organizational];
  } catch (err) {
    logger.warn('[suggestedStarters] LLM request failed', { model, message: err?.message });
    return null;
  }
}

/**
 * Returns suggested conversation starters for the current user based on their last 2 conversations.
 * Uses only custom endpoints (same as chat); no fallback to OpenAI API.
 * @param {Object} req - Express request (req.user.id, req.config must be set)
 * @param {Object} res - Express response (for client initialization)
 * @returns {Promise<{ starters: string[] } | null>} starters array or null when disabled/failure
 */
async function getSuggestedStarters(req, res) {
  if (!isEnabled(process.env.SUGGESTED_STARTERS_ENABLED)) {
    if (process.env.DEBUG_LOGGING === 'true') {
      logger.debug('[suggestedStarters] Disabled (SUGGESTED_STARTERS_ENABLED not true)');
    }
    return null;
  }

  try {
    const { conversations } = await getConvosByCursor(req.user.id, {
      limit: 2,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    });

    if (!conversations?.length) {
      if (process.env.DEBUG_LOGGING === 'true') {
        logger.debug('[suggestedStarters] No recent conversations, skipping');
      }
      return null;
    }

    let context = conversations
      .map((c, i) => `${i + 1}. ${(c.title || 'New conversation').slice(0, MAX_CHARS_PER_TITLE)}`)
      .join('\n');
    if (context.length > MAX_TOTAL_CONTEXT_CHARS) {
      context = context.slice(0, MAX_TOTAL_CONTEXT_CHARS);
    }

    const starters = await fetchSuggestedStartersFromLLM({
      context,
      req,
      res,
    });

    if (!starters?.length) {
      if (process.env.DEBUG_LOGGING === 'true') {
        logger.debug('[suggestedStarters] LLM returned no starters');
      }
      return null;
    }

    if (process.env.DEBUG_LOGGING === 'true') {
      logger.debug('[suggestedStarters] Returning starters', { count: starters.length });
    }
    return { starters };
  } catch (err) {
    logger.error('[suggestedStarters] Error', err);
    return null;
  }
}

module.exports = { getSuggestedStarters };
