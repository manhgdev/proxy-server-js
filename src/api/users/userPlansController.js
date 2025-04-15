import UserProxy from '../../models/UserProxy.js';
import Package from '../../models/Package.js';
import logger from '../../utils/logger.js';

/**
 * Lấy danh sách gói dịch vụ của người dùng hiện tại
 * @route GET /api/v1/users/plans/my
 * @access Private
 */
export const getUserPlans = async (req, res, next) => {
  try {
    // Luôn chỉ lấy dữ liệu của user đã xác thực qua token
    const userId = req.user.id;
    logger.info(`User ${userId} is accessing their plans`);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const userPlans = await UserProxy.find({ 
      user_id: userId,
      is_active: true,
      expires_at: { $gt: new Date() }
    })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);
    
    // Lấy thông tin gói package mà không dùng populate để tránh lỗi schema
    const plansWithDetails = await Promise.all(
      userPlans.map(async (plan) => {
        let packageData = null;
        
        if (plan.package_id) {
          packageData = await Package.findOne({ _id: plan.package_id });
        }
        
        return {
          ...plan.toObject(),
          package_details: packageData ? {
            name: packageData.name,
            description: packageData.description,
            type: packageData.type,
            category: packageData.category
          } : null
        };
      })
    );
    
    const total = await UserProxy.countDocuments({ 
      user_id: userId,
      is_active: true,
      expires_at: { $gt: new Date() }
    });
    
    const pages = Math.ceil(total / limit);
    
    return res.status(200).json({
      status: 'success',
      data: {
        plans: plansWithDetails,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting plans for user ${req.user.id}:`, error);
    next(error);
  }
}; 