import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getResellerProfile,
  updateResellerProfile,
  getResellerCustomers,
  createCustomer,
  getCommissionHistory as getCommissions,
  requestWithdrawal,
  getResellerStats
} from './resellerController.js';
import { authenticateCombined, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get reseller profile
router.get(
  '/profile',
  authenticateCombined,
  authorize('reseller'),
  getResellerProfile
);

// Update reseller profile
router.patch(
  '/profile',
  authenticateCombined,
  authorize('reseller'),
  [
    body('payment_details').optional().isObject(),
    body('payment_details.bank_name').optional().isString(),
    body('payment_details.account_number').optional().isString(),
    body('payment_details.account_name').optional().isString(),
    body('company_name').optional().isString(),
    body('company_address').optional().isString(),
    body('tax_id').optional().isString()
  ],
  updateResellerProfile
);

// Get reseller customers
router.get(
  '/customers',
  authenticateCombined,
  authorize('reseller'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('search').optional().isString(),
    query('status').optional().isString().isIn(['active', 'inactive']).withMessage('Invalid status'),
    query('sort').optional().isString()
  ],
  getResellerCustomers
);

// Create customer (Reseller only)
router.post(
  '/customers',
  authenticateCombined,
  authorize('reseller'),
  [
    body('username').isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullname').isString().withMessage('Full name is required'),
    body('phone').optional().isString()
  ],
  createCustomer
);

// Get commission history
router.get(
  '/commissions',
  authenticateCombined,
  authorize('reseller'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('sort').optional().isString(),
    query('from').optional().isISO8601().withMessage('From date must be in ISO format'),
    query('to').optional().isISO8601().withMessage('To date must be in ISO format')
  ],
  getCommissions
);

// Request commission withdrawal
router.post(
  '/withdraw',
  authenticateCombined,
  authorize('reseller'),
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('bank_info').isObject().withMessage('Bank information is required'),
    body('bank_info.bank_name').isString().withMessage('Bank name is required'),
    body('bank_info.account_number').isString().withMessage('Account number is required'),
    body('bank_info.account_name').isString().withMessage('Account name is required')
  ],
  requestWithdrawal
);

// Get reseller stats
router.get(
  '/stats',
  authenticateCombined,
  authorize('reseller'),
  getResellerStats
);

export default router;
