const config = {
  port: parseInt(process.env.PORT) || 3001,
  env: process.env.NODE_ENV || 'development',
  
  // Cấu hình server
  serverOptions: {
    timeouts: {
      server: 120000, // 2 phút
      socket: 60000   // 1 phút
    },
    bodyLimit: '10mb',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 phút
      max: 100 // Limit mỗi IP đến 100 requests mỗi 15 phút
    }
  },
  
  // Các endpoint không cần xác thực
  publicEndpoints: [
    { path: '/api/v1/auth/login', method: 'POST' },
    { path: '/api/v1/auth/register', method: 'POST' },
    { path: '/api/v1/auth/refresh-token', method: 'POST' },
    { path: '/api/v1/packages', method: 'GET' },
    { path: '/api/v1/packages/:id', method: 'GET' },
    { path: '/health', method: 'GET' },
  ],
  
  // Cấu hình upload file
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    storagePath: 'public/uploads'
  }
};

export default config; 