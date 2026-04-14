# Utilitários de Billing e Token Management

Este diretório contém ferramentas para validação, monitoramento e teste do sistema de contabilização de tokens do LibreChat.

## 📋 Ferramentas Disponíveis

### 1. 🔍 Dashboard de Billing (`billing-dashboard.js`)

Visualização rápida das estatísticas de billing do sistema.

```bash
# Dashboard geral do sistema
node utils/billing-dashboard.js

# Dashboard de um usuário específico
node utils/billing-dashboard.js <userId>
```

**Mostra:**
- Estatísticas gerais do sistema
- Top 10 modelos por custo
- Top 10 usuários por custo
- Cobertura de agentes (% de agentes com billing)
- Últimos 7 dias de atividade
- Verificação de integridade

**Use quando:** Quiser ter uma visão rápida do estado atual do billing

---

### 2. ✅ Validação de Tokens (`validate-token-billing.js`)

Valida se as transações estão sendo calculadas corretamente.

```bash
# Validar uma conversa específica
node utils/validate-token-billing.js <conversationId>

# Validar últimas 10 conversas de um usuário
node utils/validate-token-billing.js user:<userId>
```

**Verifica:**
- Se os preços (rates) estão corretos
- Se os cálculos de tokenValue estão corretos
- Se os modelos estão configurados nos modelDescriptions
- Se os agentes estão gerando transações
- Uso e custo detalhado por modelo

**Use quando:** Quiser validar se a contabilização está correta em conversas específicas

---

### 3. 🔄 Sincronização de Preços (`sync-model-prices.js`)

Compara e sincroniza preços entre o banco e o código.

```bash
# Modo dry-run (apenas visualiza diferenças)
node utils/sync-model-prices.js --dry-run

# Gera arquivo de referência
node utils/sync-model-prices.js
```

**Verifica:**
- Diferenças de preços entre `modelsdescriptions` (banco) e `tx.js` (código)
- Modelos no banco que faltam no código
- Modelos no código que faltam no banco
- Gera arquivo de referência `token-values-reference.js`

**Use quando:** Adicionar novos modelos ou atualizar preços

---

### 4. 🧪 Testes Automatizados (`test-billing.js`)

Suite de testes automatizados para billing.

```bash
node utils/test-billing.js
```

**Testa:**
- Cálculos de preços (getMultiplier)
- Estrutura e integridade de transações
- Sincronização de preços
- Cobertura de agentes
- Detecção de problemas comuns

**Use quando:** Quiser validar o sistema automaticamente (CI/CD ou testes manuais)

---

## 🚀 Fluxo de Trabalho Recomendado

### Para Adicionar um Novo Modelo

1. **Adicione no banco**:
```javascript
// No MongoDB shell
db.modelsdescriptions.updateOne(
  {},
  {
    $set: {
      "novo-modelo": {
        "name": "Novo Modelo",
        "provider": "Provider",
        "prompt": 1.5,
        "completion": 10,
        // ... outras propriedades
      }
    }
  }
)
```

2. **Verifique sincronização**:
```bash
node utils/sync-model-prices.js --dry-run
```

3. **Atualize o código** se necessário:
   - Edite `api/models/tx.js`
   - Adicione o modelo no objeto `tokenValues`

4. **Valide**:
```bash
node utils/test-billing.js
```

### Para Debugar Problemas de Billing

1. **Dashboard geral**:
```bash
node utils/billing-dashboard.js
```

2. **Se encontrar problemas**, valide um usuário específico:
```bash
node utils/validate-token-billing.js user:<userId>
```

3. **Verifique sincronização de preços**:
```bash
node utils/sync-model-prices.js --dry-run
```

4. **Execute testes**:
```bash
node utils/test-billing.js
```

### Para Auditoria Regular

Execute semanalmente:

```bash
# 1. Dashboard geral
node utils/billing-dashboard.js

# 2. Verificar sincronização
node utils/sync-model-prices.js --dry-run

# 3. Executar testes
node utils/test-billing.js
```

## 📊 Interpretando Resultados

### ✅ Tudo OK

```
✓ Transações válidas: 100
✓ Custo correto
✓ Todas as transações estão corretas!
✓ Cobertura de agentes: 100.0%
```

### ⚠️ Atenção Necessária

```
⚠️  Rate incorreto: esperado 1.75, encontrado 6
⚠️  Modelo "xyz" não encontrado nos modelDescriptions
⚠️  Cobertura de agentes: 65.0%
⚠️  25 transações usando defaultRate
```

**Ações:**
1. Adicione o modelo faltante nos modelDescriptions
2. Atualize o tx.js
3. Investigue por que agentes não estão gerando transações

### ❌ Erro Crítico

```
❌ Transações inválidas: 50
❌ tokenValue incorreto
❌ Alguns testes falharam
```

**Ações:**
1. Leia o guia completo: `utils/TOKEN-BILLING-GUIDE.md`
2. Verifique os logs: `docker compose logs api | grep -i token`
3. Valide transações específicas

## 📁 Arquivos Gerados

### `token-values-reference.js`
Gerado por `sync-model-prices.js`. Contém todos os preços do banco em formato JavaScript para facilitar atualização do `tx.js`.

## 🔗 Documentação Relacionada

- **Guia Completo**: `utils/TOKEN-BILLING-GUIDE.md`
- **Código de Transações**: `api/models/Transaction.js`
- **Tabela de Preços**: `api/models/tx.js`
- **Cliente de Agentes**: `api/server/controllers/agents/client.js`

## 🐛 Troubleshooting

### "Nenhuma transação encontrada"

**Causa:** Banco de dados vazio ou conversa inexistente

**Solução:** Verifique o ID da conversa ou usuário

### "Modelo não encontrado"

**Causa:** Modelo não está em modelsdescriptions

**Solução:** 
```bash
node utils/sync-model-prices.js --dry-run
# Adicione o modelo manualmente
```

### "Rate incorreto"

**Causa:** Modelo não está em tx.js (usando defaultRate=6)

**Solução:** Adicione o modelo em `api/models/tx.js`

### "Agentes sem billing"

**Causa:** Problema na contabilização de agentes

**Solução:**
1. Verifique logs: `grep "recordCollectedUsage" logs/api.log`
2. Verifique se `recordTokenUsage` está sendo chamado
3. Consulte o guia completo

## 📞 Suporte

Para mais informações, consulte:
- `TOKEN-BILLING-GUIDE.md` - Guia completo e detalhado
- Logs do servidor: `docker compose logs api`
- Documentação do código

## 🎯 Metas de Qualidade

- **Cobertura de agentes**: ≥ 95%
- **Uso de defaultRate**: < 5%
- **Transações inválidas**: 0%
- **Modelos sem preço**: 0

## 📝 Changelog

### 2025-02-03
- ✨ Criação inicial das ferramentas de billing
- 📊 Dashboard de billing
- ✅ Validação de transações
- 🔄 Sincronização de preços
- 🧪 Testes automatizados
- 📖 Documentação completa
