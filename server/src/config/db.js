const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom DNS fails
}

let isConnected = false;
let isInMemoryFallback = false;

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.log('ℹ️  No MONGODB_URI provided. Running in IN-MEMORY database fallback mode.');
    isInMemoryFallback = true;
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Unreachable (${error.message}). Falling back to IN-MEMORY database store.`);
    isInMemoryFallback = true;
    return false;
  }
};

const getDBStatus = () => {
  const active = mongoose.connection.readyState === 1;
  return {
    connected: active,
    fallback: !active,
    mode: active ? 'mongodb' : 'in-memory',
  };
};

module.exports = {
  connectDB,
  getDBStatus,
  isInMemory: () => isInMemoryFallback || mongoose.connection.readyState !== 1,
};
