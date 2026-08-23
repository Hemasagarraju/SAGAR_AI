/**
 * BaseIntegration - Common interface for all third-party and AI integrations
 */
class BaseIntegration {
  constructor(providerName) {
    if (this.constructor === BaseIntegration) {
      throw new Error('Abstract class BaseIntegration cannot be instantiated directly.');
    }
    this.provider = providerName;
  }

  /**
   * Test connection and token health
   * @param {Object} credentials 
   * @returns {Promise<{success: boolean, message: string, details?: any}>}
   */
  async testConnection(credentials) {
    throw new Error(`testConnection() must be implemented by ${this.provider}`);
  }

  /**
   * Execute integration action
   * @param {string} action - Action name (e.g. 'sendEmail', 'postMessage', 'appendRow')
   * @param {Object} params - Input parameters for action
   * @param {Object} credentials - Decrypted credentials
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async executeAction(action, params, credentials) {
    throw new Error(`executeAction() must be implemented by ${this.provider}`);
  }

  /**
   * Get provider authorization URL
   * @param {string} redirectUri 
   * @param {string} state 
   * @returns {string}
   */
  getAuthUrl(redirectUri, state) {
    throw new Error(`getAuthUrl() must be implemented by ${this.provider}`);
  }

  /**
   * Handle OAuth authorization code exchange
   * @param {string} code 
   * @param {string} redirectUri 
   * @returns {Promise<{accessToken: string, refreshToken?: string, expiresAt?: Date, accountIdentifier?: string}>}
   */
  async handleCallback(code, redirectUri) {
    throw new Error(`handleCallback() must be implemented by ${this.provider}`);
  }
}

module.exports = BaseIntegration;
