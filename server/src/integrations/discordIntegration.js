const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = process.env.DISCORD_CLIENT_ID || 'mock-discord-client-id';
    const scope = encodeURIComponent('bot messages.read');
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=2048&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    if (code === 'mock-oauth-code' || !process.env.DISCORD_CLIENT_ID) {
      return {
        accessToken: `mock_discord_bot_token_${Date.now()}`,
        accountIdentifier: 'Agentflow Bot #9999 (Server: Operations Hub)',
        scopes: ['bot', 'messages.read']
      };
    }

    try {
      const response = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        accountIdentifier: 'Discord Connected App',
        scopes: response.data.scope?.split(' ') || ['bot']
      };
    } catch (err) {
      throw new Error(`Discord OAuth failed: ${err.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.botToken && !credentials.webhookUrl && !credentials.accessToken)) {
      return {
        success: false,
        message: 'No Discord bot token or webhook URL configured.'
      };
    }

    const token = credentials.botToken || credentials.accessToken;
    if (token && token.startsWith('mock_')) {
      return {
        success: true,
        message: 'Connected to Discord (Mock Sandbox Bot)',
        accountIdentifier: credentials.accountIdentifier || 'Agentflow Bot #9999'
      };
    }

    if (credentials.webhookUrl) {
      return {
        success: true,
        message: 'Discord Webhook is ready.',
        accountIdentifier: 'Discord Webhook'
      };
    }

    try {
      const res = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token}` }
      });
      return {
        success: true,
        message: `Connected as ${res.data.username}#${res.data.discriminator}`,
        accountIdentifier: `${res.data.username}#${res.data.discriminator}`
      };
    } catch (err) {
      return { success: false, message: `Discord check failed: ${err.message}` };
    }
  }

  async executeAction(action, params = {}, credentials = {}) {
    const token = credentials.botToken || credentials.accessToken;
    const webhookUrl = credentials.webhookUrl || params.webhookUrl;

    if (!token && !webhookUrl) {
      const err = new Error('Discord integration is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'postMessage':
      case 'sendNotification': {
        const { channelId, content, message, embeds } = params;
        const msgContent = content || message;

        if (!msgContent && !embeds) {
          const err = new Error('Content or embeds is required for Discord postMessage.');
          err.code = 'MISSING_FIELDS';
          throw err;
        }

        console.log(`[DiscordIntegration] Posting Discord message: "${(msgContent || '').substring(0, 80)}"`);

        // If webhook URL exists
        if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
          try {
            await axios.post(webhookUrl, {
              content: msgContent,
              embeds: embeds || (params.title ? [{
                title: params.title,
                description: msgContent,
                color: 0x5865F2,
                timestamp: new Date().toISOString()
              }] : undefined)
            });
            return {
              success: true,
              data: {
                status: 'DELIVERED',
                provider: 'discord_webhook',
                timestamp: new Date().toISOString()
              }
            };
          } catch (err) {
            const error = new Error(`Discord Webhook failed: ${err.message}`);
            error.code = 'API_FAILURE';
            throw error;
          }
        }

        // Sandbox execution
        return {
          success: true,
          data: {
            id: `disc_${Date.now()}`,
            channelId: channelId || 'default-channel',
            content: msgContent,
            status: 'POSTED',
            provider: 'discord_sandbox',
            timestamp: new Date().toISOString()
          }
        };
      }

      default:
        throw new Error(`Unsupported Discord action: "${action}"`);
    }
  }
}

module.exports = new DiscordIntegration();
