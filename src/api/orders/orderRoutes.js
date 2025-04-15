import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  getMyOrders,
  cancelOrder,
  getOrderItems,
  getResellerOrders
} from './orderController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get all orders (admin only)
router.get(
  '/',
  authenticate,
  authorize('manage_orders', 'view_orders'),
  getAllOrders
);

// Get my orders
router.get(
  '/my',
  authenticate,
  getMyOrders
);

// Get orders for a reseller
router.get(
  '/reseller',
  authenticate,
  authorize('view_orders'),
  getResellerOrders
);

// Get order by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  getOrderById
);

// Get order items for an order
router.get(
  '/:id/items',
  authenticate,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  getOrderItems
);

// Create new order
router.post(
  '/',
  authenticate,
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.package_id').isMongoId().withMessage('Invalid package ID format'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.custom_config').optional().isObject().withMessage('Custom config must be an object'),
    body('payment_method').isString().isIn(['wallet', 'credit_card', 'bank_transfer', 'crypto']).withMessage('Invalid payment method')
  ],
  createOrder
);

// Cancel order
router.post(
  '/:id/cancel',
  authenticate,
  param('id').isMongoId().withMessage('Invalid order ID format'),
  cancelOrder
);

export default router;
