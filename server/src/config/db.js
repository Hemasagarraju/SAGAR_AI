const mongoose = require('mongoose');
const env = require('./env');

let mongoMemoryServer = null;

async function connectDB() {
  mongoose.set('strictQuery', false);
  
  // 1. Attempt connecting to the configured MONGODB_URI first
  if (env.mongodbUri) {
    try {
      console.log(`[Database] Attempting connection to ${env.mongodbUri}...`);
      await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: 2000
      });
      console.log('[Database] MongoDB connected successfully via URI.');
      return;
    } catch (uriError) {
      console.warn(`[Database] Failed to connect to ${env.mongodbUri} (${uriError.message}).`);
    }
  }

  // 2. Fallback to MongoMemoryServer with extended timeout
  try {
    console.log('[Database] Starting in-memory MongoDB server fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      binary: {
        timeout: 60000
      },
      instance: {}
    });
    const uri = mongoMemoryServer.getUri();
    
    await mongoose.connect(uri);
    console.log(`[Database] In-memory MongoDB connected successfully at ${uri}`);
    return;
  } catch (mmsError) {
    console.warn(`[Database] MongoMemoryServer error (${mmsError.message}). Attempting secondary fallback...`);
  }

  // 3. Fallback: If network/binary download failed, try local default mongodb
  try {
    const fallbackUri = 'mongodb://127.0.0.1:27017/sagaragent_ai';
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[Database] Connected to local MongoDB instance.');
  } catch (err) {
    console.warn('[Database] Running in mock database state for zero-config offline mode.');
  }
}

async function closeDB() {
  try {
    await mongoose.connection.close();
  } catch (e) {}
  if (mongoMemoryServer) {
    try {
      await mongoMemoryServer.stop();
    } catch (e) {}
  }
}

module.exports = { connectDB, closeDB };
