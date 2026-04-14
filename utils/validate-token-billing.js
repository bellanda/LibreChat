/**
 * Script de validação de contabilização de tokens
 * 
 * Este script verifica se:
 * 1. Os preços dos modelos estão sendo aplicados corretamente
 * 2. Os tokens de agentes estão sendo contabilizados
 * 3. As transações estão corretas comparando com os modelDescriptions do banco
 * 
 * Uso: node utils/validate-token-billing.js [conversationId]
 */

const path = require('path');
require('module-alias/register');
require('module-alias').addAlias('~', path.join(__dirname, '../api'));

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { logger } = require('@librechat/data-schemas');
const { connectDb } = require('../api/db/connect');

const { Transaction } = require('../api/db/models');
const ModelsDescriptions = require('../api/models/ModelsDescriptions');
const { Conversation } = require('../api/db/models');

/** 1.000.000 créditos = US$ 1 */
const CREDITS_PER_DOLLAR = 1e6;

const COLOR = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${color}${text}${COLOR.reset}`;
}

/**
 * Busca os preços configurados no banco
 */
async function getModelPrices() {
  try {
    const modelsDescriptions = await ModelsDescriptions.findOne({}).lean();
    if (!modelsDescriptions) {
      console.log(colorize('⚠️  Nenhuma descrição de modelo encontrada no banco', COLOR.yellow));
      return {};
    }

    const prices = {};
    // Remove o _id e itera pelos modelos
    Object.keys(modelsDescriptions).forEach(key => {
      if (key === '_id') return;
      
      const model = modelsDescriptions[key];
      if (model.prompt && model.completion) {
        prices[key] = {
          prompt: model.prompt,
          completion: model.completion,
          name: model.name,
          provider: model.provider,
        };
      }
    });

    console.log(colorize(`\n✓ Carregados preços de ${Object.keys(prices).length} modelos`, COLOR.green));
    return prices;
  } catch (error) {
    console.error(colorize('❌ Erro ao buscar preços dos modelos:', COLOR.red), error);
    return {};
  }
}

/**
 * Valida uma transação individual
 */
function validateTransaction(tx, modelPrices) {
  const issues = [];
  const model = tx.model;

  if (!model) {
    issues.push('Modelo não especificado');
    return { valid: false, issues };
  }

  const expectedPrice = modelPrices[model];
  
  if (!expectedPrice) {
    issues.push(`Modelo "${model}" não encontrado nos modelDescriptions`);
    return { valid: false, issues, model };
  }

  // Valida o rate (multiplicador)
  const expectedRate = tx.tokenType === 'prompt' 
    ? expectedPrice.prompt 
    : expectedPrice.completion;

  if (Math.abs(tx.rate - expectedRate) > 0.01) {
    issues.push(
      `Rate incorreto: esperado ${expectedRate}, encontrado ${tx.rate} ` +
      `(diferença: ${Math.abs(tx.rate - expectedRate).toFixed(4)})`
    );
  }

  // Valida o tokenValue
  const expectedTokenValue = tx.rawAmount * expectedRate;
  if (Math.abs(tx.tokenValue - expectedTokenValue) > 0.01) {
    issues.push(
      `TokenValue incorreto: esperado ${expectedTokenValue.toFixed(4)}, ` +
      `encontrado ${tx.tokenValue.toFixed(4)}`
    );
  }

  return {
    valid: issues.length === 0,
    issues,
    model,
    expectedRate,
    actualRate: tx.rate,
    expectedPrice,
  };
}

/**
 * Analisa transações de uma conversa
 */
async function analyzeConversation(conversationId, modelPrices) {
  try {
    console.log(colorize(`\n📊 Analisando conversa: ${conversationId}`, COLOR.cyan));
    
    const transactions = await Transaction.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    if (transactions.length === 0) {
      console.log(colorize('  ℹ️  Nenhuma transação encontrada', COLOR.yellow));
      return {
        conversationId,
        total: 0,
        valid: 0,
        invalid: 0,
        issues: [],
      };
    }

    console.log(colorize(`  Total de transações: ${transactions.length}`, COLOR.blue));

    let valid = 0;
    let invalid = 0;
    const allIssues = [];
    const modelUsage = {};

    transactions.forEach((tx, index) => {
      const validation = validateTransaction(tx, modelPrices);
      
      // Agrupa uso por modelo
      if (validation.model) {
        if (!modelUsage[validation.model]) {
          modelUsage[validation.model] = {
            prompt: 0,
            completion: 0,
            promptTokens: 0,
            completionTokens: 0,
            totalCost: 0,
          };
        }
        
        if (tx.tokenType === 'prompt') {
          modelUsage[validation.model].prompt += 1;
          modelUsage[validation.model].promptTokens += Math.abs(tx.rawAmount);
        } else if (tx.tokenType === 'completion') {
          modelUsage[validation.model].completion += 1;
          modelUsage[validation.model].completionTokens += Math.abs(tx.rawAmount);
        }
        modelUsage[validation.model].totalCost += Math.abs(tx.tokenValue);
      }

      if (validation.valid) {
        valid++;
      } else {
        invalid++;
        allIssues.push({
          index: index + 1,
          transactionId: tx._id,
          model: tx.model,
          tokenType: tx.tokenType,
          rawAmount: tx.rawAmount,
          rate: tx.rate,
          tokenValue: tx.tokenValue,
          context: tx.context,
          issues: validation.issues,
          expectedRate: validation.expectedRate,
        });
      }
    });

    // Relatório de uso por modelo
    console.log(colorize('\n  📈 Uso por modelo:', COLOR.magenta));
    Object.entries(modelUsage).forEach(([model, usage]) => {
      const price = modelPrices[model];
      const displayName = price ? `${price.name} (${price.provider})` : model;
      
      console.log(colorize(`\n    ${displayName}:`, COLOR.bright));
      console.log(`      Tokens prompt: ${usage.promptTokens.toLocaleString()}`);
      console.log(`      Tokens completion: ${usage.completionTokens.toLocaleString()}`);
      console.log(`      Total tokens: ${(usage.promptTokens + usage.completionTokens).toLocaleString()}`);
      const totalCostDollars = Math.abs(usage.totalCost) / CREDITS_PER_DOLLAR;
      console.log(`      Custo total: $${totalCostDollars.toFixed(4)}`);
      
      if (price) {
        const expectedCost = 
          (usage.promptTokens * price.prompt / 1000000) +
          (usage.completionTokens * price.completion / 1000000);
        console.log(`      Custo esperado: $${expectedCost.toFixed(4)}`);
        
        const diff = Math.abs(totalCostDollars - expectedCost);
        if (diff > 0.0001) {
          console.log(colorize(`      ⚠️  Diferença: $${diff.toFixed(4)}`, COLOR.yellow));
        } else {
          console.log(colorize(`      ✓ Custo correto`, COLOR.green));
        }
      }
    });

    // Relatório de validação
    console.log(colorize(`\n  ✅ Transações válidas: ${valid}`, COLOR.green));
    if (invalid > 0) {
      console.log(colorize(`  ❌ Transações inválidas: ${invalid}`, COLOR.red));
      
      console.log(colorize('\n  🔍 Detalhes dos problemas encontrados:', COLOR.red));
      allIssues.forEach((issue) => {
        console.log(colorize(`\n    Transação #${issue.index} (${issue.transactionId}):`, COLOR.yellow));
        console.log(`      Modelo: ${issue.model}`);
        console.log(`      Tipo: ${issue.tokenType}`);
        console.log(`      Tokens: ${Math.abs(issue.rawAmount)}`);
        console.log(`      Rate atual: ${issue.rate}`);
        if (issue.expectedRate) {
          console.log(`      Rate esperado: ${issue.expectedRate}`);
        }
        console.log(`      Context: ${issue.context || 'message'}`);
        console.log(colorize('      Problemas:', COLOR.red));
        issue.issues.forEach(problem => {
          console.log(`        • ${problem}`);
        });
      });
    }

    return {
      conversationId,
      total: transactions.length,
      valid,
      invalid,
      issues: allIssues,
      modelUsage,
    };

  } catch (error) {
    console.error(colorize('❌ Erro ao analisar conversa:', COLOR.red), error);
    throw error;
  }
}

/**
 * Verifica se os agentes estão sendo contabilizados
 */
async function checkAgentBilling(userId) {
  try {
    console.log(colorize('\n🤖 Verificando contabilização de agentes...', COLOR.cyan));

    // Busca conversas de agentes do usuário
    const agentConversations = await Conversation.find({
      user: userId,
      endpoint: 'agents',
    }).lean().limit(10);

    if (agentConversations.length === 0) {
      console.log(colorize('  ℹ️  Nenhuma conversa de agente encontrada', COLOR.yellow));
      return;
    }

    console.log(colorize(`  Encontradas ${agentConversations.length} conversas de agentes`, COLOR.blue));

    let agentsWithBilling = 0;
    let agentsWithoutBilling = 0;

    for (const conv of agentConversations) {
      const txCount = await Transaction.countDocuments({ conversationId: conv.conversationId });
      
      if (txCount > 0) {
        agentsWithBilling++;
      } else {
        agentsWithoutBilling++;
        console.log(colorize(
          `  ⚠️  Conversa ${conv.conversationId} sem transações`,
          COLOR.yellow
        ));
      }
    }

    console.log(colorize(`\n  ✅ Agentes com billing: ${agentsWithBilling}`, COLOR.green));
    if (agentsWithoutBilling > 0) {
      console.log(colorize(
        `  ⚠️  Agentes SEM billing: ${agentsWithoutBilling}`,
        COLOR.yellow
      ));
    }

  } catch (error) {
    console.error(colorize('❌ Erro ao verificar agentes:', COLOR.red), error);
  }
}

/**
 * Analisa as últimas N conversas de um usuário
 */
async function analyzeRecentConversations(userId, limit = 10) {
  try {
    console.log(colorize(`\n📚 Analisando últimas ${limit} conversas do usuário...`, COLOR.cyan));

    const conversations = await Conversation.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    if (conversations.length === 0) {
      console.log(colorize('  ℹ️  Nenhuma conversa encontrada', COLOR.yellow));
      return;
    }

    const modelPrices = await getModelPrices();
    const results = [];

    for (const conv of conversations) {
      const result = await analyzeConversation(conv.conversationId, modelPrices);
      results.push(result);
    }

    // Resumo geral
    const totalTransactions = results.reduce((sum, r) => sum + r.total, 0);
    const totalValid = results.reduce((sum, r) => sum + r.valid, 0);
    const totalInvalid = results.reduce((sum, r) => sum + r.invalid, 0);

    console.log(colorize('\n' + '='.repeat(80), COLOR.cyan));
    console.log(colorize('📊 RESUMO GERAL', COLOR.bright));
    console.log(colorize('='.repeat(80), COLOR.cyan));
    console.log(`Total de conversas analisadas: ${conversations.length}`);
    console.log(`Total de transações: ${totalTransactions}`);
    console.log(colorize(`Transações válidas: ${totalValid}`, COLOR.green));
    if (totalInvalid > 0) {
      console.log(colorize(`Transações inválidas: ${totalInvalid}`, COLOR.red));
      const percentage = ((totalInvalid / totalTransactions) * 100).toFixed(2);
      console.log(colorize(`Taxa de erro: ${percentage}%`, COLOR.red));
    } else {
      console.log(colorize('✓ Todas as transações estão corretas!', COLOR.green));
    }

    return results;

  } catch (error) {
    console.error(colorize('❌ Erro ao analisar conversas:', COLOR.red), error);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log(colorize('\n' + '='.repeat(80), COLOR.cyan));
    console.log(colorize('🔍 VALIDAÇÃO DE CONTABILIZAÇÃO DE TOKENS', COLOR.bright));
    console.log(colorize('='.repeat(80), COLOR.cyan));

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log(colorize('\n⚠️  Uso: node utils/validate-token-billing.js [conversationId|userId]', COLOR.yellow));
      console.log('\nExemplos:');
      console.log('  node utils/validate-token-billing.js 507f1f77bcf86cd799439011  # Analisa uma conversa específica');
      console.log('  node utils/validate-token-billing.js user:507f1f77bcf86cd799439011  # Analisa últimas conversas do usuário');
      process.exit(1);
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida. Defina no .env na raiz do projeto.');
    }
    await connectDb();

    const input = args[0];
    const modelPrices = await getModelPrices();

    if (input.startsWith('user:')) {
      const userId = input.replace('user:', '');
      await checkAgentBilling(userId);
      await analyzeRecentConversations(userId);
    } else {
      // Analisa uma conversa específica
      const result = await analyzeConversation(input, modelPrices);
      
      if (result.total === 0) {
        console.log(colorize('\n⚠️  Nenhuma transação encontrada para esta conversa', COLOR.yellow));
      }
    }

    console.log(colorize('\n✓ Validação concluída!', COLOR.green));
    process.exit(0);

  } catch (error) {
    console.error(colorize('\n❌ Erro durante a validação:', COLOR.red), error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  getModelPrices,
  validateTransaction,
  analyzeConversation,
  checkAgentBilling,
  analyzeRecentConversations,
};
