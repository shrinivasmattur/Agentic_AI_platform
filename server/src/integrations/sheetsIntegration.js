const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class SheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  async getOAuthStartUrl(redirectUri, state) {
    const clientId = env.GOOGLE.CLIENT_ID || 'mock-google-client-id';
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`;
  }

  async handleOAuthCallback(code, redirectUri) {
    return {
      accessToken: `mock_sheets_access_token_${Date.now()}`,
      refreshToken: `mock_sheets_refresh_token_${Date.now()}`,
      expiresIn: 3600,
      accountEmail: 'operator.sheets@agentflow.ai',
      scopes: ['spreadsheets'],
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { connected: true, accountEmail: credentials.accountEmail || 'operator.sheets@agentflow.ai' };
  }

  async appendRow(credentials, { spreadsheetId, range, values }) {
    if (!credentials || !credentials.accessToken) {
      throw new Error('INTEGRATION_NOT_CONNECTED: Google Sheets credentials missing or expired');
    }

    return {
      status: 'APPENDED',
      spreadsheetId: spreadsheetId || 'default-sheet',
      updatedRange: range || 'Sheet1!A1:E1',
      updatedRows: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new SheetsIntegration();
