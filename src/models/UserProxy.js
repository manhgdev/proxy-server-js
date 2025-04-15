import mongoose from 'mongoose';

const userProxySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  proxy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proxy',
    required: true,
    index: true
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPlan',
    required: true,
    index: true
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true,
    index: true
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  last_used_at: {
    type: Date,
    default: null
  },
  auto_renew: {
    type: Boolean,
    default: false
  },
  custom_settings: {
    username: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null
    },
    rotation_interval: {
      type: Number,
      default: null
    },
    sticky_session: {
      type: Boolean,
      default: false
    }
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
  },
  usage_stats: {
    bytes_sent: {
      type: Number,
      default: 0
    },
    bytes_received: {
      type: Number,
      default: 0
    },
    requests_count: {
      type: Number,
      default: 0
    },
    last_ip: {
      type: String,
      default: null
    },
    countries_accessed: [{
      country: String,
      count: Number
    }]
  }
}, { versionKey: false });

// Compound index for user and proxy
userProxySchema.index({ user_id: 1, proxy_id: 1 }, { unique: true });

// Index for expiration monitoring
userProxySchema.index({ expires_at: 1, is_active: 1 });

// Index for user plans
userProxySchema.index({ plan_id: 1, is_active: 1 });

// Update the updated_at field
userProxySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to check if proxy is expired
userProxySchema.methods.isExpired = function() {
  return this.expires_at < new Date();
};

// Method to deactivate proxy
userProxySchema.methods.deactivate = async function() {
  this.is_active = false;
  this.updated_at = Date.now();
  await this.save();
  
  // Update the proxy
  const Proxy = mongoose.model('Proxy');
  await Proxy.findByIdAndUpdate(this.proxy_id, {
    assigned: false,
    updated_at: Date.now()
  });

  return this;
};

// Method to extend expiration
userProxySchema.methods.extend = async function(days) {
  if (days <= 0) {
    throw new Error('Extension days must be greater than zero');
  }
  
  const currentExpiry = new Date(this.expires_at);
  
  // If already expired, extend from current date
  if (this.isExpired()) {
    const now = new Date();
    this.expires_at = new Date(now.setDate(now.getDate() + days));
  } else {
    // If not expired, add days to current expiry
    this.expires_at = new Date(currentExpiry.setDate(currentExpiry.getDate() + days));
  }
  
  // Reactivate if needed
  this.is_active = true;
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Method to update usage stats
userProxySchema.methods.updateUsage = async function(stats) {
  this.usage_stats.bytes_sent += stats.bytes_sent || 0;
  this.usage_stats.bytes_received += stats.bytes_received || 0;
  this.usage_stats.requests_count += 1;
  
  if (stats.client_ip) {
    this.usage_stats.last_ip = stats.client_ip;
  }
  
  if (stats.country) {
    // Find country in array
    const countryIndex = this.usage_stats.countries_accessed.findIndex(
      c => c.country === stats.country
    );
    
    if (countryIndex >= 0) {
      // Update existing country count
      this.usage_stats.countries_accessed[countryIndex].count += 1;
    } else {
      // Add new country
      this.usage_stats.countries_accessed.push({
        country: stats.country,
        count: 1
      });
    }
  }
  
  this.last_used_at = Date.now();
  this.updated_at = Date.now();
  
  await this.save();
  return this;
};

// Static method to find active proxies for a user
userProxySchema.statics.findActiveForUser = async function(userId) {
  return this.find({
    user_id: userId,
    is_active: true,
    expires_at: { $gt: new Date() }
  }).populate('proxy_id').sort({ expires_at: 1 });
};

// Static method to find expired proxies
userProxySchema.statics.findExpired = async function(options = {}) {
  const query = {
    is_active: true,
    expires_at: { $lt: new Date() }
  };
  
  if (options.userId) {
    query.user_id = options.userId;
  }
  
  if (options.planId) {
    query.plan_id = options.planId;
  }
  
  return this.find(query)
    .populate('proxy_id')
    .populate('user_id', 'username email')
    .sort({ expires_at: 1 })
    .limit(options.limit || 100);
};

const UserProxy = mongoose.model('UserProxy', userProxySchema, 'userProxies');

export default UserProxy; 