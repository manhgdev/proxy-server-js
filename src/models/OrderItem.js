import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  item_total: {
    type: Number,
    required: true,
    min: 0
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  final_price: {
    type: Number,
    required: true,
    min: 0
  },
  attributes: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  proxies_assigned: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Proxy',
    default: []
  },
  user_plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPlan',
    default: null
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

// Compound indexes for better query performance
orderItemSchema.index({ order_id: 1, package_id: 1 });
orderItemSchema.index({ user_plan_id: 1 });

// Pre-save middleware to update timestamps
orderItemSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // Calculate final price if not set manually
  if (!this.final_price) {
    this.final_price = this.item_total - this.discount_amount;
  }
  
  next();
});

// Pre-save middleware to calculate item_total from unit_price and quantity
orderItemSchema.pre('save', function(next) {
  if (this.isModified('unit_price') || this.isModified('quantity')) {
    this.item_total = this.unit_price * this.quantity;
    this.final_price = this.item_total - this.discount_amount;
  }
  next();
});

// Static method to find items for an order
orderItemSchema.statics.findByOrderId = function(orderId) {
  return this.find({ order_id: orderId })
    .populate('package_id')
    .sort({ created_at: 1 });
};

// Method to add assigned proxies
orderItemSchema.methods.assignProxies = async function(proxyIds) {
  if (!Array.isArray(proxyIds)) {
    proxyIds = [proxyIds];
  }
  
  // Add proxies to the assigned list (avoiding duplicates)
  this.proxies_assigned = [...new Set([...this.proxies_assigned, ...proxyIds])];
  
  // If all proxies are assigned, mark as completed
  if (this.proxies_assigned.length >= this.quantity) {
    this.status = 'completed';
  } else if (this.proxies_assigned.length > 0) {
    this.status = 'processing';
  }
  
  await this.save();
  return this;
};

// Method to remove assigned proxies
orderItemSchema.methods.removeProxies = async function(proxyIds) {
  if (!Array.isArray(proxyIds)) {
    proxyIds = [proxyIds];
  }
  
  // Convert ObjectIDs to strings for comparison
  const proxyIdsStr = proxyIds.map(id => id.toString());
  
  // Filter out the proxies to be removed
  this.proxies_assigned = this.proxies_assigned.filter(
    id => !proxyIdsStr.includes(id.toString())
  );
  
  // Update status based on remaining assigned proxies
  if (this.proxies_assigned.length === 0) {
    this.status = 'pending';
  } else if (this.proxies_assigned.length < this.quantity) {
    this.status = 'processing';
  }
  
  await this.save();
  return this;
};

// Method to get associated package
orderItemSchema.methods.getPackage = async function() {
  if (!this.populated('package_id')) {
    await this.populate('package_id');
  }
  return this.package_id;
};

// Method to link to a user plan
orderItemSchema.methods.linkToUserPlan = async function(userPlanId) {
  this.user_plan_id = userPlanId;
  await this.save();
  return this;
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema, 'order_items');

export default OrderItem; 