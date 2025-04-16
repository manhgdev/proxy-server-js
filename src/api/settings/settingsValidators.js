import { body } from 'express-validator';

export const updateUserSettingsValidator = [
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
]; 