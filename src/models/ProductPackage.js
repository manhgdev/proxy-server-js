import mongoose from 'mongoose';

const priceTierSchema = new mongoose.Schema({
  min_quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const productPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['static', 'rotating', 'residential', 'datacenter', 'mobile'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['shared', 'dedicated', 'semi-dedicated'],
    index: true
  },
  protocol: {
    type: String,
    required: true,
    enum: ['http', 'https', 'socks5', 'all'],
    default: 'all'
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
  features: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    is_highlighted: Boolean
  }],
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  min_quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  max_quantity: {
    type: Number,
    default: 100
  },
  available_quantity: {
    type: Number,
    default: null
  },
  reseller_discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sort_order: {
    type: Number,
    default: 0
  },
  is_public: {
    type: Boolean,
    default: true
  },
  bandwidth_gb: {
    type: Number,
    default: null
  },
  bandwidth_price_per_gb: {
    type: Number,
    default: null
  },
  pool_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProxyPool',
    default: null
  }
}, { versionKey: false });

// Indexes for better query performance
productPackageSchema.index({ type: 1, category: 1, active: 1 });
productPackageSchema.index({ is_bandwidth: 1, active: 1 });
productPackageSchema.index({ is_rotating: 1, active: 1 });
productPackageSchema.index({ sort_order: 1, active: 1 });
productPackageSchema.index({ is_public: 1, active: 1 });

// Update timestamps
productPackageSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to get price with quantity discount
productPackageSchema.methods.getPriceForQuantity = function(quantity) {
  if (!quantity || quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }
  
  // If no tiers or quantity is 1, return base price
  if (!this.price_tiers || this.price_tiers.length === 0 || quantity === 1) {
    return this.price;
  }
  
  // Sort tiers by min_quantity (descending) to find the highest applicable tier
  const sortedTiers = [...this.price_tiers].sort((a, b) => b.min_quantity - a.min_quantity);
  
  // Find the applicable tier
  const applicableTier = sortedTiers.find(tier => quantity >= tier.min_quantity);
  
  // If found, return tier price, otherwise return base price
  return applicableTier ? applicableTier.price : this.price;
};

// Method to calculate total price for an order
productPackageSchema.methods.calculateTotalPrice = function(quantity) {
  const unitPrice = this.getPriceForQuantity(quantity);
  return unitPrice * quantity;
};

// Method to get reseller price
productPackageSchema.methods.getResellerPrice = function(quantity) {
  const regularPrice = this.calculateTotalPrice(quantity);
  const discountAmount = (regularPrice * this.reseller_discount) / 100;
  return regularPrice - discountAmount;
};

// Static method to find active packages
productPackageSchema.statics.findPublicPackages = async function() {
  return this.find({
    active: true,
    is_public: true
  }).sort({ sort_order: 1, price: 1 });
};

const ProductPackage = mongoose.model('ProductPackage', productPackageSchema, 'productPackages');

export default ProductPackage; 