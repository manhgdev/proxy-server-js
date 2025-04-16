import express from 'express';
import {
  getAllUsers as getUsers,
  getUserById as getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile as updateUserProfile,
  getUserPlans,
  getUserRoles,
  getUserPermissions
} from './userController.js';
import { authenticateCombined, checkResourceAccess, authorize } from '../../middlewares/auth.js';
import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import {
  getAllUsersValidator,
  getUserByIdValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateProfileValidator,
  getUserOrdersValidator,
  getUserOrderByIdValidator
} from './userValidators.js';

const router = express.Router();

// Get all users [Admin/Manager/Reseller]
router.get(
  '/',
  authenticateCombined,
  authorize(['manage_users', 'view_users']),
  getAllUsersValidator,
  getUsers
);

// Search users
router.get(
  '/search',
  authenticateCombined,
  authorize(['manage_users', 'view_users']),
  getUsers
);

// Get user by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  authorize(['manage_users', 'view_users']),
  getUserByIdValidator,
  getUser
);

// Create new user (Admin only)
router.post(
  '/',
  authenticateCombined,
  authorize('manage_users'),
  createUserValidator,
  createUser
);

// Update user (Admin only)
router.put(
  '/:id',
  authenticateCombined,
  authorize('manage_users'),
  updateUserValidator,
  updateUser
);

// Delete user (Admin only)
router.delete(
  '/:id',
  authenticateCombined,
  authorize('manage_users'),
  deleteUserValidator,
  deleteUser
);

// Update user profile
router.put(
  '/profile/update',
  authenticateCombined,
  updateProfileValidator,
  updateUserProfile
);

// Get user plans
router.get(
  '/:id/plans',
  authenticateCombined,
  checkResourceAccess,
  getUserByIdValidator,
  getUserPlans
);

// Get user roles
router.get(
  '/:id/roles',
  authenticateCombined,
  checkResourceAccess,
  authorize(['manage_users', 'view_users']),
  getUserByIdValidator,
  getUserRoles
);

// Get user permissions
router.get(
  '/:id/permissions',
  authenticateCombined,
  checkResourceAccess,
  authorize(['manage_users', 'view_users']),
  getUserByIdValidator,
  getUserPermissions
);

// Get user's API key
router.get(
  '/me/api-key',
  authenticateCombined,
  (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        api_key: req.user.api_key || null
      }
    });
  }
);

// Generate new API key for user
router.post(
  '/me/api-key',
  authenticateCombined,
  (req, res) => {
    const crypto = require('crypto');
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    res.status(200).json({
      status: 'success',
      data: {
        api_key: apiKey
      },
      message: 'New API key generated successfully'
    });
  }
);

// Lấy danh sách đơn hàng của người dùng hiện tại
router.get('/me/orders', authenticateCombined, getUserOrdersValidator, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments({ user_id: userId });
    const pages = Math.ceil(total / limit);
    
    return res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Lấy chi tiết đơn hàng của người dùng hiện tại
router.get('/me/orders/:orderId', authenticateCombined, getUserOrderByIdValidator, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId,
      user_id: userId 
    });
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy đơn hàng',
        errors: []
      });
    }
    
    const orderItems = await OrderItem.find({ order_id: orderId });
    
    return res.status(200).json({
      status: 'success',
      data: {
        order,
        items: orderItems
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router; 