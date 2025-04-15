# REST API - Hệ thống Proxy Server

## Tổng quan

API của Proxy Server tuân theo các tiêu chuẩn RESTful và JWT authentication. Tất cả các endpoints đều trả về cùng một định dạng response.

**Base URL**: `/api/v1`

**Authentication**: Tất cả các endpoints (trừ login, register) đều yêu cầu JWT token trong header:
```
Authorization: Bearer {access_token}
```

**Response Format**:

```json
{
  "status": "success | error",
  "message": "Mô tả kết quả (tùy chọn)",
  "data": { ... } | null,
  "errors": [ ... ] | null
}
```

**Pagination**: Các endpoints có hỗ trợ phân trang sẽ chấp nhận tham số `page` và `limit` trong query string.

## I. Authentication & User Management

### 1. Đăng nhập

```
POST /auth/login
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

### 2. Đăng ký

```
POST /auth/register
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

### 3. Làm mới token

```
POST /auth/refresh-token
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### 4. Đăng xuất

```
POST /auth/logout
```

**Response:**
```json
{
  "status": "success",
  "message": "Đăng xuất thành công"
}
```

### 5. Lấy thông tin người dùng

```
GET /users/profile
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
      "balance": 1000000,
      "currency": "VND"
    },
    "is_reseller": true,
    "parent_id": null
  }
}
```

### 6. Cập nhật thông tin người dùng

```
PUT /users/profile
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

### 7. Quản lý API Key

```
POST /users/api-key/generate
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "api_key": "uk_987654321zyxwvu"
  }
}
```

## II. Quản lý Tài chính

### 1. Lấy thông tin ví

```
GET /wallet
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "balance": 1000000,
    "currency": "VND",
    "locked_amount": 0,
    "last_deposit_at": "2023-01-01T00:00:00Z",
    "is_active": true
  }
}
```

### 2. Lấy lịch sử giao dịch

```
GET /wallet/transactions?page=1&limit=10
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
        "amount": 500000,
        "balance_before": 500000,
        "balance_after": 1000000,
        "currency": "VND",
        "status": "completed",
        "description": "Nạp tiền qua ngân hàng",
        "bonus_amount": 50000,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Tạo yêu cầu nạp tiền

```
POST /wallet/deposit
```

**Request:**
```json
{
  "amount": 500000,
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
    "amount": 500000,
    "status": "pending",
    "payment_method": "bank_transfer"
  }
}
```

### 4. Tạo yêu cầu rút tiền (Reseller)

```
POST /wallet/withdraw
```

**Request:**
```json
{
  "amount": 200000,
  "payment_method": "bank_transfer",
  "payment_details": {
    "bank_name": "Vietcombank",
    "account_number": "0987654321",
    "account_name": "Nguyễn Văn A"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Yêu cầu rút tiền đã được ghi nhận",
  "data": {
    "withdrawal_id": "507f1f77bcf86cd799439032",
    "amount": 200000,
    "status": "pending"
  }
}
```

## III. Quản lý Proxy

### 1. Lấy danh sách gói proxy

```
GET /packages?type=static&category=datacenter
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "packages": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "name": "Datacenter Static - Basic",
        "description": "5 dedicated datacenter proxies",
        "type": "static",
        "category": "datacenter",
        "price": 250000,
        "duration_days": 30,
        "features": ["dedicated_ip", "unlimited_bandwidth", "high_speed"]
      }
    ],
    "total": 1
  }
}
```

### 2. Lấy chi tiết gói proxy

```
GET /packages/507f1f77bcf86cd799439040
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "name": "Datacenter Static - Basic",
    "description": "5 dedicated datacenter proxies",
    "type": "static",
    "category": "datacenter",
    "protocol": "http",
    "is_rotating": false,
    "is_bandwidth": false,
    "duration_days": 30,
    "price": 250000,
    "price_tiers": [
      {
        "min_quantity": 1,
        "price_per_unit": 250000
      },
      {
        "min_quantity": 5,
        "price_per_unit": 230000
      }
    ],
    "allowed_countries": ["US", "UK", "DE", "FR", "JP"],
    "features": ["dedicated_ip", "unlimited_bandwidth", "high_speed"],
    "active": true
  }
}
```

### 3. Lấy danh sách proxy đang sử dụng

```
GET /proxies?page=1&limit=10
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "proxies": [
      {
        "_id": "507f1f77bcf86cd799439050",
        "plan_id": "507f1f77bcf86cd799439045",
        "ip": "203.0.113.1",
        "port": 8080,
        "username": "user123",
        "password": "pass123",
        "protocol": "http",
        "type": "datacenter",
        "country": "US",
        "city": "New York",
        "status": "active",
        "expiry_date": "2023-02-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 4. Lấy chi tiết gói proxy đã mua

```
GET /plans/507f1f77bcf86cd799439045
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439045",
    "package_id": "507f1f77bcf86cd799439040",
    "package_name": "Datacenter Static - Basic",
    "start_date": "2023-01-01T00:00:00Z",
    "end_date": "2023-02-01T00:00:00Z",
    "active": true,
    "auto_renew": false,
    "plan_type": "static",
    "proxies": [
      {
        "_id": "507f1f77bcf86cd799439050",
        "ip": "203.0.113.1",
        "port": 8080,
        "username": "user123",
        "password": "pass123",
        "protocol": "http",
        "country": "US"
      }
    ]
  }
}
```

### 5. Yêu cầu thay thế proxy

```
POST /proxies/507f1f77bcf86cd799439050/replace
```

**Request:**
```json
{
  "reason": "slow_speed",
  "details": "Proxy quá chậm, tốc độ dưới 1Mbps"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Yêu cầu thay thế proxy đã được ghi nhận",
  "data": {
    "replacement_id": "507f1f77bcf86cd799439055",
    "status": "pending"
  }
}
```

### 6. Kiểm tra tình trạng proxy

```
GET /proxies/507f1f77bcf86cd799439050/status
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "proxy_id": "507f1f77bcf86cd799439050",
    "is_active": true,
    "response_time": 120, // ms
    "success_rate": 98.5, // %
    "last_check": "2023-01-10T12:00:00Z",
    "location": {
      "country": "US",
      "city": "New York",
      "isp": "Cloudflare"
    }
  }
}
```

### 7. Xoay proxy (cho Rotating Proxy)

```
POST /proxies/rotate
```

**Request:**
```json
{
  "plan_id": "507f1f77bcf86cd799439046"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Xoay proxy thành công",
  "data": {
    "previous_ip": "203.0.113.1",
    "new_ip": "203.0.113.2"
  }
}
```

### 8. Nạp thêm băng thông

```
POST /plans/507f1f77bcf86cd799439047/topup
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
    "topup_id": "507f1f77bcf86cd799439060",
    "previous_gb_remaining": 1.2,
    "new_gb_total": 6.2,
    "transaction_id": "507f1f77bcf86cd799439065"
  }
}
```

## IV. Quản lý Đơn hàng

### 1. Tạo đơn hàng mới

```
POST /orders
```

**Request:**
```json
{
  "items": [
    {
      "package_id": "507f1f77bcf86cd799439040",
      "quantity": 1,
      "custom_config": {
        "countries": ["US", "UK"],
        "protocol": "http"
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
  "message": "Đơn hàng đã được tạo",
  "data": {
    "order_id": "507f1f77bcf86cd799439070",
    "order_number": "ORD123456",
    "total_amount": 250000,
    "payment_status": "paid",
    "transaction_id": "507f1f77bcf86cd799439075",
    "plans": [
      {
        "plan_id": "507f1f77bcf86cd799439080",
        "package_name": "Datacenter Static - Basic",
        "start_date": "2023-01-15T00:00:00Z",
        "end_date": "2023-02-15T00:00:00Z"
      }
    ]
  }
}
```

### 2. Lấy lịch sử đơn hàng

```
GET /orders?page=1&limit=10
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439070",
        "order_number": "ORD123456",
        "total_amount": 250000,
        "payment_status": "paid",
        "status": "completed",
        "payment_method": "wallet",
        "created_at": "2023-01-15T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Lấy chi tiết đơn hàng

```
GET /orders/507f1f77bcf86cd799439070
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "order_number": "ORD123456",
    "total_amount": 250000,
    "payment_status": "paid",
    "status": "completed",
    "payment_method": "wallet",
    "created_at": "2023-01-15T00:00:00Z",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439071",
        "package_id": "507f1f77bcf86cd799439040",
        "package_name": "Datacenter Static - Basic",
        "quantity": 1,
        "price": 250000,
        "subtotal": 250000,
        "custom_config": {
          "countries": ["US", "UK"],
          "protocol": "http"
        }
      }
    ],
    "plans": [
      {
        "plan_id": "507f1f77bcf86cd799439080",
        "package_name": "Datacenter Static - Basic",
        "start_date": "2023-01-15T00:00:00Z",
        "end_date": "2023-02-15T00:00:00Z"
      }
    ]
  }
}
```

### 4. Gia hạn proxy

```
POST /plans/507f1f77bcf86cd799439080/renew
```

**Request:**
```json
{
  "payment_source": "wallet",
  "duration_months": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Gia hạn thành công",
  "data": {
    "renewal_id": "507f1f77bcf86cd799439085",
    "order_id": "507f1f77bcf86cd799439090",
    "new_end_date": "2023-03-15T00:00:00Z",
    "transaction_id": "507f1f77bcf86cd799439095"
  }
}
```

## V. Thống kê và Báo cáo (Reseller)

### 1. Thống kê tổng quan

```
GET /reseller/dashboard
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customers_count": 15,
    "active_plans_count": 25,
    "total_sales": 15000000,
    "this_month_sales": 3000000,
    "commission_balance": 750000,
    "recent_activities": [
      {
        "type": "new_customer",
        "customer": "customer3",
        "timestamp": "2023-01-15T00:00:00Z"
      },
      {
        "type": "new_order",
        "customer": "customer1",
        "amount": 450000,
        "timestamp": "2023-01-14T00:00:00Z"
      }
    ]
  }
}
```

### 2. Báo cáo hoa hồng

```
GET /reseller/commissions?start_date=2023-01-01&end_date=2023-01-31
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "commissions": [
      {
        "_id": "507f1f77bcf86cd799439100",
        "customer_id": "507f1f77bcf86cd799439101",
        "customer_username": "customer1",
        "order_id": "507f1f77bcf86cd799439102",
        "amount": 450000,
        "commission_rate": 10,
        "commission_amount": 45000,
        "created_at": "2023-01-14T00:00:00Z"
      }
    ],
    "total_amount": 45000,
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## VI. API Admin

### 1. Quản lý người dùng

```
GET /admin/users?page=1&limit=10
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "username": "admin",
        "email": "admin@example.com",
        "user_level": 0,
        "created_at": "2023-01-01T00:00:00Z",
        "active": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 2. Quản lý gói proxy

```
POST /admin/packages
```

**Request:**
```json
{
  "name": "Residential Static - Premium",
  "description": "10 dedicated residential proxies",
  "type": "static",
  "category": "residential",
  "protocol": "http",
  "is_rotating": false,
  "is_bandwidth": false,
  "duration_days": 30,
  "price": 650000,
  "features": ["dedicated_ip", "unlimited_bandwidth", "high_anonymity"]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Gói proxy đã được tạo",
  "data": {
    "package_id": "507f1f77bcf86cd799439110"
  }
}
```

### 3. Quản lý xác nhận nạp tiền

```
PUT /admin/deposit/507f1f77bcf86cd799439120/approve
```

**Response:**
```json
{
  "status": "success",
  "message": "Yêu cầu nạp tiền đã được xác nhận",
  "data": {
    "transaction_id": "507f1f77bcf86cd799439120",
    "wallet_id": "507f1f77bcf86cd799439020",
    "amount": 500000,
    "bonus_amount": 50000,
    "status": "completed"
  }
}
``` 