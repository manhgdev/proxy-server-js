import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllPlans,
  getPlanById,
  getMyPlans,
  toggleAutoRenew,
  cancelPlan,
  renewPlan,
  getResellerPlans
} from './planController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get all plans (admin only)
router.get(
  '/',
  authenticate,
  authorize('manage_proxies', 'view_proxies'),
  getAllPlans
);

// Get my plans
router.get(
  '/my',
  authenticate,
  getMyPlans
);

// Get reseller's customers plans
router.get(
  '/reseller',
  authenticate,
  authorize('view_proxies'),
  getResellerPlans
);

// Get plan by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  getPlanById
);

// Toggle auto-renew for a plan
router.post(
  '/:id/toggle-auto-renew',
  authenticate,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  toggleAutoRenew
);

// Cancel plan
router.post(
  '/:id/cancel',
  authenticate,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  cancelPlan
);

// Renew plan
router.post(
  '/:id/renew',
  authenticate,
  param('id').isMongoId().withMessage('Invalid plan ID format'),
  renewPlan
);

export default router;
