import Wallet from '../../models/Wallet.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import User from '../../models/User.js';
import { validationResult } from 'express-validator';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError,
  InternalServerError
} from '../../utils/errors.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Get wallet info
 * @route GET /api/v1/wallet/me
 * @access Private
 */
const getWalletInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user_id: userId });
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    // Get recent transactions
    const recentTransactions = await WalletTransaction.find({ wallet_id: wallet._id })
      .sort('-created_at')
      .limit(5);
    
    res.status(200).json({
      status: 'success',
      data: {
        wallet: {
          id: wallet._id,
          balance: wallet.balance,
          currency: wallet.currency,
          locked_amount: wallet.locked_amount,
          available_balance: wallet.balance - wallet.locked_amount,
          last_deposit_at: wallet.last_deposit_at,
          is_active: wallet.is_active,
          created_at: wallet.created_at
        },
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    logger.error(`Error getting wallet info for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get user wallet (admin only)
 * @route GET /api/v1/wallet/user/:userId
 * @access Private (Admin only)
 */
const getUserWallet = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    // Check permissions
    if (req.user.user_level > 1) { // If not admin/manager
      throw new ForbiddenError('Only Admin or Manager can access other users wallets');
    }
    
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user_id: userId });
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    // Get recent transactions
    const recentTransactions = await WalletTransaction.find({ wallet_id: wallet._id })
      .sort('-created_at')
      .limit(10);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        wallet: {
          id: wallet._id,
          balance: wallet.balance,
          currency: wallet.currency,
          locked_amount: wallet.locked_amount,
          available_balance: wallet.balance - wallet.locked_amount,
          last_deposit_at: wallet.last_deposit_at,
          is_active: wallet.is_active,
          created_at: wallet.created_at
        },
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    logger.error(`Error getting wallet for user ${req.params.userId}:`, error);
    next(error);
  }
};

/**
 * Get transactions
 * @route GET /api/v1/wallet/transactions
 * @access Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      type = 'all',
      start_date,
      end_date
    } = req.query;
    
    const userId = req.user.id;
    
    // Get wallet
    const wallet = await Wallet.findOne({ user_id: userId });
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    // Build query
    const query = { wallet_id: wallet._id };
    
    // Filter by type
    if (type !== 'all') {
      query.type = type;
    }
    
    // Filter by date range
    if (start_date || end_date) {
      query.created_at = {};
      if (start_date) {
        query.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        query.created_at.$lte = new Date(end_date);
      }
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    // Get transactions
    const transactions = await WalletTransaction.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await WalletTransaction.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting transactions for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Request deposit
 * @route POST /api/v1/wallet/deposit
 * @access Private
 */
const requestDeposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const { amount, payment_method } = req.body;
    const userId = req.user.id;
    
    // Get wallet
    const wallet = await Wallet.findOne({ user_id: userId }).session(session);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    if (!wallet.is_active) {
      throw new BadRequestError('Wallet is inactive');
    }
    
    // Generate deposit information
    let depositInfo = {};
    
    switch (payment_method) {
      case 'bank_transfer':
        depositInfo = {
          bank_name: 'VPBank',
          account_number: '1234567890',
          account_name: 'Proxy Server JSC',
          reference: `DEP-${userId.toString().substring(0, 6)}`
        };
        break;
      case 'credit_card':
        depositInfo = {
          redirect_url: 'https://payment.proxy-server.com/process'
        };
        break;
      case 'crypto':
        depositInfo = {
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          currency: 'USDT',
          network: 'TRC20'
        };
        break;
      default:
        throw new BadRequestError('Invalid payment method');
    }
    
    // Create pending transaction
    const transaction = new WalletTransaction({
      wallet_id: wallet._id,
      user_id: userId,
      type: 'deposit',
      amount: parseFloat(amount),
      balance_before: wallet.balance,
      balance_after: wallet.balance, // Not updated until confirmed
      currency: wallet.currency,
      status: 'pending',
      description: `Deposit via ${payment_method}`,
      metadata: {
        payment_method,
        deposit_info: depositInfo
      },
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await transaction.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      status: 'success',
      data: {
        transaction,
        deposit_info: depositInfo,
        message: 'Deposit request created successfully. Please complete the payment.'
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error(`Error requesting deposit for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Request withdrawal
 * @route POST /api/v1/wallet/withdraw
 * @access Private
 */
const requestWithdrawal = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const { amount, payment_details } = req.body;
    const userId = req.user.id;
    
    // Get wallet
    const wallet = await Wallet.findOne({ user_id: userId }).session(session);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    if (!wallet.is_active) {
      throw new BadRequestError('Wallet is inactive');
    }
    
    // Check if enough balance
    const withdrawalAmount = parseFloat(amount);
    const availableBalance = wallet.balance - wallet.locked_amount;
    
    if (availableBalance < withdrawalAmount) {
      throw new BadRequestError('Insufficient balance');
    }
    
    // Lock the withdrawal amount
    wallet.locked_amount += withdrawalAmount;
    wallet.updated_at = new Date();
    
    await wallet.save({ session });
    
    // Create pending withdrawal transaction
    const transaction = new WalletTransaction({
      wallet_id: wallet._id,
      user_id: userId,
      type: 'withdrawal',
      amount: -withdrawalAmount, // Negative for withdrawals
      balance_before: wallet.balance,
      balance_after: wallet.balance, // Not updated until confirmed
      currency: wallet.currency,
      status: 'pending',
      description: 'Withdrawal request',
      metadata: {
        payment_details
      },
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await transaction.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      status: 'success',
      data: {
        transaction,
        message: 'Withdrawal request submitted successfully. It will be processed within 24 hours.'
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error(`Error requesting withdrawal for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get wallet stats (admin only)
 * @route GET /api/v1/wallet/stats
 * @access Private (Admin only)
 */
const getWalletStats = async (req, res, next) => {
  try {
    // Check permissions
    if (req.user.user_level > 1) { // If not admin/manager
      throw new ForbiddenError('Only Admin or Manager can access wallet statistics');
    }
    
    // Get total wallets
    const totalWallets = await Wallet.countDocuments();
    
    // Get total balance across all wallets
    const balanceResult = await Wallet.aggregate([
      {
        $group: {
          _id: '$currency',
          total_balance: { $sum: '$balance' },
          total_locked: { $sum: '$locked_amount' }
        }
      }
    ]);
    
    // Get pending transactions
    const pendingDeposits = await WalletTransaction.countDocuments({ 
      type: 'deposit', 
      status: 'pending' 
    });
    
    const pendingWithdrawals = await WalletTransaction.countDocuments({ 
      type: 'withdrawal', 
      status: 'pending' 
    });
    
    // Get transaction stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactionStats = await WalletTransaction.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        total_wallets: totalWallets,
        balance_stats: balanceResult,
        pending_transactions: {
          deposits: pendingDeposits,
          withdrawals: pendingWithdrawals
        },
        transaction_stats: transactionStats
      }
    });
  } catch (error) {
    logger.error('Error getting wallet statistics:', error);
    next(error);
  }
};

export {
  getWalletInfo,
  getUserWallet,
  getTransactions,
  requestDeposit,
  requestWithdrawal,
  getWalletStats
}; 