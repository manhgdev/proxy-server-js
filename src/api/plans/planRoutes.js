import express from 'express';
import {
  getUserPlans as getAllPlans,
  getUserPlans as getMyPlans,
  getUserPlans as getResellerPlans,
  getUserPlanById as getPlanById,
  toggleAutoRenew,
  renewPlan,
  toggleAutoRenew as cancelPlan
} from './plansController.js';
import { authenticateCombined, checkResourceAccess, authorize } from '../../middlewares/auth.js';
import {
  getAllPlansValidator,
  getMyPlansValidator,
  getResellerPlansValidator,
  getPlanByIdValidator,
  toggleAutoRenewValidator,
  cancelPlanValidator,
  renewPlanValidator
} from './planValidators.js';

const router = express.Router();

// Get all plans (Admin only)
router.get(
  '/',
  authenticateCombined,
  authorize(['manage_orders', 'view_orders']),
  getAllPlansValidator,
  getAllPlans
);

// Get my plans - Đặt route này trước các route có tham số
router.get(
  '/my',
  authenticateCombined,
  getMyPlansValidator,
  getMyPlans
);

// Get reseller plans
router.get(
  '/reseller',
  authenticateCombined,
  authorize('reseller'),
  getResellerPlansValidator,
  getResellerPlans
);

// Get plan by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  getPlanByIdValidator,
  getPlanById
);

// Toggle auto-renew
router.post(
  '/:id/toggle-auto-renew',
  authenticateCombined,
  checkResourceAccess,
  toggleAutoRenewValidator,
  toggleAutoRenew
);

// Cancel plan
router.post(
  '/:id/cancel',
  authenticateCombined,
  checkResourceAccess,
  cancelPlanValidator,
  cancelPlan
);

// Renew plan
router.post(
  '/:id/renew',
  authenticateCombined,
  checkResourceAccess,
  renewPlanValidator,
  renewPlan
);

export default router;
