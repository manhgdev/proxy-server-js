import mongoose from 'mongoose';

const proxySchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true
  },
  port: {
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  protocol: {
    type: String,
    required: true,
    enum: ['http', 'https', 'socks5'],
    default: 'http'
  },
  type: {
    type: String,
    required: true,
    enum: ['datacenter', 'residential', 'mobile', 'rotating'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['shared', 'dedicated', 'semi-dedicated'],
    default: 'shared',
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  isp: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'suspended', 'error'],
    default: 'active',
    index: true
  },
  sold: {
    type: Boolean,
    default: false,
    index: true
  },
  assigned: {
    type: Boolean,
    default: false,
    index: true
  },
  provider_id: {
    type: String,
    default: null
  },
  provider_name: {
    type: String,
    default: null
  },
  host: {
    type: String,
    required: true
  },
  last_checked: {
    type: Date,
    default: null
  },
  last_status: {
    type: String,
    enum: ['online', 'offline', 'unknown'],
    default: 'unknown'
  },
  last_response_time: {
    type: Number,
    default: 0
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

// Ensure indexes for common query patterns
proxySchema.index({ type: 1, status: 1, sold: 1 });
proxySchema.index({ country: 1, type: 1, status: 1 });
proxySchema.index({ provider_id: 1 }, { sparse: true });
proxySchema.index({ created_at: -1 });

// Compound index for proxy filtering
proxySchema.index({ 
  status: 1, 
  type: 1, 
  category: 1, 
  country: 1, 
  sold: 1
});

// Update timestamps
proxySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to get connection string
proxySchema.methods.getConnectionString = function() {
  if (this.protocol === 'socks5') {
    return `socks5://${this.username}:${this.password}@${this.host}:${this.port}`;
  }
  return `http://${this.username}:${this.password}@${this.host}:${this.port}`;
};

// Method to convert to API-friendly format
proxySchema.methods.toApiFormat = function() {
  return {
    id: this._id,
    ip: this.ip,
    port: this.port,
    host: this.host,
    protocol: this.protocol,
    type: this.type,
    category: this.category,
    country: this.country,
    city: this.city,
    region: this.region,
    isp: this.isp,
    status: this.status,
    connection_string: this.getConnectionString(),
    last_checked: this.last_checked,
    last_status: this.last_status
  };
};

// Static method to find available proxies
proxySchema.statics.findAvailable = async function(options = {}) {
  const query = {
    status: 'active',
    sold: false,
    assigned: false
  };
  
  // Apply filters if provided
  if (options.type) query.type = options.type;
  if (options.category) query.category = options.category;
  if (options.country) query.country = options.country;
  if (options.protocol) query.protocol = options.protocol;
  
  return this.find(query).sort({ created_at: 1 }).limit(options.limit || 10);
};

// Static method to mark as sold
proxySchema.statics.markAsSold = async function(proxyId, session = null) {
  const options = session ? { session } : {};
  
  return this.findByIdAndUpdate(
    proxyId,
    { 
      sold: true, 
      assigned: true,
      updated_at: Date.now()
    },
    { 
      new: true,
      ...options
    }
  );
};

const Proxy = mongoose.model('Proxy', proxySchema, 'proxies');

export default Proxy; 