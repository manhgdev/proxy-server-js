import express from 'express';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// GET wallet info (requires auth)
router.get('/', authenticate, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GET wallet route',
    data: {
      balance: 0,
      currency: 'USD'
    }
  });
});

export default router;
