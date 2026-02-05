# Guia de Verificação de Contabilização de Tokens

Este guia explica como verificar se a contabilização de tokens está sendo feita corretamente no LibreChat, incluindo verificação de preços e contabilização de agentes.

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Como Funciona a Contabilização](#como-funciona-a-contabilização)
3. [Ferramentas de Validação](#ferramentas-de-validação)
4. [Verificação Passo a Passo](#verificação-passo-a-passo)
5. [Problemas Comuns](#problemas-comuns)
6. [Contabilização de Agentes](#contabilização-de-agentes)

## 🔍 Visão Geral do Sistema

### Componentes Principais

1. **`modelsdescriptions` (MongoDB)**: Armazena preços por modelo (prompt e completion)
2. **`api/models/tx.js`**: Tabela de preços hardcoded no código
3. **`api/models/Transaction.js`**: Gerencia criação e cálculo de transações
4. **`api/models/spendTokens.js`**: Interface para gastar tokens
5. **`api/server/controllers/agents/client.js`**: Contabiliza tokens de agentes

### Fluxo de Contabilização

```
Modelo usado → Tokens consumidos → getMultiplier (tx.js) → Cálculo do custo → Transaction no banco
```

## 💰 Como Funciona a Contabilização

### 1. Preços dos Modelos

Os preços são definidos em **USD por 1 milhão de tokens**:

```javascript
// Exemplo do seu modelsdescriptions
{
  "gpt-5.2-medium": {
    "prompt": 1.75,      // $1.75 por 1M tokens de entrada
    "completion": 14     // $14.00 por 1M tokens de saída
  }
}
```

### 2. Cálculo de Custo

```javascript
// Para cada transação:
tokenValue = rawAmount * rate

// Onde:
// - rawAmount = número de tokens (negativo para débito)
// - rate = preço do modelo (prompt ou completion)
```

### 3. Exemplo Prático

Se você usar **1000 tokens de entrada** e **500 tokens de saída** com `gpt-5.2-medium`:

```
Custo entrada    = (1000 / 1_000_000) * 1.75  = $0.00175
Custo saída      = (500  / 1_000_000) * 14    = $0.00700
Custo total      = $0.00875
```

## 🛠️ Ferramentas de Validação

### 1. Script de Validação (`validate-token-billing.js`)

Verifica se as transações estão corretas comparando com os preços do banco.

```bash
# Validar uma conversa específica
node utils/validate-token-billing.js <conversationId>

# Validar últimas conversas de um usuário
node utils/validate-token-billing.js user:<userId>

# Exemplo
node utils/validate-token-billing.js 507f1f77bcf86cd799439011
node utils/validate-token-billing.js user:507f1f77bcf86cd799439011
```

### 2. Script de Sincronização (`sync-model-prices.js`)

Compara preços do banco com os hardcoded em `tx.js`.

```bash
# Modo dry-run (apenas visualiza diferenças)
node utils/sync-model-prices.js --dry-run

# Gera arquivo de referência
node utils/sync-model-prices.js
```

## ✅ Verificação Passo a Passo

### Passo 1: Verificar Preços no Banco

```bash
# Conecte ao MongoDB
docker compose exec api npm run mongo-shell

# No shell do Mongo:
use LibreChat
db.modelsdescriptions.findOne()
```

Verifique se os preços estão corretos para cada modelo.

### Passo 2: Sincronizar Preços

```bash
# Veja as diferenças
node utils/sync-model-prices.js --dry-run

# Se houver diferenças, atualize api/models/tx.js
# Use o arquivo gerado em utils/token-values-reference.js como referência
```

### Passo 3: Validar Transações

```bash
# Pegue o ID de um usuário de teste
USER_ID="507f1f77bcf86cd799439011"

# Valide as transações
node utils/validate-token-billing.js user:$USER_ID
```

### Passo 4: Verificar Agentes

O script de validação já verifica agentes automaticamente. Procure por:

```
🤖 Verificando contabilização de agentes...
  ✅ Agentes com billing: X
  ⚠️  Agentes SEM billing: Y
```

Se houver agentes sem billing, há um problema na contabilização.

## 🐛 Problemas Comuns

### 1. Preços Incorretos

**Sintoma**: `Rate incorreto: esperado 1.75, encontrado 6`

**Causa**: O modelo não está em `tx.js` e está usando `defaultRate = 6`

**Solução**:
1. Execute `node utils/sync-model-prices.js --dry-run`
2. Adicione o modelo faltante em `api/models/tx.js`
3. Reinicie o servidor

### 2. Modelo Não Encontrado

**Sintoma**: `Modelo "xyz" não encontrado nos modelDescriptions`

**Causa**: O nome do modelo usado nas transações não bate com o banco

**Solução**:
1. Verifique o nome exato em `db.modelsdescriptions.findOne()`
2. Verifique como o modelo está sendo registrado nas transações
3. Atualize o modelsdescriptions ou corrija o nome usado

### 3. Agentes Sem Billing

**Sintoma**: `Agentes SEM billing: X`

**Causa**: Tokens de agentes não estão sendo registrados

**Verificação**:

```javascript
// Em api/server/controllers/agents/client.js
// Método recordCollectedUsage deve estar sendo chamado

// Verifique os logs:
grep "recordCollectedUsage" logs/api.log
```

**Solução**:
- Verifique se `recordCollectedUsage` está sendo chamado após cada execução de agente
- Verifique se o `endpointTokenConfig` está sendo passado corretamente

### 4. TokenValue Incorreto

**Sintoma**: `TokenValue incorreto: esperado -1750, encontrado -6000`

**Causa**: Rate incorreto ou cálculo errado

**Solução**:
1. Verifique a fórmula: `tokenValue = rawAmount * rate`
2. Verifique se o `rawAmount` é negativo (para débito)
3. Verifique se o `rate` está correto

## 🤖 Contabilização de Agentes

### Como Funciona

Os agentes podem fazer múltiplas chamadas a modelos internamente. Cada chamada deve ser contabilizada:

```javascript
// Exemplo de estrutura de uso em agente:
{
  "model": "gpt-5.2-medium",
  "input_tokens": 1500,
  "output_tokens": 800,
  "cache_creation_input_tokens": 0,
  "cache_read_input_tokens": 0
}
```

### Verificação

1. **Execute um agente** que você sabe que usa modelos internos
2. **Verifique as transações**:

```bash
# No MongoDB
db.transactions.find({ 
  conversationId: "<sua-conversationId>",
  model: { $exists: true }
}).pretty()
```

3. **Conte as transações**:
   - Deve haver transações para CADA chamada do agente
   - Tanto para o modelo principal quanto para modelos internos

### Exemplo de Saída Esperada

```
🤖 Verificando contabilização de agentes...
  Encontradas 5 conversas de agentes
  ✅ Agentes com billing: 5
  
📊 Analisando conversa: abc123...
  Total de transações: 12

  📈 Uso por modelo:

    GPT 5.2 Medium (Azure):
      Tokens prompt: 15,000
      Tokens completion: 8,000
      Total tokens: 23,000
      Custo total: $0.138250
      Custo esperado: $0.138250
      ✓ Custo correto
```

## 📊 Interpretando os Resultados

### Resultados Positivos

```
✓ Carregados preços de 15 modelos
✓ Transações válidas: 100
✓ Custo correto
✓ Todas as transações estão corretas!
```

### Resultados que Precisam Atenção

```
⚠️  Modelo "xyz" não encontrado nos modelDescriptions
⚠️  Rate incorreto: esperado 1.75, encontrado 6
⚠️  Agentes SEM billing: 3
❌ Transações inválidas: 25
```

## 🔧 Manutenção

### Quando Adicionar um Novo Modelo

1. **Adicione no banco**:
```javascript
db.modelsdescriptions.updateOne(
  {},
  {
    $set: {
      "novo-modelo": {
        "name": "Novo Modelo",
        "provider": "Azure",
        "prompt": 1.5,
        "completion": 10
      }
    }
  }
)
```

2. **Adicione em `tx.js`**:
```javascript
// Em api/models/tx.js, no objeto tokenValues:
'novo-modelo': { prompt: 1.5, completion: 10 },
```

3. **Valide**:
```bash
node utils/sync-model-prices.js --dry-run
```

### Auditoria Regular

Execute periodicamente:

```bash
# Semanal: verificar sincronização de preços
node utils/sync-model-prices.js --dry-run

# Mensal: auditar transações recentes
node utils/validate-token-billing.js user:<userId-teste>
```

## 📞 Suporte

Se encontrar problemas:

1. Execute os scripts de validação
2. Salve os logs completos
3. Verifique a seção de Problemas Comuns
4. Consulte os logs do servidor: `docker compose logs api | grep -i token`

## 🔗 Arquivos Relacionados

- `api/models/tx.js` - Tabela de preços
- `api/models/Transaction.js` - Lógica de transações
- `api/models/spendTokens.js` - Interface de gastos
- `api/server/controllers/agents/client.js` - Contabilização de agentes
- `api/models/ModelsDescriptions.js` - Model do Mongoose
- `api/server/services/ModelsDescriptionsService.js` - Service de modelos

## 📝 Logs Úteis

```bash
# Ver transações sendo criadas
docker compose logs api | grep "spendTokens"

# Ver cálculos de token
docker compose logs api | grep "recordTokenUsage"

# Ver uso de agentes
docker compose logs api | grep "recordCollectedUsage"
```
