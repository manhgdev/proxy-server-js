import server from './server.js';
import database from './database.js';
import auth from './auth.js';

export default {
  server,
  database,
  auth,
  
  // Các biến môi trường chung
  app: {
    name: 'Proxy Server JS',
    version: process.env.npm_package_version || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
  
  // Cấu hình email
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM
  },
  
  // Cấu hình payment gateway
  payment: {
    apiKey: process.env.PAYMENT_API_KEY,
    apiSecret: process.env.PAYMENT_API_SECRET
  },
  
  // Cấu hình proxy provider API
  proxyProvider: {
    apiEndpoint: process.env.PROXY_API_ENDPOINT,
    apiKey: process.env.PROXY_API_KEY
  },
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL
}; 