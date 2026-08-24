const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userName: {
      type: String,
      default: 'Operator'
    },
    userEmail: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    category: {
      type: String,
      enum: ['ai_workflows', 'speed_performance', 'ui_design', 'multi_agent', 'integrations', 'overall'],
      default: 'overall'
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    lastSessionCloseTime: {
      type: Date,
      default: null
    },
    returnVisitTime: {
      type: Date,
      default: Date.now
    },
    deviceInfo: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ rating: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
