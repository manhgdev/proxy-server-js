import { body } from 'express-validator';

// Validators cho Role
export const validateCreateRole = [
  body('name')
    .notEmpty().withMessage('Tên vai trò không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Tên vai trò phải từ 3-50 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Mô tả không quá 200 ký tự'),
  body('level')
    .notEmpty().withMessage('Level không được để trống')
    .isInt({ min: 0, max: 10 }).withMessage('Level phải là số nguyên từ 0-10'),
  body('is_admin')
    .optional()
    .isBoolean().withMessage('is_admin phải là boolean'),
  body('is_reseller')
    .optional()
    .isBoolean().withMessage('is_reseller phải là boolean')
];

export const validateUpdateRole = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage('Tên vai trò phải từ 3-50 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Mô tả không quá 200 ký tự'),
  body('level')
    .optional()
    .isInt({ min: 0, max: 10 }).withMessage('Level phải là số nguyên từ 0-10'),
  body('is_admin')
    .optional()
    .isBoolean().withMessage('is_admin phải là boolean'),
  body('is_reseller')
    .optional()
    .isBoolean().withMessage('is_reseller phải là boolean')
];

// Validators cho Permission
export const validateCreatePermission = [
  body('name')
    .notEmpty().withMessage('Tên quyền không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Tên quyền phải từ 3-50 ký tự'),
  body('code')
    .notEmpty().withMessage('Mã quyền không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Mã quyền phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_:]+$/).withMessage('Mã quyền chỉ chứa ký tự chữ, số, dấu gạch dưới và dấu hai chấm'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Mô tả không quá 200 ký tự'),
  body('group')
    .notEmpty().withMessage('Nhóm quyền không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Nhóm quyền phải từ 2-50 ký tự')
];

export const validateUpdatePermission = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage('Tên quyền phải từ 3-50 ký tự'),
  body('code')
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage('Mã quyền phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_:]+$/).withMessage('Mã quyền chỉ chứa ký tự chữ, số, dấu gạch dưới và dấu hai chấm'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Mô tả không quá 200 ký tự'),
  body('group')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Nhóm quyền phải từ 2-50 ký tự')
];

// Validators cho Role-Permission
export const validateAssignPermission = [
  body('role_id')
    .notEmpty().withMessage('ID vai trò không được để trống')
    .isMongoId().withMessage('ID vai trò không hợp lệ'),
  body('permission_id')
    .notEmpty().withMessage('ID quyền không được để trống')
    .isMongoId().withMessage('ID quyền không hợp lệ')
];

export const validateUpdateRolePermissions = [
  body('role_id')
    .optional()
    .isMongoId().withMessage('ID vai trò không hợp lệ'),
  body('permission_ids')
    .notEmpty().withMessage('Danh sách quyền không được để trống')
    .isArray().withMessage('Danh sách quyền phải là một mảng')
    .custom(ids => {
      if (!ids.every(id => typeof id === 'string')) {
        throw new Error('Mỗi ID quyền phải là một chuỗi');
      }
      return true;
    })
];

// Validators cho User-Role
export const validateAssignRole = [
  body('user_id')
    .notEmpty().withMessage('ID người dùng không được để trống')
    .isMongoId().withMessage('ID người dùng không hợp lệ'),
  body('role_id')
    .notEmpty().withMessage('ID vai trò không được để trống')
    .isMongoId().withMessage('ID vai trò không hợp lệ')
];

export const validateUpdateUserRoles = [
  body('user_id')
    .optional()
    .isMongoId().withMessage('ID người dùng không hợp lệ'),
  body('role_ids')
    .notEmpty().withMessage('Danh sách vai trò không được để trống')
    .isArray().withMessage('Danh sách vai trò phải là một mảng')
    .custom(ids => {
      if (!ids.every(id => typeof id === 'string')) {
        throw new Error('Mỗi ID vai trò phải là một chuỗi');
      }
      return true;
    })
]; 