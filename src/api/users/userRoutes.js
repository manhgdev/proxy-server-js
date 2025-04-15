import express from 'express';
import { body, param, query } from 'express-validator';
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
import UserPlans from '../../models/UserPlans.js';
import Package from '../../models/Package.js';
import { getUserPlans as getUserPlansController } from './userPlansController.js';

const router = express.Router();

// Get all users [Admin/Manager/Reseller]
router.get(
  '/',
  authenticateCombined,
  authorize(['manage_users', 'view_users']),
  [
    query('page').optional().isInt().withMessage('Page must be an integer'),
    query('limit').optional().isInt().withMessage('Limit must be an integer'),
    query('sort').optional().isString(),
    query('search').optional().isString(),
    query('status').optional().isString(),
    query('user_level').optional().isInt().withMessage('User level must be an integer'),
  ],
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
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUser
);

// Create new user (Admin only)
router.post(
  '/',
  authenticateCombined,
  authorize('manage_users'),
  [
    body('username').isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullname').isString().withMessage('Full name is required'),
    body('user_level').isInt({ min: 0, max: 3 }).withMessage('User level must be between 0-3'),
    body('active').optional().isBoolean()
  ],
  createUser
);

// Update user (Admin only)
router.put(
  '/:id',
  authenticateCombined,
  authorize('manage_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  [
    body('username').optional().isString().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('password').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullname').optional().isString(),
    body('user_level').optional().isInt({ min: 0, max: 3 }).withMessage('User level must be between 0-3'),
    body('active').optional().isBoolean()
  ],
  updateUser
);

// Delete user (Admin only)
router.delete(
  '/:id',
  authenticateCombined,
  authorize('manage_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  deleteUser
);

// Update user profile
router.put(
  '/profile/update',
  authenticateCombined,
  [
    body('fullname').optional().isString(),
    body('phone').optional().isString(),
    body('billing_info').optional().isObject(),
    body('billing_info.address').optional().isString(),
    body('billing_info.city').optional().isString(),
    body('billing_info.country').optional().isString(),
    body('billing_info.tax_id').optional().isString(),
    body('billing_info.company').optional().isString()
  ],
  updateUserProfile
);

// Get user plans
router.get(
  '/:id/plans',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUserPlans
);

// Get user roles
router.get(
  '/:id/roles',
  authenticateCombined,
  checkResourceAccess,
  authorize(['manage_users', 'view_users']),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUserRoles
);

// Get user permissions
router.get(
  '/:id/permissions',
  authenticateCombined,
  checkResourceAccess,
  authorize(['manage_users', 'view_users']),
  param('id').isMongoId().withMessage('Invalid user ID format'),
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
router.get('/me/orders', authenticateCombined, async (req, res, next) => {
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
router.get('/me/orders/:orderId', authenticateCombined, async (req, res, next) => {
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

// Dùng route đơn giản nhưng an toàn để lấy plans của người dùng hiện tại
router.get('/plans/my', authenticateCombined, getUserPlansController);

export default router; 