import express from 'express';
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
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  validateResetTokenValidator
} from './authValidators.js';

const router = express.Router();

// Đăng ký
router.post('/register', registerValidator, register);

// Đăng nhập
router.post('/login', loginValidator, login);

// Làm mới token
router.post('/refresh-token', refreshTokenValidator, refreshToken);

// Đăng xuất
router.post('/logout', authenticateCombined, logout);

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticateCombined, me);

// Đổi mật khẩu
router.post('/change-password', authenticateCombined, changePasswordValidator, changePassword);

// Quên mật khẩu
router.post('/forgot-password', forgotPasswordValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  
  // Trả về response giả lập
  res.status(200).json({
    status: 'success',
    message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
  });
});

// Đặt lại mật khẩu
router.post('/reset-password', resetPasswordValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }
  
  // Trả về response giả lập
  res.status(200).json({
    status: 'success',
    message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.'
  });
});

// Validate reset token
router.get('/validate-reset-token', validateResetTokenValidator, (req, res) => {
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
});

// Tạo API key
router.post('/generate-api-key', authenticateCombined, generateApiKey);

export default router; 