const Notification = require('../models/Notification');

class NotificationService {
  async getNotifications(userId, { limit = 30 } = {}) {
    const notifications = await Notification.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('workflowId', 'name')
      .lean();

    const unreadCount = await Notification.countDocuments({ owner: userId, isRead: false });

    return {
      notifications,
      unreadCount
    };
  }

  async markAsRead(userId, notificationId) {
    if (notificationId === 'all') {
      await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
      return { success: true, message: 'All notifications marked as read' };
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, owner: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return notification;
  }

  async clearNotifications(userId) {
    await Notification.deleteMany({ owner: userId });
    return { success: true, message: 'Notifications cleared' };
  }
}

module.exports = new NotificationService();
