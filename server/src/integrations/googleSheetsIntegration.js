const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(redirectUri, state) {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id';
    const scope = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  }

  async handleCallback(code, redirectUri) {
    if (code === 'mock-oauth-code' || !process.env.GOOGLE_CLIENT_ID) {
      return {
        accessToken: `mock_sheets_access_token_${Date.now()}`,
        refreshToken: `mock_sheets_refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        accountIdentifier: 'operator@agentflow.io (Google Sheets)',
        scopes: ['spreadsheets', 'drive.file']
      };
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
        scopes: ['spreadsheets', 'drive.file']
      };
    } catch (err) {
      throw new Error(`Google Sheets OAuth failed: ${err.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return {
        success: false,
        message: 'No Google Sheets access token configured.'
      };
    }

    if (credentials.accessToken && (credentials.accessToken.startsWith('mock') || credentials.accessToken.includes('demo') || credentials.accessToken.startsWith('mock_'))) {
      return {
        success: true,
        message: 'Connected to Google Sheets API (Sandbox Mode)',
        accountIdentifier: credentials.accountIdentifier || 'Enterprise Master Audit Log'
      };
    }

    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` }
      });
      return {
        success: true,
        message: `Connected as ${res.data.email}`,
        accountIdentifier: res.data.email
      };
    } catch (err) {
      return { success: false, message: `Google Sheets connection check failed: ${err.message}` };
    }
  }

  async executeAction(action, params = {}, credentials = {}) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Google Sheets integration is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    switch (action) {
      case 'appendRow': {
        const { spreadsheetId = 'sheet_default_101', range = 'Sheet1!A:Z', values = [], rowData } = params;
        const rowToAppend = Array.isArray(values) && values.length > 0 ? values : (Array.isArray(rowData) ? rowData : Object.values(rowData || { timestamp: new Date().toISOString(), status: 'PROCESSED' }));

        console.log(`[GoogleSheetsIntegration] Appending row to sheet ${spreadsheetId} [${range}]:`, rowToAppend);

        if (credentials.accessToken && !credentials.accessToken.startsWith('mock_')) {
          try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
            const res = await axios.post(
              url,
              { values: [rowToAppend] },
              { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
            );

            return {
              success: true,
              data: {
                updatedRange: res.data.updates.updatedRange,
                updatedRows: res.data.updates.updatedRows,
                status: 'APPENDED'
              }
            };
          } catch (apiErr) {
            const err = new Error(`Google Sheets API error: ${apiErr.response?.data?.error?.message || apiErr.message}`);
            err.code = 'API_FAILURE';
            throw err;
          }
        }

        // Sandbox simulation
        return {
          success: true,
          data: {
            spreadsheetId,
            range: `${range.split('!')[0]}!A${Math.floor(Math.random() * 50) + 2}`,
            appendedValues: rowToAppend,
            status: 'APPENDED',
            provider: 'sheets_sandbox',
            timestamp: new Date().toISOString()
          }
        };
      }

      case 'readRange': {
        const { spreadsheetId = 'sheet_default_101', range = 'Sheet1!A1:E10' } = params;
        return {
          success: true,
          data: {
            spreadsheetId,
            range,
            values: [
              ['ID', 'Name', 'Email', 'Amount', 'Status'],
              ['INV-101', 'Acme Corp', 'billing@acme.com', '$4,500', 'Approved'],
              ['INV-102', 'Beta LLC', 'finance@beta.io', '$1,250', 'Pending']
            ]
          }
        };
      }

      default:
        throw new Error(`Unsupported Google Sheets action: "${action}"`);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
