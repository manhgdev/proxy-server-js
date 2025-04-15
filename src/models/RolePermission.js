import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  permission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

// Đảm bảo mỗi vai trò chỉ có mỗi quyền một lần
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

// Cập nhật thời gian chỉnh sửa khi thay đổi
rolePermissionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema, 'rolePermissions');

export default RolePermission; 