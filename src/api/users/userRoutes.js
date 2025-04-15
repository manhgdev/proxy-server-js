import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getUserPlans,
  getUserRoles,
  assignRole,
  removeRole,
  getUserPermissions
} from './userController.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = express.Router();

// Get all users - Admin & Reseller only
router.get(
  '/',
  authenticate,
  authorize('manage_users', 'view_users'),
  getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  authenticate,
  authorize('manage_users', 'view_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUserById
);

// Create new user - Admin only
router.post(
  '/',
  authenticate,
  authorize('manage_users'),
  [
    body('username')
      .isString()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3-30 characters')
      .trim()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('fullname')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2-100 characters')
      .trim(),
    body('user_level')
      .isInt({ min: 0, max: 3 })
      .withMessage('User level must be between 0-3')
  ],
  createUser
);

// Update user
router.put(
  '/:id',
  authenticate,
  authorize('manage_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('fullname').optional().isString().isLength({ min: 2, max: 100 }),
    body('phone').optional().isString(),
    body('user_level').optional().isInt({ min: 0, max: 3 }),
    body('active').optional().isBoolean()
  ],
  updateUser
);

// Delete user
router.delete(
  '/:id',
  authenticate,
  authorize('manage_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  deleteUser
);

// Update own profile
router.put(
  '/profile/update',
  authenticate,
  [
    body('fullname').optional().isString().isLength({ min: 2, max: 100 }),
    body('phone').optional().isString(),
    body('billing_info').optional().isObject()
  ],
  updateProfile
);

// Get user plans
router.get(
  '/:id/plans',
  authenticate,
  authorize('manage_users', 'view_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUserPlans
);

// Get user roles
router.get(
  '/:id/roles',
  authenticate,
  authorize('manage_users', 'view_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUserRoles
);

// Assign role to user
router.post(
  '/:id/roles',
  authenticate,
  authorize('manage_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  body('role_id').isMongoId().withMessage('Invalid role ID format'),
  assignRole
);

// Remove role from user
router.delete(
  '/:id/roles/:roleId',
  authenticate,
  authorize('manage_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  param('roleId').isMongoId().withMessage('Invalid role ID format'),
  removeRole
);

// Get user permissions
router.get(
  '/:id/permissions',
  authenticate,
  authorize('manage_users', 'view_users'),
  param('id').isMongoId().withMessage('Invalid user ID format'),
  getUserPermissions
);

export default router; 