import mongoose from 'mongoose';

const notificationPrefsSchema = new mongoose.Schema({
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
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  language: {
    type: String,
    enum: ['en', 'vi'],
    default: 'en'
  },
  notification_prefs: {
    type: notificationPrefsSchema,
    default: () => ({})
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

// Update the updated_at field on save
settingsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create the Settings model
const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 