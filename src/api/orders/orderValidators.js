import { body, param, query } from 'express-validator';

export const getAllOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString(),
  query('sort').optional().isString(),
  query('from').optional().isISO8601().withMessage('From date must be in ISO format'),
  query('to').optional().isISO8601().withMessage('To date must be in ISO format')
];

export const getMyOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString(),
  query('sort').optional().isString()
];

export const getResellerOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString(),
  query('sort').optional().isString()
];

export const getOrderByIdValidator = [
  param('id').isMongoId().withMessage('Invalid order ID format')
];

export const getOrderItemsValidator = [
  param('id').isMongoId().withMessage('Invalid order ID format')
];

export const createOrderValidator = [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.package_id').isMongoId().withMessage('Invalid package ID format'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.custom_config').optional().isObject(),
  body('payment_method').isString().isIn(['wallet', 'credit_card', 'crypto']).withMessage('Invalid payment method'),
  body('discount_code').optional().isString(),
  body('customer_notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

export const cancelOrderValidator = [
  param('id').isMongoId().withMessage('Invalid order ID format')
]; 