import RolePermission from '../../models/RolePermission.js';
import Role from '../../models/Role.js';
import Permission from '../../models/Permission.js';
import { validationResult } from 'express-validator';

// Get all permissions for a specific role
export const getPermissionsByRoleId = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    
    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Find all role permissions
    const rolePermissions = await RolePermission.find({ role_id: roleId })
      .populate('permission_id');
    
    // Extract permissions data
    const permissions = rolePermissions.map(rp => rp.permission_id);
    
    return res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Assign permission to role
export const assignPermissionToRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { role_id, permission_id } = req.body;
    
    // Check if role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if permission exists
    const permission = await Permission.findById(permission_id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    // Check if permission is already assigned to role
    const existingRolePermission = await RolePermission.findOne({
      role_id,
      permission_id
    });
    
    if (existingRolePermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission is already assigned to this role'
      });
    }
    
    // Create new role permission
    const rolePermission = new RolePermission({
      role_id,
      permission_id
    });
    
    await rolePermission.save();
    
    return res.status(201).json({
      success: true,
      data: rolePermission,
      message: 'Permission assigned to role successfully'
    });
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove permission from role
export const removePermissionFromRole = async (req, res) => {
  try {
    const { role_id, permission_id } = req.params;
    
    // Check if role-permission mapping exists
    const rolePermission = await RolePermission.findOne({
      role_id,
      permission_id
    });
    
    if (!rolePermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission is not assigned to this role'
      });
    }
    
    await rolePermission.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Permission removed from role successfully'
    });
  } catch (error) {
    console.error('Error removing permission from role:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update permissions for a role (bulk operation)
export const updateRolePermissions = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { role_id, permission_ids } = req.body;
    
    // Check if role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if permissions exist
    const permissions = await Permission.find({
      _id: { $in: permission_ids }
    });
    
    if (permissions.length !== permission_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more permissions not found'
      });
    }
    
    // Delete all existing permissions for the role
    await RolePermission.deleteMany({ role_id });
    
    // Create new role-permission mappings
    const rolePermissions = permission_ids.map(permission_id => ({
      role_id,
      permission_id,
      created_at: new Date()
    }));
    
    await RolePermission.insertMany(rolePermissions);
    
    return res.status(200).json({
      success: true,
      message: 'Role permissions updated successfully',
      data: {
        role_id,
        permission_count: permission_ids.length
      }
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 