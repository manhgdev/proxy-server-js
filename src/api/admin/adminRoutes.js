import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Middleware để chỉ cho phép admin truy cập
router.use(authenticate, authorize(['admin']));

// GET admin dashboard info
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GET admin dashboard route',
    data: {
      users: 0,
      packages: 0,
      orders: 0,
      revenue: 0
    }
  });
});

export default router;
