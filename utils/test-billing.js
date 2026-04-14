/**
 * Script de teste automatizado para billing
 * Pode ser usado em CI/CD ou testes manuais
 * 
 * Uso: node utils/test-billing.js
 */

const path = require('path');
require('module-alias/register');
require('module-alias').addAlias('~', path.join(__dirname, '../api'));

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { connectDb } = require('../api/db/connect');

const { Transaction } = require('../api/db/models');
const ModelsDescriptions = require('../api/models/ModelsDescriptions');
const { getMultiplier } = require('../api/models/tx');

const COLOR = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

function colorize(text, color) {
  return `${color}${text}${COLOR.reset}`;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(colorize(`✓ ${name}`, COLOR.green));
    return true;
  } catch (error) {
    failedTests++;
    console.log(colorize(`✗ ${name}`, COLOR.red));
    console.log(colorize(`  ${error.message}`, COLOR.red));
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertAlmostEqual(a, b, tolerance = 0.01, message = '') {
  if (Math.abs(a - b) > tolerance) {
    throw new Error(message || `Esperado ${b}, mas recebeu ${a} (diferença: ${Math.abs(a - b)})`);
  }
}

/**
 * Testes de cálculo de preços
 */
async function testPriceCalculation() {
  console.log(colorize('\n📊 TESTES DE CÁLCULO DE PREÇOS', COLOR.yellow));

  // Test 1: Verificar se getMultiplier retorna valores corretos
  test('getMultiplier retorna valor para modelo conhecido', () => {
    const rate = getMultiplier({
      model: 'gpt-4o',
      tokenType: 'prompt',
    });
    assert(rate > 0, 'Rate deve ser maior que 0');
    assertAlmostEqual(rate, 2.5, 0.1, 'Rate do gpt-4o prompt deve ser ~2.5');
  });

  // Test 2: Verificar defaultRate para modelo desconhecido
  test('getMultiplier retorna defaultRate para modelo desconhecido', () => {
    const rate = getMultiplier({
      model: 'modelo-inexistente-123',
      tokenType: 'prompt',
    });
    assertAlmostEqual(rate, 6, 0.1, 'Default rate deve ser 6');
  });

  // Test 3: Verificar cálculo com endpointTokenConfig
  test('getMultiplier usa endpointTokenConfig quando fornecido', () => {
    const customConfig = {
      'custom-model': {
        prompt: 1.5,
        completion: 3.0,
      }
    };
    
    const rate = getMultiplier({
      model: 'custom-model',
      tokenType: 'prompt',
      endpointTokenConfig: customConfig,
    });
    
    assertAlmostEqual(rate, 1.5, 0.01, 'Deve usar o rate do config customizado');
  });
}

/**
 * Testes de transações
 */
async function testTransactions() {
  console.log(colorize('\n💳 TESTES DE TRANSAÇÕES', COLOR.yellow));

  // Test 4: Verificar estrutura de transações no banco
  test('Transações no banco têm campos obrigatórios', async () => {
    const tx = await Transaction.findOne({}).lean();
    if (!tx) {
      console.log(colorize('  ⚠️  Pulando teste: nenhuma transação no banco', COLOR.yellow));
      totalTests--;
      return;
    }

    assert(tx.user != null, 'Transação deve ter user');
    assert(tx.tokenType != null, 'Transação deve ter tokenType');
    assert(tx.rawAmount != null, 'Transação deve ter rawAmount');
    assert(tx.tokenValue != null, 'Transação deve ter tokenValue');
    assert(tx.rate != null, 'Transação deve ter rate');
  });

  // Test 5: Verificar cálculo de tokenValue
  test('tokenValue é calculado corretamente', async () => {
    const tx = await Transaction.findOne({ 
      model: { $exists: true, $ne: null },
      rawAmount: { $ne: 0 }
    }).lean();
    
    if (!tx) {
      console.log(colorize('  ⚠️  Pulando teste: nenhuma transação válida no banco', COLOR.yellow));
      totalTests--;
      return;
    }

    const expectedTokenValue = tx.rawAmount * tx.rate;
    assertAlmostEqual(
      tx.tokenValue,
      expectedTokenValue,
      0.01,
      `tokenValue deve ser rawAmount * rate (${tx.rawAmount} * ${tx.rate} = ${expectedTokenValue})`
    );
  });

  // Test 6: Verificar que transações são negativas (débito)
  test('Transações de débito têm valores negativos', async () => {
    const tx = await Transaction.findOne({
      tokenType: { $in: ['prompt', 'completion'] },
      context: { $ne: 'auto-refill' }
    }).lean();

    if (!tx) {
      console.log(colorize('  ⚠️  Pulando teste: nenhuma transação de débito no banco', COLOR.yellow));
      totalTests--;
      return;
    }

    assert(tx.rawAmount <= 0, 'rawAmount de débito deve ser <= 0');
    assert(tx.tokenValue <= 0, 'tokenValue de débito deve ser <= 0');
  });
}

/**
 * Testes de sincronização de preços
 */
async function testPriceSynchronization() {
  console.log(colorize('\n🔄 TESTES DE SINCRONIZAÇÃO DE PREÇOS', COLOR.yellow));

  // Test 7: Verificar se modelDescriptions existe
  test('modelDescriptions existe no banco', async () => {
    const modelsDesc = await ModelsDescriptions.findOne({}).lean();
    assert(modelsDesc != null, 'modelDescriptions deve existir');
    
    const modelCount = Object.keys(modelsDesc).filter(k => k !== '_id').length;
    assert(modelCount > 0, 'Deve ter pelo menos 1 modelo configurado');
  });

  // Test 8: Verificar consistência entre banco e código
  test('Modelos mais usados estão no banco', async () => {
    // Pega os 5 modelos mais usados
    const topModels = await Transaction.aggregate([
      { $match: { model: { $exists: true, $ne: null } } },
      { $group: { _id: '$model', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    if (topModels.length === 0) {
      console.log(colorize('  ⚠️  Pulando teste: nenhum modelo usado', COLOR.yellow));
      totalTests--;
      return;
    }

    const modelsDesc = await ModelsDescriptions.findOne({}).lean();
    const missingModels = [];

    topModels.forEach(({ _id: model }) => {
      if (!modelsDesc[model]) {
        missingModels.push(model);
      }
    });

    if (missingModels.length > 0) {
      throw new Error(
        `Modelos mais usados não estão no banco: ${missingModels.join(', ')}`
      );
    }
  });

  // Test 9: Verificar se preços no banco são válidos
  test('Preços no banco são números positivos', async () => {
    const modelsDesc = await ModelsDescriptions.findOne({}).lean();
    const invalidModels = [];

    Object.keys(modelsDesc).forEach(key => {
      if (key === '_id') return;
      
      const model = modelsDesc[key];
      if (
        typeof model.prompt !== 'number' ||
        typeof model.completion !== 'number' ||
        model.prompt <= 0 ||
        model.completion <= 0
      ) {
        invalidModels.push(key);
      }
    });

    if (invalidModels.length > 0) {
      throw new Error(
        `Modelos com preços inválidos: ${invalidModels.join(', ')}`
      );
    }
  });
}

/**
 * Testes de agentes
 */
async function testAgents() {
  console.log(colorize('\n🤖 TESTES DE AGENTES', COLOR.yellow));

  const { Conversation } = require('../api/models');

  // Test 10: Verificar se agentes estão gerando transações
  test('Conversas de agentes geram transações', async () => {
    const agentConvo = await Conversation.findOne({ endpoint: 'agents' }).lean();
    
    if (!agentConvo) {
      console.log(colorize('  ⚠️  Pulando teste: nenhuma conversa de agente no banco', COLOR.yellow));
      totalTests--;
      return;
    }

    const txCount = await Transaction.countDocuments({
      conversationId: agentConvo.conversationId
    });

    assert(
      txCount > 0,
      `Conversa de agente ${agentConvo.conversationId} não tem transações`
    );
  });

  // Test 11: Verificar cobertura de agentes
  test('Cobertura de agentes é aceitável (>80%)', async () => {
    const totalAgents = await Conversation.countDocuments({ endpoint: 'agents' });
    
    if (totalAgents === 0) {
      console.log(colorize('  ⚠️  Pulando teste: nenhuma conversa de agente', COLOR.yellow));
      totalTests--;
      return;
    }

    const agentsWithTx = await Conversation.aggregate([
      { $match: { endpoint: 'agents' } },
      {
        $lookup: {
          from: 'transactions',
          localField: 'conversationId',
          foreignField: 'conversationId',
          as: 'transactions'
        }
      },
      { $match: { 'transactions.0': { $exists: true } } },
      { $count: 'total' }
    ]);

    const withTx = agentsWithTx[0]?.total || 0;
    const coverage = (withTx / totalAgents) * 100;

    assert(
      coverage >= 80,
      `Cobertura de agentes muito baixa: ${coverage.toFixed(1)}% (esperado >= 80%)`
    );
  });
}

/**
 * Testes de integridade
 */
async function testIntegrity() {
  console.log(colorize('\n🔍 TESTES DE INTEGRIDADE', COLOR.yellow));

  // Test 12: Verificar transações órfãs
  test('Não há transações com modelo null', async () => {
    const count = await Transaction.countDocuments({
      model: null,
      tokenType: { $in: ['prompt', 'completion'] }
    });

    assert(
      count === 0,
      `${count} transações com modelo null (não deveria haver)`
    );
  });

  // Test 13: Verificar uso de defaultRate
  test('Uso de defaultRate é baixo (<5%)', async () => {
    const [totalTx, defaultRateTx] = await Promise.all([
      Transaction.countDocuments({ 
        tokenType: { $in: ['prompt', 'completion'] }
      }),
      Transaction.countDocuments({
        rate: 6,
        tokenType: { $in: ['prompt', 'completion'] }
      }),
    ]);

    if (totalTx === 0) {
      console.log(colorize('  ⚠️  Pulando teste: nenhuma transação no banco', COLOR.yellow));
      totalTests--;
      return;
    }

    const percentage = (defaultRateTx / totalTx) * 100;

    assert(
      percentage < 5,
      `${percentage.toFixed(1)}% das transações usam defaultRate (esperado <5%)`
    );
  });

  // Test 14: Verificar transações com tokenValue = 0
  test('Não há transações com tokenValue zero incorreto', async () => {
    const count = await Transaction.countDocuments({
      tokenValue: 0,
      rawAmount: { $ne: 0 },
      rate: { $ne: 0 }
    });

    assert(
      count === 0,
      `${count} transações com tokenValue=0 mas rawAmount≠0 (erro de cálculo)`
    );
  });
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log(colorize('\n' + '='.repeat(80), COLOR.yellow));
    console.log(colorize('🧪 TESTES DE BILLING', COLOR.yellow));
    console.log(colorize('='.repeat(80), COLOR.yellow));

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida. Defina no .env na raiz do projeto.');
    }
    await connectDb();

    await testPriceCalculation();
    await testTransactions();
    await testPriceSynchronization();
    await testAgents();
    await testIntegrity();

    // Resumo
    console.log(colorize('\n' + '='.repeat(80), COLOR.yellow));
    console.log(colorize('📊 RESUMO', COLOR.yellow));
    console.log(colorize('='.repeat(80), COLOR.yellow));
    console.log(`Total de testes: ${totalTests}`);
    console.log(colorize(`✓ Passaram: ${passedTests}`, COLOR.green));
    
    if (failedTests > 0) {
      console.log(colorize(`✗ Falharam: ${failedTests}`, COLOR.red));
      console.log(colorize('\n❌ ALGUNS TESTES FALHARAM', COLOR.red));
      process.exit(1);
    } else {
      console.log(colorize('\n✅ TODOS OS TESTES PASSARAM', COLOR.green));
      process.exit(0);
    }

  } catch (error) {
    console.error(colorize('\n❌ Erro durante os testes:', COLOR.red), error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  testPriceCalculation,
  testTransactions,
  testPriceSynchronization,
  testAgents,
  testIntegrity,
};
