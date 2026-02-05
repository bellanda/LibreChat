/**
 * Referência de preços de tokens baseada nos modelDescriptions do banco
 * Gerado automaticamente em 2026-02-03T16:06:41.844Z
 *
 * Use este arquivo como referência para atualizar api/models/tx.js
 *
 * RESUMO DA ÚLTIMA SINCRONIZAÇÃO:
 *   Modelos no banco: 20
 *   Modelos no código: 211
 *   Diferenças (banco ≠ código): 1
 *   Faltando no código: 0
 *   Extras no código: 191
 */

/**
 * CORRIGIR EM api/models/tx.js (valores atuais no código estão diferentes do banco)
 */
const differencesToFix = [
  {
    "modelId": "openai/gpt-oss-120b",
    "name": "GPT-OSS 120B",
    "provider": "Groq",
    "banco": {
      "prompt": 0.15,
      "completion": 0.75
    },
    "codigo": {
      "prompt": 0.3,
      "completion": 0.75
    },
    "linhaSugerida": "'openai/gpt-oss-120b': { prompt: 0.15, completion: 0.75 },"
  }
];


/** Preços do banco (modelDescriptions) - use para conferir ou colar em tx.js */
const tokenValuesFromDB = {
    // GPT-OSS 120B (Groq)
    'accounts/fireworks/models/gpt-oss-120b': { prompt: 0.15, completion: 0.6 },
    // GPT-OSS 20B (Groq)
    'accounts/fireworks/models/gpt-oss-20b': { prompt: 0.07, completion: 0.3 },
    // MoonshotAI Kimi K2 Thinking (Fireworks)
    'accounts/fireworks/models/kimi-k2-thinking': { prompt: 0.6, completion: 2.5 },
    // Claude Haiku 4.5 (Anthropic)
    'claude-haiku-4-5-20251001': { prompt: 1, completion: 5 },
    // Claude Sonnet 4.5 (Anthropic)
    'claude-sonnet-4-5-20250929': { prompt: 3, completion: 15 },
    // Gemini 2.5 Flash Lite (Google)
    'gemini-2.5-flash-lite-preview-09-2025': { prompt: 0.1, completion: 0.4 },
    // Gemini 2.5 Flash (Google)
    'gemini-2.5-flash-preview-09-2025': { prompt: 0.3, completion: 2.5 },
    // Gemini 3.0 Pro (Google)
    'gemini-3-pro-preview': { prompt: 2, completion: 12 },
    // GPT-4.1 (Azure)
    'gpt-4.1': { prompt: 2, completion: 8 },
    // GPT 5.2 Codex (Azure)
    'gpt-5.2-codex-xhigh': { prompt: 1.75, completion: 14 },
    // GPT 5.2 Medium (Azure)
    'gpt-5.2-medium': { prompt: 1.75, completion: 14 },
    // GPT 5.2 XHIGH (Azure)
    'gpt-5.2-xhigh': { prompt: 1.75, completion: 14 },
    // Grok 4 (xAI)
    'grok-4': { prompt: 3, completion: 15 },
    // Grok 4.1 Fast (Non‑Reasoning) (xAI)
    'grok-4-1-fast-non-reasoning': { prompt: 0.2, completion: 0.5 },
    // Grok 4.1 Fast (xAI)
    'grok-4-1-fast-reasoning': { prompt: 0.2, completion: 0.5 },
    // Grok Code Fast 1 (xAI)
    'grok-code-fast-1': { prompt: 0.2, completion: 1.5 },
    // Llama 4 Maverick (Groq)
    'meta-llama/llama-4-maverick-17b-128e-instruct': { prompt: 0.2, completion: 0.6 },
    // Llama 4 Scout (Groq)
    'meta-llama/llama-4-scout-17b-16e-instruct': { prompt: 0.11, completion: 0.34 },
    // GPT-OSS 120B (Groq)
    'openai/gpt-oss-120b': { prompt: 0.15, completion: 0.75 },
    // GPT-OSS 20B (Groq)
    'openai/gpt-oss-20b': { prompt: 0.1, completion: 0.5 },
};

module.exports = {
  tokenValuesFromDB,
  differencesToFix,
};
