import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 10
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
}, { versionKey: false });

// Indexes for faster querying
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ level: 1 });

// Update the updated_at field before saving
roleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Role = mongoose.model('Role', roleSchema, 'roles');

export default Role; 