import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['datacenter', 'residential', 'mobile', 'isp'],
    default: 'datacenter'
  },
  pricing_model: {
    type: String, 
    enum: ['subscription', 'bandwidth', 'one_time'],
    required: true,
    default: 'subscription'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount_price: {
    type: Number,
    min: 0
  },
  duration_days: {
    type: Number,
    min: 1,
    default: 30
  },
  bandwidth_gb: {
    type: Number,
    min: 0,
    default: 0
  },
  proxy_count: {
    type: Number,
    required: true,
    min: 1
  },
  features: {
    type: [String],
    default: []
  },
  countries: {
    type: [String],
    default: []
  },
  regions: {
    type: [String],
    default: []
  },
  rotation_interval: {
    type: Number, // in minutes, 0 for static proxies
    default: 0
  },
  is_rotating: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    default: 'standard'
  },
  available_stock: {
    type: Number,
    min: 0,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  display_order: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Object,
    default: {}
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

// Indexes for better query performance
packageSchema.index({ type: 1 });
packageSchema.index({ pricing_model: 1 });
packageSchema.index({ is_active: 1, category: 1 });
packageSchema.index({ is_featured: 1, display_order: 1 });

// Pre-save middleware to update timestamps
packageSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Virtual for calculating discounted price
packageSchema.virtual('final_price').get(function() {
  return this.discount_price && this.discount_price < this.price 
    ? this.discount_price 
    : this.price;
});

// Static method to find active packages by type
packageSchema.statics.findActiveByType = function(type) {
  return this.find({ 
    type, 
    is_active: true 
  }).sort({ display_order: 1, price: 1 });
};

// Static method to find featured packages
packageSchema.statics.findFeatured = function() {
  return this.find({ 
    is_active: true,
    is_featured: true 
  }).sort({ display_order: 1 });
};

// Static method to update stock
packageSchema.statics.updateStock = async function(packageId, quantity) {
  const pkg = await this.findById(packageId);
  if (!pkg) {
    throw new Error('Package not found');
  }
  
  pkg.available_stock = Math.max(0, pkg.available_stock - quantity);
  return pkg.save();
};

// Ensure JSON response includes virtual fields
packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

const Package = mongoose.model('Package', packageSchema);

export default Package;