const ModelsDescriptions = require('../../models/ModelsDescriptions');

/**
 * Busca todo o diretório de modelos
 */
const getAllModelsDescriptions = async () => {
  try {
    return await ModelsDescriptions.findOne({}).lean();
  } catch (error) {
    console.error('Erro ao buscar descrições dos modelos:', error);
    throw error;
  }
};

/**
 * Busca um modelo específico pelo ID
 */
const getModelDescriptionById = async (modelId) => {
  try {
    const doc = await ModelsDescriptions.findOne({}).lean();
    return doc ? doc[modelId] : null;
  } catch (error) {
    console.error('Erro ao buscar descrição do modelo:', error);
    throw error;
  }
};

/**
 * Substitui todo o diretório de modelos
 */
const replaceModelsDescriptions = async (newDirectory) => {
  try {
    return await ModelsDescriptions.replaceOne({}, newDirectory, { upsert: true });
  } catch (error) {
    console.error('Erro ao substituir descrições dos modelos:', error);
    throw error;
  }
};

module.exports = {
  getAllModelsDescriptions,
  getModelDescriptionById,
  replaceModelsDescriptions,
};