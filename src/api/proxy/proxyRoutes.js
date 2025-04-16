import express from 'express';
import { authenticateCombined, checkResourceAccess } from '../../middlewares/auth.js';
import {
  getUserProxies as getProxies,
  getProxyById,
  rotateProxy,
  checkProxyStatus,
  updateProxySettings
} from './proxyController.js';
import {
  getAllProxiesValidator,
  getProxyByIdValidator,
  rotateProxyValidator,
  checkProxyStatusValidator,
  updateProxySettingsValidator
} from './proxyValidators.js';

const router = express.Router();

// Get all proxies
router.get(
  '/',
  authenticateCombined,
  getAllProxiesValidator,
  getProxies
);

// Get proxy by ID
router.get(
  '/:id',
  authenticateCombined,
  checkResourceAccess,
  getProxyByIdValidator,
  getProxyById
);

// Rotate proxy
router.post(
  '/:id/rotate',
  authenticateCombined,
  checkResourceAccess,
  rotateProxyValidator,
  rotateProxy
);

// Check proxy status
router.get(
  '/:id/status',
  authenticateCombined,
  checkResourceAccess,
  checkProxyStatusValidator,
  checkProxyStatus
);

// Update proxy settings
router.patch(
  '/:id/settings',
  authenticateCombined,
  checkResourceAccess,
  updateProxySettingsValidator,
  updateProxySettings
);

export default router;