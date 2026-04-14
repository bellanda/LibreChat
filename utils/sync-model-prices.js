/**
 * Script para sincronizar preços dos modelDescriptions com o sistema de token billing
 * 
 * Este script:
 * 1. Lê os preços do banco (modelsdescriptions)
 * 2. Atualiza o arquivo tx.js com os preços corretos
 * 3. Gera um relatório de diferenças
 * 
 * Usa MONGO_URI do .env na raiz do projeto.
 * Uso: node utils/sync-model-prices.js [--dry-run]
 */

const path = require('path');

// Carrega .env da raiz do projeto (antes de qualquer require que use process.env)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const fs = require('fs').promises;
require('module-alias/register');
const { connectDb } = require('../api/db/connect');

const ModelsDescriptions = require('../api/models/ModelsDescriptions');

const COLOR = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${color}${text}${COLOR.reset}`;
}

/**
 * Busca preços do banco
 */
async function getModelPricesFromDB() {
  const modelsDescriptions = await ModelsDescriptions.findOne({}).lean();
  if (!modelsDescriptions) {
    throw new Error('Nenhuma descrição de modelo encontrada no banco');
  }

  const prices = {};
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

  return prices;
}

/**
 * Lê preços do tx.js
 * Extrai todas as entradas { prompt, completion } do objeto tokenValues (regex global no arquivo).
 */
async function getModelPricesFromCode() {
  const txPath = path.join(__dirname, '../api/models/tx.js');
  const txContent = await fs.readFile(txPath, 'utf8');

  const prices = {};
  // Chave pode ser 'key', "key" ou identificador (ex: deepseek, grok, o3)
  const re = /\s*(?:'([^']*)'|"([^"]*)"|([a-zA-Z0-9_.-]+))\s*:\s*\{\s*prompt:\s*([\d.]+)\s*,\s*completion:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = re.exec(txContent)) !== null) {
    const key = m[1] ?? m[2] ?? m[3];
    const prompt = parseFloat(m[4]);
    const completion = parseFloat(m[5]);
    if (key && !Number.isNaN(prompt) && !Number.isNaN(completion)) {
      prices[key] = { prompt, completion };
    }
  }

  return prices;
}

/**
 * Compara preços do banco com o código
 */
function comparePrices(dbPrices, codePrices) {
  const differences = [];
  const missing = [];
  const extra = [];

  // Verifica modelos no banco
  Object.keys(dbPrices).forEach(modelId => {
    const dbPrice = dbPrices[modelId];
    const codePrice = codePrices[modelId];

    if (!codePrice) {
      missing.push({
        modelId,
        name: dbPrice.name,
        provider: dbPrice.provider,
        prompt: dbPrice.prompt,
        completion: dbPrice.completion,
      });
    } else if (
      Math.abs(dbPrice.prompt - codePrice.prompt) > 0.01 ||
      Math.abs(dbPrice.completion - codePrice.completion) > 0.01
    ) {
      differences.push({
        modelId,
        name: dbPrice.name,
        provider: dbPrice.provider,
        db: { prompt: dbPrice.prompt, completion: dbPrice.completion },
        code: { prompt: codePrice.prompt, completion: codePrice.completion },
      });
    }
  });

  // Verifica modelos extras no código
  Object.keys(codePrices).forEach(modelId => {
    if (!dbPrices[modelId]) {
      extra.push({
        modelId,
        prompt: codePrices[modelId].prompt,
        completion: codePrices[modelId].completion,
      });
    }
  });

  return { differences, missing, extra };
}

/**
 * Gera código para adicionar ao tx.js
 */
function generateTokenValuesCode(dbPrices) {
  const lines = [];

  Object.keys(dbPrices)
    .sort()
    .forEach((modelId) => {
      const price = dbPrices[modelId];
      const comment = `// ${price.name} (${price.provider})`;
      lines.push(`    ${comment}`);
      lines.push(`    '${modelId}': { prompt: ${price.prompt}, completion: ${price.completion} },`);
    });

  return lines.join('\n');
}

/**
 * Monta o conteúdo do arquivo de referência com resumo, tokenValues e diferenças
 */
function buildReferenceFileContent({
  referenceCode,
  dbPrices,
  codePrices,
  differences,
  missing,
  extra,
}) {
  const ts = new Date().toISOString();
  const nBanco = Object.keys(dbPrices).length;
  const nCodigo = Object.keys(codePrices).length;

  let out = `/**
 * Referência de preços de tokens baseada nos modelDescriptions do banco
 * Gerado automaticamente em ${ts}
 *
 * Use este arquivo como referência para atualizar api/models/tx.js
 *
 * RESUMO DA ÚLTIMA SINCRONIZAÇÃO:
 *   Modelos no banco: ${nBanco}
 *   Modelos no código: ${nCodigo}
 *   Diferenças (banco ≠ código): ${differences.length}
 *   Faltando no código: ${missing.length}
 *   Extras no código: ${extra.length}
 */
`;

  if (differences.length > 0) {
    out += `
/**
 * CORRIGIR EM api/models/tx.js (valores atuais no código estão diferentes do banco)
 */
const differencesToFix = ${JSON.stringify(
      differences.map((d) => ({
        modelId: d.modelId,
        name: d.name,
        provider: d.provider,
        banco: d.db,
        codigo: d.code,
        linhaSugerida: `'${d.modelId}': { prompt: ${d.db.prompt}, completion: ${d.db.completion} },`,
      })),
      null,
      2,
    )};

`;
  }

  if (missing.length > 0) {
    out += `
/**
 * MODELOS NO BANCO QUE FALTAM NO CÓDIGO (adicionar em api/models/tx.js)
 */
const missingInCode = ${JSON.stringify(
      missing.map((m) => ({
        modelId: m.modelId,
        name: m.name,
        provider: m.provider,
        prompt: m.prompt,
        completion: m.completion,
        linhaSugerida: `'${m.modelId}': { prompt: ${m.prompt}, completion: ${m.completion} },`,
      })),
      null,
      2,
    )};

`;
  }

  out += `
/** Preços do banco (modelDescriptions) - use para conferir ou colar em tx.js */
const tokenValuesFromDB = {
${referenceCode}
};
`;

  out += `
module.exports = {
  tokenValuesFromDB,`;
  if (differences.length > 0) out += `
  differencesToFix,`;
  if (missing.length > 0) out += `
  missingInCode,`;
  out += `
};
`;

  return out;
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log(colorize('\n' + '='.repeat(80), COLOR.cyan));
    console.log(colorize('🔄 SINCRONIZAÇÃO DE PREÇOS DE MODELOS', COLOR.bright));
    console.log(colorize('='.repeat(80), COLOR.cyan));

    const dryRun = process.argv.includes('--dry-run');
    if (dryRun) {
      console.log(colorize('\n⚠️  Modo DRY-RUN: nenhuma alteração será feita', COLOR.yellow));
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida. Defina no .env na raiz do projeto (ex: MONGO_URI=mongodb://localhost:27018/LibreChat)');
    }

    console.log(colorize('\n🔌 Conectando ao MongoDB...', COLOR.cyan));
    await connectDb();
    console.log(colorize('✓ Conectado', COLOR.green));

    console.log(colorize('\n📖 Lendo preços do banco de dados...', COLOR.cyan));
    const dbPrices = await getModelPricesFromDB();
    console.log(colorize(`✓ Carregados ${Object.keys(dbPrices).length} modelos do banco`, COLOR.green));

    console.log(colorize('\n📄 Lendo preços do código (tx.js)...', COLOR.cyan));
    let codePrices;
    try {
      codePrices = await getModelPricesFromCode();
      console.log(colorize(`✓ Carregados ${Object.keys(codePrices).length} modelos do código`, COLOR.green));
    } catch (error) {
      console.log(colorize('⚠️  Não foi possível ler preços do código', COLOR.yellow));
      codePrices = {};
    }

    console.log(colorize('\n🔍 Comparando preços...', COLOR.cyan));
    const { differences, missing, extra } = comparePrices(dbPrices, codePrices);

    // Relatório de diferenças
    if (differences.length > 0) {
      console.log(colorize(`\n⚠️  ${differences.length} modelo(s) com preços diferentes:`, COLOR.yellow));
      differences.forEach(diff => {
        console.log(colorize(`\n  ${diff.modelId}:`, COLOR.bright));
        console.log(`    Nome: ${diff.name} (${diff.provider})`);
        console.log(colorize('    Banco:', COLOR.cyan));
        console.log(`      prompt: ${diff.db.prompt}, completion: ${diff.db.completion}`);
        console.log(colorize('    Código:', COLOR.yellow));
        console.log(`      prompt: ${diff.code.prompt}, completion: ${diff.code.completion}`);
      });
    } else {
      console.log(colorize('✓ Nenhuma diferença de preços encontrada', COLOR.green));
    }

    // Modelos faltando no código
    if (missing.length > 0) {
      console.log(colorize(`\n📝 ${missing.length} modelo(s) no banco mas não no código:`, COLOR.yellow));
      missing.forEach(model => {
        console.log(`  • ${model.modelId} - ${model.name} (${model.provider})`);
        console.log(`    prompt: ${model.prompt}, completion: ${model.completion}`);
      });

      console.log(colorize('\n💡 Código para adicionar ao tx.js:', COLOR.cyan));
      console.log(colorize('=' .repeat(80), COLOR.cyan));
      missing.forEach(model => {
        console.log(`    // ${model.name} (${model.provider})`);
        console.log(`    '${model.modelId}': { prompt: ${model.prompt}, completion: ${model.completion} },`);
      });
      console.log(colorize('=' .repeat(80), COLOR.cyan));
    } else {
      console.log(colorize('\n✓ Todos os modelos do banco estão no código', COLOR.green));
    }

    // Modelos extras no código
    if (extra.length > 0) {
      console.log(colorize(`\n⚠️  ${extra.length} modelo(s) no código mas não no banco:`, COLOR.yellow));
      extra.forEach(model => {
        console.log(`  • ${model.modelId}`);
        console.log(`    prompt: ${model.prompt}, completion: ${model.completion}`);
      });
      console.log(colorize('\n💡 Estes modelos podem ser removidos ou adicionados ao banco', COLOR.cyan));
    }

    // Gera arquivo completo de referência (com resumo e diferenças)
    console.log(colorize('\n📄 Gerando arquivo de referência...', COLOR.cyan));
    const referenceCode = generateTokenValuesCode(dbPrices);
    const referencePath = path.join(__dirname, 'token-values-reference.js');

    const referenceContent = buildReferenceFileContent({
      referenceCode,
      dbPrices,
      codePrices,
      differences,
      missing,
      extra,
    });

    if (!dryRun) {
      await fs.writeFile(referencePath, referenceContent);
      console.log(colorize(`✓ Arquivo de referência salvo em: ${referencePath}`, COLOR.green));
    } else {
      console.log(colorize('  (arquivo não salvo - modo dry-run)', COLOR.yellow));
    }

    // Resumo final
    console.log(colorize('\n' + '='.repeat(80), COLOR.cyan));
    console.log(colorize('📊 RESUMO', COLOR.bright));
    console.log(colorize('='.repeat(80), COLOR.cyan));
    console.log(`Modelos no banco: ${Object.keys(dbPrices).length}`);
    console.log(`Modelos no código: ${Object.keys(codePrices).length}`);
    console.log(colorize(`Diferenças: ${differences.length}`, differences.length > 0 ? COLOR.yellow : COLOR.green));
    console.log(colorize(`Faltando no código: ${missing.length}`, missing.length > 0 ? COLOR.yellow : COLOR.green));
    console.log(colorize(`Extras no código: ${extra.length}`, extra.length > 0 ? COLOR.yellow : COLOR.green));

    if (differences.length === 0 && missing.length === 0) {
      console.log(colorize('\n✓ Preços sincronizados corretamente!', COLOR.green));
    } else {
      console.log(colorize('\n⚠️  Ação necessária: atualize api/models/tx.js com os valores corretos', COLOR.yellow));
      console.log(colorize('    Use o arquivo de referência gerado como base', COLOR.yellow));
    }

    process.exit(0);

  } catch (error) {
    console.error(colorize('\n❌ Erro durante a sincronização:', COLOR.red), error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  getModelPricesFromDB,
  comparePrices,
  generateTokenValuesCode,
};
