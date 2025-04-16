import { body, param } from 'express-validator';

export const getAlertsValidator = [];

export const createAlertValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên cảnh báo là bắt buộc')
    .isLength({ max: 100 })
    .withMessage('Tên cảnh báo không vượt quá 100 ký tự'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Loại cảnh báo là bắt buộc')
    .isIn(['bandwidth', 'availability', 'response_time', 'error_rate'])
    .withMessage('Loại cảnh báo không hợp lệ'),
  
  body('threshold')
    .isNumeric()
    .withMessage('Ngưỡng cảnh báo phải là số'),
  
  body('comparison')
    .trim()
    .notEmpty()
    .withMessage('Điều kiện so sánh là bắt buộc')
    .isIn(['gt', 'lt', 'eq', 'gte', 'lte'])
    .withMessage('Điều kiện so sánh không hợp lệ'),
  
  body('notification_method')
    .isArray()
    .withMessage('Phương thức thông báo phải là mảng')
    .custom(methods => {
      const validMethods = ['email', 'sms', 'web'];
      return methods.every(method => validMethods.includes(method));
    })
    .withMessage('Phương thức thông báo không hợp lệ'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái phải là boolean')
];

export const updateAlertValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID cảnh báo không hợp lệ'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên cảnh báo không được để trống')
    .isLength({ max: 100 })
    .withMessage('Tên cảnh báo không vượt quá 100 ký tự'),
  
  body('type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Loại cảnh báo không được để trống')
    .isIn(['bandwidth', 'availability', 'response_time', 'error_rate'])
    .withMessage('Loại cảnh báo không hợp lệ'),
  
  body('threshold')
    .optional()
    .isNumeric()
    .withMessage('Ngưỡng cảnh báo phải là số'),
  
  body('comparison')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Điều kiện so sánh không được để trống')
    .isIn(['gt', 'lt', 'eq', 'gte', 'lte'])
    .withMessage('Điều kiện so sánh không hợp lệ'),
  
  body('notification_method')
    .optional()
    .isArray()
    .withMessage('Phương thức thông báo phải là mảng')
    .custom(methods => {
      const validMethods = ['email', 'sms', 'web'];
      return methods.every(method => validMethods.includes(method));
    })
    .withMessage('Phương thức thông báo không hợp lệ'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái phải là boolean')
];

export const deleteAlertValidator = [
  param('id').isMongoId().withMessage('ID cảnh báo không hợp lệ')
]; 