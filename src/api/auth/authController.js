import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import config from '../../../config/index.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

/**
 * Đăng nhập
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Kiểm tra đầu vào
    if (!username || !password) {
      throw new BadRequestError('Username and password are required');
    }
    
    // Tìm user theo username
    const user = await User.findOne({ username }).select('+password_hash');
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Kiểm tra tài khoản có bị khóa không
    if (!user.active) {
      throw new UnauthorizedError('Your account has been deactivated');
    }
    
    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Tạo JWT token
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      user_level: user.user_level,
      // Trong ứng dụng thực tế, cần query từ bảng UserRoles
      roles: user.is_admin ? ['admin'] : 
             user.is_manager ? ['manager'] : 
             user.is_reseller ? ['reseller'] : ['customer']
    };
    
    // Debug thông tin
    console.log('Generating JWT token for user:', user.username);
    console.log('JWT Secret in authController:', process.env.JWT_SECRET ? 'exists' : 'missing');
    console.log('Config JWT Secret in authController:', config.auth.jwt.secret ? 'exists' : 'missing');
    
    // Sử dụng trực tiếp biến môi trường thay vì thông qua config
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_for_development';
    
    // Access token
    const accessToken = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: config.auth.jwt.expiresIn }
    );
    
    // Refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      jwtRefreshSecret,
      { expiresIn: config.auth.jwt.refreshExpiresIn }
    );
    
    // Lưu tokens
    user.access_token = accessToken;
    await user.save();
    
    // Response không chứa password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      user_level: user.user_level,
      roles: payload.roles
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: parseInt(config.auth.jwt.expiresIn) || 3600,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Đăng ký
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullname, phone, reseller_code } = req.body;
    
    // Kiểm tra đầu vào
    if (!username || !email || !password || !fullname) {
      throw new BadRequestError('Username, email, password and fullname are required');
    }
    
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        throw new BadRequestError('Username already exists');
      }
      throw new BadRequestError('Email already exists');
    }
    
    // Tìm reseller nếu có reseller_code
    let parentId = null;
    if (reseller_code) {
      const reseller = await User.findOne({ 
        username: reseller_code,
        user_level: 2 // Reseller
      });
      
      if (reseller) {
        parentId = reseller._id;
      }
    }
    
    // Tạo user mới
    const newUser = new User({
      username,
      password_hash: password, // Sẽ được hash tự động bởi middleware
      email,
      fullname,
      phone: phone || '',
      parent_id: parentId,
      user_level: 3, // Customer
      api_key: new User().generateApiKey()
    });
    
    // Lưu user
    await newUser.save();
    
    // TODO: Tạo wallet cho user
    
    // Response
    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công',
      data: {
        user_id: newUser._id,
        username: newUser.username,
        api_key: newUser.api_key
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

/**
 * Làm mới token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      throw new BadRequestError('Refresh token is required');
    }
    
    // Sử dụng trực tiếp biến môi trường
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_for_development';
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, jwtRefreshSecret);
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    // Tìm user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    if (!user.active) {
      throw new UnauthorizedError('Your account has been deactivated');
    }
    
    // Tạo access token mới
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      user_level: user.user_level,
      roles: user.is_admin ? ['admin'] : 
             user.is_manager ? ['manager'] : 
             user.is_reseller ? ['reseller'] : ['customer']
    };
    
    // Sử dụng trực tiếp biến môi trường
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development';
    
    const accessToken = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: config.auth.jwt.expiresIn }
    );
    
    // Lưu token mới
    user.access_token = accessToken;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        access_token: accessToken,
        expires_in: parseInt(config.auth.jwt.expiresIn) || 3600
      }
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
};

/**
 * Đăng xuất
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    // Lấy user ID từ token
    const userId = req.user.id;
    
    // Tìm và xóa access token
    await User.findByIdAndUpdate(userId, { access_token: null });
    
    res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

export {
  login,
  register,
  refreshToken,
  logout
}; 