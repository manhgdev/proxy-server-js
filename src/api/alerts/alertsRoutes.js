import express from 'express';
import { param } from 'express-validator';
import {
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  deleteAllAlerts
} from './alertsController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticate);

// Lấy thông báo của người dùng
router.get('/', getUserAlerts);

// Đánh dấu thông báo đã đọc
router.patch(
  '/:id/read',
  [
    param('id').isMongoId().withMessage('ID thông báo không hợp lệ')
  ],
  markAlertAsRead
);

// Đánh dấu tất cả thông báo là đã đọc
router.patch('/read-all', markAllAlertsAsRead);

// Xóa một thông báo
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID thông báo không hợp lệ')
  ],
  deleteAlert
);

// Xóa tất cả thông báo
router.delete('/delete-all', deleteAllAlerts);

export default router; 