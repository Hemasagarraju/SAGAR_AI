const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow'
    },
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution'
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'escalation'],
      default: 'info'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
