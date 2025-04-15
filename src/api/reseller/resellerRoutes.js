import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Middleware để chỉ cho phép reseller truy cập
router.use(authenticate, authorize(['reseller']));

// GET reseller dashboard info
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GET reseller dashboard route',
    data: {
      customers: 0,
      orders: 0,
      commission: 0,
      active_proxies: 0
    }
  });
});

export default router;
