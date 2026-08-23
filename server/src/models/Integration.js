const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'],
      required: true
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    scopes: [
      {
        type: String
      }
    ],
    encryptedCredentials: {
      type: String, // AES-256 encrypted payload
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    accountIdentifier: {
      type: String, // e.g. email, webhook name, channel ID, team ID
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one integration per provider per owner
integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
