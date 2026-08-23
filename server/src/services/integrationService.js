const crypto = require('crypto');
const env = require('../config/env');
const Integration = require('../models/Integration');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class IntegrationService {
  constructor() {
    this.providers = {
      gmail: gmailIntegration,
      slack: slackIntegration,
      discord: discordIntegration,
      'google-sheets': googleSheetsIntegration
    };
  }

  /**
   * Derive a 32-byte encryption key from env
   */
  _getKey() {
    return crypto.createHash('sha256').update(env.credentialEncryptionKey).digest();
  }

  /**
   * Encrypt credentials payload at rest
   */
  encryptCredentials(data) {
    if (!data) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this._getKey(), iv);
    const text = JSON.stringify(data);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt credentials payload
   */
  decryptCredentials(encryptedString) {
    if (!encryptedString) return null;
    try {
      const parts = encryptedString.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted credentials format');
      }
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this._getKey(), iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('[IntegrationService] Failed to decrypt credentials:', err.message);
      return null;
    }
  }

  /**
   * Get all integrations for a user with sanitization (never expose raw secrets)
   */
  async getUserIntegrations(userId) {
    const list = await Integration.find({ owner: userId }).lean();
    const defaultProviders = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];

    const userMap = {};
    list.forEach((item) => {
      userMap[item.provider] = item;
    });

    return defaultProviders.map((provider) => {
      const existing = userMap[provider];
      return {
        provider,
        isConnected: existing ? existing.isConnected : false,
        accountIdentifier: existing ? existing.accountIdentifier : '',
        scopes: existing ? existing.scopes : [],
        expiresAt: existing ? existing.expiresAt : null,
        updatedAt: existing ? existing.updatedAt : null,
        id: existing ? existing._id : null
      };
    });
  }

  /**
   * Check health and status of all integrations for a user
   */
  async checkIntegrationStatus(userId) {
    const integrations = await Integration.find({ owner: userId });
    const defaultProviders = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];
    const statuses = {};

    const userMap = {};
    integrations.forEach((item) => {
      userMap[item.provider] = item;
    });

    for (const provider of defaultProviders) {
      const item = userMap[provider];
      const providerImpl = this.providers[provider];

      if (item && providerImpl && item.isConnected) {
        const creds = this.decryptCredentials(item.encryptedCredentials);
        const testRes = await providerImpl.testConnection(creds);
        statuses[provider] = {
          connected: item.isConnected,
          health: testRes.success ? 'healthy' : 'degraded',
          message: testRes.message,
          accountIdentifier: item.accountIdentifier || testRes.accountIdentifier,
          expiresAt: item.expiresAt
        };
      } else {
        statuses[provider] = {
          connected: item ? item.isConnected : false,
          health: item?.isConnected ? 'healthy' : 'disconnected',
          message: item?.isConnected ? 'Connected' : 'Not configured'
        };
      }
    }

    return statuses;
  }

  /**
   * Auto-seed/connect demo integrations for 1-click sandbox testing
   */
  async seedDemoIntegrations(userId) {
    const demoConfigs = [
      {
        provider: 'gmail',
        accountIdentifier: 'hemasagar.ops@gmail.com',
        credentials: { accessToken: 'mock-gmail-token-demo' },
        scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']
      },
      {
        provider: 'slack',
        accountIdentifier: '#critical-ops (SagarAI Workspace)',
        credentials: { botToken: 'xoxb-mock-slack-bot-token-demo' },
        scopes: ['chat:write', 'channels:read', 'incoming-webhook']
      },
      {
        provider: 'discord',
        accountIdentifier: '#operations-channel',
        credentials: { webhookUrl: 'https://discord.com/api/webhooks/mock-demo-channel' },
        scopes: ['webhook.incoming']
      },
      {
        provider: 'google-sheets',
        accountIdentifier: 'Enterprise Master Audit Log',
        credentials: { accessToken: 'mock-sheets-token-demo' },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      },
      {
        provider: 'openrouter',
        accountIdentifier: 'OpenRouter Multi-LLM Cluster',
        credentials: { apiKey: 'sk-or-v1-mock-demo-key', accessToken: 'sk-or-v1-mock-demo-key' },
        scopes: ['models.read', 'chat.completions']
      },
      {
        provider: 'gemini',
        accountIdentifier: 'Google Gemini 1.5 Flash / Pro Engine',
        credentials: { apiKey: 'AIzaSy-mock-demo-key', accessToken: 'AIzaSy-mock-demo-key' },
        scopes: ['gemini-1.5-flash', 'gemini-1.5-pro']
      }
    ];

    for (const config of demoConfigs) {
      await this.saveIntegrationCredentials(userId, config);
    }

    return await this.getUserIntegrations(userId);
  }

  /**
   * Manually save credentials or API tokens
   */
  async saveIntegrationCredentials(userId, { provider, credentials, accountIdentifier, scopes = [] }) {
    const encrypted = this.encryptCredentials(credentials);

    const updated = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        owner: userId,
        provider,
        isConnected: true,
        encryptedCredentials: encrypted,
        accountIdentifier: accountIdentifier || `${provider}-connected-account`,
        scopes,
        expiresAt: credentials.expiresAt ? new Date(credentials.expiresAt) : null,
        metadata: { lastVerifiedAt: new Date() }
      },
      { upsert: true, new: true }
    );

    return {
      provider: updated.provider,
      isConnected: updated.isConnected,
      accountIdentifier: updated.accountIdentifier,
      scopes: updated.scopes
    };
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(userId, provider) {
    await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        isConnected: false,
        encryptedCredentials: null,
        accountIdentifier: '',
        expiresAt: null
      }
    );
    return { success: true, message: `Disconnected ${provider}` };
  }

  /**
   * Start OAuth Flow
   */
  getOAuthStartUrl(provider, userId) {
    const providerImpl = this.providers[provider];
    if (!providerImpl) {
      throw new Error(`Provider ${provider} does not support OAuth flow.`);
    }

    const redirectUri = `${env.clientUrl}/api/integrations/oauth/${provider}/callback`;
    const state = Buffer.from(JSON.stringify({ userId, provider, ts: Date.now() })).toString('base64');
    return providerImpl.getAuthUrl(redirectUri, state);
  }

  /**
   * Handle OAuth Callback
   */
  async handleOAuthCallback(provider, code, state, redirectUri) {
    const providerImpl = this.providers[provider];
    if (!providerImpl) {
      throw new Error(`Provider ${provider} not found.`);
    }

    let userId;
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      userId = parsed.userId;
    } catch (e) {
      throw new Error('Invalid OAuth state parameter.');
    }

    const authData = await providerImpl.handleCallback(code, redirectUri);
    const encrypted = this.encryptCredentials(authData);

    await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        owner: userId,
        provider,
        isConnected: true,
        encryptedCredentials: encrypted,
        accountIdentifier: authData.accountIdentifier || `${provider}-user`,
        scopes: authData.scopes || [],
        expiresAt: authData.expiresAt || null
      },
      { upsert: true, new: true }
    );

    return { success: true, provider, accountIdentifier: authData.accountIdentifier };
  }

  /**
   * Execute Action with Automatic Credential Fetching & Decryption
   */
  async executeIntegrationAction(userId, provider, action, params = {}) {
    const providerImpl = this.providers[provider];
    if (!providerImpl) {
      throw new Error(`Integration provider '${provider}' is not supported.`);
    }

    const integration = await Integration.findOne({ owner: userId, provider });
    if (!integration || !integration.isConnected || !integration.encryptedCredentials) {
      const err = new Error(`Integration '${provider}' is not connected. Please connect it in Integrations settings.`);
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    // Check expiration if applicable
    if (integration.expiresAt && new Date() > new Date(integration.expiresAt)) {
      const err = new Error(`Integration credentials for '${provider}' have expired.`);
      err.code = 'AUTH_EXPIRED';
      throw err;
    }

    const credentials = this.decryptCredentials(integration.encryptedCredentials);
    if (!credentials) {
      const err = new Error(`Failed to decrypt credentials for '${provider}'.`);
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    return await providerImpl.executeAction(action, params, credentials);
  }
}

module.exports = new IntegrationService();
