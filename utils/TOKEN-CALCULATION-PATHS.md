# Tokens – caminhos (upstream = aqui)

## Contagem (quantidade de tokens)

- `api/server/utils/countTokens.js` → Tiktoken p50k_base/cl100k_base; usado por rotas e BaseClient
- `packages/api/src/utils/tokenizer.ts` → Tokenizer + countTokens; export em `packages/api/src/utils/index.ts`; usado como `@librechat/api` countTokens
- `api/app/clients/BaseClient.js` → getTokenCount(countTokens), getTokenCountForMessage, getTokenCountForResponse; tokenCountMap e promptTokens em handleContextStrategy
- `api/app/clients/OpenAIClient.js` → getTokenCount, getTokenCountForMessage, handleContextStrategy → tokenCountMap; getStreamUsage() → usage da API
- `api/app/clients/AnthropicClient.js` → idem; getStreamUsage(); recordTokenUsage → spendTokens/spendStructuredTokens
- `api/app/clients/GoogleClient.js` → idem; getStreamUsage(); recordTokenUsage → spendTokens
- `api/server/controllers/agents/client.js` → getTokenCount(Tokenizer), getTokenCountForMessage; tokenCountMap por mensagem; agentes não chamam recordTokenUsage do BaseClient (skip clientName === agents)

## De onde vêm promptTokens e completionTokens

- Chat normal: stream da API → cliente guarda em this.usage → getStreamUsage() → BaseClient usa usage[inputTokensKey] e usage[outputTokensKey]
- BaseClient: `api/app/clients/BaseClient.js` ~783–830 → getStreamUsage() ou getTokenCountForResponse; chama recordTokenUsage do cliente
- Agentes: run devolve usage por etapa → `api/server/controllers/agents/client.js` recordCollectedUsage ~770–860 → input_tokens, output_tokens (e cache) → spendTokens/spendStructuredTokens por uso

## Gasto (créditos) e preço

- `api/models/spendTokens.js` → spendTokens(txData, { promptTokens, completionTokens }) → createTransaction/createStructuredTransaction
- `api/models/Transaction.js` → createTransaction, createStructuredTransaction, calculateTokenValue (rawAmount * multiplier), updateBalance(tokenCredits)
- `api/models/tx.js` → getMultiplier({ model, tokenType, endpointTokenConfig }), getValueKey, tokenValues; 1M tokens × rate = créditos (1M créditos = 1 USD)
- Quem chama spendTokens: OpenAIClient.recordTokenUsage, AnthropicClient.recordTokenUsage, GoogleClient.recordTokenUsage, agents/client.js recordCollectedUsage e recordTokenUsage, GeminiImageGen recordTokenUsage, abortMiddleware.js, Threads/manage.js

## Onde fica o tokenCount das mensagens

- `api/app/clients/BaseClient.js` → handleTokenCountMap → updateMessage com tokenCount/summaryTokenCount
- `api/models/Message.js` → update com tokenCount
- `api/server/routes/messages.js` → countTokens ao editar texto → updateMessage tokenCount

## Onde entra o preço (rate) por modelo

- `api/models/tx.js` → tokenValues[valueKey], getValueKey(model,endpoint), getMultiplier; se endpointTokenConfig → endpointTokenConfig[model][tokenType]
- `api/models/Transaction.js` → calculateTokenValue usa getMultiplier; tokenValue = rawAmount * multiplier

## Fluxo em sequência (chat)

1. Rota chat → controller → client (OpenAI/Anthropic/Google)
2. Client buildMessages/handleContextStrategy → BaseClient + cliente → tokenCountMap, promptTokens
3. Resposta API → usage → this.usage → getStreamUsage()
4. BaseClient fim da resposta → recordTokenUsage (cliente) → spendTokens
5. spendTokens → Transaction.createTransaction (prompt + completion) → tx.js getMultiplier → calculateTokenValue → updateBalance
6. handleTokenCountMap → Message update tokenCount

## Fluxo em sequência (agentes)

1. Rota agentes → AgentClient
2. Run (packages/agents) → usos por etapa
3. recordCollectedUsage → para cada uso spendTokens/spendStructuredTokens (model, user, endpointTokenConfig em txMetadata)
4. spendTokens → Transaction → tx.js getMultiplier → tokenValue → updateBalance

---

## Cada provedor tem sua forma de contagem? Está funcionando?

- **Contagem (quantidade)**: Sim. Cada provedor devolve na resposta da API o uso (input_tokens, output_tokens ou prompt_tokens, completion_tokens). Nós não “contamos” para billing: usamos o número que a API devolve. Cada cliente normaliza com inputTokensKey/outputTokensKey e getStreamUsage(). Está funcionando.
- **Preço (rate)**: Não é por provedor. O rate vem de um único lugar: `getMultiplier` em `api/models/tx.js`. Se existir `endpointTokenConfig` no request, usa ele; senão usa a tabela `tokenValues` (e getValueKey) dentro do próprio tx.js. Ou seja: contagem = da API do provedor; preço = nosso (tx.js ou endpointTokenConfig).

---

## Cache (prompt caching) – onde fica e por que o dashboard não fica exato

### Onde os tokens de cache entram

- API do provedor (ex.: Anthropic) devolve: `input_tokens`, `cache_creation_input_tokens` (write), `cache_read_input_tokens` (read).
- `api/app/clients/AnthropicClient.js` ~327–344: se `usage.input_tokens != null` → `spendStructuredTokens` com `promptTokens: { input, write, read }` (write = cache_creation_input_tokens, read = cache_read_input_tokens).
- `api/server/controllers/agents/client.js` ~788–842: para cada uso do run lê `input_token_details?.cache_creation` / `cache_creation_input_tokens` e `cache_read` / `cache_read_input_tokens`; se algum > 0 → `spendStructuredTokens` com input/write/read; senão `spendTokens` normal.

### Onde o custo de cache é calculado

- `api/models/spendTokens.js` → `spendStructuredTokens(..., { promptTokens: { input, write, read }, completionTokens })` → `createStructuredTransaction` com inputTokens, writeTokens, readTokens (negativos).
- `api/models/Transaction.js` → `calculateStructuredTokenValue`: para tokenType `prompt` usa três rates (input, write, read) via `getMultiplier` (input) e `getCacheMultiplier` (write, read). `tokenValue = -(input*inputRate + write*writeRate + read*readRate)`; `rawAmount = -(input+write+read)`.
- Rates de cache: `api/models/tx.js` → `getCacheMultiplier({ cacheType: 'write'|'read', model, endpointTokenConfig })`; tabela `cacheTokenValues` (write/read por modelo). Se `endpointTokenConfig` existir usa `endpointTokenConfig[model][cacheType]`; senão `cacheTokenValues[valueKey]`; se não achar, usa rate de input.
- Schema: `packages/data-schemas/src/schema/transaction.ts` → campos `inputTokens`, `writeTokens`, `readTokens` (e rate, tokenValue, rawAmount).

### Por que o dashboard não fica “exato”

- Dashboard (`utils/billing-dashboard.js`): `getModelStats` agrega `$sum: { $abs: '$rawAmount' }` (tokens) e `$sum: { $abs: '$tokenValue' }` (custo). Para transações estruturadas (cache), **tokenValue já é o custo correto**; o total exibido está certo.
- O que não aparece: (1) **Detalhe por tipo** (input vs write vs read): o dashboard não mostra breakdown; (2) **Rates de cache** podem vir de fallback: se não houver `write`/`read` em `endpointTokenConfig` (ex.: modelsdescriptions só com prompt/completion), `getCacheMultiplier` devolve null e usa rate de **input** para write e read → cache read (mais barato) é cobrado como input → custo **acima** do real; (3) `api/models/tx.js` → `cacheTokenValues` tem só alguns modelos (Claude, DeepSeek); outros usam fallback.

### Resumo de caminhos – cache

- Origem do uso: `api/app/clients/AnthropicClient.js` (recordTokenUsage), `api/server/controllers/agents/client.js` (recordCollectedUsage).
- Gastos: `api/models/spendTokens.js` (spendStructuredTokens) → `api/models/Transaction.js` (createStructuredTransaction, calculateStructuredTokenValue).
- Rates de cache: `api/models/tx.js` (getCacheMultiplier, cacheTokenValues ~271–290).
- Persistência: Transaction com inputTokens, writeTokens, readTokens, tokenValue, rawAmount.
- Dashboard (script): `utils/billing-dashboard.js` (getModelStats) só soma rawAmount e tokenValue; não mostra input/write/read.

---

## Dashboard do cliente (UI) – onde o saldo aparece e por que não fica exato

O “dashboard” é a tela do app em `client/src/routes/Dashboard.tsx` (rotas sob `/d/*`). O saldo não fica na página principal do Dashboard e sim em **Settings** (aba Balance).

### Onde o cliente busca e exibe o saldo

- Rota do dashboard: `client/src/routes/Dashboard.tsx` → `DashboardRoute` em `client/src/routes/Layouts/Dashboard.tsx` → filhos (ex.: Prompts, etc.). Não exibe saldo.
- Saldo nas configurações: `client/src/components/Nav/Settings.tsx` → aba Balance (se `startupConfig?.balance?.enabled`).
- Componente do saldo: `client/src/components/Nav/SettingsTabs/Balance/Balance.tsx` → `useGetUserBalance()` → exibe `TokenCreditsItem`.
- Valor exibido: `client/src/components/Nav/SettingsTabs/Balance/TokenCreditsItem.tsx` → mostra `tokenCredits.toFixed(2)` (só o número em créditos).
- Dados: `client/src/data-provider/Misc/queries.ts` → `useGetUserBalance` chama `dataService.getUserBalance()` → GET `/api/balance`.
- API do saldo: `api/server/routes/balance.js` → `api/server/controllers/Balance.js` (balanceController) → `Balance.findOne({ user: req.user.id })` → devolve `tokenCredits`, autoRefill, etc. (modelo em `api/db/models.js` / data-schemas Balance).

### Por que o valor não fica “exato” nesse dashboard

1. **Unidade**: O backend guarda e devolve **créditos** (1M créditos = 1 USD). O cliente mostra esse número direto (`tokenCredits.toFixed(2)`), sem converter para dólares. Quem espera “valor em reais/dólares” vê créditos e acha que não bate.
2. **Sem detalhe de uso**: A UI não mostra transações nem breakdown (prompt vs completion, input vs cache write/read). Só o saldo atual. Não dá para “conferir” custo por request ou por cache na tela.
3. **Cache**: O saldo em si está correto (já descontado com cache quando há `spendStructuredTokens`). O que não fica “exato” é a **interpretação** (créditos vs dólares) e a **falta de detalhe** (cache, por modelo, etc.), não o valor armazenado.

### Resumo de caminhos – dashboard cliente (saldo)

- UI: `client/src/routes/Dashboard.tsx` → Settings → `client/src/components/Nav/SettingsTabs/Balance/Balance.tsx` → `TokenCreditsItem.tsx` (exibe tokenCredits).
- Dados: `client/src/data-provider` (getUserBalance) → GET `/api/balance` → `api/server/controllers/Balance.js` → `Balance.findOne`.
- Modelo: Balance (tokenCredits) em `api/db/models` / data-schemas; atualizado por `api/models/Transaction.js` (updateBalance).
