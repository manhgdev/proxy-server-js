import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config/index.js';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please enter a valid email'
    ]
  },
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [50, 'Full name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  user_level: {
    type: Number,
    default: 3, // 0: Admin, 1: Manager, 2: Reseller, 3: Customer
    enum: [0, 1, 2, 3]
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  api_key: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },
  access_token: {
    type: String,
    select: false
  },
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  billing_info: {
    address: {
      type: String,
      default: ''
    },
    tax_id: {
      type: String,
      default: ''
    },
    company: {
      type: String,
      default: ''
    }
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
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ api_key: 1 }, { unique: true, sparse: true });
UserSchema.index({ parent_id: 1 });
UserSchema.index({ user_level: 1 });

// Virtuals
UserSchema.virtual('is_admin').get(function() {
  return this.user_level === 0;
});

UserSchema.virtual('is_manager').get(function() {
  return this.user_level === 1;
});

UserSchema.virtual('is_reseller').get(function() {
  return this.user_level === 2;
});

UserSchema.virtual('is_customer').get(function() {
  return this.user_level === 3;
});

// Middleware - Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(config.auth.password.saltRounds);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Method to generate API key
UserSchema.methods.generateApiKey = function() {
  // Generate a random API key with prefix
  const prefix = 'uk_';
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  return prefix + randomPart;
};

const User = mongoose.model('User', UserSchema);
export default User; 