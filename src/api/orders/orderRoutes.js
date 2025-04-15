import express from 'express';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// GET all orders (requires auth)
router.get('/', authenticate, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GET orders route',
    data: []
  });
});

export default router;
