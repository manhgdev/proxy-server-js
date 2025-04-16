import mongoose from 'mongoose';

const priceTierSchema = new mongoose.Schema({
  min_quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price_per_unit: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['static', 'rotating', 'bandwidth', 'mobile']
  },
  category: {
    type: String,
    required: true,
    enum: ['datacenter', 'residential', 'mobile']
  },
  protocol: {
    type: String,
    required: true,
    enum: ['http', 'https', 'socks5']
  },
  is_rotating: {
    type: Boolean,
    default: false
  },
  is_bandwidth: {
    type: Boolean,
    default: false
  },
  duration_days: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  price_tiers: [priceTierSchema],
  allowed_countries: {
    type: [String],
    default: []
  },
  allowed_isps: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
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

// Tự động cập nhật thời gian cập nhật
packageSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

packageSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

const Package = mongoose.model('Package', packageSchema, 'productPackages');

export default Package;