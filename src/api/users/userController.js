import User from '../../models/User.js';
import Role from '../../models/Role.js';
import UserRole from '../../models/UserRole.js';
import Permission from '../../models/Permission.js';
import RolePermission from '../../models/RolePermission.js';
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
 * Get all users
 * @route GET /api/v1/users
 * @access Private (Admin, Manager, Reseller)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-created_at',
      user_level,
      search,
      active
    } = req.query;
    
    const query = {};
    
    // Nếu là reseller, chỉ lấy user thuộc reseller đó
    if (req.user.user_level === 2) { // Reseller
      query.parent_id = req.user.id;
    }
    
    // Lọc theo user_level
    if (user_level !== undefined) {
      query.user_level = user_level;
    }
    
    // Lọc theo active
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    // Tìm kiếm theo username, email, hoặc fullname
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullname: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    };
    
    const users = await User.find(query)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 * @access Private (Admin, Manager, Reseller)
 */
const getUserById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    
    // Kiểm tra quyền truy cập
    if (req.user.user_level === 2) { // Reseller
      const user = await User.findById(userId);
      if (!user || !user.parent_id || user.parent_id.toString() !== req.user.id) {
        throw new ForbiddenError('You do not have permission to access this user');
      }
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error(`Error getting user by ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new user
 * @route POST /api/v1/users
 * @access Private (Admin, Manager)
 */
const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const { 
      username, 
      email, 
      password, 
      fullname, 
      phone, 
      user_level,
      active = true
    } = req.body;
    
    // Kiểm tra quyền tạo user
    if (req.user.user_level > 1) { // Chỉ Admin và Manager mới được tạo
      throw new ForbiddenError('You do not have permission to create users');
    }
    
    // Kiểm tra nếu tạo admin, thì chỉ admin mới được tạo
    if (user_level === 0 && req.user.user_level !== 0) {
      throw new ForbiddenError('Only admin can create admin users');
    }
    
    // Kiểm tra username và email đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        throw new BadRequestError('Username already exists');
      }
      if (existingUser.email === email) {
        throw new BadRequestError('Email already in use');
      }
    }
    
    // Tạo user mới
    const newUser = new User({
      username,
      password_hash: password, // Sẽ được hash trong middleware của model
      email,
      fullname,
      phone,
      user_level,
      active,
      parent_id: user_level === 3 ? req.user.id : null // Nếu là customer thì parent_id là người tạo
    });
    
    await newUser.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          fullname: newUser.fullname,
          user_level: newUser.user_level,
          active: newUser.active,
          created_at: newUser.created_at
        }
      }
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/v1/users/:id
 * @access Private (Admin, Manager)
 */
const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    const updateData = {};
    
    // Lọc các trường có thể update
    const allowedFields = [
      'email', 'fullname', 'phone', 'user_level', 'active', 'billing_info'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Kiểm tra quyền update
    if (req.user.user_level > 1) { // Chỉ Admin và Manager mới được update
      throw new ForbiddenError('You do not have permission to update users');
    }
    
    // Tìm user cần update
    const userToUpdate = await User.findById(userId);
    
    if (!userToUpdate) {
      throw new NotFoundError('User not found');
    }
    
    // Kiểm tra cấp độ user
    if (userToUpdate.user_level === 0 && req.user.user_level !== 0) {
      throw new ForbiddenError('Only admin can update admin users');
    }
    
    // Kiểm tra nếu đang update level lên admin, chỉ admin mới được update
    if (updateData.user_level === 0 && req.user.user_level !== 0) {
      throw new ForbiddenError('Only admin can promote users to admin level');
    }
    
    // Cập nhật thời gian
    updateData.updated_at = new Date();
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    
    // Kiểm tra quyền xóa
    if (req.user.user_level !== 0) { // Chỉ Admin mới được xóa
      throw new ForbiddenError('Only admin can delete users');
    }
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Không cho phép xóa chính mình
    if (userId === req.user.id) {
      throw new BadRequestError('You cannot delete your own account');
    }
    
    // Xóa user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update user profile (self)
 * @route PUT /api/v1/users/profile/update
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.user.id;
    const updateData = {};
    
    // Lọc các trường có thể update
    const allowedFields = ['fullname', 'phone', 'billing_info'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Cập nhật thời gian
    updateData.updated_at = new Date();
    
    // Update profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    logger.error(`Error updating profile for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get user plans
 * @route GET /api/v1/users/:id/plans
 * @access Private (Admin, Manager, Reseller)
 */
const getUserPlans = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    
    // Kiểm tra quyền truy cập
    if (req.user.user_level === 2) { // Reseller
      const user = await User.findById(userId);
      if (!user || !user.parent_id || user.parent_id.toString() !== req.user.id) {
        throw new ForbiddenError('You do not have permission to access this user');
      }
    }
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Lấy danh sách plans
    const userProxies = await UserProxy.find({ user_id: userId })
      .populate('package_id')
      .populate('proxy_ids')
      .sort('-created_at');
    
    res.status(200).json({
      status: 'success',
      data: {
        plans: userProxies
      }
    });
  } catch (error) {
    logger.error(`Error getting plans for user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get user roles
 * @route GET /api/v1/users/:id/roles
 * @access Private (Admin, Manager)
 */
const getUserRoles = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Lấy danh sách roles
    const userRoles = await UserRole.find({ user_id: userId })
      .populate('role_id')
      .sort('-assigned_at');
    
    res.status(200).json({
      status: 'success',
      data: {
        roles: userRoles
      }
    });
  } catch (error) {
    logger.error(`Error getting roles for user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Assign role to user
 * @route POST /api/v1/users/:id/roles
 * @access Private (Admin only)
 */
const assignRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    const { role_id } = req.body;
    
    // Kiểm tra quyền gán role
    if (req.user.user_level !== 0) { // Chỉ Admin mới được gán role
      throw new ForbiddenError('Only admin can assign roles');
    }
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Kiểm tra role có tồn tại không
    const role = await Role.findById(role_id);
    
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    
    // Kiểm tra role đã được gán chưa
    const existingRole = await UserRole.findOne({
      user_id: userId,
      role_id: role_id
    });
    
    if (existingRole) {
      throw new BadRequestError('Role already assigned to this user');
    }
    
    // Gán role
    const newUserRole = new UserRole({
      user_id: userId,
      role_id: role_id,
      assigned_at: new Date(),
      assigned_by: req.user.id,
      created_at: new Date()
    });
    
    await newUserRole.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        assigned_role: {
          ...newUserRole.toObject(),
          role_name: role.name
        }
      },
      message: 'Role assigned successfully'
    });
  } catch (error) {
    logger.error(`Error assigning role to user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Remove role from user
 * @route DELETE /api/v1/users/:id/roles/:roleId
 * @access Private (Admin only)
 */
const removeRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    const roleId = req.params.roleId;
    
    // Kiểm tra quyền xóa role
    if (req.user.user_level !== 0) { // Chỉ Admin mới được xóa role
      throw new ForbiddenError('Only admin can remove roles');
    }
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Kiểm tra role assignment có tồn tại không
    const userRole = await UserRole.findOne({
      user_id: userId,
      role_id: roleId
    });
    
    if (!userRole) {
      throw new NotFoundError('Role assignment not found');
    }
    
    // Xóa role
    await UserRole.findByIdAndDelete(userRole._id);
    
    res.status(200).json({
      status: 'success',
      message: 'Role removed successfully'
    });
  } catch (error) {
    logger.error(`Error removing role from user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get user permissions
 * @route GET /api/v1/users/:id/permissions
 * @access Private (Admin, Manager)
 */
const getUserPermissions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        errors: errors.array() 
      });
    }
    
    const userId = req.params.id;
    
    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Lấy danh sách roles của user
    const userRoles = await UserRole.find({ user_id: userId });
    
    if (!userRoles.length) {
      return res.status(200).json({
        status: 'success',
        data: {
          permissions: []
        }
      });
    }
    
    // Lấy role IDs
    const roleIds = userRoles.map(ur => ur.role_id);
    
    // Lấy danh sách permissions của các roles
    const rolePermissions = await RolePermission.find({
      role_id: { $in: roleIds }
    }).populate('permission_id');
    
    // Lấy unique permissions
    const permissions = [];
    const permissionIds = new Set();
    
    rolePermissions.forEach(rp => {
      if (rp.permission_id && !permissionIds.has(rp.permission_id._id.toString())) {
        permissionIds.add(rp.permission_id._id.toString());
        permissions.push(rp.permission_id);
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        permissions
      }
    });
  } catch (error) {
    logger.error(`Error getting permissions for user ${req.params.id}:`, error);
    next(error);
  }
};

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getUserPlans,
  getUserRoles,
  assignRole,
  removeRole,
  getUserPermissions
}; 