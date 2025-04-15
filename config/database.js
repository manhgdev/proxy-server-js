import mongoose from 'mongoose';
import logger from '../src/utils/logger.js';

const connectDB = async () => {
  const mongoURI = process.env.NODE_ENV === 'test' 
    ? process.env.MONGODB_TEST_URI 
    : process.env.MONGODB_URI;

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('MongoDB connection established successfully');
    
    // Thêm các listeners cho mongoose
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 