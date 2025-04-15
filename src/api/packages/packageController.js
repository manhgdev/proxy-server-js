import ProductPackage from '../../models/ProductPackage.js';
import { validationResult } from 'express-validator';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError,
  InternalServerError
} from '../../utils/errors.js';
import logger from '../../utils/logger.js';

/**
 * Get all packages
 * @route GET /api/v1/packages
 * @access Private
 */
const getAllPackages = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      type,
      category,
      is_rotating,
      is_bandwidth,
      active,
      search
    } = req.query;
    
    const query = {};
    
    // Filtering
    if (type) query.type = type;
    if (category) query.category = category;
    if (is_rotating !== undefined) query.is_rotating = is_rotating === 'true';
    if (is_bandwidth !== undefined) query.is_bandwidth = is_bandwidth === 'true';
    if (active !== undefined) query.active = active === 'true';
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const packages = await ProductPackage.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await ProductPackage.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        packages,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting packages:', error);
    next(error);
  }
};

/**
 * Get active packages (for public listing)
 * @route GET /api/v1/packages/active
 * @access Public
 */
const getActivePackages = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'price',
      type,
      category
    } = req.query;
    
    const query = { active: true };
    
    // Filtering
    if (type) query.type = type;
    if (category) query.category = category;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const packages = await ProductPackage.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await ProductPackage.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        packages,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting active packages:', error);
    next(error);
  }
};

/**
 * Get package by ID
 * @route GET /api/v1/packages/:id
 * @access Private
 */
const getPackageById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const packageId = req.params.id;
    const packageData = await ProductPackage.findById(packageId);
    
    if (!packageData) {
      throw new NotFoundError('Package not found');
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        package: packageData
      }
    });
  } catch (error) {
    logger.error(`Error getting package by ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new package
 * @route POST /api/v1/packages
 * @access Private (Admin only)
 */
const createPackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    // Kiểm tra quyền
    if (req.user.user_level !== 0 && req.user.user_level !== 1) {
      throw new ForbiddenError('Only Admin or Manager can create packages');
    }
    
    const {
      name,
      description,
      type,
      category,
      protocol,
      is_rotating,
      is_bandwidth,
      duration_days,
      price,
      price_tiers,
      allowed_countries,
      allowed_isps,
      features,
      active = true
    } = req.body;
    
    // Kiểm tra tên gói đã tồn tại chưa
    const existingPackage = await ProductPackage.findOne({ name });
    if (existingPackage) {
      throw new BadRequestError('Package name already exists');
    }
    
    // Kiểm tra tính nhất quán của dữ liệu
    if (is_bandwidth && type !== 'bandwidth') {
      throw new BadRequestError('is_bandwidth can only be true for bandwidth type packages');
    }
    
    if (is_rotating && type === 'static') {
      throw new BadRequestError('is_rotating cannot be true for static type packages');
    }
    
    // Tạo gói mới
    const newPackage = new ProductPackage({
      name,
      description,
      type,
      category,
      protocol,
      is_rotating,
      is_bandwidth,
      duration_days,
      price,
      price_tiers,
      allowed_countries,
      allowed_isps,
      features,
      active,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await newPackage.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        package: newPackage
      }
    });
  } catch (error) {
    logger.error('Error creating package:', error);
    next(error);
  }
};

/**
 * Update package
 * @route PUT /api/v1/packages/:id
 * @access Private (Admin only)
 */
const updatePackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    // Kiểm tra quyền
    if (req.user.user_level !== 0 && req.user.user_level !== 1) {
      throw new ForbiddenError('Only Admin or Manager can update packages');
    }
    
    const packageId = req.params.id;
    
    // Kiểm tra gói có tồn tại không
    const packageToUpdate = await ProductPackage.findById(packageId);
    if (!packageToUpdate) {
      throw new NotFoundError('Package not found');
    }
    
    // Prepare update data
    const updateData = {};
    
    // Lọc các trường có thể update
    const allowedFields = [
      'name', 'description', 'price', 'price_tiers', 
      'allowed_countries', 'allowed_isps', 'features', 'active'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Kiểm tra tên gói đã tồn tại chưa (nếu đổi tên)
    if (updateData.name && updateData.name !== packageToUpdate.name) {
      const existingPackage = await ProductPackage.findOne({ name: updateData.name });
      if (existingPackage) {
        throw new BadRequestError('Package name already exists');
      }
    }
    
    // Cập nhật thời gian
    updateData.updated_at = new Date();
    
    // Update package
    const updatedPackage = await ProductPackage.findByIdAndUpdate(
      packageId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        package: updatedPackage
      }
    });
  } catch (error) {
    logger.error(`Error updating package ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete package
 * @route DELETE /api/v1/packages/:id
 * @access Private (Admin only)
 */
const deletePackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    // Kiểm tra quyền
    if (req.user.user_level !== 0) {
      throw new ForbiddenError('Only Admin can delete packages');
    }
    
    const packageId = req.params.id;
    
    // Kiểm tra gói có tồn tại không
    const packageToDelete = await ProductPackage.findById(packageId);
    if (!packageToDelete) {
      throw new NotFoundError('Package not found');
    }
    
    // TODO: Check if package is in use before deleting
    
    // Delete package
    await ProductPackage.findByIdAndDelete(packageId);
    
    res.status(200).json({
      status: 'success',
      message: 'Package deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting package ${req.params.id}:`, error);
    next(error);
  }
};

export {
  getAllPackages,
  getActivePackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
}; 