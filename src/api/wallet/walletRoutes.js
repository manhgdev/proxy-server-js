import express from 'express';
import {
  getWalletInfo,
  getTransactions,
  requestDeposit,
  requestWithdrawal,
  getUserWallet,
  getWalletStats
} from './walletController.js';
import { authenticateCombined, checkResourceAccess, authorize } from '../../middlewares/auth.js';
import {
  getUserWalletValidator,
  getTransactionsValidator,
  requestDepositValidator,
  requestWithdrawalValidator
} from './walletValidators.js';

const router = express.Router();

// Get my wallet info
router.get(
  '/me',
  authenticateCombined,
  getWalletInfo
);

// Get user wallet (admin only)
router.get(
  '/user/:userId',
  authenticateCombined,
  checkResourceAccess,
  authorize('manage_finances'),
  getUserWalletValidator,
  getUserWallet
);

// Get my transactions
router.get(
  '/transactions',
  authenticateCombined,
  getTransactionsValidator,
  getTransactions
);

// Request deposit
router.post(
  '/deposit',
  authenticateCombined,
  requestDepositValidator,
  requestDeposit
);

// Request withdrawal
router.post(
  '/withdraw',
  authenticateCombined,
  requestWithdrawalValidator,
  requestWithdrawal
);

// Get wallet stats (admin only)
router.get(
  '/stats',
  authenticateCombined,
  authorize('manage_finances'),
  getWalletStats
);

export default router;
