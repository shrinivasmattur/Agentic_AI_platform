const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    connected: {
      type: Boolean,
      default: false,
    },
    scopes: [
      {
        type: String,
      },
    ],
    accessTokenEncrypted: {
      type: String,
      default: null,
    },
    refreshTokenEncrypted: {
      type: String,
      default: null,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    accountEmail: {
      type: String,
      default: '',
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual methods to set and get decrypted tokens without logging plaintext
integrationSchema.methods.setAccessToken = function (token) {
  this.accessTokenEncrypted = encrypt(token);
};

integrationSchema.methods.getAccessToken = function () {
  return decrypt(this.accessTokenEncrypted);
};

integrationSchema.methods.setRefreshToken = function (token) {
  this.refreshTokenEncrypted = encrypt(token);
};

integrationSchema.methods.getRefreshToken = function () {
  return decrypt(this.refreshTokenEncrypted);
};

let Integration;
try {
  Integration = mongoose.model('Integration');
} catch {
  Integration = mongoose.model('Integration', integrationSchema);
}

module.exports = Integration;
