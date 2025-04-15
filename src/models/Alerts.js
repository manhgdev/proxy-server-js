import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPlan',
    index: true
  },
  type: {
    type: String,
    enum: ['expiry', 'low_balance', 'bandwidth_low', 'system', 'security'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    expiry_date: Date,
    remaining_gb: Number,
    current_balance: Number
  },
  triggered_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  notification_sent: {
    type: Boolean,
    default: false
  },
  notification_method: {
    type: String,
    enum: ['email', 'dashboard', 'both'],
    default: 'dashboard'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false
  }
});

// Index chính
alertSchema.index({ user_id: 1, is_read: 1 });
alertSchema.index({ triggered_at: -1 });
alertSchema.index({ type: 1, user_id: 1 });

// Phương thức tĩnh để tạo cảnh báo sắp hết hạn
alertSchema.statics.createExpiryAlert = async function(userId, planId, expiryDate, planName) {
  const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  
  return this.create({
    user_id: userId,
    plan_id: planId,
    type: 'expiry',
    message: `Gói ${planName} của bạn sẽ hết hạn trong ${daysLeft} ngày.`,
    data: {
      expiry_date: expiryDate
    },
    triggered_at: new Date(),
    is_read: false,
    notification_sent: false,
    notification_method: 'both',
    created_at: new Date()
  });
};

// Phương thức tĩnh để tạo cảnh báo số dư thấp
alertSchema.statics.createLowBalanceAlert = async function(userId, balance, currency) {
  return this.create({
    user_id: userId,
    type: 'low_balance',
    message: `Số dư ví của bạn sắp hết: ${balance} ${currency}`,
    data: {
      current_balance: balance
    },
    triggered_at: new Date(),
    is_read: false,
    notification_sent: false,
    notification_method: 'both',
    created_at: new Date()
  });
};

// Phương thức tĩnh để tạo cảnh báo bandwidth thấp
alertSchema.statics.createLowBandwidthAlert = async function(userId, planId, remainingGB) {
  return this.create({
    user_id: userId,
    plan_id: planId,
    type: 'bandwidth_low',
    message: `Băng thông còn lại của bạn đang thấp: ${remainingGB.toFixed(2)} GB`,
    data: {
      remaining_gb: remainingGB
    },
    triggered_at: new Date(),
    is_read: false,
    notification_sent: false,
    notification_method: 'both',
    created_at: new Date()
  });
};

const Alert = mongoose.model('Alert', alertSchema, 'alerts');

export default Alert; 