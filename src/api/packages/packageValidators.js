import { body, param, query } from 'express-validator';

export const getAllPackagesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  query('category').optional().isString(),
  query('type').optional().isString()
];

export const getPackageByIdValidator = [
  param('id').isMongoId().withMessage('Invalid package ID format')
];

export const createPackageValidator = [
  body('name').isString().withMessage('Name is required'),
  body('description').isString().withMessage('Description is required'),
  body('type').isString().isIn(['static', 'rotating', 'bandwidth']).withMessage('Invalid package type'),
  body('category').isString().isIn(['residential', 'datacenter', 'mobile', 'isp']).withMessage('Invalid package category'),
  body('protocol').isString().isIn(['http', 'https', 'socks5']).withMessage('Invalid protocol'),
  body('is_rotating').isBoolean().withMessage('is_rotating flag is required'),
  body('is_bandwidth').isBoolean().withMessage('is_bandwidth flag is required'),
  body('duration_days').isInt({ min: 1 }).withMessage('Duration days must be a positive integer'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('price_tiers').isArray().withMessage('Price tiers must be an array'),
  body('price_tiers.*.min_quantity').isInt({ min: 1 }).withMessage('Min quantity must be a positive integer'),
  body('price_tiers.*.price_per_unit').isNumeric().withMessage('Price per unit must be a number'),
  body('allowed_countries').optional().isArray().withMessage('Allowed countries must be an array'),
  body('allowed_isps').optional().isArray().withMessage('Allowed ISPs must be an array'),
  body('features').optional().isArray().withMessage('Features must be an array'),
  body('min_quantity').optional().isInt({ min: 1 }).withMessage('Min quantity must be a positive integer'),
  body('max_quantity').optional().isInt({ min: 1 }).withMessage('Max quantity must be a positive integer'),
  body('bandwidth_gb').optional().isNumeric().withMessage('Bandwidth GB must be a number'),
  body('bandwidth_price_per_gb').optional().isNumeric().withMessage('Bandwidth price per GB must be a number'),
  body('active').isBoolean().withMessage('Active flag is required')
];

export const updatePackageValidator = [
  param('id').isMongoId().withMessage('Invalid package ID format'),
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('price_tiers').optional().isArray().withMessage('Price tiers must be an array'),
  body('price_tiers.*.min_quantity').optional().isInt({ min: 1 }).withMessage('Min quantity must be a positive integer'),
  body('price_tiers.*.price_per_unit').optional().isNumeric().withMessage('Price per unit must be a number'),
  body('allowed_countries').optional().isArray(),
  body('allowed_isps').optional().isArray(),
  body('features').optional().isArray(),
  body('active').optional().isBoolean()
];

export const deletePackageValidator = [
  param('id').isMongoId().withMessage('Invalid package ID format')
]; 