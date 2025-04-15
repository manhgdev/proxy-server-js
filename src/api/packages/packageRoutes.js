import express from 'express';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// GET all packages
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GET packages route',
    data: []
  });
});

// GET package by ID
router.get('/:id', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `GET package with ID: ${req.params.id}`,
    data: {}
  });
});

export default router;
