/**
 * Suggested conversation starters based on the user's last conversations.
 * Isolated feature: set SUGGESTED_STARTERS_ENABLED=true and SUGGESTED_STARTERS_MODEL to enable.
 * Remove this file and the route in convos.js to disable without affecting the rest of the app.
 */

const { isEnabled } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { getConvosByCursor } = require('~/models/Conversation');

const MAX_STARTERS = 4;
const MAX_WORDS_PER_PHRASE = 6;
/** Limit context size to avoid burning tokens (titles only, trimmed). */
const MAX_CHARS_PER_TITLE = 40;
const MAX_TOTAL_CONTEXT_CHARS = 150;

/**
 * Calls an OpenAI-compatible chat completion endpoint to generate short starter phrases.
 * @param {Object} params
 * @param {string} params.context - Text describing the user's last conversations (e.g. titles)
 * @param {string} params.model - Model name (e.g. gpt-4o-mini, or a small OSS model like gpt-oss20B)
 * @param {string} params.baseURL - API base URL
 * @param {string} params.apiKey - API key
 * @returns {Promise<string[] | null>} Up to 4 phrases or null on error
 */
async function fetchSuggestedStartersFromLLM({ context, model, baseURL, apiKey }) {
  const systemPrompt = `You suggest short phrases to start a new chat. Reply with exactly ${MAX_STARTERS} phrases, one per line. Each phrase must be 1-${MAX_WORDS_PER_PHRASE} words, no numbering, no quotes. Language: same as the conversation titles.`;
  const userPrompt = `Based on these recent conversation titles, suggest ${MAX_STARTERS} short phrases to start a new conversation:\n\n${context}`;

  const url = `${baseURL.replace(/\/$/, '')}/chat/completions`;
  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 120,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.warn('[suggestedStarters] LLM request failed', { status: res.status, body: errText });
    return null;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return null;
  }

  const lines = content
    .split(/\n/)
    .map((line) => line.replace(/^[\d.)\-\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, MAX_STARTERS);

  return lines.length >= 2 ? lines : null;
}

/**
 * Returns suggested conversation starters for the current user based on their last 2 conversations.
 * Feature is off unless SUGGESTED_STARTERS_ENABLED=true and SUGGESTED_STARTERS_MODEL is set.
 * @param {Object} req - Express request (req.user.id must be set)
 * @returns {Promise<{ starters: string[] } | null>} starters array or null when disabled/failure
 */
async function getSuggestedStarters(req) {
  const enabled = isEnabled(process.env.SUGGESTED_STARTERS_ENABLED);
  const model = process.env.SUGGESTED_STARTERS_MODEL?.trim();
  if (!enabled || !model) {
    return null;
  }

  const baseURL =
    process.env.SUGGESTED_STARTERS_BASE_URL?.trim() ||
    process.env.OPENAI_REVERSE_PROXY?.trim() ||
    'https://api.openai.com/v1';
  const apiKey =
    process.env.SUGGESTED_STARTERS_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    logger.warn('[suggestedStarters] No API key configured (SUGGESTED_STARTERS_API_KEY or OPENAI_API_KEY)');
    return null;
  }

  try {
    const { conversations } = await getConvosByCursor(req.user.id, {
      limit: 2,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    });

    if (!conversations?.length) {
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
      model,
      baseURL,
      apiKey,
    });

    if (!starters?.length) {
      return null;
    }

    return { starters };
  } catch (err) {
    logger.error('[suggestedStarters] Error', err);
    return null;
  }
}

module.exports = { getSuggestedStarters };
