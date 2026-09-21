import mongoose from 'mongoose';
import { config } from './env.js';

export const dbStatus = {
  connected: false,
  state: 'disconnected',
  host: null,
  name: null,
  error: null,
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbStatus.connected = true;
    dbStatus.state = 'connected';
    dbStatus.host = conn.connection.host;
    dbStatus.name = conn.connection.name;
    dbStatus.error = null;

    if (config.isProduction) {
      console.log('[MongoDB] Connected successfully to database.');
    } else {
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.state = 'error';
    dbStatus.error = error.message;

    console.warn(`[MongoDB Warning] Could not connect to database: ${error.message}`);
    console.warn('[MongoDB Warning] Server will continue running in standalone mode for API/Health checks.');
    return null;
  }
};

export const closeDB = async () => {
  if (dbStatus.connected) {
    await mongoose.connection.close();
    dbStatus.connected = false;
    dbStatus.state = 'disconnected';
    console.log('[MongoDB] Connection closed.');
  }
};

mongoose.connection.on('disconnected', () => {
  dbStatus.connected = false;
  dbStatus.state = 'disconnected';
  console.log('[MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  dbStatus.connected = true;
  dbStatus.state = 'connected';
  console.log('[MongoDB] Reconnected to database.');
});
