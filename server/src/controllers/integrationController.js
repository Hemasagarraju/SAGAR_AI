const integrationService = require('../services/integrationService');

class IntegrationController {
  async listIntegrations(req, res, next) {
    try {
      const integrations = await integrationService.getUserIntegrations(req.user._id);
      return res.status(200).json({
        success: true,
        data: integrations
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const statuses = await integrationService.checkIntegrationStatus(req.user._id);
      return res.status(200).json({
        success: true,
        data: statuses
      });
    } catch (err) {
      next(err);
    }
  }

  async saveCredentials(req, res, next) {
    try {
      const { provider, credentials, accountIdentifier, scopes } = req.body;
      const result = await integrationService.saveIntegrationCredentials(req.user._id, {
        provider,
        credentials,
        accountIdentifier,
        scopes
      });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async disconnect(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await integrationService.disconnectIntegration(req.user._id, provider);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async startOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const authUrl = integrationService.getOAuthStartUrl(provider, req.user._id);
      return res.status(200).json({
        success: true,
        data: { authUrl }
      });
    } catch (err) {
      next(err);
    }
  }

  async handleOAuthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, redirectUri } = req.query;
      const result = await integrationService.handleOAuthCallback(provider, code, state, redirectUri);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async testIntegration(req, res, next) {
    try {
      const { provider } = req.params;
      const statusMap = await integrationService.checkIntegrationStatus(req.user._id);
      return res.status(200).json({
        success: true,
        data: statusMap[provider] || { connected: false, message: 'Provider not configured' }
      });
    } catch (err) {
      next(err);
    }
  }

  async seedDemo(req, res, next) {
    try {
      const result = await integrationService.seedDemoIntegrations(req.user._id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationController();
