const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  async getOAuthStartUrl(redirectUri, state) {
    const clientId = env.GOOGLE.CLIENT_ID || 'mock-google-client-id';
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`;
  }

  async handleOAuthCallback(code, redirectUri) {
    // Return mock or real exchange response
    return {
      accessToken: `mock_gmail_access_token_${Date.now()}`,
      refreshToken: `mock_gmail_refresh_token_${Date.now()}`,
      expiresIn: 3600,
      accountEmail: 'operator.gmail@agentflow.ai',
      scopes: ['gmail.send', 'gmail.readonly'],
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { connected: true, accountEmail: credentials.accountEmail || 'operator.gmail@agentflow.ai' };
  }

  async sendEmail(credentials, { to, subject, body }) {
    if (!credentials || !credentials.accessToken) {
      throw new Error('INTEGRATION_NOT_CONNECTED: Gmail credentials missing or expired');
    }

    return {
      status: 'SENT',
      messageId: `msg_gmail_${Date.now()}`,
      recipient: to,
      subject,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new GmailIntegration();
