import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import config from '../../../config/index.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Wallet from '../../models/Wallet.js';

/**
 * Đăng nhập
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
    
    // Sử dụng config thay vì trực tiếp biến môi trường
    const jwtSecret = config.auth.jwt.secret;
    const jwtRefreshSecret = config.auth.jwt.refreshSecret;
    
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
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, fullname, phone } = req.body;

    // Kiểm tra username và email đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại'
        });
      }
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password_hash: password, // Sẽ được hash trong middleware
      fullname,
      phone,
      user_level: 3, // Customer
      is_admin: false,
      is_reseller: false,
      active: true,
      created_at: Date.now()
    });

    await newUser.save();

    // Tạo ví cho người dùng mới
    const wallet = await Wallet.findOrCreate(newUser._id);
    
    // Cập nhật wallet_id cho user
    newUser.wallet_id = wallet._id;
    await newUser.save();

    // Tạo token
    const accessToken = jwt.sign(
      { id: newUser._id, username: newUser.username },
      config.auth.jwt.secret,
      { expiresIn: config.auth.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id, username: newUser.username },
      config.auth.jwt.refreshSecret,
      { expiresIn: config.auth.jwt.refreshExpiresIn }
    );

    // Trả về thông tin người dùng và token
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          fullname: newUser.fullname,
          user_level: newUser.user_level
        },
        access_token: accessToken,
        refresh_token: refreshToken
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
    
    // Sử dụng config thay vì biến môi trường
    const jwtRefreshSecret = config.auth.jwt.refreshSecret;
    
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
    // Nếu đã authenticate, xóa token
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.access_token = null;
        await user.save();
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 * @route GET /api/v1/auth/me
 * @access Private
 */
const me = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password_hash -access_token');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Lấy thông tin ví
    const wallet = await Wallet.findOne({ user_id: userId });
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullname: user.fullname,
          phone: user.phone,
          user_level: user.user_level,
          created_at: user.created_at,
          wallet: wallet ? {
            balance: wallet.balance,
            currency: wallet.currency
          } : null
        }
      }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    next(error);
  }
};

/**
 * Đổi mật khẩu
 * @route POST /api/v1/auth/change-password
 * @access Private
 */
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { current_password, new_password } = req.body;
    const userId = req.user.id;
    
    // Lấy thông tin người dùng
    const user = await User.findById(userId).select('+password_hash');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(current_password);
    
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }
    
    // Cập nhật mật khẩu mới
    user.password_hash = new_password;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

/**
 * Tạo API key
 * @route POST /api/v1/auth/generate-api-key
 * @access Private
 */
const generateApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Lấy thông tin người dùng
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Tạo API key mới
    const apiKey = user.generateApiKey();
    user.api_key = apiKey;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        api_key: apiKey
      }
    });
  } catch (error) {
    logger.error('Generate API key error:', error);
    next(error);
  }
};

export {
  login,
  register,
  refreshToken,
  logout,
  me,
  changePassword,
  generateApiKey
}; 