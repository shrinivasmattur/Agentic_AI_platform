const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-cbc';

const getKey = () => {
  const rawKey = env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  // Ensure exactly 32 bytes (256 bits)
  return crypto.createHash('sha256').update(String(rawKey)).digest();
};

/**
 * Encrypt a text string (e.g., OAuth access or refresh tokens)
 */
const encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error.message);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt an encrypted string back to plaintext
 */
const decrypt = (encryptedText) => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Decryption failed');
  }
};

module.exports = {
  encrypt,
  decrypt,
};
