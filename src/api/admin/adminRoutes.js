import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} from './roleController.js';
import { 
  getAllPermissions, 
  getPermissionById, 
  createPermission, 
  updatePermission, 
  deletePermission,
  getPermissionGroups
} from './permissionController.js';
import {
  getPermissionsByRoleId,
  assignPermissionToRole,
  removePermissionFromRole,
  updateRolePermissions
} from './rolePermissionController.js';
import {
  getRolesByUserId,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserRoles
} from './userRoleController.js';
import { 
  validateCreateRole, 
  validateUpdateRole,
  validateCreatePermission,
  validateUpdatePermission,
  validateAssignPermission,
  validateUpdateRolePermissions,
  validateAssignRole,
  validateUpdateUserRoles
} from '../../validators/adminValidators.js';

const router = express.Router();

// Middleware để chỉ cho phép admin truy cập
router.use(authenticate, authorize(['admin']));

// GET admin dashboard info
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GET admin dashboard route',
    data: {
      users: 0,
      packages: 0,
      orders: 0,
      revenue: 0
    }
  });
});

// Role routes
router.get('/roles', getAllRoles);
router.get('/roles/:id', getRoleById);
router.post('/roles', validateCreateRole, createRole);
router.put('/roles/:id', validateUpdateRole, updateRole);
router.delete('/roles/:id', deleteRole);

// Permission routes
router.get('/permissions', getAllPermissions);
router.get('/permissions/groups', getPermissionGroups);
router.get('/permissions/:id', getPermissionById);
router.post('/permissions', validateCreatePermission, createPermission);
router.put('/permissions/:id', validateUpdatePermission, updatePermission);
router.delete('/permissions/:id', deletePermission);

// Role-Permission routes
router.get('/roles/:roleId/permissions', getPermissionsByRoleId);
router.post('/role-permissions', validateAssignPermission, assignPermissionToRole);
router.delete('/role-permissions/:role_id/:permission_id', removePermissionFromRole);
router.post('/roles/:role_id/permissions', validateUpdateRolePermissions, updateRolePermissions);

// User-Role routes
router.get('/users/:userId/roles', getRolesByUserId);
router.post('/user-roles', validateAssignRole, assignRoleToUser);
router.delete('/user-roles/:user_id/:role_id', removeRoleFromUser);
router.post('/users/:user_id/roles', validateUpdateUserRoles, updateUserRoles);

export default router;
