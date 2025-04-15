import mongoose from 'mongoose';

const userPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductPackage',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  plan_type: {
    type: String,
    enum: ['static', 'rotating', 'bandwidth'],
    required: true
  },
  start_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  end_date: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  expired: {
    type: Boolean,
    default: false
  },
  expired_at: {
    type: Date,
    default: null
  },
  grace_period_days: {
    type: Number,
    default: 3
  },
  suspension_date: {
    type: Date,
    default: null
  },
  renewal_status: {
    type: String,
    enum: ['not_renewed', 'pending', 'renewed'],
    default: 'not_renewed'
  },
  renewal_price: {
    type: Number,
    required: true
  },
  auto_renew: {
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
  versionKey: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes
userPlanSchema.index({ user_id: 1 });
userPlanSchema.index({ end_date: 1 });
userPlanSchema.index({ active: 1 });
userPlanSchema.index({ user_id: 1, active: 1 });
userPlanSchema.index({ end_date: 1, active: 1 });

// Pre-save hook để cập nhật thời gian
userPlanSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Kiểm tra xem gói đã hết hạn chưa
userPlanSchema.methods.isExpired = function() {
  return this.end_date < new Date();
};

// Gia hạn thêm một giai đoạn
userPlanSchema.methods.renew = async function(durationDays) {
  const currentEndDate = new Date(this.end_date);
  
  // Nếu đã hết hạn, tính từ ngày hiện tại
  if (this.isExpired()) {
    const now = new Date();
    this.end_date = new Date(now.setDate(now.getDate() + durationDays));
  } else {
    // Nếu chưa hết hạn, cộng thêm vào ngày hết hạn hiện tại
    this.end_date = new Date(currentEndDate.setDate(currentEndDate.getDate() + durationDays));
  }
  
  this.renewal_status = 'renewed';
  this.active = true;
  this.expired = false;
  this.expired_at = null;
  
  await this.save();
  return this;
};

// Đánh dấu gói là đã hết hạn
userPlanSchema.methods.markAsExpired = async function() {
  this.active = false;
  this.expired = true;
  this.expired_at = new Date();
  
  await this.save();
  return this;
};

// Phương thức tĩnh để tìm tất cả gói sắp hết hạn
userPlanSchema.statics.findAboutToExpire = async function(dayThreshold = 3) {
  const now = new Date();
  const thresholdDate = new Date(now.setDate(now.getDate() + dayThreshold));
  
  return this.find({
    active: true,
    expired: false,
    end_date: { $lte: thresholdDate, $gt: now }
  }).populate('user_id').populate('package_id');
};

// Phương thức tĩnh để tìm tất cả gói đã hết hạn nhưng chưa được đánh dấu
userPlanSchema.statics.findExpiredButNotMarked = async function() {
  const now = new Date();
  
  return this.find({
    active: true,
    expired: false,
    end_date: { $lt: now }
  }).populate('user_id').populate('package_id');
};

const UserPlan = mongoose.model('UserPlan', userPlanSchema, 'userPlans');

export default UserPlan; 