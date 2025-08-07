const express = require('express');
const {
  getAllModelsDescriptions,
  getModelDescriptionById,
  replaceModelsDescriptions,
} = require('../services/ModelsDescriptionsService');

const router = express.Router();

// GET /api/models-descriptions - Retorna todo o diretório
router.get('/', async (req, res) => {
  try {
    const descriptions = await getAllModelsDescriptions();
    res.json(descriptions);
  } catch (error) {
    console.error('Erro na rota GET /models-descriptions:', error);
    res.status(500).json({ error: 'Erro ao buscar descrições dos modelos' });
  }
});

// GET /api/models-descriptions/:modelId - Retorna um modelo específico
router.get('/:modelId', async (req, res) => {
  try {
    const model = await getModelDescriptionById(req.params.modelId);
    if (!model) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    res.json(model);
  } catch (error) {
    console.error('Erro na rota GET /models-descriptions/:modelId:', error);
    res.status(500).json({ error: 'Erro ao buscar descrição do modelo' });
  }
});

// PUT /api/models-descriptions - Substitui todo o diretório
router.put('/', async (req, res) => {
  try {
    await replaceModelsDescriptions(req.body);
    res.json({ success: true, message: 'Diretório de modelos atualizado com sucesso' });
  } catch (error) {
    console.error('Erro na rota PUT /models-descriptions:', error);
    res.status(500).json({ error: 'Erro ao atualizar diretório de modelos' });
  }
});

module.exports = router;
