import UserRole from '../../models/UserRole.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { validationResult } from 'express-validator';

// Get all roles for a specific user
export const getRolesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find all user roles
    const userRoles = await UserRole.find({ user_id: userId })
      .populate('role_id')
      .populate('assigned_by', 'username fullname');
    
    // Extract roles data
    const roles = userRoles.map(ur => ({
      role: ur.role_id,
      assigned_at: ur.assigned_at,
      assigned_by: ur.assigned_by
    }));
    
    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Assign role to user
export const assignRoleToUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { user_id, role_id } = req.body;
    
    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if role is already assigned to user
    const existingUserRole = await UserRole.findOne({
      user_id,
      role_id
    });
    
    if (existingUserRole) {
      return res.status(400).json({
        success: false,
        message: 'Role is already assigned to this user'
      });
    }
    
    // Create new user role
    const userRole = new UserRole({
      user_id,
      role_id,
      assigned_by: req.user.id // Assuming the authenticated user's ID is available in req.user
    });
    
    await userRole.save();
    
    // If the role has a specific user_level, update the user's level
    if (role.level !== undefined) {
      user.user_level = role.level;
      await user.save();
    }
    
    return res.status(201).json({
      success: true,
      data: userRole,
      message: 'Role assigned to user successfully'
    });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove role from user
export const removeRoleFromUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.params;
    
    // Check if user-role mapping exists
    const userRole = await UserRole.findOne({
      user_id,
      role_id
    });
    
    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'Role is not assigned to this user'
      });
    }
    
    await userRole.deleteOne();
    
    // Get the remaining roles and update user_level based on highest priority role
    const remainingUserRoles = await UserRole.find({ user_id })
      .populate('role_id');
    
    if (remainingUserRoles.length > 0) {
      // Find the role with the lowest level (highest priority)
      const highestPriorityRole = remainingUserRoles.reduce(
        (prev, curr) => (curr.role_id.level < prev.role_id.level ? curr : prev),
        remainingUserRoles[0]
      );
      
      // Update user's level
      await User.findByIdAndUpdate(user_id, {
        user_level: highestPriorityRole.role_id.level
      });
    } else {
      // If no roles left, set to regular customer
      await User.findByIdAndUpdate(user_id, { user_level: 3 });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Role removed from user successfully'
    });
  } catch (error) {
    console.error('Error removing role from user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update roles for a user (bulk operation)
export const updateUserRoles = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { user_id, role_ids } = req.body;
    
    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if roles exist
    const roles = await Role.find({
      _id: { $in: role_ids }
    });
    
    if (roles.length !== role_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more roles not found'
      });
    }
    
    // Delete all existing roles for the user
    await UserRole.deleteMany({ user_id });
    
    // Create new user-role mappings
    const userRoles = role_ids.map(role_id => ({
      user_id,
      role_id,
      assigned_by: req.user.id, // Assuming the authenticated user's ID is available in req.user
      assigned_at: new Date(),
      created_at: new Date()
    }));
    
    await UserRole.insertMany(userRoles);
    
    // Update user_level based on highest priority role
    if (roles.length > 0) {
      // Find the role with the lowest level (highest priority)
      const highestPriorityRole = roles.reduce(
        (prev, curr) => (curr.level < prev.level ? curr : prev),
        roles[0]
      );
      
      user.user_level = highestPriorityRole.level;
      await user.save();
    } else {
      // If no roles provided, set to regular customer
      user.user_level = 3;
      await user.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'User roles updated successfully',
      data: {
        user_id,
        role_count: role_ids.length,
        user_level: user.user_level
      }
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 