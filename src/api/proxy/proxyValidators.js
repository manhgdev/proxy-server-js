import { body, param, query } from 'express-validator';

export const getAllProxiesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString().isIn(['active', 'inactive', 'expired']).withMessage('Invalid status'),
  query('type').optional().isString().isIn(['static', 'rotating', 'bandwidth']).withMessage('Invalid type'),
  query('country').optional().isString(),
  query('sort').optional().isString()
];

export const getProxyByIdValidator = [
  param('id').isMongoId().withMessage('Invalid proxy ID format')
];

export const rotateProxyValidator = [
  param('id').isMongoId().withMessage('Invalid proxy ID format')
];

export const checkProxyStatusValidator = [
  param('id').isMongoId().withMessage('Invalid proxy ID format')
];

export const updateProxySettingsValidator = [
  param('id').isMongoId().withMessage('Invalid proxy ID format'),
  body('username').optional().isString(),
  body('password').optional().isString(),
  body('rotation_interval').optional().isInt({ min: 0 }).withMessage('Rotation interval must be non-negative'),
  body('sticky_session').optional().isBoolean(),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
]; 