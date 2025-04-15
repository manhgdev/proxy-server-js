import UserProxy from '../../models/UserProxy.js';
import ProductPackage from '../../models/ProductPackage.js';
import Wallet from '../../models/Wallet.js';
import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import User from '../../models/User.js';
import { validationResult } from 'express-validator';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError,
  InternalServerError
} from '../../utils/errors.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Get all plans - Admin only
 * @route GET /api/v1/plans
 * @access Private (Admin, Manager)
 */
const getAllPlans = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      user_id,
      active,
      expired,
      plan_type,
      search
    } = req.query;
    
    const query = {};
    
    // Filtering
    if (user_id) query.user_id = user_id;
    if (active !== undefined) query.active = active === 'true';
    if (expired !== undefined) query.expired = expired === 'true';
    if (plan_type) query.plan_type = plan_type;
    
    // Search by username or email
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      
      if (users.length > 0) {
        query.user_id = { $in: users.map(user => user._id) };
      }
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const plans = await UserProxy.find(query)
      .populate('user_id', 'username email')
      .populate('package_id')
      .populate('order_id')
      .populate('proxy_ids')
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await UserProxy.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        plans,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting plans:', error);
    next(error);
  }
};

/**
 * Get my plans
 * @route GET /api/v1/plans/my
 * @access Private
 */
const getMyPlans = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { active, expired } = req.query;
    
    const query = { user_id: userId };
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    if (expired !== undefined) {
      query.expired = expired === 'true';
    }
    
    const plans = await UserProxy.find(query)
      .populate('package_id')
      .populate('proxy_ids')
      .sort('-created_at');
    
    res.status(200).json({
      status: 'success',
      data: {
        plans
      }
    });
  } catch (error) {
    logger.error(`Error getting plans for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get plans for a reseller
 * @route GET /api/v1/plans/reseller
 * @access Private (Reseller)
 */
const getResellerPlans = async (req, res, next) => {
  try {
    // Check if user is reseller or admin
    if (req.user.user_level > 2) {
      throw new ForbiddenError('Only admin, manager or resellers can access this endpoint');
    }
    
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      user_id,
      active,
      expired
    } = req.query;
    
    const query = {};
    
    // If user is reseller, only get plans for their customers
    if (req.user.user_level === 2) {
      // Find all users where parent_id is the reseller
      const customers = await User.find({ parent_id: req.user.id });
      query.user_id = { $in: customers.map(user => user._id) };
    } 
    // For admin, if user_id is provided, filter by that
    else if (user_id) {
      query.user_id = user_id;
    }
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    if (expired !== undefined) {
      query.expired = expired === 'true';
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const plans = await UserProxy.find(query)
      .populate('user_id', 'username email')
      .populate('package_id')
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await UserProxy.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        plans,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting reseller plans:`, error);
    next(error);
  }
};

/**
 * Get plan by ID
 * @route GET /api/v1/plans/:id
 * @access Private
 */
const getPlanById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const planId = req.params.id;
    
    const plan = await UserProxy.findById(planId)
      .populate('user_id', 'username email')
      .populate('package_id')
      .populate('proxy_ids')
      .populate('order_id');
    
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    
    // Check access permission
    if (req.user.user_level > 1) { // If not admin/manager
      // Check if plan belongs to this user
      if (plan.user_id._id.toString() !== req.user.id) {
        // Check if user is reseller and plan belongs to their customer
        if (req.user.user_level === 2) {
          const customer = await User.findById(plan.user_id._id);
          if (!customer || customer.parent_id?.toString() !== req.user.id) {
            throw new ForbiddenError('You do not have permission to access this plan');
          }
        } else {
          throw new ForbiddenError('You do not have permission to access this plan');
        }
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (error) {
    logger.error(`Error getting plan by ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Toggle auto-renew for a plan
 * @route POST /api/v1/plans/:id/toggle-auto-renew
 * @access Private
 */
const toggleAutoRenew = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const planId = req.params.id;
    
    const plan = await UserProxy.findById(planId);
    
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    
    // Check access permission
    if (plan.user_id.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to modify this plan');
    }
    
    // Check if plan is active
    if (!plan.active) {
      throw new BadRequestError('Cannot toggle auto-renew for inactive plan');
    }
    
    // Check if plan is expired
    if (plan.expired) {
      throw new BadRequestError('Cannot toggle auto-renew for expired plan');
    }
    
    // Toggle auto-renew
    plan.auto_renew = !plan.auto_renew;
    plan.updated_at = new Date();
    
    await plan.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        plan,
        message: `Auto-renew ${plan.auto_renew ? 'enabled' : 'disabled'} successfully`
      }
    });
  } catch (error) {
    logger.error(`Error toggling auto-renew for plan ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Cancel plan
 * @route POST /api/v1/plans/:id/cancel
 * @access Private
 */
const cancelPlan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const planId = req.params.id;
    
    const plan = await UserProxy.findById(planId);
    
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    
    // Check access permission
    if (plan.user_id.toString() !== req.user.id && req.user.user_level > 1) {
      throw new ForbiddenError('You do not have permission to cancel this plan');
    }
    
    // Check if plan is already canceled or expired
    if (!plan.active || plan.expired) {
      throw new BadRequestError('Plan is already inactive or expired');
    }
    
    // Cancel plan
    plan.active = false;
    plan.auto_renew = false;
    plan.cancellation_date = new Date();
    plan.updated_at = new Date();
    
    await plan.save();
    
    // Release proxies if any
    if (plan.proxy_ids && plan.proxy_ids.length > 0) {
      for (const proxyId of plan.proxy_ids) {
        await mongoose.model('Proxy').findByIdAndUpdate(proxyId, {
          $set: {
            assigned: false,
            current_user_id: null,
            last_user_id: plan.user_id,
            updated_at: new Date()
          }
        });
      }
      
      plan.proxies_released = true;
      await plan.save();
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Plan canceled successfully'
    });
  } catch (error) {
    logger.error(`Error canceling plan ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Renew plan
 * @route POST /api/v1/plans/:id/renew
 * @access Private
 */
const renewPlan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const planId = req.params.id;
    
    const plan = await UserProxy.findById(planId).session(session);
    
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    
    // Check access permission
    if (plan.user_id.toString() !== req.user.id && req.user.user_level > 1) {
      throw new ForbiddenError('You do not have permission to renew this plan');
    }
    
    // Check if plan is active and not expired
    if (!plan.active) {
      throw new BadRequestError('Cannot renew inactive plan');
    }
    
    // Get package details for pricing
    const packageData = await ProductPackage.findById(plan.package_id).session(session);
    
    if (!packageData) {
      throw new NotFoundError('Package not found');
    }
    
    if (!packageData.active) {
      throw new BadRequestError('Package is no longer available');
    }
    
    const renewalPrice = plan.renewal_price || packageData.price;
    
    // Check wallet balance
    const wallet = await Wallet.findOne({ user_id: plan.user_id }).session(session);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    if (wallet.balance < renewalPrice) {
      throw new BadRequestError('Insufficient balance to renew plan');
    }
    
    // Deduct from wallet
    const walletTransaction = await wallet.deduct(
      renewalPrice, 
      'Plan renewal payment', 
      { plan_id: planId }, 
      session
    );
    
    // Create order for the renewal
    const order = new Order({
      user_id: plan.user_id,
      wallet_id: wallet._id,
      order_number: 'ORD-' + Date.now().toString(),
      total_amount: renewalPrice,
      payment_method: 'wallet',
      payment_source: 'wallet',
      wallet_trans_id: walletTransaction._id,
      status: 'completed',
      payment_status: 'paid',
      reseller_id: null,
      commission_rate: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await order.save({ session });
    
    // Create order item
    const orderItem = new OrderItem({
      order_id: order._id,
      package_id: packageData._id,
      quantity: 1,
      price: renewalPrice,
      subtotal: renewalPrice,
      custom_config: plan.custom_config || {},
      created_at: new Date()
    });
    
    await orderItem.save({ session });
    
    // Update plan
    const today = new Date();
    const newEndDate = new Date(today);
    newEndDate.setDate(newEndDate.getDate() + packageData.duration_days);
    
    // Update the plan with new dates
    plan.start_date = today;
    plan.end_date = newEndDate;
    plan.expired = false;
    plan.expiry_notified = false;
    plan.renewal_status = 'renewed';
    plan.last_renewal_date = today;
    plan.renewal_count = (plan.renewal_count || 0) + 1;
    plan.updated_at = today;
    
    await plan.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Plan renewed successfully',
        plan,
        order
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error(`Error renewing plan ${req.params.id}:`, error);
    next(error);
  }
};

export {
  getAllPlans,
  getMyPlans,
  getResellerPlans,
  getPlanById,
  toggleAutoRenew,
  cancelPlan,
  renewPlan
}; 