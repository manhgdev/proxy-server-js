import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  order_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_source: {
    type: String,
    enum: ['wallet', 'bank_transfer', 'credit_card', 'crypto', 'paypal', 'other'],
    default: 'wallet'
  },
  wallet_trans_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed'],
    default: 'pending',
    index: true
  },
  payment_method: {
    type: String,
    default: null
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  reseller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  commission_rate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  customer_notes: {
    type: String,
    default: ''
  },
  admin_notes: {
    type: String,
    default: ''
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  discount_code: {
    type: String,
    default: null
  },
  ip_address: {
    type: String,
    default: null
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processed_at: {
    type: Date,
    default: null
  }
}, { versionKey: false });

// Compound indexes for better query performance
orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ status: 1, payment_status: 1 });
orderSchema.index({ reseller_id: 1, status: 1 });

// Pre-save middleware to update timestamps
orderSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Static method to generate unique order number
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Get the count of orders created today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const todayOrdersCount = await this.countDocuments({
    created_at: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  // Generate a random suffix (4 digits)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  // Combine to form the order number
  const orderNumber = `ORD-${datePrefix}-${(todayOrdersCount + 1).toString().padStart(4, '0')}-${randomSuffix}`;
  
  // Check if the generated order number already exists
  const existingOrder = await this.findOne({ order_number: orderNumber });
  
  if (existingOrder) {
    // If it exists (very unlikely), try again recursively
    return this.generateOrderNumber();
  }
  
  return orderNumber;
};

// Method to mark order as completed
orderSchema.methods.markAsCompleted = async function(userId) {
  this.status = 'completed';
  this.payment_status = 'paid';
  this.processed_by = userId;
  this.processed_at = Date.now();
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Method to mark order as cancelled
orderSchema.methods.markAsCancelled = async function(userId, reason) {
  this.status = 'cancelled';
  this.admin_notes = reason ? `${this.admin_notes}\nCancelled: ${reason}` : this.admin_notes;
  this.processed_by = userId;
  this.processed_at = Date.now();
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Method to get order items
orderSchema.methods.getItems = async function() {
  const OrderItem = mongoose.model('OrderItem');
  return OrderItem.find({ order_id: this._id }).populate('package_id');
};

// Static method to find pending orders
orderSchema.statics.findPendingOrders = async function() {
  return this.find({
    status: 'pending',
    payment_status: 'pending'
  })
  .sort({ created_at: 1 })
  .populate('user_id', 'username email fullname');
};

const Order = mongoose.model('Order', orderSchema, 'orders');

export default Order; 