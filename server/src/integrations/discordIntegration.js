const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async getOAuthStartUrl(redirectUri, state) {
    const clientId = env.DISCORD.CLIENT_ID || 'mock-discord-client-id';
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=bot&state=${state}`;
  }

  async handleOAuthCallback(code, redirectUri) {
    return {
      accessToken: `mock_discord_token_${Date.now()}`,
      refreshToken: `mock_discord_refresh_${Date.now()}`,
      expiresIn: 604800,
      accountEmail: 'discord.bot@agentflow.ai',
      scopes: ['bot', 'messages.read'],
    };
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !env.DISCORD.BOT_TOKEN)) {
      return { connected: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { connected: true, accountEmail: 'discord.bot@agentflow.ai' };
  }

  async postMessage(credentials, { channelId, message }) {
    return {
      status: 'DELIVERED',
      channelId: channelId || 'general',
      messageId: `discord_msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new DiscordIntegration();
