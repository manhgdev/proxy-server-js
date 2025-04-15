import mongoose from 'mongoose';

const userRoleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_at: {
    type: Date,
    default: Date.now
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

// Đảm bảo mỗi người dùng chỉ có mỗi vai trò một lần
userRoleSchema.index({ user_id: 1, role_id: 1 }, { unique: true });
userRoleSchema.index({ user_id: 1 });
userRoleSchema.index({ role_id: 1 });

// Cập nhật thời gian chỉnh sửa khi thay đổi
userRoleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const UserRole = mongoose.model('UserRole', userRoleSchema, 'userRoles');

export default UserRole; 