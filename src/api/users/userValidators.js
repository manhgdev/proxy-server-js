import { body, param, query } from 'express-validator';

export const getAllUsersValidator = [
  query('page').optional().isInt().withMessage('Page must be an integer'),
  query('limit').optional().isInt().withMessage('Limit must be an integer'),
  query('sort').optional().isString(),
  query('search').optional().isString(),
  query('status').optional().isString(),
  query('user_level').optional().isInt().withMessage('User level must be an integer')
];

export const getUserByIdValidator = [
  param('id').isMongoId().withMessage('Invalid user ID format')
];

export const createUserValidator = [
  body('username').isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullname').isString().withMessage('Full name is required'),
  body('user_level').isInt({ min: 0, max: 3 }).withMessage('User level must be between 0-3'),
  body('active').optional().isBoolean()
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('username').optional().isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullname').optional().isString(),
  body('user_level').optional().isInt({ min: 0, max: 3 }).withMessage('User level must be between 0-3'),
  body('active').optional().isBoolean()
];

export const deleteUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID format')
];

export const updateProfileValidator = [
  body('fullname').optional().isString(),
  body('phone').optional().isString(),
  body('billing_info').optional().isObject(),
  body('billing_info.address').optional().isString(),
  body('billing_info.city').optional().isString(),
  body('billing_info.country').optional().isString(),
  body('billing_info.tax_id').optional().isString(),
  body('billing_info.company').optional().isString()
];

export const getUserOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100')
];

export const getUserOrderByIdValidator = [
  param('orderId').isMongoId().withMessage('Invalid order ID format')
]; 