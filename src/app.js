import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import config from '../config/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import apiRoutes from './api/index.js';

// Create Express app
const app = express();

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: config.server.serverOptions.bodyLimit }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    data: {
      environment: config.app.env,
      version: config.app.version,
      timestamp: new Date().toISOString()
    }
  });
});

// Thêm API health check endpoint để đảm bảo tương thích
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes - Gọn và tập trung
app.use('/api/v1', apiRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Error handler middleware
app.use(errorHandler);

export default app; 