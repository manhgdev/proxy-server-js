import express from 'express';
import { body, query } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshToken,
  me,
  changePassword,
  generateApiKey
} from './authController.js';
import { authenticateCombined } from '../../middlewares/auth.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Đăng ký
router.post(
  '/register',
  [
    body('username')
      .isString()
      .isLength({ min: 3, max: 30 })
      .withMessage('Tên đăng nhập phải có độ dài từ 3-30 ký tự')
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    body('email')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('fullname')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Họ tên phải có độ dài từ 2-100 ký tự')
      .trim()
  ],
  register
);

// Đăng nhập
router.post(
  '/login',
  [
    body('username')
      .isString()
      .trim(),
    body('password')
      .isString()
  ],
  login
);

// Làm mới token
router.post(
  '/refresh-token',
  [
    body('refresh_token')
      .isString()
      .withMessage('Refresh token is required')
  ],
  refreshToken
);

// Đăng xuất
router.post('/logout', authenticateCombined, logout);

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticateCombined, me);

// Đổi mật khẩu
router.post(
  '/change-password',
  authenticateCombined,
  [
    body('current_password')
      .isString()
      .withMessage('Mật khẩu hiện tại không được để trống'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
      .not().equals('current_password')
      .withMessage('Mật khẩu mới không được trùng với mật khẩu hiện tại')
  ],
  changePassword
);

// Quên mật khẩu
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    
    // Trả về response giả lập
    res.status(200).json({
      status: 'success',
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
    });
  }
);

// Đặt lại mật khẩu
router.post(
  '/reset-password',
  [
    body('token')
      .isString()
      .withMessage('Token is required'),
    body('password')
      .isString()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    
    // Trả về response giả lập
    res.status(200).json({
      status: 'success',
      message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.'
    });
  }
);

// Validate reset token
router.get(
  '/validate-reset-token',
  [
    query('token')
      .isString()
      .withMessage('Token is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    
    // Trả về response giả lập
    res.status(200).json({
      status: 'success',
      data: {
        valid: true
      }
    });
  }
);

// Tạo API key
router.post('/generate-api-key', authenticateCombined, generateApiKey);

export default router; 