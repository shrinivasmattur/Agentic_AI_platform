const asyncHandler = require('../utils/asyncHandler');
const integrationService = require('../services/integrationService');
const env = require('../config/env');

const listIntegrations = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const list = await integrationService.listUserIntegrations(userId);
  res.status(200).json({
    success: true,
    data: list,
  });
});

const getIntegrationStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const summary = await integrationService.getIntegrationStatusSummary(userId);
  res.status(200).json({
    success: true,
    data: summary,
  });
});

const startOAuth = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { provider } = req.params;
  const result = await integrationService.startOAuthFlow(provider, userId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const handleOAuthCallback = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { code, state } = req.query;
  const result = await integrationService.handleOAuthCallback(provider, code, state);
  res.redirect(`${env.CLIENT_URL}/integrations?status=connected&provider=${provider}`);
});

const handleOAuthError = asyncHandler(async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'OAuth authorization failed or was cancelled by user',
  });
});

module.exports = {
  listIntegrations,
  getIntegrationStatus,
  startOAuth,
  handleOAuthCallback,
  handleOAuthError,
};
