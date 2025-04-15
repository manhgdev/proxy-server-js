import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllOrders as getOrders,
  getOrderById,
  getMyOrders,
  getResellerOrders,
  createOrder,
  cancelOrder,
  getOrderItems
} from './orderController.js';
import { authenticateCombined, checkResourceAccess, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get all orders (Admin only)
router.get(
  '/',
  authenticateCombined,
  authorize(['manage_orders', 'view_orders']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString(),
    query('sort').optional().isString(),
    query('from').optional().isISO8601().withMessage('From date must be in ISO format'),
    query('to').optional().isISO8601().withMessage('To date must be in ISO format')
  ],
  getOrders
);

// Get my orders
router.get(
  '/my',
  authenticateCombined,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString(),
    query('sort').optional().isString()
  ],
  getMyOrders
);

// Get reseller orders
router.get(
  '/reseller',
  authenticateCombined,
  authorize('reseller'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString(),
    query('sort').optional().isString()
  ],
  getResellerOrders
);

// Get order by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  getOrderById
);

// Get order items
router.get(
  '/:id/items',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  getOrderItems
);

// Create new order
router.post(
  '/',
  authenticateCombined,
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.package_id').isMongoId().withMessage('Invalid package ID format'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('items.*.custom_config').optional().isObject(),
    body('payment_method').isString().isIn(['wallet', 'credit_card', 'crypto']).withMessage('Invalid payment method'),
    body('discount_code').optional().isString(),
    body('customer_notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
  ],
  createOrder
);

// Cancel order
router.post(
  '/:id/cancel',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  cancelOrder
);

export default router;
