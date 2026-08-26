const ApiError = require('../utils/apiError');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Integration = require('../models/Integration');
const { encrypt, decrypt } = require('../utils/crypto');

const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const sheetsIntegration = require('../integrations/sheetsIntegration');

const PROVIDERS = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': sheetsIntegration,
};

class IntegrationService {
  async listUserIntegrations(userId) {
    const supportedProviders = ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'];
    let userDocs = [];

    if (isInMemory()) {
      userDocs = await memoryStore.getCollection('integrations').find({ owner: String(userId) });
    } else {
      userDocs = await Integration.find({ owner: userId });
    }

    const docMap = new Map(userDocs.map(doc => [doc.provider, doc]));

    return supportedProviders.map(provider => {
      const existing = docMap.get(provider);
      return {
        provider,
        connected: existing ? Boolean(existing.connected) : false,
        accountEmail: existing ? existing.accountEmail : '',
        lastError: existing ? existing.lastError : null,
        updatedAt: existing ? existing.updatedAt : null,
      };
    });
  }

  async getIntegrationStatusSummary(userId) {
    const integrations = await this.listUserIntegrations(userId);
    const connectedCount = integrations.filter(i => i.connected).length;
    return {
      totalSupported: integrations.length,
      connectedCount,
      disconnectedCount: integrations.length - connectedCount,
      providers: integrations,
    };
  }

  async startOAuthFlow(provider, userId) {
    const integrationModule = PROVIDERS[provider];
    if (!integrationModule) {
      throw new ApiError(400, `Unsupported integration provider: ${provider}`);
    }

    const redirectUri = `http://localhost:5000/api/integrations/oauth/${provider}/callback`;
    const state = Buffer.from(JSON.stringify({ userId: String(userId), provider })).toString('base64');
    const authUrl = await integrationModule.getOAuthStartUrl(redirectUri, state);

    return { authUrl, provider, state };
  }

  async handleOAuthCallback(provider, code, state) {
    const integrationModule = PROVIDERS[provider];
    if (!integrationModule) {
      throw new ApiError(400, `Unsupported integration provider: ${provider}`);
    }

    let userId = null;
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      userId = decodedState.userId;
    } catch (e) {
      throw new ApiError(400, 'Invalid OAuth state parameter');
    }

    const redirectUri = `http://localhost:5000/api/integrations/oauth/${provider}/callback`;
    const tokens = await integrationModule.handleOAuthCallback(code, redirectUri);

    const payload = {
      owner: String(userId),
      provider,
      connected: true,
      scopes: tokens.scopes || [],
      accessTokenEncrypted: encrypt(tokens.accessToken),
      refreshTokenEncrypted: encrypt(tokens.refreshToken),
      tokenExpiresAt: new Date(Date.now() + (tokens.expiresIn || 3600) * 1000),
      accountEmail: tokens.accountEmail || '',
      lastError: null,
    };

    if (isInMemory()) {
      const store = memoryStore.getCollection('integrations');
      const existing = await store.findOne({ owner: String(userId), provider });
      if (existing) {
        await store.findByIdAndUpdate(existing._id, payload);
      } else {
        await store.create(payload);
      }
    } else {
      await Integration.findOneAndUpdate({ owner: userId, provider }, payload, { upsert: true, new: true });
    }

    return { provider, connected: true, accountEmail: tokens.accountEmail };
  }

  async getCredentials(userId, provider) {
    let doc = null;
    if (isInMemory()) {
      doc = await memoryStore.getCollection('integrations').findOne({ owner: String(userId), provider });
    } else {
      doc = await Integration.findOne({ owner: userId, provider });
    }

    if (!doc || !doc.connected) {
      return null;
    }

    return {
      accessToken: decrypt(doc.accessTokenEncrypted),
      refreshToken: decrypt(doc.refreshTokenEncrypted),
      accountEmail: doc.accountEmail,
    };
  }

  // Execution Handlers for Third-Party Actions
  async executeGmailSend(userId, params) {
    const creds = await this.getCredentials(userId, 'gmail');
    return await gmailIntegration.sendEmail(creds, params);
  }

  async executeSlackPost(userId, params) {
    const creds = await this.getCredentials(userId, 'slack');
    return await slackIntegration.postMessage(creds, params);
  }

  async executeDiscordPost(userId, params) {
    const creds = await this.getCredentials(userId, 'discord');
    return await discordIntegration.postMessage(creds, params);
  }

  async executeSheetsAppend(userId, params) {
    const creds = await this.getCredentials(userId, 'google-sheets');
    return await sheetsIntegration.appendRow(creds, params);
  }
}

module.exports = new IntegrationService();
