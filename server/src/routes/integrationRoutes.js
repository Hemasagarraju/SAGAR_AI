const express = require('express');
const { body, param } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.post('/seed-demo', integrationController.seedDemo);

router.post(
  '/',
  [
    body('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Invalid provider'),
    body('credentials').isObject().withMessage('Credentials object required'),
    validate
  ],
  integrationController.saveCredentials
);

router.get('/oauth/:provider/start', integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);

router.get(
  '/oauth/error',
  (req, res) => {
    res.status(400).json({ success: false, error: req.query.message || 'OAuth authorization failed' });
  }
);

router.delete(
  '/:provider',
  [
    param('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Invalid provider'),
    validate
  ],
  integrationController.disconnect
);

router.post(
  '/:provider/test',
  [
    param('provider').isIn(['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini']).withMessage('Invalid provider'),
    validate
  ],
  integrationController.testIntegration
);

module.exports = router;
