import { body, param, query } from 'express-validator';

// Role validators
export const roleIdValidator = param('id').isMongoId().withMessage('Invalid role ID format');

export const createRoleValidator = [
  body('name').isString().withMessage('Name is required'),
  body('description').isString().withMessage('Description is required'),
  body('level').isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
  body('is_admin').isBoolean().withMessage('is_admin flag is required'),
  body('is_reseller').isBoolean().withMessage('is_reseller flag is required')
];

export const updateRoleValidator = [
  roleIdValidator,
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('level').optional().isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
  body('is_admin').optional().isBoolean(),
  body('is_reseller').optional().isBoolean()
];

// Role-Permission validators
export const createRolePermissionValidator = [
  body('role_id').isMongoId().withMessage('Invalid role ID format'),
  body('permission_id').isMongoId().withMessage('Invalid permission ID format')
];

export const deleteRolePermissionValidator = [
  param('roleId').isMongoId().withMessage('Invalid role ID format'),
  param('permissionId').isMongoId().withMessage('Invalid permission ID format')
];

// User-Role validators
export const createUserRoleValidator = [
  body('user_id').isMongoId().withMessage('Invalid user ID format'),
  body('role_id').isMongoId().withMessage('Invalid role ID format')
];

export const deleteUserRoleValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID format'),
  param('roleId').isMongoId().withMessage('Invalid role ID format')
];

// Report validators
export const revenueReportValidator = [
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('interval').optional().isString().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid interval')
];

export const userReportValidator = [
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date')
];

export const orderReportValidator = [
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('status').optional().isString()
];

// Wallet validators
export const creditWalletValidator = [
  body('user_id').isMongoId().withMessage('Invalid user ID format'),
  body('amount').isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 10000 }).withMessage('Minimum credit amount is 10,000'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
]; 