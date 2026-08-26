/**
 * Base Integration Abstract Interface.
 * All third-party providers (Gmail, Slack, Discord, Google Sheets) implement this interface.
 */

class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  async getOAuthStartUrl(redirectUri, state) {
    throw new Error(`getOAuthStartUrl not implemented for ${this.providerName}`);
  }

  async handleOAuthCallback(code, redirectUri) {
    throw new Error(`handleOAuthCallback not implemented for ${this.providerName}`);
  }

  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for ${this.providerName}`);
  }

  async executeAction(actionType, params, credentials) {
    throw new Error(`executeAction not implemented for ${this.providerName}`);
  }
}

module.exports = BaseIntegration;
