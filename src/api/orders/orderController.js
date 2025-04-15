import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import ProductPackage from '../../models/ProductPackage.js';
import Wallet from '../../models/Wallet.js';
import UserProxy from '../../models/UserProxy.js';
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
 * Get all orders
 * @route GET /api/v1/orders
 * @access Private (Admin, Manager)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      status,
      payment_status,
      user_id,
      start_date,
      end_date,
      search
    } = req.query;
    
    const query = {};
    
    // Filtering
    if (status) query.status = status;
    if (payment_status) query.payment_status = payment_status;
    if (user_id) query.user_id = user_id;
    
    // Date range filter
    if (start_date || end_date) {
      query.created_at = {};
      if (start_date) {
        query.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        query.created_at.$lte = new Date(end_date);
      }
    }
    
    // Search by order number
    if (search) {
      query.order_number = { $regex: search, $options: 'i' };
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const orders = await Order.find(query)
      .populate('user_id', 'username email fullname')
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting orders:', error);
    next(error);
  }
};

/**
 * Get my orders
 * @route GET /api/v1/orders/my
 * @access Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      status
    } = req.query;
    
    const query = { user_id: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const orders = await Order.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting orders for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get orders for a reseller
 * @route GET /api/v1/orders/reseller
 * @access Private (Reseller)
 */
const getResellerOrders = async (req, res, next) => {
  try {
    // Kiểm tra quyền reseller
    if (req.user.user_level !== 0 && req.user.user_level !== 1 && req.user.user_level !== 2) {
      throw new ForbiddenError('Only admin, manager or resellers can access this endpoint');
    }
    
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      status,
      user_id
    } = req.query;
    
    const query = {};
    
    // Nếu là reseller, chỉ lấy đơn hàng của reseller đó
    if (req.user.user_level === 2) {
      query.reseller_id = req.user.id;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by user if provided and is admin/manager
    if (user_id && (req.user.user_level === 0 || req.user.user_level === 1)) {
      query.user_id = user_id;
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const orders = await Order.find(query)
      .populate('user_id', 'username email fullname')
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting reseller orders:`, error);
    next(error);
  }
};

/**
 * Get order by ID
 * @route GET /api/v1/orders/:id
 * @access Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
      .populate('user_id', 'username email fullname')
      .populate('wallet_id', 'balance currency');
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.user_level > 1 && order.user_id._id.toString() !== req.user.id && order.reseller_id?.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to access this order');
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    logger.error(`Error getting order by ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get order items for an order
 * @route GET /api/v1/orders/:id/items
 * @access Private
 */
const getOrderItems = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const orderId = req.params.id;
    
    // Kiểm tra order có tồn tại không
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.user_level > 1 && order.user_id.toString() !== req.user.id && order.reseller_id?.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to access this order');
    }
    
    // Lấy các order items
    const orderItems = await OrderItem.find({ order_id: orderId })
      .populate('package_id');
    
    res.status(200).json({
      status: 'success',
      data: {
        order_items: orderItems
      }
    });
  } catch (error) {
    logger.error(`Error getting order items for order ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new order
 * @route POST /api/v1/orders
 * @access Private
 */
const createOrder = async (req, res, next) => {
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
    
    const { items, payment_method, reseller_id } = req.body;
    const userId = req.user.id;
    
    // Kiểm tra items có tồn tại không
    if (!items || !items.length) {
      throw new BadRequestError('Order must contain at least one item');
    }
    
    // Tạo order number
    const orderNumber = 'ORD-' + Date.now().toString();
    
    // Tính tổng số tiền
    let totalAmount = 0;
    let processedItems = [];
    
    for (const item of items) {
      const { package_id, quantity, custom_config } = item;
      
      // Kiểm tra package có tồn tại không
      const packageData = await ProductPackage.findById(package_id).session(session);
      
      if (!packageData) {
        throw new NotFoundError(`Package with ID ${package_id} not found`);
      }
      
      if (!packageData.active) {
        throw new BadRequestError(`Package "${packageData.name}" is not available for purchase`);
      }
      
      // Tính giá dựa trên tier
      let price = packageData.price;
      
      if (packageData.price_tiers && packageData.price_tiers.length) {
        // Sắp xếp theo min_quantity giảm dần
        const sortedTiers = [...packageData.price_tiers].sort((a, b) => b.min_quantity - a.min_quantity);
        
        // Tìm tier phù hợp
        for (const tier of sortedTiers) {
          if (quantity >= tier.min_quantity) {
            price = tier.price_per_unit;
            break;
          }
        }
      }
      
      const subtotal = price * quantity;
      totalAmount += subtotal;
      
      processedItems.push({
        package_id,
        quantity,
        price,
        subtotal,
        custom_config
      });
    }
    
    // Kiểm tra reseller_id nếu có
    let commissionRate = 0;
    if (reseller_id) {
      // TODO: Kiểm tra reseller_id có hợp lệ không và tính commission
      commissionRate = 10; // Default 10%
    }
    
    // Kiểm tra ví nếu thanh toán bằng ví
    let wallet;
    let walletTransId = null;
    
    if (payment_method === 'wallet') {
      wallet = await Wallet.findOne({ user_id: userId }).session(session);
      
      if (!wallet) {
        throw new BadRequestError('Wallet not found');
      }
      
      if (wallet.balance < totalAmount) {
        throw new BadRequestError('Insufficient balance');
      }
      
      // Trừ tiền từ ví
      const walletTransaction = await wallet.deduct(totalAmount, 'Order payment', { order_number: orderNumber }, session);
      walletTransId = walletTransaction._id;
    }
    
    // Tạo order
    const order = new Order({
      user_id: userId,
      wallet_id: wallet ? wallet._id : null,
      order_number: orderNumber,
      total_amount: totalAmount,
      payment_method,
      payment_source: payment_method,
      wallet_trans_id: walletTransId,
      status: payment_method === 'wallet' ? 'completed' : 'pending',
      payment_status: payment_method === 'wallet' ? 'paid' : 'pending',
      reseller_id: reseller_id || null,
      commission_rate: commissionRate,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await order.save({ session });
    
    // Tạo order items
    for (const item of processedItems) {
      const orderItem = new OrderItem({
        order_id: order._id,
        package_id: item.package_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        custom_config: item.custom_config || {},
        created_at: new Date()
      });
      
      await orderItem.save({ session });
      
      // Nếu thanh toán bằng ví, tự động tạo user proxy plan
      if (payment_method === 'wallet') {
        const packageData = await ProductPackage.findById(item.package_id).session(session);
        
        // Tạo user proxy plan
        await UserProxy.createFromOrder(order._id, orderItem._id, userId, session);
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      status: 'success',
      data: {
        order,
        message: payment_method === 'wallet' 
          ? 'Order completed successfully' 
          : 'Order created successfully, waiting for payment'
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error creating order:', error);
    next(error);
  }
};

/**
 * Cancel order
 * @route POST /api/v1/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res, next) => {
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
    
    const orderId = req.params.id;
    
    // Kiểm tra order có tồn tại không
    const order = await Order.findById(orderId).session(session);
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    // Kiểm tra quyền hủy đơn
    if (req.user.user_level > 1 && order.user_id.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to cancel this order');
    }
    
    // Kiểm tra trạng thái đơn
    if (order.status === 'cancelled') {
      throw new BadRequestError('Order is already cancelled');
    }
    
    if (order.status === 'completed') {
      throw new BadRequestError('Cannot cancel a completed order');
    }
    
    // Cập nhật trạng thái đơn
    order.status = 'cancelled';
    order.updated_at = new Date();
    
    await order.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error(`Error cancelling order ${req.params.id}:`, error);
    next(error);
  }
};

export {
  getAllOrders,
  getMyOrders,
  getResellerOrders,
  getOrderById,
  getOrderItems,
  createOrder,
  cancelOrder
}; 