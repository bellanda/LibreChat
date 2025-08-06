const GroupsConfigs = require('../../models/GroupsConfigs');

/**
 * Busca toda a configuração de grupos
 */
const getAllGroupsConfigs = async () => {
  try {
    return await GroupsConfigs.findOne({}).lean();
  } catch (error) {
    console.error('Erro ao buscar configurações de grupos:', error);
    throw error;
  }
};

/**
 * Busca uma configuração específica pelo ID
 */
const getGroupsConfigById = async (configId) => {
  try {
    const doc = await GroupsConfigs.findOne({}).lean();
    return doc ? doc[configId] : null;
  } catch (error) {
    console.error('Erro ao buscar configuração de grupos:', error);
    throw error;
  }
};

/**
 * Substitui toda a configuração de grupos
 */
const replaceGroupsConfigs = async (newConfig) => {
  try {
    return await GroupsConfigs.replaceOne({}, newConfig, { upsert: true });
  } catch (error) {
    console.error('Erro ao substituir configurações de grupos:', error);
    throw error;
  }
};

module.exports = {
  getAllGroupsConfigs,
  getGroupsConfigById,
  replaceGroupsConfigs,
}; 