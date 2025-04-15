import mongoose from 'mongoose';

const resellerDetailsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  commission_rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  downline_count: {
    type: Number,
    default: 0
  },
  total_sales: {
    type: Number,
    default: 0
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

// Index để tăng tốc truy vấn
resellerDetailsSchema.index({ user_id: 1 }, { unique: true });
resellerDetailsSchema.index({ commission_rate: 1 });

// Cập nhật thời gian cập nhật trước khi lưu
resellerDetailsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Tăng số lượng downline
resellerDetailsSchema.methods.incrementDownlineCount = async function() {
  this.downline_count += 1;
  await this.save();
  return this;
};

// Cập nhật tổng doanh số
resellerDetailsSchema.methods.updateTotalSales = async function(amount) {
  this.total_sales += amount;
  await this.save();
  return this;
};

// Tính toán hoa hồng
resellerDetailsSchema.methods.calculateCommission = function(orderAmount) {
  return (orderAmount * this.commission_rate) / 100;
};

// Tìm hoặc tạo thông tin đại lý
resellerDetailsSchema.statics.findOrCreate = async function(userId, defaultCommissionRate = 10) {
  let resellerDetails = await this.findOne({ user_id: userId });
  
  if (!resellerDetails) {
    resellerDetails = await this.create({
      user_id: userId,
      commission_rate: defaultCommissionRate,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  return resellerDetails;
};

const ResellerDetails = mongoose.model('ResellerDetails', resellerDetailsSchema, 'resellerDetails');

export default ResellerDetails; 