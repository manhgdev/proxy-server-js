import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light'
  },
  language: {
    type: String,
    enum: ['en', 'vi'],
    default: 'vi'
  },
  notification_prefs: {
    email: {
      type: Boolean,
      default: true
    },
    dashboard: {
      type: Boolean,
      default: true
    },
    proxy_expiry: {
      type: Boolean,
      default: true
    },
    balance_low: {
      type: Boolean,
      default: true
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
userSettingsSchema.index({ user_id: 1 }, { unique: true });

// Cập nhật thời gian modified trước khi lưu
userSettingsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Phương thức tìm hoặc tạo cài đặt người dùng
userSettingsSchema.statics.findOrCreate = async function(userId) {
  let settings = await this.findOne({ user_id: userId });
  
  if (!settings) {
    settings = await this.create({
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  return settings;
};

const UserSettings = mongoose.model('UserSettings', userSettingsSchema, 'userSettings');

export default UserSettings; 