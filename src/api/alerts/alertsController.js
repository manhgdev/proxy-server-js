import Alert from '../../models/Alerts.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

/**
 * Lấy danh sách thông báo của người dùng hiện tại
 * @route GET /api/v1/alerts
 * @access Đã đăng nhập
 */
export const getUserAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type, is_read } = req.query;
    
    // Tạo query object
    const query = { user_id: userId };
    
    // Filter theo type nếu có
    if (type) {
      query.type = type;
    }
    
    // Filter theo trạng thái đã đọc/chưa đọc
    if (is_read !== undefined) {
      query.is_read = is_read === 'true';
    }
    
    // Tính toán số lượng skip cho phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Thực hiện query với phân trang và sắp xếp
    const alerts = await Alert.find(query)
      .sort({ triggered_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số thông báo phù hợp với query
    const totalAlerts = await Alert.countDocuments(query);
    
    // Đếm số thông báo chưa đọc
    const unreadCount = await Alert.countDocuments({
      user_id: userId,
      is_read: false
    });
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalAlerts / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        alerts,
        stats: {
          unread_count: unreadCount
        },
        pagination: {
          total: totalAlerts,
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
 * Đánh dấu thông báo đã đọc
 * @route PATCH /api/v1/alerts/:id/read
 * @access Đã đăng nhập
 */
export const markAlertAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID thông báo không hợp lệ');
    }
    
    // Tìm kiếm thông báo
    const alert = await Alert.findOne({
      _id: id,
      user_id: userId
    });
    
    if (!alert) {
      throw new NotFoundError('Thông báo không tồn tại');
    }
    
    // Nếu đã đọc rồi thì không cần cập nhật
    if (alert.is_read) {
      return res.status(200).json({
        success: true,
        message: 'Thông báo đã được đánh dấu đọc từ trước'
      });
    }
    
    // Cập nhật trạng thái đã đọc
    alert.is_read = true;
    await alert.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * @route PATCH /api/v1/alerts/read-all
 * @access Đã đăng nhập
 */
export const markAllAlertsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Cập nhật tất cả thông báo chưa đọc
    const result = await Alert.updateMany(
      { user_id: userId, is_read: false },
      { $set: { is_read: true } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Tất cả thông báo đã được đánh dấu là đã đọc',
      data: {
        matched_count: result.matchedCount,
        modified_count: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa một thông báo
 * @route DELETE /api/v1/alerts/:id
 * @access Đã đăng nhập
 */
export const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID thông báo không hợp lệ');
    }
    
    // Tìm kiếm và xóa thông báo
    const alert = await Alert.findOneAndDelete({
      _id: id,
      user_id: userId
    });
    
    if (!alert) {
      throw new NotFoundError('Thông báo không tồn tại');
    }
    
    res.status(200).json({
      success: true,
      message: 'Thông báo đã được xóa thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa tất cả thông báo
 * @route DELETE /api/v1/alerts/delete-all
 * @access Đã đăng nhập
 */
export const deleteAllAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Xóa tất cả thông báo của người dùng
    const result = await Alert.deleteMany({ user_id: userId });
    
    res.status(200).json({
      success: true,
      message: 'Tất cả thông báo đã được xóa thành công',
      data: {
        deleted_count: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới cảnh báo
 * @route POST /api/v1/alerts
 * @access Đã đăng nhập
 */
export const createAlert = async (req, res, next) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dữ liệu không hợp lệ', errors.array());
    }

    const userId = req.user.id;
    const { 
      name, 
      type, 
      threshold, 
      comparison, 
      notification_method, 
      active = true 
    } = req.body;

    // Tạo alert mới
    const newAlert = new Alert({
      user_id: userId,
      name,
      type,
      threshold,
      comparison,
      notification_method,
      active,
      created_at: new Date(),
      updated_at: new Date()
    });

    await newAlert.save();

    res.status(201).json({
      success: true,
      message: 'Tạo cảnh báo thành công',
      data: newAlert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật cảnh báo
 * @route PATCH /api/v1/alerts/:id
 * @access Đã đăng nhập
 */
export const updateAlert = async (req, res, next) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Dữ liệu không hợp lệ', errors.array());
    }

    const { id } = req.params;
    const userId = req.user.id;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID cảnh báo không hợp lệ');
    }
    
    // Tạo đối tượng chứa dữ liệu cần cập nhật
    const updateData = {};
    
    // Chỉ cập nhật các trường được gửi lên
    const allowedFields = ['name', 'type', 'threshold', 'comparison', 'notification_method', 'active'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Cập nhật thời gian chỉnh sửa
    updateData.updated_at = new Date();
    
    // Tìm và cập nhật cảnh báo
    const updatedAlert = await Alert.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedAlert) {
      throw new NotFoundError('Cảnh báo không tồn tại hoặc không có quyền cập nhật');
    }
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật cảnh báo thành công',
      data: updatedAlert
    });
  } catch (error) {
    next(error);
  }
}; 