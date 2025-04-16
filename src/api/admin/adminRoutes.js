import express from 'express';
import { authenticateCombined, authorize } from '../../middlewares/auth.js';
import { body, param, query } from 'express-validator';
import { getDashboardSummary as getDashboard, getDashboardRevenue, getRevenueChart, getNewUsersStats } from './dashboardController.js';
import { 
  getAllRoles as getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} from './roleController.js';
import { 
  getAllPermissions as getPermissions, 
  getPermissionById, 
  createPermission, 
  updatePermission, 
  deletePermission,
  getPermissionGroups
} from './permissionController.js';
import {
  getPermissionsByRoleId,
  assignPermissionToRole as createRolePermission,
  removePermissionFromRole as deleteRolePermission,
  updateRolePermissions
} from './rolePermissionController.js';
import {
  getRolesByUserId,
  assignRoleToUser as createUserRole,
  removeRoleFromUser as deleteUserRole,
  updateUserRoles
} from './userRoleController.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import Wallet from '../../models/Wallet.js';
import User from '../../models/User.js';
import mongoose from 'mongoose';
import Role from '../../models/Role.js';
import UserRole from '../../models/UserRole.js';
import ResellerDetails from '../../models/ResellerDetails.js';
import Proxy from '../../models/Proxy.js';
import ProxyService from '../../services/proxyService.js';

const router = express.Router();

// Dashboard
router.get(
  '/dashboard',
  authenticateCombined,
  authorize(['admin']),
  getDashboard
);

// Role Management
router.get(
  '/roles',
  authenticateCombined,
  authorize(['admin']),
  getRoles
);

router.get(
  '/roles/:id',
  authenticateCombined,
  authorize(['admin']),
  param('id').isMongoId().withMessage('Invalid role ID format'),
  getRoleById
);

router.post(
  '/roles',
  authenticateCombined,
  authorize(['admin']),
  [
    body('name').isString().withMessage('Name is required'),
    body('description').isString().withMessage('Description is required'),
    body('level').isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
    body('is_admin').isBoolean().withMessage('is_admin flag is required'),
    body('is_reseller').isBoolean().withMessage('is_reseller flag is required')
  ],
  createRole
);

router.put(
  '/roles/:id',
  authenticateCombined,
  authorize(['admin']),
  param('id').isMongoId().withMessage('Invalid role ID format'),
  [
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('level').optional().isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
    body('is_admin').optional().isBoolean(),
    body('is_reseller').optional().isBoolean()
  ],
  updateRole
);

router.delete(
  '/roles/:id',
  authenticateCombined,
  authorize(['admin']),
  param('id').isMongoId().withMessage('Invalid role ID format'),
  deleteRole
);

// Permission Management
router.get(
  '/permissions',
  authenticateCombined,
  authorize(['admin']),
  getPermissions
);

router.get(
  '/permissions/groups',
  authenticateCombined,
  authorize(['admin']),
  getPermissionGroups
);

// Role-Permission Management
router.post(
  '/role-permissions',
  authenticateCombined,
  authorize(['admin']),
  [
    body('role_id').isMongoId().withMessage('Invalid role ID format'),
    body('permission_id').isMongoId().withMessage('Invalid permission ID format')
  ],
  createRolePermission
);

router.delete(
  '/role-permissions/:roleId/:permissionId',
  authenticateCombined,
  authorize(['admin']),
  param('roleId').isMongoId().withMessage('Invalid role ID format'),
  param('permissionId').isMongoId().withMessage('Invalid permission ID format'),
  deleteRolePermission
);

// User-Role Management
router.post(
  '/user-roles',
  authenticateCombined,
  authorize(['admin']),
  [
    body('user_id').isMongoId().withMessage('Invalid user ID format'),
    body('role_id').isMongoId().withMessage('Invalid role ID format')
  ],
  createUserRole
);

router.delete(
  '/user-roles/:userId/:roleId',
  authenticateCombined,
  authorize(['admin']),
  param('userId').isMongoId().withMessage('Invalid user ID format'),
  param('roleId').isMongoId().withMessage('Invalid role ID format'),
  deleteUserRole
);

// Reports
router.get(
  '/reports/revenue',
  authenticateCombined,
  authorize(['admin']),
  [
    query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('interval').optional().isString().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid interval')
  ],
  getDashboardRevenue
);

router.get(
  '/reports/users',
  authenticateCombined,
  authorize(['admin']),
  [
    query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date')
  ],
  getNewUsersStats
);

router.get(
  '/reports/orders',
  authenticateCombined,
  authorize(['admin']),
  [
    query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('status').optional().isString()
  ],
  getRevenueChart
);

// Admin list all proxies
router.get(
  '/proxies',
  authenticateCombined,
  authorize(['admin']),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type, status } = req.query;
      
      // Create query object
      const query = {};
      
      // Filter by type if specified
      if (type) {
        query.type = type;
      }
      
      // Filter by status if specified
      if (status) {
        query.status = status;
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get all proxies
      const proxies = await Proxy.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Count total proxies
      const total = await Proxy.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        data: {
          proxies,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Admin get all proxies error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error, please try again later',
        error: error.message
      });
    }
  }
);

// Admin update proxy
router.put(
  '/proxies/:id',
  authenticateCombined,
  authorize(['admin']),
  [
    param('id').isMongoId().withMessage('Invalid proxy ID format'),
    body('ip').optional().isIP().withMessage('Invalid IP format'),
    body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1-65535'),
    body('username').optional().isString(),
    body('password').optional().isString(),
    body('protocol').optional().isIn(['http', 'https', 'socks5']).withMessage('Invalid protocol'),
    body('type').optional().isString(),
    body('status').optional().isString(),
    body('country').optional().isString().isLength({ min: 2, max: 2 }).withMessage('Country must be ISO code')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if proxy exists
      const proxy = await Proxy.findById(id);
      if (!proxy) {
        return res.status(404).json({
          success: false,
          message: 'Proxy not found'
        });
      }
      
      // Update proxy fields
      const updateData = req.body;
      
      // Only allow updating specific fields
      const allowedFields = ['ip', 'port', 'username', 'password', 'protocol', 'type', 'status', 'country', 'city', 'region', 'isp', 'host'];
      Object.keys(updateData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });
      
      // Add updated_at timestamp
      updateData.updated_at = new Date();
      
      // Update the proxy
      const updatedProxy = await Proxy.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Proxy updated successfully',
        data: updatedProxy
      });
    } catch (error) {
      console.error('Admin update proxy error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error, please try again later',
        error: error.message
      });
    }
  }
);

// Admin delete proxy
router.delete(
  '/proxies/:id',
  authenticateCombined,
  authorize(['admin']),
  [
    param('id').isMongoId().withMessage('Invalid proxy ID format')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if proxy exists
      const proxy = await Proxy.findById(id);
      if (!proxy) {
        return res.status(404).json({
          success: false,
          message: 'Proxy not found'
        });
      }
      
      // Delete the proxy
      await Proxy.findByIdAndDelete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Proxy deleted successfully'
      });
    } catch (error) {
      console.error('Admin delete proxy error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error, please try again later',
        error: error.message
      });
    }
  }
);

// Admin rotate proxy
router.post(
  '/proxies/:id/rotate',
  authenticateCombined,
  authorize(['admin']),
  [
    param('id').isMongoId().withMessage('Invalid proxy ID format')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if proxy exists
      const proxy = await Proxy.findById(id);
      if (!proxy) {
        return res.status(404).json({
          success: false,
          message: 'Proxy not found'
        });
      }
      
      // Call the proxy service to rotate the proxy
      const rotationResult = await ProxyService.rotateProxy(id);
      
      return res.status(200).json({
        success: true,
        message: 'Proxy rotated successfully',
        data: rotationResult
      });
    } catch (error) {
      console.error('Admin rotate proxy error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error, please try again later',
        error: error.message
      });
    }
  }
);

// Admin check proxy
router.get(
  '/proxies/:id/check',
  authenticateCombined,
  authorize(['admin']),
  [
    param('id').isMongoId().withMessage('Invalid proxy ID format')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if proxy exists
      const proxy = await Proxy.findById(id);
      if (!proxy) {
        return res.status(404).json({
          success: false,
          message: 'Proxy not found'
        });
      }
      
      // Call the proxy service to check the proxy
      const checkResult = await ProxyService.checkProxy(id);
      
      // Update the proxy with check results
      proxy.health_status = {
        last_check: new Date(),
        response_time: checkResult.responseTime || 0,
        success_rate: checkResult.successRate || 0,
        error_message: checkResult.error || null
      };
      
      await proxy.save();
      
      return res.status(200).json({
        success: true,
        message: 'Proxy check completed',
        data: {
          isWorking: checkResult.isWorking,
          responseTime: checkResult.responseTime,
          successRate: checkResult.successRate,
          error: checkResult.error
        }
      });
    } catch (error) {
      console.error('Admin check proxy error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error, please try again later',
        error: error.message
      });
    }
  }
);

// Admin credit user wallet
router.post(
  '/wallet/credit',
  authenticateCombined,
  authorize(['admin']),
  [
    body('user_id').isMongoId().withMessage('Invalid user ID format'),
    body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 10000 }).withMessage('Minimum credit amount is 10,000'),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
  ],
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { user_id, amount, notes } = req.body;
      
      // Check if user exists
      const user = await User.findById(user_id).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      // Get wallet
      const wallet = await Wallet.findOne({ user_id: user_id }).session(session);
      if (!wallet) {
        // Create new wallet if not exists
        const newWallet = new Wallet({
          user_id: user_id,
          balance: 0,
          currency: 'VND',
          locked_amount: 0,
          is_active: true
        });
        await newWallet.save({ session });
        
        // Add transaction data
        const transactionData = {
          wallet_id: newWallet._id,
          user_id: user_id,
          type: 'deposit',
          amount: amount,
          balance_before: 0,
          balance_after: amount,
          currency: 'VND',
          description: 'Admin credit - Initial deposit',
          status: 'completed',
          metadata: {
            payment_method: 'admin',
            admin_id: req.user.id,
            notes: notes || 'Credit by admin'
          },
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // Create transaction with wallet update
        const transaction = await WalletTransaction.createTransaction(transactionData, session);
        
        // Commit transaction
        await session.commitTransaction();
        session.endSession();
        
        return res.status(200).json({
          status: 'success',
          message: 'Wallet created and credited successfully',
          data: {
            transaction_id: transaction._id,
            wallet_id: newWallet._id,
            user_id: user_id,
            amount: amount,
            new_balance: amount
          }
        });
      }
      
      // Add transaction data
      const transactionData = {
        wallet_id: wallet._id,
        user_id: user_id,
        type: 'deposit',
        amount: amount,
        balance_before: wallet.balance,
        balance_after: wallet.balance + amount,
        currency: wallet.currency,
        description: 'Admin credit',
        status: 'completed',
        metadata: {
          payment_method: 'admin',
          admin_id: req.user.id,
          notes: notes || 'Credit by admin'
        },
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Create transaction with wallet update
      const transaction = await WalletTransaction.createTransaction(transactionData, session);
      
      // Commit transaction
      await session.commitTransaction();
      session.endSession();
      
      return res.status(200).json({
        status: 'success',
        message: 'Wallet credited successfully',
        data: {
          transaction_id: transaction._id,
          wallet_id: wallet._id,
          user_id: user_id,
          amount: amount,
          new_balance: wallet.balance
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      console.error('Error crediting wallet:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error crediting wallet',
        error: error.message
      });
    }
  }
);

// Thêm endpoint để xem danh sách đại lý
router.get(
  '/resellers',
  authenticateCombined,
  authorize(['admin']),
  async (req, res, next) => {
    try {
      const resellerRole = await Role.findOne({ name: "Reseller" });
      
      if (!resellerRole) {
        return res.status(404).json({
          status: 'error',
          message: 'Vai trò đại lý không tồn tại'
        });
      }
      
      const userRoles = await UserRole.find({ role_id: resellerRole._id });
      const resellerIds = userRoles.map(ur => ur.user_id);
      
      const resellers = await User.find({ _id: { $in: resellerIds } })
        .select('_id username email fullname phone active created_at');
        
      // Lấy thêm thông tin chi tiết về đại lý nếu có
      const resellerDetails = await ResellerDetails.find({ 
        user_id: { $in: resellerIds } 
      });
      
      const resultData = resellers.map(reseller => {
        const details = resellerDetails.find(
          rd => rd.user_id.toString() === reseller._id.toString()
        );
        
        return {
          ...reseller.toObject(),
          commission_rate: details ? details.commission_rate : null,
          downline_count: details ? details.downline_count : 0,
          total_sales: details ? details.total_sales : 0
        };
      });
      
      return res.status(200).json({
        status: 'success',
        data: resultData
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
