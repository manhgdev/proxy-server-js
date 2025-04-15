import Permission from '../../models/Permission.js';
import { validationResult } from 'express-validator';

// Get all permissions
export const getAllPermissions = async (req, res) => {
  try {
    let query = {};
    
    // Filter by group if provided
    if (req.query.group) {
      query.group = req.query.group;
    }
    
    const permissions = await Permission.find(query).sort({ group: 1, name: 1 });
    
    return res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get permission by ID
export const getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new permission
export const createPermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { name, code, description, group } = req.body;
    
    // Check if permission with same code already exists
    const existingPermission = await Permission.findOne({ code });
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission with this code already exists'
      });
    }
    
    const permission = new Permission({
      name,
      code,
      description,
      group
    });
    
    await permission.save();
    
    return res.status(201).json({
      success: true,
      data: permission,
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update permission
export const updatePermission = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { name, code, description, group } = req.body;
    
    // Check if permission exists
    let permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    // Check if updating to a code that already exists (excluding this permission)
    if (code && code !== permission.code) {
      const existingPermission = await Permission.findOne({ code });
      if (existingPermission) {
        return res.status(400).json({
          success: false,
          message: 'Permission with this code already exists'
        });
      }
    }
    
    // Update fields
    if (name) permission.name = name;
    if (code) permission.code = code;
    if (description !== undefined) permission.description = description;
    if (group) permission.group = group;
    
    await permission.save();
    
    return res.status(200).json({
      success: true,
      data: permission,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete permission
export const deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    await permission.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get permission groups
export const getPermissionGroups = async (req, res) => {
  try {
    const groups = await Permission.distinct('group');
    
    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching permission groups:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 