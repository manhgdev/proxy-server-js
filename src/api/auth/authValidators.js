import { body, query } from 'express-validator';

export const registerValidator = [
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
];

export const loginValidator = [
  body('username')
    .isString()
    .trim(),
  body('password')
    .isString()
];

export const refreshTokenValidator = [
  body('refresh_token')
    .isString()
    .withMessage('Refresh token is required')
];

export const changePasswordValidator = [
  body('current_password')
    .isString()
    .withMessage('Mật khẩu hiện tại không được để trống'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .not().equals('current_password')
    .withMessage('Mật khẩu mới không được trùng với mật khẩu hiện tại')
];

export const forgotPasswordValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
];

export const resetPasswordValidator = [
  body('token')
    .isString()
    .withMessage('Token is required'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

export const validateResetTokenValidator = [
  query('token')
    .isString()
    .withMessage('Token is required')
]; 