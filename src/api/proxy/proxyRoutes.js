import express from 'express';
import { authenticateCombined, checkResourceAccess, authorize } from '../../middlewares/auth.js';
import { body, param, query } from 'express-validator';
import {
  getUserProxies as getProxies,
  getProxyById,
  rotateProxy,
  checkProxyStatus,
  updateProxySettings
} from './proxyController.js';

const router = express.Router();

// Get all proxies
router.get(
  '/',
  authenticateCombined,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isString().isIn(['active', 'inactive', 'expired']).withMessage('Invalid status'),
    query('type').optional().isString().isIn(['static', 'rotating', 'bandwidth']).withMessage('Invalid type'),
    query('country').optional().isString(),
    query('sort').optional().isString()
  ],
  getProxies
);

// Get proxy by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid proxy ID format'),
  getProxyById
);

// Rotate proxy
router.post(
  '/:id/rotate',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid proxy ID format'),
  rotateProxy
);

// Check proxy status
router.get(
  '/:id/status',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid proxy ID format'),
  checkProxyStatus
);

// Update proxy settings
router.patch(
  '/:id/settings',
  authenticateCombined,
  checkResourceAccess,
  param('id').isMongoId().withMessage('Invalid proxy ID format'),
  [
    body('username').optional().isString(),
    body('password').optional().isString(),
    body('rotation_interval').optional().isInt({ min: 0 }).withMessage('Rotation interval must be non-negative'),
    body('sticky_session').optional().isBoolean(),
    body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
  ],
  updateProxySettings
);

export default router;