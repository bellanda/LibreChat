const express = require('express');
const router = express.Router();
const { requireJwtAuth } = require('~/server/middleware');
const endpointController = require('~/server/controllers/EndpointController');
const overrideController = require('~/server/controllers/OverrideController');

router.get('/', requireJwtAuth, endpointController);
router.get('/config/override', overrideController);

module.exports = router;
