const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const { emitExecutionEvent, emitUserNotification } = require('../config/socket');

/**
 * Monitoring Agent
 * Emits real-time timeline events, persists granular audit logs, and creates notifications.
 */
class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  /**
   * Log an event across database and real-time Socket.IO stream
   */
  async emitLog({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    try {
      const logEntry = await ExecutionLog.create({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date()
      });

      // Stream to subscribed clients
      emitExecutionEvent(executionId.toString(), 'agent:event', {
        id: logEntry._id,
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: logEntry.timestamp
      });

      return logEntry;
    } catch (err) {
      console.error('[MonitoringAgent] Failed to persist execution log:', err.message);
    }
  }

  /**
   * Send user notification
   */
  async notifyUser({ userId, workflowId, executionId, type = 'info', title, message }) {
    try {
      const notification = await Notification.create({
        owner: userId,
        workflowId,
        executionId,
        type,
        title,
        message,
        isRead: false
      });

      emitUserNotification(userId.toString(), notification);
      return notification;
    } catch (err) {
      console.error('[MonitoringAgent] Failed to create notification:', err.message);
    }
  }
}

module.exports = new MonitoringAgent();
