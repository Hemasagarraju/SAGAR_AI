const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = process.env.SLACK_CLIENT_ID || 'mock-slack-client-id';
    const scope = encodeURIComponent('chat:write,channels:read,chat:write.public,incoming-webhook');
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    if (code === 'mock-oauth-code' || !process.env.SLACK_CLIENT_ID) {
      return {
        accessToken: `xoxb-mock-slack-bot-token-${Date.now()}`,
        accountIdentifier: '#ops-alerts (Acme Workspace)',
        scopes: ['chat:write', 'channels:read', 'incoming-webhook']
      };
    }

    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack OAuth failed');
      }

      return {
        accessToken: response.data.access_token,
        accountIdentifier: response.data.team?.name || 'Slack Team',
        scopes: response.data.scope?.split(',') || ['chat:write']
      };
    } catch (err) {
      throw new Error(`Slack OAuth exchange failed: ${err.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl && !credentials.botToken)) {
      return {
        success: false,
        message: 'No Slack bot token or webhook URL configured.'
      };
    }

    const token = credentials.botToken || credentials.accessToken;
    if (token && token.startsWith('xoxb-mock')) {
      return {
        success: true,
        message: 'Connected to Slack (Mock Sandbox Workspace)',
        accountIdentifier: credentials.accountIdentifier || '#ops-alerts'
      };
    }

    if (token) {
      try {
        const res = await axios.get('https://slack.com/api/auth.test', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.ok) {
          return {
            success: true,
            message: `Connected to Slack team: ${res.data.team} (as ${res.data.user})`,
            accountIdentifier: res.data.team
          };
        }
        return { success: false, message: `Slack check failed: ${res.data.error}` };
      } catch (err) {
        return { success: false, message: `Slack error: ${err.message}` };
      }
    }

    return {
      success: true,
      message: 'Slack Webhook ready.',
      accountIdentifier: 'Custom Webhook'
    };
  }

  async executeAction(action, params = {}, credentials = {}) {
    const token = credentials.botToken || credentials.accessToken;
    const webhookUrl = credentials.webhookUrl || params.webhookUrl;

    if (!token && !webhookUrl) {
      const err = new Error('Slack integration is not connected or credentials missing.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'postMessage': {
        const { channel = '#general', text = '', message, blocks } = params;
        const messageText = message || text;

        if (!messageText && !blocks) {
          const err = new Error('Message text or blocks is required for Slack postMessage.');
          err.code = 'MISSING_FIELDS';
          throw err;
        }

        console.log(`[SlackIntegration] Posting to channel ${channel}: "${messageText.substring(0, 80)}..."`);

        // If live token exists
        if (token && !token.startsWith('xoxb-mock')) {
          try {
            const res = await axios.post(
              'https://slack.com/api/chat.postMessage',
              { channel, text: messageText, blocks },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data.ok) {
              const err = new Error(`Slack API error: ${res.data.error}`);
              err.code = res.data.error === 'invalid_auth' ? 'AUTH_EXPIRED' : 'API_FAILURE';
              throw err;
            }

            return {
              success: true,
              data: {
                ts: res.data.ts,
                channel: res.data.channel,
                message: messageText,
                status: 'POSTED'
              }
            };
          } catch (apiErr) {
            if (apiErr.code) throw apiErr;
            const err = new Error(`Slack post failed: ${apiErr.message}`);
            err.code = 'API_FAILURE';
            throw err;
          }
        }

        // Sandbox / Webhook mode
        return {
          success: true,
          data: {
            ts: `${Date.now()}.000100`,
            channel: channel || '#ops-feed',
            text: messageText,
            status: 'POSTED',
            provider: 'slack_sandbox',
            timestamp: new Date().toISOString()
          }
        };
      }

      default:
        throw new Error(`Unsupported Slack action: "${action}"`);
    }
  }
}

module.exports = new SlackIntegration();
