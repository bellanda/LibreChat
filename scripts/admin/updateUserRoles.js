#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const path = require('path');

// Carregar configurações do projeto
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LibreChat';
const DB_NAME = process.env.DB_NAME || 'LibreChat';

/**
 * Atualiza o role de um usuário específico
 * @param {string} identifier - Username, email ou ldapId do usuário
 * @param {string} role - Novo role (admin, user, etc.)
 * @param {string} identifierType - Tipo do identificador (username, email, ldapId)
 */
async function updateUserRole(identifier, role, identifierType = 'username') {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db(DB_NAME);
    const users = db.collection('users');

    // Construir filtro baseado no tipo de identificador
    const filter = { [identifierType]: identifier };

    // Verificar se o usuário existe
    const existingUser = await users.findOne(filter);
    if (!existingUser) {
      console.log(`❌ Usuário não encontrado: ${identifier} (${identifierType})`);
      return false;
    }

    console.log(
      `📋 Usuário encontrado: ${existingUser.name || existingUser.username} (${existingUser.email})`,
    );
    console.log(`📋 Role atual: ${existingUser.role || 'user'}`);

    // Atualizar o role
    const result = await users.updateOne(filter, {
      $set: {
        role: role,
        updatedAt: new Date(),
      },
    });

    if (result.modifiedCount > 0) {
      console.log(`✅ Role atualizado com sucesso para: ${role}`);
      return true;
    } else {
      console.log(`⚠️  Nenhuma alteração necessária (role já era: ${role})`);
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return false;
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

/**
 * Atualiza roles de múltiplos usuários
 * @param {Array} userList - Lista de objetos {identifier, role, identifierType?}
 */
async function updateMultipleUserRoles(userList) {
  console.log(`🚀 Iniciando atualização de ${userList.length} usuários...\n`);

  const results = [];

  for (const userConfig of userList) {
    const { identifier, role, identifierType = 'username' } = userConfig;
    console.log(`\n📝 Processando: ${identifier}`);

    const success = await updateUserRole(identifier, role, identifierType);
    results.push({ identifier, role, success });

    // Pequena pausa entre operações
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Resumo final
  console.log('\n📊 RESUMO DA OPERAÇÃO:');
  console.log('========================');

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Sucessos: ${successful}`);
  console.log(`❌ Falhas: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Usuários com falha:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.identifier}`);
      });
  }
}

/**
 * Lista todos os usuários e seus roles
 */
async function listUsers() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const userList = await users
      .find(
        {},
        {
          projection: {
            username: 1,
            email: 1,
            name: 1,
            role: 1,
            provider: 1,
            ldapId: 1,
            createdAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray();

    console.log('\n👥 LISTA DE USUÁRIOS:');
    console.log('=====================');

    userList.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.username || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   LDAP ID: ${user.ldapId || 'N/A'}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Provider: ${user.provider || 'local'}`);
      console.log(
        `   Criado: ${user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : 'N/A'}`,
      );
      console.log('   ---');
    });

    console.log(`\nTotal: ${userList.length} usuários`);
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
  } finally {
    await client.close();
  }
}

// Função principal para execução via linha de comando
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📋 SCRIPT DE GERENCIAMENTO DE USUÁRIOS
=====================================

Uso:
  node updateUserRoles.js list                           # Lista todos os usuários
  node updateUserRoles.js <identifier> <role> [type]     # Atualiza um usuário
  node updateUserRoles.js batch                          # Executa lista pré-definida

Exemplos:
  node updateUserRoles.js list
  node updateUserRoles.js gb810437 admin username
  node updateUserRoles.js user@email.com admin email
  node updateUserRoles.js batch

Roles disponíveis: admin, user
Tipos de identificador: username, email, ldapId
    `);
    return;
  }

  if (args[0] === 'list') {
    await listUsers();
    return;
  }

  if (args[0] === 'batch') {
    // Lista pré-definida de usuários para atualizar
    const userList = [
      { identifier: 'gb810437', role: 'admin', identifierType: 'username' },
      // Adicione mais usuários aqui conforme necessário
      // { identifier: 'outro_usuario', role: 'admin', identifierType: 'username' },
    ];

    await updateMultipleUserRoles(userList);
    return;
  }

  // Atualização de usuário único
  const [identifier, role, identifierType = 'username'] = args;

  if (!identifier || !role) {
    console.log('❌ Erro: Identificador e role são obrigatórios');
    console.log('Uso: node updateUserRoles.js <identifier> <role> [type]');
    return;
  }

  await updateUserRole(identifier, role, identifierType);
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  updateUserRole,
  updateMultipleUserRoles,
  listUsers,
};
