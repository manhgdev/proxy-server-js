import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllPlans,
  getMyPlans,
  getResellerPlans,
  getPlanById,
  toggleAutoRenew,
  cancelPlan,
  renewPlan
} from './planController.js';
import { authenticateCombined, checkResourceAccess, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get all plans (Admin only)
router.get(
  '/',
  authenticateCombined,
  authorize(['manage_orders', 'view_orders']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString().isIn(['active', 'expired', 'cancelled']).withMessage('Invalid status'),
    query('sort').optional().isString()
  ],
  getAllPlans
);

// Get my plans - Đặt route này trước các route có tham số
router.get(
  '/user-plans',
  authenticateCombined,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString().isIn(['active', 'expired', 'cancelled']).withMessage('Invalid status'),
    query('sort').optional().isString()
  ],
  getMyPlans
);

// Get reseller plans
router.get(
  '/reseller',
  authenticateCombined,
  authorize('reseller'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString().isIn(['active', 'expired', 'cancelled']).withMessage('Invalid status'),
    query('sort').optional().isString()
  ],
  getResellerPlans
);

// Get plan by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  getPlanById
);

// Toggle auto-renew
router.post(
  '/:id/toggle-auto-renew',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  toggleAutoRenew
);

// Cancel plan
router.post(
  '/:id/cancel',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  cancelPlan
);

// Renew plan
router.post(
  '/:id/renew',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  renewPlan
);

export default router;
