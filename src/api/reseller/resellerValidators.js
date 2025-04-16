import { body, query, param } from 'express-validator';
import { validate } from '../../middlewares/validate.js';

export const updateProfileValidators = validate([
  body('payment_details').optional().isObject(),
  body('payment_details.bank_name').optional().isString(),
  body('payment_details.account_number').optional().isString(),
  body('payment_details.account_name').optional().isString(),
  body('company_name').optional().isString(),
  body('company_address').optional().isString(),
  body('tax_id').optional().isString()
]);

export const getCustomersValidators = validate([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('search').optional().isString(),
  query('status').optional().isString().isIn(['active', 'inactive']).withMessage('Invalid status'),
  query('sort').optional().isString()
]);

export const createCustomerValidators = validate([
  body('username').isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullname').isString().withMessage('Full name is required'),
  body('phone').optional().isString()
]);

export const getCommissionsValidators = validate([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('sort').optional().isString(),
  query('from').optional().isISO8601().withMessage('From date must be in ISO format'),
  query('to').optional().isISO8601().withMessage('To date must be in ISO format')
]);

export const withdrawalValidators = validate([
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('bank_info').isObject().withMessage('Bank information is required'),
  body('bank_info.bank_name').isString().withMessage('Bank name is required'),
  body('bank_info.account_number').isString().withMessage('Account number is required'),
  body('bank_info.account_name').isString().withMessage('Account name is required')
]); 