import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
    index: true
  },
  payment_details: {
    bank_name: {
      type: String,
      default: ''
    },
    account_number: {
      type: String,
      default: ''
    },
    account_name: {
      type: String,
      default: ''
    }
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approved_at: {
    type: Date,
    default: null
  },
  paid_at: {
    type: Date,
    default: null
  },
  rejected_at: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    default: ''
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    default: null
  },
  notes: {
    type: String,
    default: ''
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
withdrawalRequestSchema.index({ user_id: 1, status: 1 });
withdrawalRequestSchema.index({ created_at: -1 });
withdrawalRequestSchema.index({ status: 1, created_at: -1 });

// Pre-save hook
withdrawalRequestSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Phương thức chấp nhận yêu cầu rút tiền
withdrawalRequestSchema.methods.approve = async function(approverId) {
  if (this.status !== 'pending') {
    throw new Error('Chỉ có thể chấp nhận yêu cầu đang ở trạng thái chờ duyệt');
  }
  
  this.status = 'approved';
  this.approved_by = approverId;
  this.approved_at = new Date();
  
  await this.save();
  return this;
};

// Phương thức từ chối yêu cầu rút tiền
withdrawalRequestSchema.methods.reject = async function(approverId, reason) {
  if (this.status !== 'pending') {
    throw new Error('Chỉ có thể từ chối yêu cầu đang ở trạng thái chờ duyệt');
  }
  
  this.status = 'rejected';
  this.approved_by = approverId;
  this.rejected_at = new Date();
  this.rejection_reason = reason;
  
  await this.save();
  return this;
};

// Phương thức đánh dấu đã thanh toán
withdrawalRequestSchema.methods.markAsPaid = async function(transactionId) {
  if (this.status !== 'approved') {
    throw new Error('Chỉ có thể đánh dấu đã thanh toán cho yêu cầu đã được chấp nhận');
  }
  
  this.status = 'paid';
  this.paid_at = new Date();
  this.transaction_id = transactionId;
  
  await this.save();
  return this;
};

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema, 'withdrawalRequests');

export default WithdrawalRequest; 