import mongoose from 'mongoose';

let mongoConnection: mongoose.Connection | null = null;

export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookswap_logs';
    
    await mongoose.connect(mongoUri, {
      // Опции подключения
    });
    
    mongoConnection = mongoose.connection;
    
    console.log('✅ MongoDB connected for logging');
    
    // Обработка событий подключения
    mongoConnection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoConnection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  if (mongoConnection) {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

export const getMongoConnection = (): mongoose.Connection | null => {
  return mongoConnection;
};

export default mongoose;

