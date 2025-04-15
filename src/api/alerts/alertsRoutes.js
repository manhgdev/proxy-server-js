import express from 'express';
import { param, query } from 'express-validator';
import {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  deleteAllAlerts
} from './alertsController.js';
import { authenticateCombined } from '../../middlewares/auth.js';

const router = express.Router();

// Get all alerts for user
router.get(
  '/',
  authenticateCombined,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('read').optional().isBoolean().withMessage('Read status must be a boolean'),
    query('type').optional().isString()
  ],
  getAlerts
);

// Mark alert as read
router.patch(
  '/:id/read',
  authenticateCombined,
  param('id').isMongoId().withMessage('Invalid alert ID format'),
  markAlertAsRead
);

// Mark all alerts as read
router.patch(
  '/read-all',
  authenticateCombined,
  markAllAlertsAsRead
);

// Delete an alert
router.delete(
  '/:id',
  authenticateCombined,
  param('id').isMongoId().withMessage('Invalid alert ID format'),
  deleteAlert
);

// Delete all alerts
router.delete(
  '/delete-all',
  authenticateCombined,
  deleteAllAlerts
);

export default router; 