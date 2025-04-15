import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import UserRole from '../models/UserRole.js';
import RolePermission from '../models/RolePermission.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import config from '../../config/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware xác thực người dùng qua JWT
 */
export const authenticate = async (req, res, next) => {
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
      throw new UnauthorizedError('Không có token xác thực');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Xác thực token
    const jwtSecret = config.auth.jwt.secret;
    let decoded;
    
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      logger.error('JWT verify error:', error);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token đã hết hạn');
      }
      throw new UnauthorizedError('Token không hợp lệ');
    }
    
    // Tìm user từ token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('Người dùng không tồn tại');
    }
    
    if (!user.active) {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }
    
    // Đính kèm thông tin user vào request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      user_level: user.user_level,
      is_admin: user.is_admin,
      is_reseller: user.is_reseller
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware xác thực API key
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      throw new UnauthorizedError('Không có API key');
    }
    
    // Tìm user từ API key
    const user = await User.findOne({ api_key: apiKey });
    
    if (!user) {
      throw new UnauthorizedError('API key không hợp lệ');
    }
    
    if (!user.active) {
      throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
    }
    
    // Đính kèm thông tin user vào request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      user_level: user.user_level,
      is_admin: user.is_admin,
      is_reseller: user.is_reseller
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware kiểm tra vai trò
 * @param {Array} roles - Mảng các vai trò được phép truy cập
 */
export const authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra nếu roles không phải là mảng hoặc chuỗi
      if (!Array.isArray(roles) && typeof roles !== 'string') {
        throw new Error('Roles phải là mảng hoặc chuỗi');
      }
      
      // Chuyển đổi thành mảng nếu chỉ truyền vào một vai trò dạng chuỗi
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Trường hợp không yêu cầu vai trò cụ thể
      if (allowedRoles.length === 0) {
        return next();
      }
      
      // Trường hợp đặc biệt - kiểm tra is_admin
      if (allowedRoles.includes('admin') && req.user.is_admin) {
        return next();
      }
      
      // Trường hợp đặc biệt - kiểm tra is_reseller
      if (allowedRoles.includes('reseller') && req.user.is_reseller) {
        return next();
      }
      
      // Lấy danh sách vai trò của người dùng
      const userRoles = await UserRole.find({ user_id: req.user.id })
        .populate('role_id');
      
      // Kiểm tra xem người dùng có vai trò được phép không
      const hasRole = userRoles.some(userRole => 
        allowedRoles.includes(userRole.role_id.name)
      );
      
      if (!hasRole) {
        throw new ForbiddenError('Bạn không có quyền truy cập');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra quyền
 * @param {Array} permissions - Mảng các quyền được phép truy cập
 */
export const hasPermission = (permissions = []) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra nếu permissions không phải là mảng hoặc chuỗi
      if (!Array.isArray(permissions) && typeof permissions !== 'string') {
        throw new Error('Permissions phải là mảng hoặc chuỗi');
      }
      
      // Chuyển đổi thành mảng nếu chỉ truyền vào một quyền dạng chuỗi
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      
      // Trường hợp không yêu cầu quyền cụ thể
      if (requiredPermissions.length === 0) {
        return next();
      }
      
      // Nếu là admin, cho phép mọi quyền truy cập
      if (req.user.is_admin) {
        return next();
      }
      
      // Lấy danh sách vai trò của người dùng
      const userRoles = await UserRole.find({ user_id: req.user.id });
      const roleIds = userRoles.map(ur => ur.role_id);
      
      // Lấy danh sách quyền dựa trên vai trò
      const rolePermissions = await RolePermission.find({
        role_id: { $in: roleIds }
      }).populate('permission_id');
      
      // Kiểm tra xem người dùng có quyền được yêu cầu không
      const hasRequiredPermission = rolePermissions.some(rp => 
        requiredPermissions.includes(rp.permission_id.code)
      );
      
      if (!hasRequiredPermission) {
        throw new ForbiddenError('Bạn không có quyền thực hiện hành động này');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra vai trò - Alias của authorize cho tương thích với code cũ
 * @param {Array} roles - Mảng các vai trò được phép truy cập
 */
export const authorizeRoles = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra nếu roles không phải là mảng hoặc chuỗi
      if (!Array.isArray(roles) && typeof roles !== 'string') {
        throw new Error('Roles phải là mảng hoặc chuỗi');
      }
      
      // Chuyển đổi thành mảng nếu chỉ truyền vào một vai trò dạng chuỗi
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Trường hợp không yêu cầu vai trò cụ thể
      if (allowedRoles.length === 0) {
        return next();
      }
      
      // Kiểm tra admin
      if (allowedRoles.includes('Admin') && req.user.is_admin) {
        return next();
      }
      
      // Kiểm tra reseller
      if (allowedRoles.includes('Reseller') && req.user.is_reseller) {
        return next();
      }
      
      // Kiểm tra Manager (user_level = 1)
      if (allowedRoles.includes('Manager') && req.user.user_level === 1) {
        return next();
      }
      
      // Lấy danh sách vai trò của người dùng
      const userRoles = await UserRole.find({ user_id: req.user.id })
        .populate('role_id');
      
      // Kiểm tra xem người dùng có vai trò được phép không
      const hasRole = userRoles.some(userRole => 
        allowedRoles.includes(userRole.role_id.name)
      );
      
      if (!hasRole) {
        throw new ForbiddenError('Bạn không có quyền truy cập');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}; 