# Database Schema - Hệ thống Proxy Server

## Tổng quan

Hệ thống Proxy Server sử dụng MongoDB làm cơ sở dữ liệu chính. Cơ sở dữ liệu được chia thành 4 nhóm chức năng chính:

1. Quản lý Người dùng
2. Quản lý Tài chính
3. Quản lý Proxy
4. Quản lý Đơn hàng

## I. Quản lý Người dùng

### Collection: Users
```javascript
{
  _id: ObjectId,
  username: String,
  password_hash: String,
  email: String,
  fullname: String,
  phone: String,
  user_level: Number,  // 0: Admin, 1: Manager, 2: Reseller, 3: Customer
  parent_id: ObjectId, // Reference to Users (reseller ID)
  created_at: Date,
  updated_at: Date,
  active: Boolean,
  api_key: String,
  access_token: String,
  wallet_id: ObjectId, // Reference to Wallets
  billing_info: {
    address: String,
    tax_id: String,
    company: String
  }
}
```

### Collection: Roles
```javascript
{
  _id: ObjectId,
  name: String,        // admin, manager, reseller, customer
  description: String,
  level: Number,       // Hierarchy level
  is_admin: Boolean,
  is_reseller: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Collection: UserRoles
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,   // Reference to Users
  role_id: ObjectId,   // Reference to Roles
  assigned_at: Date,
  assigned_by: ObjectId, // Reference to Users (who assigned)
  created_at: Date
}
```

### Collection: Permissions
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,        // machine-readable code
  description: String,
  group: String,       // e.g., user, proxy, finance
  created_at: Date
}
```

### Collection: RolePermissions
```javascript
{
  _id: ObjectId,
  role_id: ObjectId,   // Reference to Roles
  permission_id: ObjectId, // Reference to Permissions
  created_at: Date
}
```

### Collection: UserSettings
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,   // Reference to Users
  theme: String,       // light, dark
  language: String,    // en, vi
  notification_prefs: {
    email: Boolean,
    dashboard: Boolean,
    proxy_expiry: Boolean,
    balance_low: Boolean
  },
  created_at: Date,
  updated_at: Date
}
```

### Collection: ResellerDetails
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,   // Reference to Users
  commission_rate: Number, // Percentage
  downline_count: Number,  // Number of customers
  total_sales: Number,
  payment_details: {
    bank_name: String,
    account_number: String,
    account_name: String
  },
  created_at: Date,
  updated_at: Date
}
```

## II. Quản lý Tài chính

### Collection: Wallets
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,   // Reference to Users
  balance: Number,
  currency: String,    // VND, USD
  locked_amount: Number,
  created_at: Date,
  updated_at: Date,
  last_deposit_at: Date,
  is_active: Boolean
}
```

### Collection: WalletTransactions
```javascript
{
  _id: ObjectId,
  wallet_id: ObjectId, // Reference to Wallets
  user_id: ObjectId,   // Reference to Users
  type: String,        // deposit, withdrawal, payment, commission, bonus
  amount: Number,
  balance_before: Number,
  balance_after: Number,
  currency: String,
  status: String,      // pending, completed, failed, cancelled
  description: String,
  bonus_amount: Number, // Only for deposits with bonus
  metadata: {
    payment_method: String,
    order_id: ObjectId,
    invoice_number: String,
    commission_for: ObjectId
  },
  created_at: Date,
  updated_at: Date
}
```

### Collection: BonusTiers
```javascript
{
  _id: ObjectId,
  name: String,
  min_amount: Number,
  bonus_percent: Number,
  bonus_max: Number,   // Maximum bonus amount
  active: Boolean,
  currency: String,
  start_date: Date,
  end_date: Date,      // null for no end date
  description: String,
  created_at: Date,
  updated_at: Date
}
```

### Collection: CommissionLog
```javascript
{
  _id: ObjectId,
  reseller_id: ObjectId, // Reference to Users (reseller)
  customer_id: ObjectId, // Reference to Users (customer)
  order_id: ObjectId,    // Reference to Orders
  transaction_id: ObjectId, // Reference to WalletTransactions
  amount: Number,        // Order amount
  commission_rate: Number, // Percentage
  commission_amount: Number, // Actual commission
  created_at: Date
}
```

### Collection: WithdrawalRequests
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,   // Reference to Users
  amount: Number,
  currency: String,
  status: String,      // pending, approved, rejected, processed
  payment_method: String,
  payment_details: {
    bank_name: String,
    account_number: String,
    account_name: String
  },
  requested_at: Date,
  processed_at: Date,  // When request was processed
  created_at: Date,
  updated_at: Date
}
```

## III. Quản lý Proxy

### Collection: ProductPackages
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String,        // static, rotating, bandwidth
  category: String,    // datacenter, residential, mobile
  protocol: String,    // http, socks5
  is_rotating: Boolean,
  is_bandwidth: Boolean,
  duration_days: Number,
  price: Number,
  price_tiers: [       // Volume discounts
    {
      min_quantity: Number,
      price_per_unit: Number
    }
  ],
  allowed_countries: [String],
  allowed_isps: [String],
  features: [String],
  active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Collection: Proxies
```javascript
{
  _id: ObjectId,
  ip: String,
  port: Number,
  username: String,
  password: String,
  protocol: String,    // http, socks5
  type: String,        // datacenter, residential, mobile
  category: String,    // shared, dedicated
  country: String,     // ISO country code
  city: String,
  region: String,      // State/province
  isp: String,
  status: String,      // active, testing, inactive, error
  sold: Boolean,
  assigned: Boolean,   // Currently assigned to a user
  current_user_id: ObjectId, // Reference to Users
  last_user_id: ObjectId,    // Last user who had this proxy
  health_status: {
    last_check: Date,
    response_time: Number,
    success_rate: Number,
    error_message: String
  },
  created_at: Date,
  updated_at: Date
}
```

### Collection: ProxyPools
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  group: String,       // Categorization
  countries: [String], // Available countries
  isps: [String],      // Available ISPs
  connection_types: [String], // mobile, residential, etc.
  proxy_count: Number,
  active_proxy_count: Number,
  entry_point: String, // Hostname or IP for the pool
  port_range: {
    start: Number,
    end: Number
  },
  username_format: String, // Format for dynamic username generation
  password_format: String, // Format for dynamic password generation
  is_bandwidth_pool: Boolean,
  active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Collection: UserPlans
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,   // Reference to Users
  package_id: ObjectId, // Reference to ProductPackages
  order_id: ObjectId,  // Reference to Orders
  plan_type: String,   // static, rotating, bandwidth
  start_date: Date,
  end_date: Date,
  active: Boolean,
  expired: Boolean,
  expired_at: Date,
  grace_period_days: Number,
  suspension_date: Date,
  renewal_status: String, // not_renewed, pending, renewed
  renewal_price: Number,
  auto_renew: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Collection: StaticProxyPlans
```javascript
{
  _id: ObjectId,
  user_plan_id: ObjectId, // Reference to UserPlans
  proxies: [ObjectId],    // References to Proxies
  protocol: String,      // http, socks5
  category: String,      // datacenter, residential
  is_rotating: Boolean,
  rotation_interval: Number, // In seconds
  rotation_url: String,   // API endpoint for manual rotation
  proxies_released: Boolean, // True if proxies were released after expiry
  previous_proxies: [ObjectId], // Proxies before release
  custom_username: String,
  custom_password: String,
  current_proxy_id: ObjectId, // Current active proxy (for rotating)
  last_rotation: Date
}
```

### Collection: BandwidthPlans
```javascript
{
  _id: ObjectId,
  user_plan_id: ObjectId, // Reference to UserPlans
  gb_amount: Number,      // Total GB purchased
  gb_remaining: Number,   // GB left
  gb_used: Number,
  price_per_gb: Number,
  custom_settings: {
    sticky_sessions: Boolean,
    session_duration: Number
  },
  allowed_pools: [ObjectId], // References to ProxyPools
  allowed_countries: [String],
  current_proxy_id: ObjectId, // Current session proxy
  access_key: String         // API access key
}
```

### Collection: ProxyReplacements
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,       // Reference to Users
  plan_id: ObjectId,       // Reference to UserPlans
  original_proxy_id: ObjectId, // Reference to Proxies
  new_proxy_id: ObjectId,      // Reference to Proxies
  reason: String,
  requested_at: Date,
  processed_at: Date,      // When replacement was processed
  status: String,          // pending, completed, rejected
  created_at: Date,
  updated_at: Date
}
```

### Collection: BandwidthTopups
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,    // Reference to Users
  plan_id: ObjectId,    // Reference to BandwidthPlans
  order_id: ObjectId,   // Reference to Orders
  gb_amount: Number,
  price: Number,
  previous_gb_remaining: Number,
  new_gb_total: Number,
  created_at: Date
}
```

### Collection: RenewalRecords
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,      // Reference to Users
  original_plan_id: ObjectId, // Reference to UserPlans
  new_plan_id: ObjectId,      // Reference to UserPlans
  order_id: ObjectId,     // Reference to Orders
  renewal_date: Date,
  renewal_price: Number,
  auto_renewal: Boolean,
  status: String,         // completed, failed
  created_at: Date
}
```

### Collection: ProxyUsageLogs
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,    // Reference to Users
  plan_id: ObjectId,    // Reference to UserPlans/BandwidthPlans
  proxy_id: ObjectId,   // Reference to Proxies or null for pool
  timestamp: Date,
  request_url: String,  // Target URL (if available)
  bytes_sent: Number,
  bytes_received: Number,
  total_bytes: Number,
  gb_used: Number,      // For bandwidth plans
  success: Boolean,
  error_code: Number,   // HTTP error code if any
  error_message: String,
  location_info: {
    country: String,
    city: String
  },
  created_at: Date
}
```

## IV. Quản lý Đơn hàng

### Collection: Orders
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,    // Reference to Users
  wallet_id: ObjectId,  // Reference to Wallets
  order_number: String,
  total_amount: Number,
  payment_source: String, // wallet, paypal, bank_transfer
  wallet_trans_id: ObjectId, // Reference to WalletTransactions
  status: String,       // pending, completed, cancelled
  payment_method: String,
  payment_status: String, // paid, unpaid, partially_paid
  reseller_id: ObjectId, // If purchased through reseller
  commission_rate: Number, // Reseller commission rate
  created_at: Date,
  updated_at: Date
}
```

### Collection: OrderItems
```javascript
{
  _id: ObjectId,
  order_id: ObjectId,   // Reference to Orders
  package_id: ObjectId, // Reference to ProductPackages
  quantity: Number,
  price: Number,
  subtotal: Number,     // price * quantity
  custom_config: {      // Custom configuration for the package
    protocol: String,
    countries: [String],
    rotation_interval: Number
  },
  created_at: Date
}
```

### Collection: PaymentConfirmations
```javascript
{
  _id: ObjectId,
  order_id: ObjectId,   // Reference to Orders
  user_id: ObjectId,    // Reference to Users
  amount: Number,
  payment_method: String,
  payment_proof: String, // URL to uploaded proof
  confirmation_status: String, // pending, approved, rejected
  confirmed_by: ObjectId, // Reference to Users (admin)
  confirmed_at: Date,
  created_at: Date,
  updated_at: Date
}
```

### Collection: Alerts
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,    // Reference to Users
  plan_id: ObjectId,    // Reference to UserPlans (optional)
  type: String,         // expiry, low_balance, bandwidth_low
  message: String,
  data: {               // Additional data depending on alert type
    expiry_date: Date,
    remaining_gb: Number,
    current_balance: Number
  },
  triggered_at: Date,
  is_read: Boolean,
  notification_sent: Boolean,
  notification_method: String, // email, dashboard, both
  created_at: Date
}
```

## Quan hệ giữa các Collection

### Quan hệ chính
1. Users → Roles (nhiều-nhiều thông qua UserRoles)
2. Roles → Permissions (nhiều-nhiều thông qua RolePermissions)
3. Users → ResellerDetails (một-một)
4. Users → Wallets (một-một)
5. Wallets → WalletTransactions (một-nhiều)
6. Users → Orders (một-nhiều)
7. Orders → OrderItems (một-nhiều)
8. Orders → UserPlans (một-nhiều)
9. UserPlans → StaticProxyPlans/BandwidthPlans (một-một)
10. StaticProxyPlans → Proxies (nhiều-nhiều)
11. BandwidthPlans → ProxyPools (nhiều-nhiều)

### Quan hệ phân cấp người dùng
- Users.parent_id → Users: Cấu trúc đa cấp reseller-customer

## Index chính cần tạo

```javascript
// Users
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ api_key: 1 }, { unique: true, sparse: true })
db.users.createIndex({ parent_id: 1 })
db.users.createIndex({ user_level: 1 })

// Wallets
db.wallets.createIndex({ user_id: 1 }, { unique: true })

// WalletTransactions
db.walletTransactions.createIndex({ wallet_id: 1 })
db.walletTransactions.createIndex({ user_id: 1 })
db.walletTransactions.createIndex({ created_at: -1 })

// Proxies
db.proxies.createIndex({ ip: 1, port: 1 }, { unique: true })
db.proxies.createIndex({ country: 1 })
db.proxies.createIndex({ status: 1 })
db.proxies.createIndex({ assigned: 1 })
db.proxies.createIndex({ current_user_id: 1 })

// UserPlans
db.userPlans.createIndex({ user_id: 1 })
db.userPlans.createIndex({ end_date: 1 })
db.userPlans.createIndex({ active: 1 })

// Orders
db.orders.createIndex({ user_id: 1 })
db.orders.createIndex({ order_number: 1 }, { unique: true })
db.orders.createIndex({ created_at: -1 })

// ProxyUsageLogs
db.proxyUsageLogs.createIndex({ user_id: 1 })
db.proxyUsageLogs.createIndex({ plan_id: 1 })
db.proxyUsageLogs.createIndex({ timestamp: -1 })
db.proxyUsageLogs.createIndex({ proxy_id: 1 })

// Alerts
db.alerts.createIndex({ user_id: 1 })
db.alerts.createIndex({ is_read: 1 })
db.alerts.createIndex({ triggered_at: -1 })
```

## Khởi tạo dữ liệu ban đầu

### Vai trò mặc định
```javascript
const defaultRoles = [
  {
    name: "Admin",
    description: "System administrator with full access",
    level: 0,
    is_admin: true,
    is_reseller: false
  },
  {
    name: "Manager",
    description: "System manager with limited administrative access",
    level: 1,
    is_admin: true,
    is_reseller: false
  },
  {
    name: "Reseller",
    description: "Can sell proxies and manage customers",
    level: 2,
    is_admin: false,
    is_reseller: true
  },
  {
    name: "Customer",
    description: "Regular end user",
    level: 3,
    is_admin: false,
    is_reseller: false
  }
];
```

### Quyền mặc định
```javascript
const defaultPermissions = [
  // User Management
  {
    name: "Manage Users",
    code: "manage_users",
    description: "Create, edit, view users",
    group: "user"
  },
  {
    name: "View Users",
    code: "view_users",
    description: "View users only",
    group: "user"
  },
  
  // Proxy Management
  {
    name: "Manage Proxies",
    code: "manage_proxies",
    description: "Add, edit, delete proxies",
    group: "proxy"
  },
  {
    name: "View Proxies",
    code: "view_proxies",
    description: "View proxy details",
    group: "proxy"
  },
  
  // Finance Management
  {
    name: "Manage Finances",
    code: "manage_finances",
    description: "Manage financial transactions",
    group: "finance"
  },
  {
    name: "Approve Withdrawals",
    code: "approve_withdrawals",
    description: "Approve withdrawal requests",
    group: "finance"
  },
  
  // Orders Management
  {
    name: "Manage Orders",
    code: "manage_orders",
    description: "Create, edit, cancel orders",
    group: "order"
  },
  {
    name: "View Orders",
    code: "view_orders",
    description: "View orders",
    group: "order"
  }
];
```

### Gói dịch vụ mặc định
```javascript
const defaultPackages = [
  // Static proxies - Datacenter
  {
    name: "Datacenter Static - Basic",
    description: "5 dedicated datacenter proxies",
    type: "static",
    category: "datacenter",
    protocol: "http",
    is_rotating: false,
    is_bandwidth: false,
    duration_days: 30,
    price: 250000,
    features: ["dedicated_ip", "unlimited_bandwidth", "high_speed"]
  },
  
  // Static proxies - Residential
  {
    name: "Residential Static - Basic",
    description: "3 dedicated residential proxies",
    type: "static",
    category: "residential",
    protocol: "http",
    is_rotating: false,
    is_bandwidth: false,
    duration_days: 30,
    price: 450000,
    features: ["dedicated_ip", "unlimited_bandwidth", "high_anonymity"]
  },
  
  // Rotating proxies
  {
    name: "Datacenter Rotating - Basic",
    description: "Rotating datacenter proxies",
    type: "rotating",
    category: "datacenter",
    protocol: "http",
    is_rotating: true,
    is_bandwidth: false,
    duration_days: 30,
    price: 350000,
    features: ["rotating_ip", "unlimited_bandwidth", "custom_rotation"]
  },
  
  // Bandwidth model
  {
    name: "Residential Bandwidth - 5GB",
    description: "5GB residential bandwidth",
    type: "bandwidth",
    category: "residential",
    protocol: "http",
    is_rotating: true,
    is_bandwidth: true,
    duration_days: 30,
    price: 500000,
    features: ["high_anonymity", "global_access", "all_countries"]
  }
];
``` 