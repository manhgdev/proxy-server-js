# REST API cho Proxy Server 

## I. Authentication & User Management

### Đăng nhập

```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "user_level": 0,
      "roles": ["admin"]
    }
  }
}
```

### Đăng ký

```
POST /api/auth/register
```

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullname": "Nguyễn Văn A",
  "phone": "0901234567",
  "reseller_code": "RESELLER123" // Mã giới thiệu (nếu có)
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Đăng ký thành công",
  "data": {
    "user_id": "507f1f77bcf86cd799439012",
    "username": "newuser",
    "api_key": "uk_123456789abcdef"
  }
}
```

### Lấy thông tin người dùng

```
GET /api/users/profile
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@example.com",
    "fullname": "Admin User",
    "phone": "0901234567",
    "created_at": "2023-01-01T00:00:00Z",
    "active": true,
    "user_level": 0,
    "roles": ["admin"],
    "wallet": {
      "_id": "507f1f77bcf86cd799439020",
      "balance": 1000.00,
      "currency": "VND"
    },
    "is_reseller": true,
    "parent_id": null
  }
}
```

### Cập nhật thông tin người dùng

```
PUT /api/users/profile
```

**Request:**
```json
{
  "email": "newemail@example.com",
  "password": "newpassword",
  "fullname": "Admin Updated",
  "phone": "0909876543"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Cập nhật thông tin thành công"
}
```

### Quản lý khách hàng (Reseller)

```
GET /api/reseller/customers
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customers": [
      {
        "_id": "507f1f77bcf86cd799439100",
        "username": "customer1",
        "email": "customer1@example.com",
        "fullname": "Khách hàng 1",
        "created_at": "2023-01-01T00:00:00Z",
        "active": true,
        "total_purchases": 1500000
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## II. Quản lý Tài chính

### Lấy thông tin ví

```
GET /api/wallet
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "balance": 1000.00,
    "currency": "VND",
    "locked_amount": 0,
    "last_deposit_at": "2023-01-01T00:00:00Z",
    "is_active": true
  }
}
```

### Lấy lịch sử giao dịch

```
GET /api/wallet/transactions
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439030",
        "type": "deposit",
        "amount": 500.00,
        "balance_before": 500.00,
        "balance_after": 1000.00,
        "currency": "VND",
        "status": "completed",
        "description": "Nạp tiền qua MoMo",
        "bonus_amount": 50.00,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Tạo yêu cầu nạp tiền

```
POST /api/wallet/deposit
```

**Request:**
```json
{
  "amount": 500.00,
  "payment_method": "bank_transfer",
  "payment_details": {
    "bank_name": "Vietcombank",
    "account_number": "1234567890",
    "transaction_id": "VCB12345"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Yêu cầu nạp tiền đã được ghi nhận",
  "data": {
    "transaction_id": "507f1f77bcf86cd799439031",
    "amount": 500.00,
    "status": "pending",
    "payment_method": "bank_transfer"
  }
}
```

### Tạo yêu cầu rút tiền (Reseller)

```
POST /api/wallet/withdraw
```

**Request:**
```json
{
  "amount": 200.00,
  "payment_method": "bank_transfer",
  "payment_details": {
    "bank_name": "Vietcombank",
    "account_number": "1234567890",
    "account_holder": "Nguyễn Văn A",
    "branch": "Hà Nội"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Yêu cầu rút tiền đã được ghi nhận",
  "data": {
    "withdrawal_id": "507f1f77bcf86cd799439040",
    "amount": 200.00,
    "status": "pending"
  }
}
```

### Lấy lịch sử hoa hồng (Reseller)

```
GET /api/reseller/commissions
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "commissions": [
      {
        "_id": "507f1f77bcf86cd799439050",
        "customer_id": "507f1f77bcf86cd799439100",
        "customer_name": "Khách hàng 1",
        "order_id": "507f1f77bcf86cd799439200",
        "amount": 1000.00,
        "commission_rate": 10,
        "commission_amount": 100.00,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_commission": 100.00
  }
}
```

## III. Quản lý Gói Proxy

### Lấy danh sách gói proxy

```
GET /api/packages
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "packages": [
      {
        "_id": "507f1f77bcf86cd799439300",
        "name": "Static Datacenter",
        "description": "Gói proxy máy chủ tốc độ cao",
        "type": "static",
        "category": "datacenter",
        "protocol": "http",
        "is_rotating": false,
        "is_bandwidth": false,
        "duration_days": 30,
        "price": 199000,
        "allowed_countries": ["US", "UK", "CA", "AU"],
        "active": true
      },
      {
        "_id": "507f1f77bcf86cd799439301",
        "name": "Residential Bandwidth",
        "description": "Gói proxy dân cư tính theo băng thông",
        "type": "bandwidth",
        "category": "residential",
        "protocol": "socks5",
        "is_rotating": true,
        "is_bandwidth": true,
        "duration_days": 30,
        "price_per_gb": 50000,
        "allowed_countries": ["VN", "US", "UK", "JP"],
        "active": true
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

### Lấy chi tiết gói proxy

```
GET /api/packages/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439300",
    "name": "Static Datacenter",
    "description": "Gói proxy máy chủ tốc độ cao",
    "type": "static",
    "category": "datacenter",
    "protocol": "http",
    "is_rotating": false,
    "is_bandwidth": false,
    "duration_days": 30,
    "price": 199000,
    "price_tiers": [
      {
        "min_quantity": 5,
        "price": 179000
      },
      {
        "min_quantity": 10,
        "price": 159000
      }
    ],
    "allowed_countries": ["US", "UK", "CA", "AU"],
    "allowed_isps": ["AWS", "GCP", "Azure"],
    "features": ["unlimited_bandwidth", "high_speed", "99_uptime"],
    "active": true
  }
}
```

## IV. Quản lý Đơn hàng

### Tạo đơn hàng mới

```
POST /api/orders
```

**Request:**
```json
{
  "items": [
    {
      "package_id": "507f1f77bcf86cd799439300",
      "quantity": 5,
      "custom_config": {
        "username": "custom_user",
        "password": "custom_pass",
        "countries": ["US", "UK"]
      }
    }
  ],
  "payment_source": "wallet"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Đơn hàng đã được tạo thành công",
  "data": {
    "order_id": "507f1f77bcf86cd799439400",
    "order_number": "ORD12345",
    "total_amount": 995000,
    "payment_status": "paid",
    "status": "completed"
  }
}
```

### Lấy danh sách đơn hàng

```
GET /api/orders
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439400",
        "order_number": "ORD12345",
        "total_amount": 995000,
        "payment_source": "wallet",
        "payment_status": "paid",
        "status": "completed",
        "created_at": "2023-01-01T00:00:00Z",
        "items": [
          {
            "package_id": "507f1f77bcf86cd799439300",
            "package_name": "Static Datacenter",
            "quantity": 5,
            "price": 199000,
            "subtotal": 995000
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Xác nhận thanh toán (manual)

```
POST /api/orders/:id/confirm-payment
```

**Request:**
```json
{
  "payment_method": "bank_transfer",
  "payment_proof": "https://example.com/proof.jpg",
  "amount": 995000
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Thanh toán đã được ghi nhận, đang chờ xác nhận",
  "data": {
    "confirmation_id": "507f1f77bcf86cd799439500",
    "status": "pending"
  }
}
```

## V. Quản lý Proxy

### Lấy danh sách gói proxy đã mua

```
GET /api/my-plans
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "plans": [
      {
        "_id": "507f1f77bcf86cd799439600",
        "package_id": "507f1f77bcf86cd799439300",
        "package_name": "Static Datacenter",
        "plan_type": "static",
        "start_date": "2023-01-01T00:00:00Z",
        "end_date": "2023-01-31T00:00:00Z",
        "active": true,
        "expired": false,
        "renewal_status": "not_set",
        "details": {
          "proxies": [
            {
              "ip": "192.168.1.1",
              "port": 8080,
              "username": "user123",
              "password": "pass123",
              "protocol": "http",
              "country": "US"
            }
          ],
          "is_rotating": false,
          "protocol": "http",
          "category": "datacenter"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Lấy chi tiết gói proxy

```
GET /api/my-plans/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439600",
    "package_id": "507f1f77bcf86cd799439300",
    "package_name": "Static Datacenter",
    "plan_type": "static",
    "start_date": "2023-01-01T00:00:00Z",
    "end_date": "2023-01-31T00:00:00Z",
    "active": true,
    "expired": false,
    "renewal_status": "not_set",
    "static_plan": {
      "proxies": [
        {
          "ip": "192.168.1.1",
          "port": 8080,
          "username": "user123",
          "password": "pass123",
          "protocol": "http",
          "country": "US",
          "city": "New York",
          "isp": "AWS"
        }
      ],
      "is_rotating": false,
      "protocol": "http",
      "category": "datacenter",
      "custom_username": "user123",
      "custom_password": "pass123"
    },
    "usage_stats": {
      "total_requests": 1500,
      "total_bandwidth": 2.5, // GB
      "last_usage": "2023-01-15T10:30:00Z"
    }
  }
}
```

### Cài đặt gia hạn tự động

```
PUT /api/my-plans/:id/renewal
```

**Request:**
```json
{
  "renewal_status": "auto"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Cài đặt gia hạn tự động thành công",
  "data": {
    "plan_id": "507f1f77bcf86cd799439600",
    "renewal_status": "auto",
    "renewal_price": 995000
  }
}
```

### Yêu cầu thay thế proxy

```
POST /api/my-plans/:id/replace-proxy
```

**Request:**
```json
{
  "proxy_id": "507f1f77bcf86cd799439700",
  "reason": "slow"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Yêu cầu thay thế proxy đã được ghi nhận",
  "data": {
    "replacement_id": "507f1f77bcf86cd799439800",
    "status": "pending"
  }
}
```

### Xoay proxy (cho proxy xoay)

```
POST /api/my-plans/:id/rotate
```

**Response:**
```json
{
  "status": "success",
  "message": "Proxy đã được xoay thành công",
  "data": {
    "new_proxy": {
      "ip": "192.168.1.2",
      "port": 8080
    },
    "rotated_at": "2023-01-15T12:30:00Z"
  }
}
```

### Nạp thêm băng thông (cho gói bandwidth)

```
POST /api/my-plans/:id/topup-bandwidth
```

**Request:**
```json
{
  "gb_amount": 5,
  "payment_source": "wallet"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Nạp thêm băng thông thành công",
  "data": {
    "topup_id": "507f1f77bcf86cd799439900",
    "gb_amount": 5,
    "price": 250000,
    "previous_gb_remaining": 1.2,
    "new_gb_total": 6.2
  }
}
```

## VI. Thông báo & Cảnh báo

### Lấy danh sách thông báo

```
GET /api/alerts
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "_id": "507f1f77bcf86cd7994391000",
        "type": "expiry_reminder",
        "message": "Gói proxy của bạn sẽ hết hạn vào ngày 31/01/2023",
        "plan_id": "507f1f77bcf86cd799439600",
        "is_read": false,
        "triggered_at": "2023-01-24T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "unread_count": 1
  }
}
```

### Đánh dấu đã đọc thông báo

```
PUT /api/alerts/:id/read
```

**Response:**
```json
{
  "status": "success",
  "message": "Đã đánh dấu thông báo"
}
``` 