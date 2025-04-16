import { param, query } from 'express-validator';

export const getAllPlansValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString().isIn(['active', 'expired', 'cancelled']).withMessage('Invalid status'),
  query('sort').optional().isString()
];

export const getMyPlansValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString().isIn(['active', 'expired', 'cancelled']).withMessage('Invalid status'),
  query('sort').optional().isString()
];

export const getResellerPlansValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('status').optional().isString().isIn(['active', 'expired', 'cancelled']).withMessage('Invalid status'),
  query('sort').optional().isString()
];

export const getPlanByIdValidator = [
  param('id').isMongoId().withMessage('Invalid plan ID format')
];

export const toggleAutoRenewValidator = [
  param('id').isMongoId().withMessage('Invalid plan ID format')
];

export const cancelPlanValidator = [
  param('id').isMongoId().withMessage('Invalid plan ID format')
];

export const renewPlanValidator = [
  param('id').isMongoId().withMessage('Invalid plan ID format')
]; 