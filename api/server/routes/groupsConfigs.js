const express = require('express');
const { 
  getAllGroupsConfigs, 
  getGroupsConfigById, 
  replaceGroupsConfigs 
} = require('../services/GroupsConfigsService');

const router = express.Router();

// GET /api/groups-configs - Retorna toda a configuração de grupos
router.get('/', async (req, res) => {
  try {
    const configs = await getAllGroupsConfigs();
    res.json(configs);
  } catch (error) {
    console.error('Erro na rota GET /groups-configs:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações de grupos' });
  }
});

// GET /api/groups-configs/:configId - Retorna uma configuração específica
router.get('/:configId', async (req, res) => {
  try {
    const config = await getGroupsConfigById(req.params.configId);
    if (!config) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    res.json(config);
  } catch (error) {
    console.error('Erro na rota GET /groups-configs/:configId:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração de grupos' });
  }
});

module.exports = router; 