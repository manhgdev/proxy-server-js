import express from 'express';
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
import {
  getAllOrdersValidator,
  getMyOrdersValidator,
  getResellerOrdersValidator,
  getOrderByIdValidator,
  getOrderItemsValidator,
  createOrderValidator,
  cancelOrderValidator
} from './orderValidators.js';

const router = express.Router();

// Get all orders (Admin only)
router.get(
  '/',
  authenticateCombined,
  authorize(['manage_orders', 'view_orders']),
  getAllOrdersValidator,
  getOrders
);

// Get my orders
router.get(
  '/my',
  authenticateCombined,
  getMyOrdersValidator,
  getMyOrders
);

// Get reseller orders
router.get(
  '/reseller',
  authenticateCombined,
  authorize('reseller'),
  getResellerOrdersValidator,
  getResellerOrders
);

// Get order by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  getOrderByIdValidator,
  getOrderById
);

// Get order items
router.get(
  '/:id/items',
  authenticateCombined,
  checkResourceAccess,
  getOrderItemsValidator,
  getOrderItems
);

// Create new order
router.post(
  '/',
  authenticateCombined,
  createOrderValidator,
  createOrder
);

// Cancel order
router.post(
  '/:id/cancel',
  authenticateCombined,
  checkResourceAccess,
  cancelOrderValidator,
  cancelOrder
);

export default router;
