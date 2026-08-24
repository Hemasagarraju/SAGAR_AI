const mongoose = require('mongoose');

const savedPromptSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'general',
      enum: ['image', 'coding', 'copywriting', 'marketing', 'persona', 'reasoning', 'general']
    },
    prompt: {
      type: String,
      required: true
    },
    optimizedPrompt: {
      type: String,
      default: ''
    },
    targetModel: {
      type: String,
      default: 'gemini-2.5-pro'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SavedPrompt', savedPromptSchema);
