const mongoose = require('mongoose');

const aiImageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    enhancedPrompt: {
      type: String,
      default: ''
    },
    style: {
      type: String,
      default: 'photorealistic',
      enum: [
        'photorealistic',
        'cyberpunk',
        'anime',
        '3d-render',
        'cinematic',
        'digital-art',
        'surrealism',
        'minimalist',
        'watercolor',
        'fantasy'
      ]
    },
    aspectRatio: {
      type: String,
      default: '1:1',
      enum: ['1:1', '16:9', '9:16', '4:3', '3:4']
    },
    imageUrl: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 1024
    },
    height: {
      type: Number,
      default: 1024
    },
    model: {
      type: String,
      default: 'flux-schnell'
    },
    seed: {
      type: Number,
      default: () => Math.floor(Math.random() * 1000000)
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AiImage', aiImageSchema);
