/**
 * MongoDB connection for sandbox audit logging.
 * Uses same connection pattern as main API for consistency.
 */

const mongoose = require('mongoose');
const { logger } = require('../logger');

const MONGO_URI = process.env.MONGO_URI;

// Global cache for connection (similar to main API)
let cached = global.sandboxMongoose;

if (!cached) {
  cached = global.sandboxMongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB for audit logging.
 * If MONGO_URI is not set, audit logging will be disabled (logs only).
 * @returns {Promise<mongoose.Connection|null>} Connection or null if disabled
 */
async function connectDb() {
  if (!MONGO_URI) {
    logger.warn('MONGO_URI not set - audit logging to database disabled (using file logs only)');
    return null;
  }

  // Return cached connection if available and connected
  if (cached.conn && cached.conn?._readyState === 1) {
    return cached.conn;
  }

  // Check if disconnected and need to reconnect
  const disconnected = cached.conn && cached.conn?._readyState !== 1;
  if (!cached.promise || disconnected) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 2,
    };

    mongoose.set('strictQuery', true);

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongoose) => {
        logger.info('Sandbox connected to MongoDB for audit logging', {
          database: mongoose.connection.db?.databaseName,
        });
        return mongoose;
      })
      .catch((err) => {
        logger.error('Failed to connect to MongoDB for audit logging', {
          error: err.message,
        });
        // Don't throw - allow sandbox to run without DB (logs only)
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDb() {
  if (cached.conn) {
    await mongoose.disconnect().catch(() => {});
    cached.conn = null;
    cached.promise = null;
    logger.info('Sandbox disconnected from MongoDB');
  }
}

module.exports = {
  connectDb,
  disconnectDb,
};
