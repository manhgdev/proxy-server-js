import { body, param } from 'express-validator';

export const getProxyPoolByIdValidator = [
  param('id').isMongoId().withMessage('ID proxy pool không hợp lệ')
];

export const createProxyPoolValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên là bắt buộc')
    .isLength({ max: 100 })
    .withMessage('Tên không được vượt quá 100 ký tự'),
  
  body('description')
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),
  
  body('group')
    .trim()
    .notEmpty()
    .withMessage('Nhóm là bắt buộc'),
  
  body('countries')
    .isArray()
    .withMessage('Danh sách quốc gia phải là mảng'),
  
  body('isps')
    .optional()
    .isArray()
    .withMessage('Danh sách ISP phải là mảng'),
  
  body('connection_types')
    .isArray()
    .withMessage('Loại kết nối phải là mảng')
    .custom(types => {
      const validTypes = ['datacenter', 'residential', 'mobile'];
      return types.every(type => validTypes.includes(type));
    })
    .withMessage('Loại kết nối không hợp lệ, chỉ chấp nhận: datacenter, residential, mobile'),
  
  body('entry_point')
    .trim()
    .notEmpty()
    .withMessage('Entry point là bắt buộc'),
  
  body('port_range')
    .isObject()
    .withMessage('Port range phải là object')
    .custom((value) => {
      return value.start && value.end && value.start <= value.end;
    })
    .withMessage('Port range không hợp lệ (start phải <= end)'),
  
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username là bắt buộc'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password là bắt buộc'),
  
  body('is_bandwidth_pool')
    .optional()
    .isBoolean()
    .withMessage('is_bandwidth_pool phải là giá trị boolean'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('active phải là giá trị boolean')
];

export const updateProxyPoolValidator = [
  param('id')
    .isMongoId()
    .withMessage('ID proxy pool không hợp lệ'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên không được để trống')
    .isLength({ max: 100 })
    .withMessage('Tên không được vượt quá 100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),
  
  body('group')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nhóm không được để trống'),
  
  body('countries')
    .optional()
    .isArray()
    .withMessage('Danh sách quốc gia phải là mảng'),
  
  body('isps')
    .optional()
    .isArray()
    .withMessage('Danh sách ISP phải là mảng'),
  
  body('connection_types')
    .optional()
    .isArray()
    .withMessage('Loại kết nối phải là mảng')
    .custom(types => {
      const validTypes = ['datacenter', 'residential', 'mobile'];
      return types.every(type => validTypes.includes(type));
    })
    .withMessage('Loại kết nối không hợp lệ, chỉ chấp nhận: datacenter, residential, mobile'),
  
  body('entry_point')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Entry point không được để trống'),
  
  body('port_range')
    .optional()
    .isObject()
    .withMessage('Port range phải là object')
    .custom((value) => {
      return value.start && value.end && value.start <= value.end;
    })
    .withMessage('Port range không hợp lệ (start phải <= end)'),
  
  body('username')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Username không được để trống'),
  
  body('password')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Password không được để trống'),
  
  body('is_bandwidth_pool')
    .optional()
    .isBoolean()
    .withMessage('is_bandwidth_pool phải là giá trị boolean'),
  
  body('active')
    .optional()
    .isBoolean()
    .withMessage('active phải là giá trị boolean')
];

export const deleteProxyPoolValidator = [
  param('id').isMongoId().withMessage('ID proxy pool không hợp lệ')
]; 