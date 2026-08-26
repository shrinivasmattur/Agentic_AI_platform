const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  async getOAuthStartUrl(redirectUri, state) {
    const clientId = env.SLACK.CLIENT_ID || 'mock-slack-client-id';
    const scopes = encodeURIComponent('chat:write,channels:read');
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}`;
  }

  async handleOAuthCallback(code, redirectUri) {
    return {
      accessToken: `mock_slack_access_token_${Date.now()}`,
      refreshToken: `mock_slack_refresh_token_${Date.now()}`,
      expiresIn: 86400,
      accountEmail: 'operator.slack@agentflow.ai',
      scopes: ['chat:write', 'channels:read'],
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { connected: true, accountEmail: credentials.accountEmail || 'operator.slack@agentflow.ai' };
  }

  async postMessage(credentials, { channel, message }) {
    if (!credentials || !credentials.accessToken) {
      throw new Error('INTEGRATION_NOT_CONNECTED: Slack credentials missing or expired');
    }

    return {
      status: 'DELIVERED',
      channel,
      messageTs: `${Date.now() / 1000}`,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new SlackIntegration();
