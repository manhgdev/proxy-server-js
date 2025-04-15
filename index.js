import app from './src/app.js';
import config from './config/index.js';
import connectDB from './config/database.js';
import logger from './src/utils/logger.js';

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the server
    const PORT = config.server.port;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.app.env} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 