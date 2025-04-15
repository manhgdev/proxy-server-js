import express from 'express';
import { login, register, refreshToken, logout } from './authController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// Đăng nhập
router.post('/login', login);

// Đăng ký
router.post('/register', register);

// Làm mới token
router.post('/refresh-token', refreshToken);

// Đăng xuất (yêu cầu xác thực)
router.post('/logout', authenticate, logout);

export default router; 