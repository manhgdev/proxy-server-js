import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import UserRole from '../models/UserRole.js';
import RolePermission from '../models/RolePermission.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import config from '../../config/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware xác thực kết hợp (JWT hoặc API key)
 */
export const authenticateCombined = async (req, res, next) => {
  try {
    // Kiểm tra xem endpoint có cần xác thực không
    const isPublicEndpoint = config.server.publicEndpoints.some(
      endpoint => endpoint.path === req.path && endpoint.method === req.method
    );
    
    if (isPublicEndpoint) {
      return next();
    }

    let user = null;
    let authType = null;

    // Kiểm tra token JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, config.auth.jwt.secret);
        user = await User.findById(decoded.id);
        if (user) authType = 'jwt';
      } catch (error) {
        logger.debug('JWT validation failed, trying API key');
      }
    }
    
    // Kiểm tra API key nếu JWT không hợp lệ
    if (!user) {
      const apiKey = req.headers['x-api-key'];
      if (apiKey) {
        user = await User.findOne({ api_key: apiKey });
        if (user) authType = 'api_key';
      }
    }
    
    // Nếu không tìm thấy user hoặc user không active
    if (!user || !user.active) {
      throw new UnauthorizedError('Không có token xác thực hoặc API key hợp lệ');
    }
    
    // Đính kèm thông tin user vào request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      user_level: user.user_level,
      is_admin: user.user_level === 0,
      is_manager: user.user_level === 1,
      is_reseller: user.user_level === 2,
      auth_type: authType
    };
    
    // Lấy danh sách roles của user
    const userRoles = await UserRole.find({ user_id: user._id }).populate('role_id');
    const roles = userRoles.map(userRole => userRole.role_id.name);
    req.user.roles = roles;
    
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
      
      // QUAN TRỌNG: Admin có thể truy cập mọi route
      if (req.user.is_admin || req.user.user_level === 0) {
        return next();
      }
      
      // Kiểm tra user_level trước
      if (
        (allowedRoles.includes('admin') && req.user.is_admin) ||
        (allowedRoles.includes('manager') && req.user.is_manager) ||
        (allowedRoles.includes('reseller') && (req.user.is_reseller || req.user.roles.includes('Reseller')))
      ) {
        return next();
      }
      
      // Kiểm tra roles chính xác
      if (req.user.roles) {
        const userRoles = req.user.roles.map(role => role.toLowerCase());
        const hasRole = userRoles.some(role => 
          allowedRoles.map(r => r.toLowerCase()).includes(role)
        );
        if (hasRole) {
          return next();
        }
      }
      
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra user_level
 * @param {Array} levels - Mảng các user_level được phép truy cập
 */
export const checkUserLevel = (levels = []) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra nếu levels không phải là mảng hoặc số
      if (!Array.isArray(levels) && typeof levels !== 'number') {
        throw new Error('User levels phải là mảng hoặc số');
      }
      
      // Chuyển đổi thành mảng nếu chỉ truyền vào một level dạng số
      const allowedLevels = Array.isArray(levels) ? levels : [levels];
      
      // Admin (user_level = 0) luôn có quyền truy cập
      if (req.user.user_level === 0) {
        return next();
      }
      
      // Kiểm tra nếu user_level của người dùng có trong danh sách cho phép
      if (allowedLevels.includes(req.user.user_level)) {
        return next();
      }
      
      throw new ForbiddenError('Bạn không có quyền truy cập');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra permissions
 * @param {Array} permissions - Mảng các permissions được phép truy cập
 */
export const hasPermission = (permissions = []) => {
  return async (req, res, next) => {
    try {
      // Kiểm tra nếu permissions không phải là mảng hoặc chuỗi
      if (!Array.isArray(permissions) && typeof permissions !== 'string') {
        throw new Error('Permissions phải là mảng hoặc chuỗi');
      }
      
      // Chuyển đổi thành mảng nếu chỉ truyền vào một permission dạng chuỗi
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      
      // Admin luôn có mọi quyền
      if (req.user.is_admin || req.user.user_level === 0) {
        return next();
      }
      
      // Lấy danh sách vai trò của người dùng
      const userRoles = await UserRole.find({ user_id: req.user.id }).populate('role_id');
      
      if (!userRoles.length) {
        throw new ForbiddenError('Bạn không có vai trò nào');
      }
      
      // Lấy danh sách quyền từ các vai trò
      const roleIds = userRoles.map(ur => ur.role_id._id);
      const rolePermissions = await RolePermission.find({ role_id: { $in: roleIds } }).populate('permission_id');
      
      // Kiểm tra xem người dùng có đủ quyền yêu cầu không
      const userPermissions = rolePermissions.map(rp => rp.permission_id.name);
      
      // Kiểm tra xem có tất cả các quyền cần thiết không
      const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));
      
      if (hasAllPermissions) {
        return next();
      }
      
      throw new ForbiddenError('Bạn không có đủ quyền truy cập');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra quyền truy cập tài nguyên
 * Đảm bảo người dùng chỉ có thể truy cập dữ liệu của chính họ, trừ khi là admin
 */
export const checkResourceAccess = async (req, res, next) => {
  try {
    // Admin luôn có quyền truy cập
    if (req.user.is_admin || req.user.user_level === 0) {
      return next();
    }
    
    // Manager có thể truy cập nhiều dữ liệu hơn
    if (req.user.is_manager || req.user.user_level === 1) {
      // Tùy chỉnh quyền cho manager nếu cần
      return next();
    }
    
    // Kiểm tra userId từ params hoặc query
    const requestedUserId = req.params.userId || req.params.id || req.query.userId || req.query.user_id;
    
    // Nếu không có userId được yêu cầu, coi như là truy cập dữ liệu riêng
    if (!requestedUserId) {
      return next();
    }
    
    // Kiểm tra xem người dùng có đang truy cập dữ liệu của chính mình không
    if (requestedUserId !== req.user.id.toString()) {
      // Nếu là reseller, kiểm tra xem user được yêu cầu có phải con của reseller không
      if (req.user.is_reseller) {
        const requestedUser = await User.findById(requestedUserId);
        if (requestedUser && requestedUser.parent_id && requestedUser.parent_id.toString() === req.user.id.toString()) {
          return next();
        }
      }
      
      throw new ForbiddenError('Bạn không có quyền truy cập dữ liệu của người dùng khác');
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 