import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
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
  group: {
    type: String,
    required: true,
    trim: true
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
permissionSchema.index({ code: 1 }, { unique: true });
permissionSchema.index({ group: 1 });

// Update the updated_at field before saving
permissionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Permission = mongoose.model('Permission', permissionSchema, 'permissions');

export default Permission; 