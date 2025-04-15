import express from 'express';
import { body } from 'express-validator';
import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings
} from './settingsController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticate);

// Lấy cài đặt người dùng
router.get('/', getUserSettings);

// Cập nhật cài đặt người dùng
router.patch(
  '/',
  [
    body('theme')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('Chủ đề không hợp lệ, chỉ chấp nhận: light, dark, system'),
    
    body('language')
      .optional()
      .isIn(['en', 'vi'])
      .withMessage('Ngôn ngữ không hợp lệ, chỉ chấp nhận: en, vi'),
    
    body('notification_prefs.email')
      .optional()
      .isBoolean()
      .withMessage('notification_prefs.email phải là giá trị boolean'),
    
    body('notification_prefs.dashboard')
      .optional()
      .isBoolean()
      .withMessage('notification_prefs.dashboard phải là giá trị boolean'),
    
    body('notification_prefs.proxy_expiry')
      .optional()
      .isBoolean()
      .withMessage('notification_prefs.proxy_expiry phải là giá trị boolean'),
    
    body('notification_prefs.balance_low')
      .optional()
      .isBoolean()
      .withMessage('notification_prefs.balance_low phải là giá trị boolean')
  ],
  updateUserSettings
);

// Reset cài đặt về mặc định
router.post('/reset', resetUserSettings);

export default router; 