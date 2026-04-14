# Resumo Executivo: Sistema de Validação de Billing

## 🎯 Objetivo

Criar ferramentas para verificar se a contabilização de tokens está correta no LibreChat, incluindo:
- Validação de preços por modelo
- Verificação de contabilização de agentes
- Detecção automática de problemas

## ✅ O Que Foi Criado

### 1. Ferramentas de Validação (4 scripts)

| Script | Propósito | Uso Principal |
|--------|-----------|---------------|
| `billing-dashboard.js` | Dashboard visual com estatísticas | Visão rápida do sistema |
| `validate-token-billing.js` | Validação detalhada de transações | Debug de problemas específicos |
| `sync-model-prices.js` | Sincronização de preços | Manutenção de preços |
| `test-billing.js` | Testes automatizados | CI/CD e validação automática |

### 2. Documentação (3 arquivos)

| Documento | Conteúdo |
|-----------|----------|
| `TOKEN-BILLING-GUIDE.md` | Guia completo e detalhado (30+ páginas) |
| `README.md` | Referência rápida das ferramentas |
| `BILLING-SUMMARY.md` | Este arquivo - resumo executivo |

## 🚀 Como Começar

### Verificação Rápida (5 minutos)

```bash
# 1. Ver dashboard geral
node utils/billing-dashboard.js

# 2. Executar testes automatizados
node utils/test-billing.js
```

### Validação Completa de um Usuário (10 minutos)

```bash
# Substitua USER_ID pelo ID do usuário
USER_ID="507f1f77bcf86cd799439011"

# 1. Dashboard do usuário
node utils/billing-dashboard.js $USER_ID

# 2. Validação detalhada
node utils/validate-token-billing.js user:$USER_ID

# 3. Verificar sincronização de preços
node utils/sync-model-prices.js --dry-run
```

## 🔍 Como Funciona a Contabilização

### Fluxo Simplificado

```
┌─────────────────┐
│  Usuário usa    │
│     modelo      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Tokens usados  │─────>│  Busca preço em  │
│ (prompt+compl.) │      │ modelDescriptions│
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Calcula custo:  │
                         │ tokens × preço   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Cria Transaction │
                         │    no banco      │
                         └──────────────────┘
```

### Componentes do Sistema

1. **`modelsdescriptions` (MongoDB)**: Fonte da verdade para preços
   - Estrutura: `{ "model-id": { "prompt": X, "completion": Y, ... } }`
   - Exemplo: `{ "gpt-5.2-medium": { "prompt": 1.75, "completion": 14 } }`

2. **`api/models/tx.js`**: Tabela de preços hardcoded (fallback)
   - Usado quando `endpointTokenConfig` não está disponível
   - Deve ser mantido sincronizado com o banco

3. **`api/models/Transaction.js`**: Lógica de cálculo
   - Função `getMultiplier()`: busca preço do modelo
   - Função `calculateTokenValue()`: calcula custo
   - Fórmula: `tokenValue = rawAmount × rate`

4. **`api/server/controllers/agents/client.js`**: Contabilização de agentes
   - Método `recordCollectedUsage()`: registra uso de agentes
   - Método `recordTokenUsage()`: registra transações individuais

## 📊 Seus Dados Atuais

### Preços Configurados (do seu exemplo)

```javascript
// Exemplos dos seus modelDescriptions
{
  "gpt-5.2-medium": {
    prompt: 1.75,      // $1.75 por 1M tokens
    completion: 14     // $14.00 por 1M tokens
  },
  "gpt-5.2-xhigh": {
    prompt: 1.75,
    completion: 14
  },
  "gemini-2.5-flash-preview-09-2025": {
    prompt: 0.3,
    completion: 2.5
  },
  // ... e outros
}
```

### Grupos Configurados

- **default**: Acesso básico (Azure OpenAI, Google, Anthropic, etc.)
- **ultimate**: Acesso completo incluindo Deepseek, Z.ai, MoonshotAI, etc.

## ⚠️ O Que Pode Estar Errado

### Problema 1: Modelo Não Configurado

**Sintoma:** Rate = 6 (defaultRate) ao invés do preço correto

**Verificação:**
```bash
node utils/sync-model-prices.js --dry-run
```

**Solução:** Adicionar modelo em `modelsdescriptions` E `tx.js`

### Problema 2: Agentes Sem Billing

**Sintoma:** Conversas de agentes sem transações associadas

**Verificação:**
```bash
node utils/billing-dashboard.js
# Procure por: "Agentes SEM billing: X"
```

**Solução:** Verificar logs e garantir que `recordCollectedUsage` está sendo chamado

### Problema 3: Cálculo Incorreto

**Sintoma:** `tokenValue` não bate com `rawAmount × rate`

**Verificação:**
```bash
node utils/validate-token-billing.js user:<userId>
```

**Solução:** Verificar lógica em `api/models/Transaction.js`

## 🎯 Checklist de Validação

Use este checklist para validar o sistema:

- [ ] **Dashboard sem erros**
  ```bash
  node utils/billing-dashboard.js
  ```
  - [ ] Cobertura de agentes ≥ 95%
  - [ ] Sem warnings de integridade

- [ ] **Testes passando**
  ```bash
  node utils/test-billing.js
  ```
  - [ ] Todos os 14 testes passam

- [ ] **Preços sincronizados**
  ```bash
  node utils/sync-model-prices.js --dry-run
  ```
  - [ ] Nenhuma diferença encontrada
  - [ ] Nenhum modelo faltando

- [ ] **Validação de amostra**
  ```bash
  node utils/validate-token-billing.js user:<userId-teste>
  ```
  - [ ] Transações válidas: 100%
  - [ ] Todos os custos corretos

## 📈 Próximos Passos

### Imediato (Faça Agora)

1. **Execute o dashboard**:
   ```bash
   node utils/billing-dashboard.js
   ```

2. **Execute os testes**:
   ```bash
   node utils/test-billing.js
   ```

3. **Analise os resultados** e corrija problemas encontrados

### Curto Prazo (Esta Semana)

1. Valide alguns usuários reais:
   ```bash
   node utils/validate-token-billing.js user:<userId>
   ```

2. Verifique sincronização de preços:
   ```bash
   node utils/sync-model-prices.js --dry-run
   ```

3. Se houver diferenças, atualize `api/models/tx.js`

### Médio Prazo (Este Mês)

1. Configure CI/CD para executar `test-billing.js` automaticamente

2. Crie um cron job para auditorias semanais:
   ```bash
   # Adicione ao crontab
   0 9 * * 1 cd /path/to/LibreChat && node utils/billing-dashboard.js > /var/log/billing-weekly.log
   ```

3. Documente procedimentos para a equipe

## 🔧 Manutenção

### Adicionar Novo Modelo

```bash
# 1. Adicionar no banco MongoDB
# 2. Sincronizar
node utils/sync-model-prices.js --dry-run
# 3. Atualizar tx.js se necessário
# 4. Validar
node utils/test-billing.js
```

### Atualizar Preço

```bash
# 1. Atualizar no banco MongoDB
# 2. Atualizar em api/models/tx.js
# 3. Reiniciar servidor
# 4. Validar
node utils/validate-token-billing.js user:<userId-teste>
```

### Auditoria Mensal

```bash
# Execute todos os scripts
node utils/billing-dashboard.js > audit-$(date +%Y%m%d).log
node utils/test-billing.js >> audit-$(date +%Y%m%d).log
node utils/sync-model-prices.js --dry-run >> audit-$(date +%Y%m%d).log
```

## 📞 Suporte e Documentação

| Precisa de | Consulte |
|------------|----------|
| Referência rápida | `utils/README.md` |
| Guia completo | `utils/TOKEN-BILLING-GUIDE.md` |
| Troubleshooting | `utils/TOKEN-BILLING-GUIDE.md` (seção Problemas Comuns) |
| Código | Comentários inline nos scripts |

## 💡 Dicas Importantes

1. **Sempre use `--dry-run` primeiro** ao sincronizar preços
2. **Execute testes após mudanças** nos preços ou modelos
3. **Monitore a cobertura de agentes** - deve estar perto de 100%
4. **Use de defaultRate < 5%** é aceitável, mais que isso indica problema
5. **Valide em produção** antes de fazer mudanças grandes

## 🎓 Conceitos-Chave

### Rate (Multiplicador)
Preço por 1 milhão de tokens. Exemplo: rate=1.75 significa $1.75 por 1M tokens.

### TokenValue (Custo)
Custo real da transação. Calculado como: `tokenValue = rawAmount × rate`

### RawAmount (Tokens)
Número de tokens usados. Negativo para débito, positivo para crédito.

### endpointTokenConfig
Configuração customizada de preços por endpoint. Sobrescreve `tx.js`.

### DefaultRate
Taxa padrão (6) usada quando modelo não é encontrado. Indica problema de configuração.

## ✨ Recursos Adicionais

Os scripts oferecem:
- ✅ Cores no terminal para melhor visualização
- 📊 Estatísticas agregadas por modelo, usuário e período
- 🔍 Detecção automática de problemas comuns
- 💾 Geração de arquivos de referência
- 🧪 Suite completa de testes
- 📈 Visualização de tendências (últimos 7 dias)

---

**Criado em:** 2025-02-03  
**Versão:** 1.0  
**Autor:** Sistema de Validação de Billing do LibreChat
