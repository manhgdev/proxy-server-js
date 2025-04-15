import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  level: {
    type: Number,
    required: [true, 'Role level is required'],
    min: 0
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  is_reseller: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Indexes
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ level: 1 });

const Role = mongoose.model('Role', RoleSchema);
export default Role; 