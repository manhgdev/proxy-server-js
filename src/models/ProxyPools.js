import mongoose from 'mongoose';

const proxyPoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  group: {
    type: String,
    required: true,
    trim: true
  },
  countries: {
    type: [String],
    default: []
  },
  isps: {
    type: [String],
    default: []
  },
  connection_types: {
    type: [String],
    enum: ['datacenter', 'residential', 'mobile'],
    default: ['datacenter']
  },
  proxy_count: {
    type: Number,
    default: 0
  },
  active_proxy_count: {
    type: Number,
    default: 0
  },
  entry_point: {
    type: String,
    required: true,
    trim: true
  },
  port_range: {
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    }
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  is_bandwidth_pool: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
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
proxyPoolSchema.index({ name: 1 }, { unique: true });
proxyPoolSchema.index({ group: 1 });
proxyPoolSchema.index({ active: 1 });
proxyPoolSchema.index({ is_bandwidth_pool: 1 });

// Cập nhật thời gian cập nhật trước khi lưu
proxyPoolSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Phương thức để lấy kết nối cho pool
proxyPoolSchema.methods.getConnectionInfo = function() {
  return {
    entry_point: this.entry_point,
    port_range: this.port_range,
    username: this.username,
    password: this.password
  };
};

// Phương thức tĩnh để tìm proxy pool theo loại kết nối và quốc gia
proxyPoolSchema.statics.findByTypeAndCountry = async function(type, country) {
  return this.find({
    connection_types: type,
    countries: country,
    active: true
  });
};

const ProxyPool = mongoose.model('ProxyPool', proxyPoolSchema, 'proxyPools');

export default ProxyPool; 