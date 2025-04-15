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
import { getUserPlans } from './api/users/userPlansController.js';
import { authenticateCombined } from './middlewares/auth.js';

// Create Express app
const app = express();

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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

// Import routes
import authRoutes from './api/auth/authRoutes.js';
import userRoutes from './api/users/userRoutes.js';
import packageRoutes from './api/packages/packageRoutes.js';
import orderRoutes from './api/orders/orderRoutes.js';
import proxyRoutes from './api/proxy/proxyRoutes.js';
import walletRoutes from './api/wallet/walletRoutes.js';
import planRoutes from './api/plans/planRoutes.js';
import adminRoutes from './api/admin/adminRoutes.js';
import resellerRoutes from './api/reseller/resellerRoutes.js';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/proxies', proxyRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reseller', resellerRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Error handler middleware
app.use(errorHandler);

export default app; 