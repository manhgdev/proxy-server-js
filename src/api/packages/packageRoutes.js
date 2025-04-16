import express from 'express';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getActivePackages
} from './packageController.js';
import { authenticateCombined, authorize } from '../../middlewares/auth.js';
import {
  getAllPackagesValidator,
  getPackageByIdValidator,
  createPackageValidator,
  updatePackageValidator,
  deletePackageValidator
} from './packageValidators.js';

const router = express.Router();

// Get all packages
router.get(
  '/',
  authenticateCombined,
  getAllPackagesValidator,
  getAllPackages
);

// Get active packages (public)
router.get(
  '/active',
  getActivePackages
);

// Get package by ID
router.get(
  '/:id',
  authenticateCombined,
  getPackageByIdValidator,
  getPackageById
);

// Create package (Admin only)
router.post(
  '/',
  authenticateCombined,
  authorize('manage_proxies'),
  createPackageValidator,
  createPackage
);

// Update package (Admin only)
router.put(
  '/:id',
  authenticateCombined,
  authorize('manage_proxies'),
  updatePackageValidator,
  updatePackage
);

// Delete package (Admin only)
router.delete(
  '/:id',
  authenticateCombined,
  authorize('manage_proxies'),
  deletePackageValidator,
  deletePackage
);

export default router;
