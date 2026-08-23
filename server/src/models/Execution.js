const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true
    },
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING'
    },
    currentNode: {
      type: String,
      default: null
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // milliseconds
      default: 0
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    outputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    error: {
      message: { type: String },
      code: { type: String },
      classification: { type: String },
      nodeId: { type: String },
      stack: { type: String }
    },
    retryCount: {
      type: Number,
      default: 0
    },
    triggerType: {
      type: String,
      enum: ['manual', 'webhook', 'schedule', 'event', 'ai_prompt'],
      default: 'manual'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orchestrationMetadata: {
      langGraph: { type: String, default: 'not-installed' },
      planConfidence: { type: Number, default: 1.0 },
      plannedOrder: [{ type: String }],
      totalNodes: { type: Number, default: 0 },
      completedNodes: [{ type: String }]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Execution', executionSchema);
