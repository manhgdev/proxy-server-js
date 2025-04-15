import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  me,
  changePassword,
  generateApiKey
} from './authController.js';
import { authenticate } from '../../middlewares/auth.js';

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
router.post('/logout', authenticate, logout);

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticate, me);

// Đổi mật khẩu
router.post(
  '/change-password',
  authenticate,
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

// Tạo API key
router.post('/generate-api-key', authenticate, generateApiKey);

export default router; 