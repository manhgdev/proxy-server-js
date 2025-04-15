import express from 'express';
import { body, query, param } from 'express-validator';
import { authenticate } from '../../middlewares/auth.js';
import {
  getUserProxies,
  getProxyById,
  rotateProxy,
  checkProxyStatus,
  updateProxySettings
} from './proxyController.js';

const router = express.Router();

// Tất cả các routes cần xác thực
router.use(authenticate);

// Lấy danh sách proxy của người dùng
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['active', 'inactive', 'expired']),
    query('type').optional().isIn(['datacenter', 'residential', 'mobile', 'rotating'])
  ],
  getUserProxies
);

// Lấy chi tiết proxy theo ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID proxy không hợp lệ')
  ],
  getProxyById
);

// Xoay proxy (đối với proxy quay vòng)
router.post(
  '/:id/rotate',
  [
    param('id').isMongoId().withMessage('ID proxy không hợp lệ')
  ],
  rotateProxy
);

// Kiểm tra trạng thái proxy
router.get(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('ID proxy không hợp lệ')
  ],
  checkProxyStatus
);

// Cập nhật tùy chỉnh proxy
router.patch(
  '/:id/settings',
  [
    param('id').isMongoId().withMessage('ID proxy không hợp lệ'),
    body('username').optional().isString().trim(),
    body('password').optional().isString().trim(),
    body('rotation_interval').optional().isInt({ min: 0 }).toInt(),
    body('sticky_session').optional().isBoolean().toBoolean(),
    body('notes').optional().isString().trim()
  ],
  updateProxySettings
);

export default router;