import ProxyPool from '../../models/ProxyPools.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

/**
 * Lấy danh sách proxy pools
 * @route GET /api/v1/proxy-pools
 * @access Admin hoặc Manager
 */
export const getProxyPools = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, group, active, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Tạo query object
    const query = {};
    
    // Filter theo loại kết nối
    if (type) {
      query.connection_types = type;
    }
    
    // Filter theo nhóm
    if (group) {
      query.group = group;
    }
    
    // Filter theo trạng thái active
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    // Tìm kiếm theo tên hoặc mô tả
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Thực hiện query với phân trang và sắp xếp
    const pools = await ProxyPool.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Đếm tổng số pools phù hợp với query
    const totalPools = await ProxyPool.countDocuments(query);
    
    // Lấy danh sách các nhóm pool để filter
    const groups = await ProxyPool.distinct('group');
    
    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalPools / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        pools,
        filters: {
          groups
        },
        pagination: {
          total: totalPools,
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
 * Lấy thông tin chi tiết của một proxy pool
 * @route GET /api/v1/proxy-pools/:id
 * @access Admin hoặc Manager
 */
export const getProxyPoolById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID proxy pool không hợp lệ');
    }
    
    // Tìm pool theo ID
    const pool = await ProxyPool.findById(id);
    
    if (!pool) {
      throw new NotFoundError('Không tìm thấy proxy pool');
    }
    
    res.status(200).json({
      success: true,
      data: pool
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới proxy pool
 * @route POST /api/v1/proxy-pools
 * @access Admin
 */
export const createProxyPool = async (req, res, next) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      name,
      description,
      group,
      countries,
      isps,
      connection_types,
      entry_point,
      port_range,
      username,
      password,
      is_bandwidth_pool,
      active
    } = req.body;
    
    // Kiểm tra tên đã tồn tại chưa
    const existingPool = await ProxyPool.findOne({ name });
    if (existingPool) {
      throw new BadRequestError('Tên proxy pool đã tồn tại');
    }
    
    // Tạo pool mới
    const newPool = new ProxyPool({
      name,
      description,
      group,
      countries,
      isps,
      connection_types,
      proxy_count: 0,
      active_proxy_count: 0,
      entry_point,
      port_range,
      username,
      password,
      is_bandwidth_pool,
      active: active !== undefined ? active : true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Lưu pool mới
    await newPool.save();
    
    res.status(201).json({
      success: true,
      message: 'Proxy pool đã được tạo thành công',
      data: newPool
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật proxy pool
 * @route PATCH /api/v1/proxy-pools/:id
 * @access Admin
 */
export const updateProxyPool = async (req, res, next) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID proxy pool không hợp lệ');
    }
    
    // Tìm pool hiện tại
    const pool = await ProxyPool.findById(id);
    
    if (!pool) {
      throw new NotFoundError('Không tìm thấy proxy pool');
    }
    
    // Lấy các trường cần cập nhật
    const {
      name,
      description,
      group,
      countries,
      isps,
      connection_types,
      entry_point,
      port_range,
      username,
      password,
      is_bandwidth_pool,
      active
    } = req.body;
    
    // Kiểm tra tên mới đã tồn tại chưa (nếu đổi tên)
    if (name && name !== pool.name) {
      const existingPool = await ProxyPool.findOne({ name });
      if (existingPool) {
        throw new BadRequestError('Tên proxy pool đã tồn tại');
      }
      pool.name = name;
    }
    
    // Cập nhật các trường được cung cấp
    if (description !== undefined) {
      pool.description = description;
    }
    
    if (group) {
      pool.group = group;
    }
    
    if (countries) {
      pool.countries = countries;
    }
    
    if (isps) {
      pool.isps = isps;
    }
    
    if (connection_types) {
      pool.connection_types = connection_types;
    }
    
    if (entry_point) {
      pool.entry_point = entry_point;
    }
    
    if (port_range) {
      pool.port_range = port_range;
    }
    
    if (username) {
      pool.username = username;
    }
    
    if (password) {
      pool.password = password;
    }
    
    if (is_bandwidth_pool !== undefined) {
      pool.is_bandwidth_pool = is_bandwidth_pool;
    }
    
    if (active !== undefined) {
      pool.active = active;
    }
    
    // Cập nhật thời gian
    pool.updated_at = new Date();
    
    // Lưu thay đổi
    await pool.save();
    
    res.status(200).json({
      success: true,
      message: 'Proxy pool đã được cập nhật thành công',
      data: pool
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa proxy pool
 * @route DELETE /api/v1/proxy-pools/:id
 * @access Admin
 */
export const deleteProxyPool = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('ID proxy pool không hợp lệ');
    }
    
    // Tìm và xóa pool
    const pool = await ProxyPool.findByIdAndDelete(id);
    
    if (!pool) {
      throw new NotFoundError('Không tìm thấy proxy pool');
    }
    
    res.status(200).json({
      success: true,
      message: 'Proxy pool đã được xóa thành công'
    });
  } catch (error) {
    next(error);
  }
}; 