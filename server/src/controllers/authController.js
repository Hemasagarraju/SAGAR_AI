const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async demoLogin(req, res, next) {
    try {
      const result = await authService.demoLogin();
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user._id);
      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
