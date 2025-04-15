import express from 'express';
import { authenticate, checkPermission } from '../../middlewares/auth.js';

const router = express.Router();

// Tạm thời trả về các route trống
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'This route is not implemented yet'
  });
});

export default router; 