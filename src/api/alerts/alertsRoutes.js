import express from 'express';
import {
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  deleteAllAlerts,
  createAlert,
  updateAlert
} from './alertsController.js';
import { authenticateCombined } from '../../middlewares/auth.js';
import { 
  getAlertsValidator, 
  createAlertValidator, 
  updateAlertValidator, 
  deleteAlertValidator 
} from './alertsValidators.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateCombined);

// Lấy danh sách alerts của user
router.get('/', getAlertsValidator, getUserAlerts);

// Tạo mới alert
router.post('/', createAlertValidator, createAlert);

// Cập nhật alert
router.patch('/:id', updateAlertValidator, updateAlert);

// Xóa alert
router.delete('/:id', deleteAlertValidator, deleteAlert);

// Đánh dấu alert là đã đọc
router.patch('/:id/read', deleteAlertValidator, markAlertAsRead);

// Đánh dấu tất cả alert là đã đọc
router.patch('/read-all', markAllAlertsAsRead);

// Xóa tất cả alerts
router.delete('/delete-all', deleteAllAlerts);

export default router; 