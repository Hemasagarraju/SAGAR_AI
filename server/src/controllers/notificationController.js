const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { limit } = req.query;
      const result = await notificationService.getNotifications(req.user._id, { limit });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async clearAll(req, res, next) {
    try {
      const result = await notificationService.clearNotifications(req.user._id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
