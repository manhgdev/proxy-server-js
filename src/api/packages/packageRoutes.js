import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getActivePackages
} from './packageController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get all packages (admin & reseller)
router.get(
  '/',
  authenticate,
  getAllPackages
);

// Get active packages (for public listing)
router.get(
  '/active',
  getActivePackages
);

// Get package by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid package ID format'),
  getPackageById
);

// Create new package (admin only)
router.post(
  '/',
  authenticate,
  authorize('manage_proxies'),
  [
    body('name').isString().notEmpty().withMessage('Package name is required'),
    body('description').isString().withMessage('Description must be a string'),
    body('type').isString().isIn(['static', 'rotating', 'bandwidth']).withMessage('Type must be static, rotating, or bandwidth'),
    body('category').isString().isIn(['datacenter', 'residential', 'mobile']).withMessage('Category must be datacenter, residential, or mobile'),
    body('protocol').isString().isIn(['http', 'https', 'socks5']).withMessage('Protocol must be http, https, or socks5'),
    body('is_rotating').isBoolean().withMessage('is_rotating must be a boolean'),
    body('is_bandwidth').isBoolean().withMessage('is_bandwidth must be a boolean'),
    body('duration_days').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('price_tiers').isArray().withMessage('Price tiers must be an array'),
    body('allowed_countries').isArray().withMessage('Allowed countries must be an array'),
    body('allowed_isps').isArray().withMessage('Allowed ISPs must be an array'),
    body('features').isArray().withMessage('Features must be an array'),
    body('active').isBoolean().withMessage('active must be a boolean')
  ],
  createPackage
);

// Update package (admin only)
router.put(
  '/:id',
  authenticate,
  authorize('manage_proxies'),
  param('id').isMongoId().withMessage('Invalid package ID format'),
  [
    body('name').optional().isString().notEmpty().withMessage('Package name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('price_tiers').optional().isArray().withMessage('Price tiers must be an array'),
    body('allowed_countries').optional().isArray().withMessage('Allowed countries must be an array'),
    body('allowed_isps').optional().isArray().withMessage('Allowed ISPs must be an array'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('active').optional().isBoolean().withMessage('active must be a boolean')
  ],
  updatePackage
);

// Delete package (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('manage_proxies'),
  param('id').isMongoId().withMessage('Invalid package ID format'),
  deletePackage
);

export default router;
