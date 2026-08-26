const express = require('express');
const integrationController = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, integrationController.listIntegrations);
router.get('/status', protect, integrationController.getIntegrationStatus);
router.get('/oauth/error', integrationController.handleOAuthError);
router.get('/oauth/:provider/start', protect, integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);

module.exports = router;
