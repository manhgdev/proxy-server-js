import express from 'express';
import {
  getResellerProfile as getProfile,
  updateResellerProfile as updateProfile,
  getResellerCustomers as getCustomers,
  createCustomer,
  getCommissionHistory as getCommissions,
  requestWithdrawal,
  getResellerStats as getStats
} from './resellerController.js';
import { authenticateCombined, authorize } from '../../middlewares/auth.js';
import { 
  updateProfileValidators, 
  getCustomersValidators, 
  createCustomerValidators, 
  getCommissionsValidators, 
  withdrawalValidators 
} from './resellerValidators.js';

const router = express.Router();

// Apply reseller role check to all routes
router.use(authenticateCombined, authorize('reseller'));

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfileValidators, updateProfile);

// Customer management
router.get('/customers', getCustomersValidators, getCustomers);
router.post('/customers', createCustomerValidators, createCustomer);

// Commission routes
router.get('/commissions', getCommissionsValidators, getCommissions);
router.post('/withdraw', withdrawalValidators, requestWithdrawal);

// Statistics route
router.get('/stats', getStats);

export default router;
