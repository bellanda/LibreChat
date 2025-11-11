const express = require('express');
const {
  uaParser,
  checkBan,
  requireJwtAuth,
  messageIpLimiter,
  concurrentLimiter,
  messageUserLimiter,
} = require('~/server/middleware');
const { isEnabled } = require('@librechat/api');
const { EModelEndpoint } = require('librechat-data-provider');

const { LIMIT_CONCURRENT_MESSAGES, LIMIT_MESSAGE_IP, LIMIT_MESSAGE_USER } = process.env ?? {};

const router = express.Router();

router.use(requireJwtAuth);
router.use(checkBan);
router.use(uaParser);

// Apply rate limiting if enabled
if (isEnabled(LIMIT_CONCURRENT_MESSAGES)) {
  router.use(concurrentLimiter);
}

if (isEnabled(LIMIT_MESSAGE_IP)) {
  router.use(messageIpLimiter);
}

if (isEnabled(LIMIT_MESSAGE_USER)) {
  router.use(messageUserLimiter);
}

// Chat endpoint for Bedrock
router.post('/chat', async (req, res) => {
  try {
    // This will be handled by the Bedrock service
    // The actual implementation is in the services/Endpoints/bedrock directory
    res.status(200).json({ message: 'Bedrock endpoint ready' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
