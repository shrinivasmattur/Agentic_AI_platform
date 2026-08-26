const Redis = require('ioredis');
const env = require('../config/env');

let redisClient = null;
let isRedisConnected = false;

const initRedis = () => {
  if (!env.REDIS_URL) {
    console.log('ℹ️  No REDIS_URL provided. Running BullMQ in IN-MEMORY fallback mode.');
    return null;
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('✅ Redis Connected for BullMQ background queues.');
    });

    redisClient.on('error', (err) => {
      console.warn(`⚠️ Redis Connection Error (${err.message}). Using in-memory job processing.`);
      isRedisConnected = false;
    });

    return redisClient;
  } catch (error) {
    console.warn(`⚠️ Failed to initialize Redis (${error.message}).`);
    return null;
  }
};

module.exports = {
  initRedis,
  getRedis: () => redisClient,
  isRedisAvailable: () => isRedisConnected,
};
