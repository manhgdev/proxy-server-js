import express from 'express';
import { body, query } from 'express-validator';
import {
  getResellerProfile,
  updateResellerProfile,
  getResellerCustomers,
  createCustomer,
  getCommissionHistory,
  requestWithdrawal,
  getResellerStats
} from './resellerController.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication và role Reseller
router.use(authenticate);
router.use(authorizeRoles(['Reseller']));

// Lấy thông tin đại lý
router.get('/profile', getResellerProfile);

// Cập nhật thông tin đại lý
router.patch(
  '/profile',
  [
    body('payment_details.bank_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Tên ngân hàng không được để trống'),
      
    body('payment_details.account_number')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Số tài khoản không được để trống'),
      
    body('payment_details.account_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Tên chủ tài khoản không được để trống')
  ],
  updateResellerProfile
);

// Lấy danh sách khách hàng
router.get('/customers', getResellerCustomers);

// Tạo khách hàng mới
router.post(
  '/customers',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Tên đăng nhập là bắt buộc')
      .isLength({ min: 3, max: 30 })
      .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Tên đăng nhập chỉ chấp nhận chữ cái, số và dấu gạch dưới'),
      
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email là bắt buộc')
      .isEmail()
      .withMessage('Email không hợp lệ'),
      
    body('password')
      .notEmpty()
      .withMessage('Mật khẩu là bắt buộc')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
      
    body('fullname')
      .trim()
      .notEmpty()
      .withMessage('Họ tên là bắt buộc'),
      
    body('phone')
      .optional()
      .trim()
  ],
  createCustomer
);

// Lấy lịch sử hoa hồng
router.get('/commissions', getCommissionHistory);

// Yêu cầu rút tiền
router.post(
  '/withdraw',
  [
    body('amount')
      .isNumeric()
      .withMessage('Số tiền phải là số')
      .isInt({ min: 100000 })
      .withMessage('Số tiền rút tối thiểu là 100,000 VND'),
      
    body('bank_info')
      .optional()
      .isObject()
      .withMessage('Thông tin ngân hàng phải là đối tượng'),
      
    body('bank_info.bank_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Tên ngân hàng không được để trống'),
      
    body('bank_info.account_number')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Số tài khoản không được để trống'),
      
    body('bank_info.account_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Tên chủ tài khoản không được để trống')
  ],
  requestWithdrawal
);

// Lấy thống kê
router.get('/stats', getResellerStats);

export default router;
