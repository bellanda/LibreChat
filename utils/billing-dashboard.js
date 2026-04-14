/**
 * Dashboard rápido de billing
 * Mostra estatísticas gerais do sistema de cobrança
 * 
 * Uso: node utils/billing-dashboard.js [userId]
 */

const path = require('path');
require('module-alias/register');
// Alias ~ para api/ quando rodando da raiz (ex: node utils/billing-dashboard.js)
require('module-alias').addAlias('~', path.join(__dirname, '../api'));

const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { connectDb } = require('../api/db/connect');

const { Transaction, Balance, Conversation } = require('../api/db/models');
const ModelsDescriptions = require('../api/models/ModelsDescriptions');

/** 1.000.000 créditos = US$ 1 (valores no banco estão em créditos) */
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

function formatNumber(num) {
  return num.toLocaleString('pt-BR');
}

/** Converte créditos em dólares e formata (1M créditos = $1) */
function formatCurrency(credits) {
  const dollars = Math.abs(Number(credits)) / CREDITS_PER_DOLLAR;
  return `$${dollars.toFixed(4)}`;
}

/** Formata saldo: créditos e equivalente em dólares */
function formatBalance(credits) {
  const c = Number(credits);
  const dollars = c / CREDITS_PER_DOLLAR;
  return `${formatNumber(c)} créditos (${formatCurrency(c)})`;
}

/**
 * Estatísticas gerais do sistema
 */
async function getSystemStats() {
  const [
    totalTransactions,
    totalUsers,
    totalConversations,
    modelsCount,
  ] = await Promise.all([
    Transaction.countDocuments({}),
    Transaction.distinct('user').then(users => users.length),
    Transaction.distinct('conversationId').then(convs => convs.length),
    ModelsDescriptions.findOne({}).then(doc => {
      if (!doc) return 0;
      return Object.keys(doc.toObject()).filter(k => k !== '_id').length;
    }),
  ]);

  return {
    totalTransactions,
    totalUsers,
    totalConversations,
    modelsCount,
  };
}

/**
 * Estatísticas por modelo
 */
async function getModelStats(userId = null) {
  const match = userId ? { user: new mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$model',
        totalTransactions: { $sum: 1 },
        totalTokens: { $sum: { $abs: '$rawAmount' } },
        totalCost: { $sum: { $abs: '$tokenValue' } },
        promptTransactions: {
          $sum: { $cond: [{ $eq: ['$tokenType', 'prompt'] }, 1, 0] }
        },
        completionTransactions: {
          $sum: { $cond: [{ $eq: ['$tokenType', 'completion'] }, 1, 0] }
        },
      }
    },
    { $sort: { totalCost: -1 } },
    { $limit: 10 }
  ]);

  return stats;
}

/**
 * Estatísticas de usuários (top spenders)
 */
async function getTopUsers(limit = 10) {
  const stats = await Transaction.aggregate([
    {
      $group: {
        _id: '$user',
        totalTransactions: { $sum: 1 },
        totalCost: { $sum: { $abs: '$tokenValue' } },
      }
    },
    { $sort: { totalCost: -1 } },
    { $limit: limit }
  ]);

  // Buscar balances
  const userIds = stats.map(s => s._id);
  const balances = await Balance.find({ user: { $in: userIds } }).lean();
  const balanceMap = {};
  balances.forEach(b => {
    balanceMap[b.user.toString()] = b.tokenCredits;
  });

  return stats.map(s => ({
    ...s,
    balance: balanceMap[s._id.toString()] || 0,
  }));
}

/**
 * Estatísticas de agentes
 */
async function getAgentStats(userId = null) {
  const match = userId 
    ? { user: new mongoose.Types.ObjectId(userId), endpoint: 'agents' }
    : { endpoint: 'agents' };

  const [totalAgentConvos, agentConvosWithTransactions] = await Promise.all([
    Conversation.countDocuments(match),
    Conversation.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'transactions',
          localField: 'conversationId',
          foreignField: 'conversationId',
          as: 'transactions'
        }
      },
      {
        $match: {
          'transactions.0': { $exists: true }
        }
      },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0),
  ]);

  const coverage = totalAgentConvos > 0 
    ? ((agentConvosWithTransactions / totalAgentConvos) * 100).toFixed(1)
    : 0;

  return {
    totalAgentConvos,
    agentConvosWithTransactions,
    agentConvosWithoutTransactions: totalAgentConvos - agentConvosWithTransactions,
    coverage: parseFloat(coverage),
  };
}

/**
 * Estatísticas temporais (últimos 7 dias)
 */
async function getTemporalStats(userId = null) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const match = {
    createdAt: { $gte: sevenDaysAgo },
    ...(userId && { user: new mongoose.Types.ObjectId(userId) }),
  };

  const stats = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        transactions: { $sum: 1 },
        tokens: { $sum: { $abs: '$rawAmount' } },
        cost: { $sum: { $abs: '$tokenValue' } },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return stats;
}

/**
 * Verifica integridade dos dados
 */
async function checkIntegrity() {
  const issues = [];

  // Transações sem modelo
  const txWithoutModel = await Transaction.countDocuments({
    model: { $exists: false }
  });
  if (txWithoutModel > 0) {
    issues.push({
      type: 'warning',
      message: `${txWithoutModel} transações sem modelo especificado`,
    });
  }

  // Transações com rate = 6 (defaultRate - indica modelo não configurado)
  const txWithDefaultRate = await Transaction.countDocuments({
    rate: 6,
    model: { $exists: true, $ne: null }
  });
  if (txWithDefaultRate > 0) {
    issues.push({
      type: 'warning',
      message: `${txWithDefaultRate} transações usando defaultRate (modelo não em tx.js)`,
    });
  }

  // Transações com tokenValue = 0
  const txWithZeroValue = await Transaction.countDocuments({
    tokenValue: 0,
    rawAmount: { $ne: 0 }
  });
  if (txWithZeroValue > 0) {
    issues.push({
      type: 'error',
      message: `${txWithZeroValue} transações com tokenValue = 0 mas rawAmount != 0`,
    });
  }

  return issues;
}

/**
 * Exibe o dashboard
 */
async function displayDashboard(userId = null) {
  console.log(colorize('\n' + '='.repeat(80), COLOR.cyan));
  console.log(colorize('💰 DASHBOARD DE BILLING', COLOR.bright));
  if (userId) {
    console.log(colorize(`   Usuário: ${userId}`, COLOR.cyan));
  }
  console.log(colorize('='.repeat(80), COLOR.cyan));

  // Estatísticas gerais
  console.log(colorize('\n📊 ESTATÍSTICAS GERAIS', COLOR.bright));
  const systemStats = await getSystemStats();
  console.log(`   Total de transações: ${colorize(formatNumber(systemStats.totalTransactions), COLOR.green)}`);
  if (!userId) {
    console.log(`   Total de usuários: ${colorize(formatNumber(systemStats.totalUsers), COLOR.green)}`);
    console.log(`   Total de conversas: ${colorize(formatNumber(systemStats.totalConversations), COLOR.green)}`);
  }
  console.log(`   Modelos configurados: ${colorize(formatNumber(systemStats.modelsCount), COLOR.green)}`);

  // Estatísticas por modelo
  console.log(colorize('\n🤖 TOP 10 MODELOS POR CUSTO', COLOR.bright));
  const modelStats = await getModelStats(userId);
  if (modelStats.length === 0) {
    console.log(colorize('   Nenhum dado encontrado', COLOR.yellow));
  } else {
    modelStats.forEach((stat, index) => {
      const model = stat._id || 'desconhecido';
      console.log(colorize(`\n   ${index + 1}. ${model}`, COLOR.cyan));
      console.log(`      Transações: ${formatNumber(stat.totalTransactions)} (${stat.promptTransactions}p + ${stat.completionTransactions}c)`);
      console.log(`      Tokens: ${formatNumber(Math.round(stat.totalTokens))}`);
      console.log(`      Custo: ${colorize(formatCurrency(stat.totalCost), COLOR.green)}`);
    });
  }

  // Top usuários (apenas se não filtrar por usuário)
  if (!userId) {
    console.log(colorize('\n👥 TOP 10 USUÁRIOS POR CUSTO', COLOR.bright));
    const topUsers = await getTopUsers(10);
    topUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user._id.toString().substring(0, 8)}... | ` +
        `Transações: ${formatNumber(user.totalTransactions)} | ` +
        `Custo: ${colorize(formatCurrency(user.totalCost), COLOR.green)} | ` +
        `Balance: ${colorize(formatBalance(user.balance), user.balance > 0 ? COLOR.green : COLOR.red)}`
      );
    });
  }

  // Estatísticas de agentes
  console.log(colorize('\n🤖 COBERTURA DE AGENTES', COLOR.bright));
  const agentStats = await getAgentStats(userId);
  console.log(`   Conversas de agentes: ${formatNumber(agentStats.totalAgentConvos)}`);
  console.log(`   Com billing: ${colorize(formatNumber(agentStats.agentConvosWithTransactions), COLOR.green)}`);
  if (agentStats.agentConvosWithoutTransactions > 0) {
    console.log(`   Sem billing: ${colorize(formatNumber(agentStats.agentConvosWithoutTransactions), COLOR.red)}`);
  }
  console.log(`   Cobertura: ${colorize(agentStats.coverage.toFixed(1) + '%', agentStats.coverage === 100 ? COLOR.green : COLOR.yellow)}`);

  // Estatísticas temporais
  console.log(colorize('\n📅 ÚLTIMOS 7 DIAS', COLOR.bright));
  const temporalStats = await getTemporalStats(userId);
  if (temporalStats.length === 0) {
    console.log(colorize('   Nenhuma transação nos últimos 7 dias', COLOR.yellow));
  } else {
    temporalStats.forEach(stat => {
      console.log(
        `   ${stat._id} | ` +
        `Transações: ${formatNumber(stat.transactions)} | ` +
        `Tokens: ${formatNumber(Math.round(stat.tokens))} | ` +
        `Custo: ${colorize(formatCurrency(stat.cost), COLOR.green)}`
      );
    });
  }

  // Verificação de integridade
  console.log(colorize('\n🔍 VERIFICAÇÃO DE INTEGRIDADE', COLOR.bright));
  const issues = await checkIntegrity();
  if (issues.length === 0) {
    console.log(colorize('   ✓ Nenhum problema detectado', COLOR.green));
  } else {
    issues.forEach(issue => {
      const color = issue.type === 'error' ? COLOR.red : COLOR.yellow;
      const icon = issue.type === 'error' ? '❌' : '⚠️';
      console.log(colorize(`   ${icon} ${issue.message}`, color));
    });
  }

  console.log(colorize('\n' + '='.repeat(80), COLOR.cyan));
}

/**
 * Função principal
 */
async function main() {
  try {
    const userId = process.argv[2];

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      console.error(colorize('❌ ID de usuário inválido', COLOR.red));
      console.log('\nUso: node utils/billing-dashboard.js [userId]');
      process.exit(1);
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida. Defina no .env na raiz do projeto.');
    }
    await connectDb();

    await displayDashboard(userId || null);
    
    console.log(colorize('\n💡 Dicas:', COLOR.cyan));
    console.log('   • Use "node utils/validate-token-billing.js user:<userId>" para análise detalhada');
    console.log('   • Use "node utils/sync-model-prices.js --dry-run" para verificar preços');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error(colorize('\n❌ Erro:', COLOR.red), error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  getSystemStats,
  getModelStats,
  getTopUsers,
  getAgentStats,
  getTemporalStats,
  checkIntegrity,
  displayDashboard,
};
