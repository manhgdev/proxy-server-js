import express from 'express';
import authRoutes from './auth/authRoutes.js';
import userRoutes from './users/userRoutes.js';
import packageRoutes from './packages/packageRoutes.js';
import orderRoutes from './orders/orderRoutes.js';
import proxyRoutes from './proxy/proxyRoutes.js';
import walletRoutes from './wallet/walletRoutes.js';
import planRoutes from './plans/planRoutes.js';
import adminRoutes from './admin/adminRoutes.js';
import resellerRoutes from './reseller/resellerRoutes.js';
import alertsRoutes from './alerts/alertsRoutes.js';
import settingsRoutes from './settings/settingsRoutes.js';
import proxyPoolsRoutes from './proxy-pools/proxyPoolsRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/packages', packageRoutes);
router.use('/orders', orderRoutes);
router.use('/proxies', proxyRoutes);
router.use('/wallet', walletRoutes);
router.use('/plans', planRoutes);
router.use('/admin', adminRoutes);
router.use('/reseller', resellerRoutes);
router.use('/alerts', alertsRoutes);
router.use('/settings', settingsRoutes);
router.use('/proxy-pools', proxyPoolsRoutes);

export default router; 