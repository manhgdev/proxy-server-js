# Thiết kế MongoDB Schema cho Hệ thống Proxy Server

## I. Quản lý người dùng

### 1. Users
```javascript
{
  _id: ObjectId,
  username: String,
  password_hash: String,
  email: String,
  fullname: String,
  phone: String,
  created_at: Date,
  updated_at: Date,
  active: Boolean,
  api_key: String,         // Key bảo mật API
  access_token: String,    // Token truy cập
  wallet_id: ObjectId,     // Tham chiếu đến ví tiền
  parent_id: ObjectId,     // Tham chiếu đến reseller quản lý user này
  user_level: Number,      // Cấp bậc người dùng (0: Admin, 1: Manager, 2: Reseller, 3: Customer)
  billing_info: {
    company_name: String,
    tax_id: String,
    address: String,
    payment_methods: [
      {
        type: String,      // "credit_card", "paypal", etc.
        details: Object    // Card info, etc.
      }
    ]
  }
}
```

### 2. Roles
```javascript
{
  _id: ObjectId,
  name: String,             // "Admin", "Manager", "Reseller", "Customer"
  description: String,
  level: Number,            // Numeric level for hierarchy
  is_admin: Boolean,
  is_reseller: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### 3. UserRoles
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,        // Tham chiếu đến người dùng
  role_id: ObjectId,        // Tham chiếu đến vai trò
  assigned_at: Date,
  assigned_by: ObjectId,    // User ID của người gán vai trò
  created_at: Date
}
```

### 4. Permissions
```javascript
{
  _id: ObjectId,
  name: String,             // Tên quyền
  code: String,             // Mã quyền dùng trong code
  description: String,
  group: String,            // Nhóm quyền: "user", "proxy", "billing", etc.
  created_at: Date
}
```

### 5. RolePermissions
```javascript
{
  _id: ObjectId,
  role_id: ObjectId,        // Tham chiếu đến vai trò
  permission_id: ObjectId,  // Tham chiếu đến quyền
  created_at: Date
}
```

### 6. UserSettings
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,        // Tham chiếu đến người dùng
  theme: String,            // "light", "dark"
  language: String,         // "vi", "en"
  notification_prefs: {
    email: Boolean,
    browser: Boolean,
    expiry_reminder_days: Number, // Số ngày trước khi hết hạn để nhắc nhở
    low_balance: Boolean,
    proxy_status: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

### 7. ResellerDetails
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,        // Tham chiếu đến tài khoản là reseller
  commission_rate: Number,  // Tỷ lệ hoa hồng cho reseller
  downline_count: Number,   // Số lượng khách hàng
  total_sales: Number,      // Tổng doanh số
  payment_details: {        // Thông tin thanh toán hoa hồng
    bank_name: String,
    account_number: String,
    account_holder: String
  },
  created_at: Date,
  updated_at: Date
}
```

## II. Quản lý tài chính

### 8. Wallets
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Tham chiếu đến người dùng
  balance: Number,         // Số dư hiện tại 
  currency: String,        // VND, USD, etc.
  locked_amount: Number,   // Số tiền đang tạm khóa
  created_at: Date,
  updated_at: Date,
  last_deposit_at: Date,
  is_active: Boolean
}
```

### 9. WalletTransactions
```javascript
{
  _id: ObjectId,
  wallet_id: ObjectId,
  user_id: ObjectId,
  type: String,            // "deposit", "withdrawal", "purchase", "refund", "renewal"
  amount: Number,          // Số tiền giao dịch
  balance_before: Number,  // Số dư trước giao dịch
  balance_after: Number,   // Số dư sau giao dịch
  currency: String,
  status: String,          // "pending", "completed", "failed", "cancelled"
  description: String,
  bonus_amount: Number,    // Tiền thưởng/hoa hồng nếu có
  metadata: {
    payment_method: String,    // "bank_transfer", "credit_card", etc.
    order_id: ObjectId,        // Tham chiếu đến đơn hàng (nếu có)
    plan_id: ObjectId,         // Tham chiếu đến UserPlans nếu là renewal
    renewal_id: ObjectId,      // Tham chiếu đến RenewalRecords nếu là renewal
    transaction_id: String,    // ID giao dịch từ bên thứ ba
    payment_proof: String      // URL đến ảnh chứng từ
  },
  created_at: Date,
  updated_at: Date
}
```

### 10. BonusTiers
```javascript
{
  _id: ObjectId,
  name: String,              // Tên mức thưởng
  min_amount: Number,        // Số tiền nạp tối thiểu
  bonus_percent: Number,     // Phần trăm thưởng
  bonus_max: Number,         // Số tiền thưởng tối đa (nếu có)
  active: Boolean,
  currency: String,          // VND, USD, etc.
  start_date: Date,          // Ngày bắt đầu áp dụng
  end_date: Date,            // Ngày kết thúc (null nếu không giới hạn)
  description: String,
  created_at: Date,
  updated_at: Date
}
```

### 11. CommissionLog
```javascript
{
  _id: ObjectId,
  reseller_id: ObjectId,     // ID của reseller nhận hoa hồng
  customer_id: ObjectId,     // ID của khách hàng tạo đơn hàng
  order_id: ObjectId,        // Đơn hàng tạo ra hoa hồng
  transaction_id: ObjectId,  // Giao dịch ví liên quan
  amount: Number,            // Số tiền đơn hàng
  commission_rate: Number,   // Tỷ lệ hoa hồng
  commission_amount: Number, // Số tiền hoa hồng
  created_at: Date
}
```

### 12. WithdrawalRequests
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,         // Người dùng yêu cầu rút tiền 
  amount: Number,            // Số tiền yêu cầu rút
  currency: String,
  status: String,            // "pending", "approved", "rejected", "completed"
  payment_method: String,    // "bank_transfer", "paypal", etc.
  payment_details: {
    bank_name: String,
    account_number: String,
    account_holder: String,
    branch: String,
    swift_code: String
  },
  requested_at: Date,
  processed_at: Date,
  created_at: Date,
  updated_at: Date
}
```

## III. Quản lý proxy

### 13. ProductPackages
```javascript
{
  _id: ObjectId,
  name: String,                // "Datacenter Static", "Residential Bandwidth", etc.
  description: String,
  type: String,                // "static", "rotating", "bandwidth"
  category: String,            // "residential", "datacenter"
  protocol: String,            // "http", "socks5", "mixed"
  is_rotating: Boolean,
  is_bandwidth: Boolean,       // True for bandwidth-based packages
  duration_days: Number,
  price: Number,               // Base price or per IP price
  price_per_gb: Number,        // For bandwidth packages
  allowed_countries: [String],
  allowed_isps: [String],
  features: [String],          // "sticky_ip", "country_routing", etc.
  price_tiers: [
    {
      min_quantity: Number,    // Min IPs or GB
      price: Number            // Price at this tier
    }
  ],
  active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### 14. Proxies
```javascript
{
  _id: ObjectId,
  ip: String,
  port: Number,
  username: String,
  password: String,
  protocol: String,           // "http", "socks5"
  type: String,               // "static", "rotating"
  category: String,           // "residential", "datacenter" 
  country: String,            // ISO country code
  city: String,
  region: String,
  isp: String,
  status: String,             // "active", "inactive", "error", "dead"
  sold: Boolean,              // True if it has ever been sold
  assigned: Boolean,          // True if currently assigned to an active plan
  last_user_id: ObjectId,     // Previous user that owned this proxy
  current_user_id: ObjectId,  // Current user that owns this proxy
  created_at: Date,
  updated_at: Date
}
```

### 15. ProxyPools
```javascript
{
  _id: ObjectId,
  name: String,                // "Vietnam Mobile", "US Residential"
  description: String,
  group: String,               // "vn-mobile", "us-residential"
  countries: [String],
  isps: [String],
  connection_types: [String],
  proxy_count: Number,
  active_proxy_count: Number,
  entry_point: String,         // Gateway address
  port_range: {
    start: Number,
    end: Number
  },
  username_format: String,
  password_format: String,
  is_bandwidth_pool: Boolean,  // True if this pool is used for bandwidth plans
  active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### 16. UserPlans
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  package_id: ObjectId,        // Reference to the ProductPackage
  order_id: ObjectId,
  plan_type: String,           // "static", "rotating", "bandwidth"
  start_date: Date,
  end_date: Date,
  active: Boolean,
  expired: Boolean,            // Đánh dấu đã hết hạn
  expired_at: Date,            // Thời điểm hết hạn thực tế (có thể khác end_date)
  renewal_status: String,      // "not_set", "pending", "auto", "disabled"
  renewal_reminder_sent: Boolean,
  renewal_reminder_date: Date,
  renewal_price: Number,       // Stored price for renewal
  grace_period_days: Number,   // Số ngày ân hạn sau khi hết hạn
  suspension_date: Date,       // Ngày tạm ngưng service nếu không gia hạn
  created_at: Date,
  updated_at: Date
}
```

### 17. StaticProxyPlans
```javascript
{
  _id: ObjectId,
  user_plan_id: ObjectId,       // Tham chiếu đến UserPlans
  proxies: [ObjectId],          // Danh sách proxy đã gán
  protocol: String,             // "http", "socks5"
  category: String,             // "residential", "datacenter"
  is_rotating: Boolean,
  rotation_interval: Number,    // Seconds between rotations (if rotating)
  proxies_released: Boolean,    // Đã giải phóng proxy sau khi hết hạn
  proxies_released_at: Date,    // Thời điểm giải phóng proxy
  previous_proxies: [ObjectId], // Danh sách proxy trước khi giải phóng
  rotation_url: String,         // URL to trigger rotation
  custom_username: String,
  custom_password: String,
  current_proxy_id: ObjectId,   // Current active proxy in rotation
  last_rotation: Date           // Last time proxy was rotated
}
```

### 18. BandwidthPlans
```javascript
{
  _id: ObjectId,
  user_plan_id: ObjectId,       // Tham chiếu đến UserPlans
  gb_amount: Number,            // Tổng GB đã mua
  gb_remaining: Number,         // GB còn lại
  gb_used: Number,              // GB đã sử dụng
  price_per_gb: Number,
  custom_settings: Object,      // Cài đặt tùy chỉnh
  allowed_pools: [ObjectId],    // Danh sách pool được phép truy cập
  allowed_countries: [String],  // Giới hạn quốc gia
  current_proxy_id: ObjectId,   // Current proxy in use
  access_key: String,           // API key để truy cập bandwidth
  access_revoked: Boolean,      // Đã thu hồi quyền truy cập
  access_revoked_at: Date       // Thời điểm thu hồi quyền
}
```

### 19. AvailableProxyPool
```javascript
{
  _id: ObjectId,
  proxy_ids: [ObjectId],      // Danh sách proxy có sẵn để bán
  category: String,           // "residential", "datacenter"
  country: String,            // ISO country code
  isp: String,                // Nhà cung cấp dịch vụ
  status: String,             // "active", "checking"
  last_checked: Date,         // Thời điểm kiểm tra gần nhất
  available_count: Number     // Số lượng proxy khả dụng
}
```

### 20. ExpiredProxyRecords
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Người dùng đã sử dụng proxy
  plan_id: ObjectId,          // Gói đã hết hạn
  proxies: [ObjectId],        // Danh sách proxy đã được sử dụng
  expired_at: Date,           // Thời điểm hết hạn
  can_restore_until: Date,    // Thời hạn có thể khôi phục
  restored: Boolean,          // Đã khôi phục chưa
  restored_at: Date,          // Thời điểm khôi phục
  created_at: Date
}
```

### 21. ProxyReplacements
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  plan_id: ObjectId,
  original_proxy_id: ObjectId,  // Proxy được thay thế
  new_proxy_id: ObjectId,       // Proxy mới
  reason: String,               // "dead", "slow", "user_request", "blacklisted"
  requested_at: Date,
  processed_at: Date,
  status: String,               // "pending", "completed", "failed"
  created_at: Date,
  updated_at: Date
}
```

### 22. ProxyLifecycleLogs
```javascript
{
  _id: ObjectId,
  proxy_ids: [ObjectId],        // Danh sách proxy liên quan
  user_id: ObjectId,            // Người dùng liên quan (nếu có)
  plan_id: ObjectId,            // Gói liên quan (nếu có)
  action: String,               // "created", "assigned", "released", "rotated", "replaced", "deleted"
  reason: String,               // "plan_purchased", "plan_expired", "user_request", "proxy_dead", "admin_action"
  previous_status: String,      // Trạng thái trước khi thực hiện action
  new_status: String,           // Trạng thái sau khi thực hiện action
  performed_by: ObjectId,       // User ID người thực hiện (thường là admin hoặc hệ thống)
  performed_at: Date,
  created_at: Date
}
```

### 23. ProxyUsageLogs
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  plan_id: ObjectId,
  proxy_id: ObjectId,
  timestamp: Date,
  request_url: String,          // Target URL (if allowed to track)
  bytes_sent: Number,
  bytes_received: Number,
  total_bytes: Number,
  gb_used: Number,              // GB consumed (for bandwidth plans)
  success: Boolean,             // Request succeeded or failed
  created_at: Date
}
```

### 24. BandwidthTopups
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  plan_id: ObjectId,            // Tham chiếu đến BandwidthPlans
  order_id: ObjectId,           // Đơn hàng mua thêm
  gb_amount: Number,            // Số GB mua thêm
  price: Number,                // Giá mua
  previous_gb_remaining: Number, // GB còn lại trước khi nạp thêm
  new_gb_total: Number,         // Tổng GB sau khi nạp thêm
  created_at: Date
}
```

### 25. RenewalRecords
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  original_plan_id: ObjectId,  // Gói cũ được gia hạn
  order_id: ObjectId,          // Đơn hàng gia hạn
  renewal_date: Date,          // Ngày gia hạn
  renewal_price: Number,       // Giá gia hạn
  auto_renewal: Boolean,       // Gia hạn tự động hay không
  status: String,              // "pending", "completed", "failed"
  created_at: Date
}
```

## IV. Quản lý đơn hàng

### 26. Orders
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  wallet_id: ObjectId,         // Tham chiếu đến ví tiền để thanh toán
  order_number: String,
  total_amount: Number,
  payment_source: String,      // "wallet", "credit_card", "bank_transfer"
  wallet_trans_id: ObjectId,   // Tham chiếu đến giao dịch ví (nếu thanh toán bằng ví)
  status: String,              // "pending", "completed", "cancelled"
  payment_method: String,
  payment_status: String,      // "pending", "paid", "failed"
  reseller_id: ObjectId,       // ID của reseller (nếu đơn này qua reseller)
  commission_rate: Number,     // Tỷ lệ hoa hồng cho reseller
  created_at: Date,
  updated_at: Date
}
```

### 27. OrderItems
```javascript
{
  _id: ObjectId,
  order_id: ObjectId,          // Tham chiếu đến Orders
  package_id: ObjectId,        // Tham chiếu đến ProductPackages
  quantity: Number,            // Số lượng proxy hoặc GB
  price: Number,               // Giá một đơn vị
  subtotal: Number,            // Thành tiền = quantity * price
  custom_config: {             // Cấu hình tùy chỉnh
    username: String,
    password: String,
    rotation_interval: Number,
    countries: [String],
    isps: [String]
  },
  created_at: Date
}
```

### 28. PaymentConfirmations
```javascript
{
  _id: ObjectId,
  order_id: ObjectId,          // Tham chiếu đến Orders
  user_id: ObjectId,
  amount: Number,
  payment_method: String,      // "bank_transfer", "momo", etc.
  payment_proof: String,       // URL đến ảnh chứng từ thanh toán
  confirmation_status: String, // "pending", "confirmed", "rejected"
  confirmed_by: ObjectId,      // Admin xác nhận thanh toán
  confirmed_at: Date,
  created_at: Date,
  updated_at: Date
}
```

### 29. Alerts
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  plan_id: ObjectId,          // Tham chiếu đến UserPlans (nếu có)
  type: String,               // "expiry_reminder", "grace_period", "service_suspended", etc.
  message: String,
  data: Object,               // Dữ liệu tùy theo loại thông báo
  triggered_at: Date,
  is_read: Boolean,
  notification_sent: Boolean,
  notification_method: String // "email", "dashboard", "both"
} 