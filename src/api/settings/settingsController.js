import UserSettings from '../../models/UserSettings.js';
import { validationResult } from 'express-validator';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

/**
 * Lấy thông tin cài đặt của người dùng hiện tại
 * @route GET /api/v1/settings
 * @access Đã đăng nhập
 */
export const getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Tìm hoặc tạo settings cho user nếu chưa có
    const settings = await UserSettings.findOrCreate(userId);
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật cài đặt của người dùng
 * @route PATCH /api/v1/settings
 * @access Đã đăng nhập
 */
export const updateUserSettings = async (req, res, next) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const userId = req.user.id;
    const { theme, language, notification_prefs } = req.body;
    
    // Tìm settings hiện tại
    let settings = await UserSettings.findOne({ user_id: userId });
    
    // Nếu không tìm thấy, tạo mới
    if (!settings) {
      settings = new UserSettings({ user_id: userId });
    }
    
    // Cập nhật các giá trị được cung cấp
    if (theme) {
      settings.theme = theme;
    }
    
    if (language) {
      settings.language = language;
    }
    
    // Cập nhật các giá trị notification_prefs nếu được cung cấp
    if (notification_prefs) {
      // Chỉ cập nhật các thuộc tính đã được gửi lên
      if (notification_prefs.email !== undefined) {
        settings.notification_prefs.email = notification_prefs.email;
      }
      
      if (notification_prefs.dashboard !== undefined) {
        settings.notification_prefs.dashboard = notification_prefs.dashboard;
      }
      
      if (notification_prefs.proxy_expiry !== undefined) {
        settings.notification_prefs.proxy_expiry = notification_prefs.proxy_expiry;
      }
      
      if (notification_prefs.balance_low !== undefined) {
        settings.notification_prefs.balance_low = notification_prefs.balance_low;
      }
    }
    
    // Lưu thay đổi
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Cài đặt đã được cập nhật',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset cài đặt về mặc định
 * @route POST /api/v1/settings/reset
 * @access Đã đăng nhập
 */
export const resetUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Tìm settings hiện tại
    const settings = await UserSettings.findOne({ user_id: userId });
    
    if (!settings) {
      // Nếu không có settings, tạo mới với giá trị mặc định
      const newSettings = await UserSettings.create({
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      return res.status(200).json({
        success: true,
        message: 'Cài đặt đã được tạo mới với giá trị mặc định',
        data: newSettings
      });
    }
    
    // Reset về giá trị mặc định
    settings.theme = 'light';
    settings.language = 'vi';
    settings.notification_prefs = {
      email: true,
      dashboard: true,
      proxy_expiry: true,
      balance_low: true
    };
    
    // Lưu thay đổi
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Cài đặt đã được reset về mặc định',
      data: settings
    });
  } catch (error) {
    next(error);
  }
}; 