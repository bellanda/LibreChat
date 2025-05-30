const express = require('express');
const router = express.Router();
const endpointController = require('~/server/controllers/EndpointController');
const overrideController = require('~/server/controllers/OverrideController');
const { requireJwtAuth } = require('~/server/middleware/');

router.get('/', requireJwtAuth, endpointController);
router.get('/config/override', overrideController);

module.exports = router;
