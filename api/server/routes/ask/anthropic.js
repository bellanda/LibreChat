const express = require('express');
const AskController = require('~/server/controllers/AskController');
const { initializeClient } = require('~/server/services/Endpoints/anthropic');
const {
  setHeaders,
  validateModel,
  validateEndpoint,
  buildEndpointOption,
  moderateText,
  validateChatModelAccess,
} = require('~/server/middleware');

const router = express.Router();
router.use(moderateText);

router.post(
  '/',
  validateChatModelAccess(),
  validateEndpoint,
  validateModel,
  buildEndpointOption,
  setHeaders,
  async (req, res, next) => {
    await AskController(req, res, next, initializeClient);
  },
);

module.exports = router;
