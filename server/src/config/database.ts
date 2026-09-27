import mongoose from 'mongoose';

let isConnected = false;

export interface DatabaseStatus {
  connected: boolean;
  state: string;
  provider: string;
}

export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri) {
    if (isProduction) {
      console.error('❌ [Database] CRITICAL: MONGODB_URI is missing in production environment. MongoDB Atlas is mandatory.');
    } else {
      console.log('ℹ️ [Database] No MONGODB_URI detected in environment. Using in-memory fallback for local development.');
    }
    return false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    // Configure connection pool and timeout parameters for production
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 25,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`✅ [Database] Connected to MongoDB Atlas (DB: ${conn.connection.name || 'furnitura'})`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ [Database] MongoDB connection error:', err.message || err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [Database] MongoDB disconnected. Attempting automatic reconnection...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [Database] MongoDB successfully reconnected.');
      isConnected = true;
    });

    return true;
  } catch (err: any) {
    console.error('❌ [Database] Failed to connect to MongoDB Atlas:', err.message || err);
    isConnected = false;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): DatabaseStatus {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'];
  const stateIndex = mongoose.connection.readyState;
  const state = states[stateIndex] || 'unknown';

  return {
    connected: isDatabaseConnected(),
    state,
    provider: isDatabaseConnected() ? 'MongoDB Atlas' : 'In-Memory State',
  };
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 [Database] MongoDB connection closed gracefully.');
  }
}
