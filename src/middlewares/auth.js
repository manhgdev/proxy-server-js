import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import config from '../../config/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware để xác thực JWT token
 */
const authenticate = (req, res, next) => {
  try {
    // Kiểm tra xem endpoint có cần xác thực không
    const isPublicEndpoint = config.server.publicEndpoints.some(
      endpoint => endpoint.path === req.path && endpoint.method === req.method
    );
    
    if (isPublicEndpoint) {
      return next();
    }

    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }
    
    // Sử dụng trực tiếp biến môi trường
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development';
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Thêm thông tin người dùng vào request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Middleware để kiểm tra role
 * @param {string[]} roles - Danh sách các roles được phép truy cập
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      if (typeof roles === 'string') {
        roles = [roles];
      }
      
      // Kiểm tra user có trong request không
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized access');
      }
      
      // Kiểm tra role của user
      const userRoles = req.user.roles || [];
      
      const hasRole = roles.length === 0 || userRoles.some(role => roles.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenError('You do not have permission to access this resource');
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      next(error);
    }
  };
};

/**
 * Middleware để kiểm tra permission
 * @param {string} resource - Resource cần kiểm tra
 * @param {string} action - Action cần kiểm tra
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // Kiểm tra user có trong request không
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized access');
      }
      
      // Lấy permissions từ user
      const userRoles = req.user.roles || [];
      
      // Kiểm tra admin role (mặc định có tất cả quyền)
      if (userRoles.includes(config.auth.roles.ADMIN)) {
        return next();
      }
      
      // Permission cần kiểm tra
      const requiredPermission = `${resource}:${action}`;
      
      // Lấy danh sách permissions của user dựa trên roles
      let userPermissions = [];
      
      for (const role of userRoles) {
        const rolePerms = config.auth.rbac.rolePermissions[role] || [];
        userPermissions = [...userPermissions, ...rolePerms];
      }
      
      // Kiểm tra permission
      const hasPermission = userPermissions.includes('*') || 
                            userPermissions.includes(`${resource}:*`) || 
                            userPermissions.includes(requiredPermission);
      
      if (!hasPermission) {
        throw new ForbiddenError(`You do not have permission to ${action} ${resource}`);
      }
      
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      next(error);
    }
  };
};

export {
  authenticate,
  authorize,
  checkPermission
}; 