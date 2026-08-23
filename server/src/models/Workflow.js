const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft'
    },
    triggerConfig: {
      type: {
        type: String,
        enum: ['manual', 'webhook', 'schedule', 'event'],
        default: 'manual'
      },
      webhookPath: { type: String },
      cronSchedule: { type: String },
      eventType: { type: String },
      config: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    nodes: [
      {
        id: { type: String, required: true },
        type: { type: String, required: true },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 }
        },
        data: { type: mongoose.Schema.Types.Mixed, default: {} }
      }
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        sourceHandle: { type: String },
        targetHandle: { type: String },
        animated: { type: Boolean, default: true },
        label: { type: String }
      }
    ],
    version: {
      type: Number,
      default: 1
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Workflow', workflowSchema);
