import ResellerDetails from '../../models/ResellerDetails.js';
import User from '../../models/User.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import Wallet from '../../models/Wallet.js';
import WithdrawalRequest from '../../models/WithdrawalRequests.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors.js';

/**
 * Lấy thông tin chi tiết của đại lý hiện tại
 * @route GET /api/v1/reseller/profile
 * @access Đại lý
 */
export const getResellerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Kiểm tra xem người dùng có phải là đại lý không
    const isReseller = req.user.is_admin || req.user.user_level === 0 || req.user.is_reseller || 
                       req.user.roles.some(role => 
                         typeof role === 'string' 
                           ? role.toLowerCase() === 'reseller' || role.toLowerCase() === 'admin'
                           : (role.name && (role.name.toLowerCase() === 'reseller' || role.name.toLowerCase() === 'admin'))
                       );
    
    if (!isReseller) {
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    }
    
    // Tìm thông tin đại lý
    const resellerDetails = await ResellerDetails.findOne({ user_id: userId });
    
    if (!resellerDetails) {
      throw new NotFoundError('Không tìm thấy thông tin đại lý');
    }
    
    res.status(200).json({
      success: true,
      data: resellerDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin chi tiết của đại lý
 * @route PATCH /api/v1/reseller/profile
 * @access Đại lý
 */
export const updateResellerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Kiểm tra xem người dùng có phải là đại lý không
    const isReseller = req.user.is_admin || req.user.user_level === 0 || req.user.is_reseller || 
                       req.user.roles.some(role => 
                         typeof role === 'string' 
                           ? role.toLowerCase() === 'reseller' || role.toLowerCase() === 'admin'
                           : (role.name && (role.name.toLowerCase() === 'reseller' || role.name.toLowerCase() === 'admin'))
                       );
    
    if (!isReseller) {
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    }
    
    // Tìm thông tin đại lý
    let resellerDetails = await ResellerDetails.findOne({ user_id: userId });
    
    if (!resellerDetails) {
      // Nếu không tìm thấy, tạo mới
      resellerDetails = new ResellerDetails({ user_id: userId });
    }
    
    // Lấy dữ liệu cần cập nhật
    const { payment_details } = req.body;
    
    // Cập nhật thông tin chi tiết thanh toán
    if (payment_details) {
      if (payment_details.bank_name) {
        resellerDetails.payment_details.bank_name = payment_details.bank_name;
      }
      
      if (payment_details.account_number) {
        resellerDetails.payment_details.account_number = payment_details.account_number;
      }
      
      if (payment_details.account_name) {
        resellerDetails.payment_details.account_name = payment_details.account_name;
      }
    }
    
    // Lưu thay đổi
    await resellerDetails.save();
    
    res.status(200).json({
      success: true,
      message: 'Thông tin đại lý đã được cập nhật thành công',
      data: resellerDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách người dùng cấp dưới (downline) của đại lý
 * @route GET /api/v1/reseller/customers
 * @access Đại lý
 */
export const getResellerCustomers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;
    
    // Kiểm tra xem người dùng có phải là đại lý không
    const isReseller = req.user.is_admin || req.user.user_level === 0 || req.user.is_reseller || 
                       req.user.roles.some(role => 
                         typeof role === 'string' 
                           ? role.toLowerCase() === 'reseller' || role.toLowerCase() === 'admin'
                           : (role.name && (role.name.toLowerCase() === 'reseller' || role.name.toLowerCase() === 'admin'))
                       );
    
    if (!isReseller) {
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    }
    
    // Tạo query object
    const query = { parent_id: userId };
    
    // Tìm kiếm theo tên hoặc email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullname: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tính toán skip cho phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Thực hiện query
    const customers = await User.find(query)
      .select('username email fullname phone active created_at')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số khách hàng
    const totalCustomers = await User.countDocuments(query);
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalCustomers / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total: totalCustomers,
          page: parseInt(page),
          pages: totalPages,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo tài khoản khách hàng mới cho đại lý
 * @route POST /api/v1/reseller/customers
 * @access Đại lý
 */
export const createCustomer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Kiểm tra xem người dùng có phải là đại lý không
    const isReseller = req.user.is_admin || req.user.user_level === 0 || req.user.is_reseller || 
                       req.user.roles.some(role => 
                         typeof role === 'string' 
                           ? role.toLowerCase() === 'reseller' || role.toLowerCase() === 'admin'
                           : (role.name && (role.name.toLowerCase() === 'reseller' || role.name.toLowerCase() === 'admin'))
                       );
    
    if (!isReseller) {
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    }
    
    const { username, email, password, fullname, phone } = req.body;
    
    // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      throw new BadRequestError('Tên đăng nhập hoặc email đã tồn tại');
    }
    
    // Tạo người dùng mới với vai trò là khách hàng
    const newUser = new User({
      username,
      email,
      fullname,
      phone,
      parent_id: userId,
      user_level: 3, // Cấp độ khách hàng
      active: true
    });
    
    // Đặt mật khẩu
    await newUser.setPassword(password);
    
    // Lưu người dùng mới
    await newUser.save();
    
    // Tạo ví cho người dùng mới
    const wallet = new Wallet({
      user_id: newUser._id,
      balance: 0,
      currency: 'VND',
      locked_amount: 0,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true
    });
    
    await wallet.save();
    
    // Cập nhật wallet_id cho người dùng
    newUser.wallet_id = wallet._id;
    await newUser.save();
    
    // Tăng số lượng downline cho đại lý
    const resellerDetails = await ResellerDetails.findOne({ user_id: userId });
    if (resellerDetails) {
      await resellerDetails.incrementDownlineCount();
    }
    
    res.status(201).json({
      success: true,
      message: 'Tài khoản khách hàng mới đã được tạo thành công',
      data: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          fullname: newUser.fullname,
          phone: newUser.phone,
          created_at: newUser.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy lịch sử hoa hồng của đại lý
 * @route GET /api/v1/reseller/commissions
 * @access Đại lý
 */
export const getCommissionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, start_date, end_date } = req.query;
    
    // Kiểm tra xem người dùng có phải là đại lý không
    const isReseller = req.user.is_admin || req.user.user_level === 0 || req.user.is_reseller || 
                       req.user.roles.some(role => 
                         typeof role === 'string' 
                           ? role.toLowerCase() === 'reseller' || role.toLowerCase() === 'admin'
                           : (role.name && (role.name.toLowerCase() === 'reseller' || role.name.toLowerCase() === 'admin'))
                       );
    
    if (!isReseller) {
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    }
    
    // Tạo query object
    const query = {
      user_id: userId,
      'metadata.commission_for': { $exists: true, $ne: null },
      type: 'commission'
    };
    
    // Filter theo khoảng thời gian
    if (start_date || end_date) {
      query.created_at = {};
      
      if (start_date) {
        query.created_at.$gte = new Date(start_date);
      }
      
      if (end_date) {
        query.created_at.$lte = new Date(end_date);
      }
    }
    
    // Tính toán skip cho phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Thực hiện query
    const commissions = await WalletTransaction.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số giao dịch hoa hồng
    const totalCommissions = await WalletTransaction.countDocuments(query);
    
    // Tính tổng tiền hoa hồng
    const totalAmount = await WalletTransaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalCommissions / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        commissions,
        stats: {
          total_amount: totalAmount.length > 0 ? totalAmount[0].total : 0,
          total_count: totalCommissions
        },
        pagination: {
          total: totalCommissions,
          page: parseInt(page),
          pages: totalPages,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Yêu cầu rút tiền hoa hồng
 * @route POST /api/v1/reseller/withdraw
 * @access Đại lý
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Kiểm tra xem người dùng có phải là đại lý không
    const isReseller = req.user.is_admin || req.user.user_level === 0 || req.user.is_reseller || 
                       req.user.roles.some(role => 
                         typeof role === 'string' 
                           ? role.toLowerCase() === 'reseller' || role.toLowerCase() === 'admin'
                           : (role.name && (role.name.toLowerCase() === 'reseller' || role.name.toLowerCase() === 'admin'))
                       );
    
    if (!isReseller) {
      throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
    }
    
    const { amount, bank_info } = req.body;
    
    // Kiểm tra số tiền tối thiểu
    if (amount < 100000) {
      throw new BadRequestError('Số tiền rút tối thiểu là 100,000 VND');
    }
    
    // Lấy thông tin ví của đại lý
    const wallet = await Wallet.findOne({ user_id: userId });
    
    if (!wallet) {
      throw new NotFoundError('Không tìm thấy ví của đại lý');
    }
    
    // Kiểm tra số dư
    if (wallet.balance < amount) {
      throw new BadRequestError('Số dư không đủ để thực hiện yêu cầu rút tiền');
    }
    
    // Tạo yêu cầu rút tiền
    const withdrawal = new WithdrawalRequest({
      user_id: userId,
      amount,
      status: 'pending',
      payment_details: bank_info || {},
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Lưu yêu cầu rút tiền
    await withdrawal.save();
    
    // Khóa số tiền trong ví
    wallet.locked_amount += amount;
    await wallet.save();
    
    res.status(201).json({
      success: true,
      message: 'Yêu cầu rút tiền đã được tạo thành công',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy báo cáo thống kê của đại lý
 * @route GET /api/v1/reseller/stats
 * @access Đại lý
 */
export const getResellerStats = async (req, res, next) => {
  try {
    // Kiểm tra người dùng có quyền truy cập và lấy userId (của reseller)
    let userId = req.user.id;
    const isAdmin = req.user.is_admin || req.user.user_level === 0 || req.user.roles.some(role => 
      typeof role === 'string' ? role.toLowerCase() === 'admin' : (role.name && role.name.toLowerCase() === 'admin')
    );
    
    // Nếu là admin và có reseller_id trong query, lấy thông tin của reseller đó
    if (isAdmin && req.query.reseller_id) {
      userId = req.query.reseller_id;
    } else {
      // Kiểm tra người dùng có phải là đại lý
      const isReseller = req.user.is_reseller || req.user.roles.some(role => 
        typeof role === 'string' ? role.toLowerCase() === 'reseller' : (role.name && role.name.toLowerCase() === 'reseller')
      );
      
      if (!isReseller && !isAdmin) {
        throw new ForbiddenError('Bạn không có quyền truy cập tài nguyên này');
      }
    }
    
    // Lấy thông tin đại lý
    const resellerDetails = await ResellerDetails.findOne({ user_id: userId });
    
    if (!resellerDetails) {
      throw new NotFoundError('Không tìm thấy thông tin đại lý');
    }
    
    // Đếm số lượng khách hàng
    const customerCount = await User.countDocuments({ parent_id: userId });
    
    // Tính tổng hoa hồng
    const totalCommission = await WalletTransaction.aggregate([
      { 
        $match: { 
          user_id: new mongoose.Types.ObjectId(userId),
          type: 'commission'
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Lấy số lượng khách hàng tạo trong 30 ngày gần đây
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomersCount = await User.countDocuments({
      parent_id: userId,
      created_at: { $gte: thirtyDaysAgo }
    });
    
    // Lấy tổng hoa hồng trong 30 ngày gần đây
    const recentCommission = await WalletTransaction.aggregate([
      { 
        $match: { 
          user_id: new mongoose.Types.ObjectId(userId),
          type: 'commission',
          created_at: { $gte: thirtyDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        customer_count: customerCount,
        total_commission: totalCommission.length > 0 ? totalCommission[0].total : 0,
        recent_stats: {
          new_customers: newCustomersCount,
          recent_commission: recentCommission.length > 0 ? recentCommission[0].total : 0
        },
        commission_rate: resellerDetails.commission_rate
      }
    });
  } catch (error) {
    next(error);
  }
}; 