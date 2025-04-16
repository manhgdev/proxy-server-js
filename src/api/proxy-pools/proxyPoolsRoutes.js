import express from 'express';
import {
  getProxyPools,
  getProxyPoolById,
  createProxyPool,
  updateProxyPool,
  deleteProxyPool
} from './proxyPoolsController.js';
import { authenticateCombined, authorize } from '../../middlewares/auth.js';
import {
  getProxyPoolByIdValidator,
  createProxyPoolValidator,
  updateProxyPoolValidator,
  deleteProxyPoolValidator
} from './proxyPoolsValidators.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateCombined);

// Lấy tất cả proxy pools - Chỉ admin hoặc manager
router.get(
  '/', 
  authorize(['manage_proxies', 'view_proxies']),
  getProxyPools
);

// Lấy chi tiết proxy pool theo ID - Chỉ admin hoặc manager
router.get(
  '/:id',
  authorize(['manage_proxies', 'view_proxies']),
  getProxyPoolByIdValidator,
  getProxyPoolById
);

// Tạo mới proxy pool - Chỉ admin
router.post(
  '/',
  authorize('manage_proxies'),
  createProxyPoolValidator,
  createProxyPool
);

// Cập nhật proxy pool - Chỉ admin
router.patch(
  '/:id',
  authorize('manage_proxies'),
  updateProxyPoolValidator,
  updateProxyPool
);

// Xóa proxy pool - Chỉ admin
router.delete(
  '/:id',
  authorize('manage_proxies'),
  deleteProxyPoolValidator,
  deleteProxyPool
);

export default router; 