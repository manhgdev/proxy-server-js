# 📘 API Testing Guide với cURL

┌─────────────────────────────────────────────────────────────┐
│                🛠️ Cài đặt và Cấu hình                      │
└─────────────────────────────────────────────────────────────┘
---

### 📦 Cài đặt cURL
```bash
brew install curl
```

### ⚙️ Cấu hình môi trường
```bash
# API URL và port
export API_URL=http://localhost:3001
```

┌─────────────────────────────────────────────────────────────┐
│                    🔍 Health Check                          │
└─────────────────────────────────────────────────────────────┘
---

### 💓 Kiểm tra trạng thái server
```bash
curl -s $API_URL/health
```

┌─────────────────────────────────────────────────────────────┐
│               🔐 Xác thực (Authentication)                  │
└─────────────────────────────────────────────────────────────┘
---

### 📝 Đăng ký tài khoản mới
```bash
curl -s $API_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "password123", 
    "fullname": "Test User", 
    "username": "testuser"
  }'
```

### 🔑 Đăng nhập
```bash
curl -s $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser", 
    "password": "password123"
  }'
```

### 💾 Lưu token cho các request sau
```bash
token=$(curl -s $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser", 
    "password": "password123"
  }' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo $token
```

### 👑 Đăng nhập tài khoản Admin
```bash
admin_token=$(curl -s $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin", 
    "password": "admin_initial_password"
  }' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo $admin_token
```

### 🔄 Làm mới token
```bash
curl -s $API_URL/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token_here"
  }'
```

### 🚪 Đăng xuất
```bash
curl -s $API_URL/api/v1/auth/logout \
  -H "Authorization: Bearer $token"
```

### 👤 Lấy thông tin người dùng hiện tại
```bash
curl -s $API_URL/api/v1/auth/me \
  -H "Authorization: Bearer $token"
```

### 🔏 Đổi mật khẩu
```bash
curl -s $API_URL/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "current_password": "password123",
    "new_password": "newpassword123"
  }'
```

### 🔑 Tạo API key
```bash
curl -s $API_URL/api/v1/auth/generate-api-key \
  -H "Authorization: Bearer $token"
```

┌─────────────────────────────────────────────────────────────┐
│                  👥 Quản lý Người dùng                      │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy danh sách người dùng (Admin/Reseller)
```bash
curl -s $API_URL/api/v1/users \
  -H "Authorization: Bearer $admin_token"
```

### 🔍 Lấy thông tin người dùng theo ID
```bash
curl -s $API_URL/api/v1/users/USER_ID \
  -H "Authorization: Bearer $admin_token"
```

### ➕ Tạo người dùng mới (Admin)
```bash
curl -s $API_URL/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "fullname": "New User",
    "user_level": 3
  }'
```

### ✏️ Cập nhật thông tin người dùng (Admin)
```bash
curl -s $API_URL/api/v1/users/USER_ID \
  -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "fullname": "Updated User Name",
    "phone": "0123456789",
    "user_level": 3,
    "active": true
  }'
```

### ❌ Xóa người dùng (Admin)
```bash
curl -s $API_URL/api/v1/users/USER_ID \
  -X DELETE \
  -H "Authorization: Bearer $admin_token"
```

### 🖋️ Cập nhật thông tin cá nhân
```bash
curl -s $API_URL/api/v1/users/profile/update \
  -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "fullname": "Updated Name",
    "phone": "0987654321",
    "billing_info": {
      "address": "123 Street",
      "city": "City",
      "country": "Country"
    }
  }'
```

### 📦 Lấy danh sách gói proxy của người dùng
```bash
curl -s $API_URL/api/v1/users/USER_ID/plans \
  -H "Authorization: Bearer $admin_token"
```

### 👥 Lấy roles của người dùng
```bash
curl -s $API_URL/api/v1/users/USER_ID/roles \
  -H "Authorization: Bearer $admin_token"
```

### 🔒 Lấy permissions của người dùng
```bash
curl -s $API_URL/api/v1/users/USER_ID/permissions \
  -H "Authorization: Bearer $admin_token"
```

┌─────────────────────────────────────────────────────────────┐
│                  📦 Quản lý Gói Proxy                       │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy danh sách gói proxy
```bash
curl -s $API_URL/api/v1/packages \
  -H "Authorization: Bearer $token"
```

### 🟢 Lấy danh sách gói proxy đang hoạt động (public)
```bash
curl -s $API_URL/api/v1/packages/active
```

### 🔍 Lấy thông tin gói proxy theo ID
```bash
curl -s $API_URL/api/v1/packages/PACKAGE_ID \
  -H "Authorization: Bearer $token"
```

### ➕ Tạo gói proxy mới (Admin)
```bash
curl -s $API_URL/api/v1/packages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "name": "New Proxy Package",
    "description": "Description of new package",
    "type": "static",
    "category": "datacenter",
    "protocol": "http",
    "is_rotating": false,
    "is_bandwidth": false,
    "duration_days": 30,
    "price": 250000,
    "price_tiers": [
      {"min_quantity": 1, "price_per_unit": 250000},
      {"min_quantity": 5, "price_per_unit": 230000}
    ],
    "allowed_countries": ["US", "GB", "DE"],
    "allowed_isps": ["Amazon", "Google"],
    "features": ["dedicated_ip", "unlimited_bandwidth"],
    "active": true
  }'
```

### ✏️ Cập nhật gói proxy (Admin)
```bash
curl -s $API_URL/api/v1/packages/PACKAGE_ID \
  -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "name": "Updated Package Name",
    "price": 260000,
    "active": true
  }'
```

### ❌ Xóa gói proxy (Admin)
```bash
curl -s $API_URL/api/v1/packages/PACKAGE_ID \
  -X DELETE \
  -H "Authorization: Bearer $admin_token"
```

┌─────────────────────────────────────────────────────────────┐
│                  🛒 Quản lý Đơn hàng                        │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy danh sách đơn hàng (Admin)
```bash
curl -s $API_URL/api/v1/orders \
  -H "Authorization: Bearer $admin_token"
```

### 🔍 Lấy đơn hàng của tôi
```bash
curl -s $API_URL/api/v1/orders/my \
  -H "Authorization: Bearer $token"
```

### 🏪 Lấy đơn hàng của reseller
```bash
curl -s $API_URL/api/v1/orders/reseller \
  -H "Authorization: Bearer $token"
```

### 📝 Lấy thông tin đơn hàng theo ID
```bash
curl -s $API_URL/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer $token"
```

### 📦 Lấy chi tiết các mục trong đơn hàng
```bash
curl -s $API_URL/api/v1/orders/ORDER_ID/items \
  -H "Authorization: Bearer $token"
```

### ➕ Tạo đơn hàng mới
```bash
curl -s $API_URL/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "items": [
      {
        "package_id": "PACKAGE_ID",
        "quantity": 1,
        "custom_config": {
          "countries": ["US"],
          "city": "New York"
        }
      }
    ],
    "payment_method": "wallet"
  }'
```

### ❌ Hủy đơn hàng
```bash
curl -s $API_URL/api/v1/orders/ORDER_ID/cancel \
  -X POST \
  -H "Authorization: Bearer $token"
```

┌─────────────────────────────────────────────────────────────┐
│                    🌐 Quản lý Proxy                         │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy danh sách proxy của người dùng
```bash
curl -s $API_URL/api/v1/proxies \
  -H "Authorization: Bearer $token"
```

### 🔍 Lấy chi tiết proxy theo ID
```bash
curl -s $API_URL/api/v1/proxies/PROXY_ID \
  -H "Authorization: Bearer $token"
```

### 🔄 Xoay proxy (đối với proxy quay vòng)
```bash
curl -s $API_URL/api/v1/proxies/PROXY_ID/rotate \
  -X POST \
  -H "Authorization: Bearer $token"
```

### ✅ Kiểm tra trạng thái proxy
```bash
curl -s $API_URL/api/v1/proxies/PROXY_ID/status \
  -H "Authorization: Bearer $token"
```

### ⚙️ Cập nhật tùy chỉnh proxy
```bash
curl -s $API_URL/api/v1/proxies/PROXY_ID/settings \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "username": "custom_username",
    "password": "custom_password",
    "rotation_interval": 30,
    "sticky_session": true,
    "notes": "My custom proxy settings"
  }'
```

┌─────────────────────────────────────────────────────────────┐
│                 📋 Quản lý Gói đã Mua                       │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy tất cả gói proxy đã mua (Admin)
```bash
curl -s $API_URL/api/v1/plans \
  -H "Authorization: Bearer $admin_token"
```

### 🔍 Lấy gói proxy của tôi
```bash
curl -s $API_URL/api/v1/plans/my \
  -H "Authorization: Bearer $token"
```

### 🏪 Lấy gói proxy của khách hàng (Reseller)
```bash
curl -s $API_URL/api/v1/plans/reseller \
  -H "Authorization: Bearer $token"
```

### 📝 Lấy chi tiết gói proxy theo ID
```bash
curl -s $API_URL/api/v1/plans/PLAN_ID \
  -H "Authorization: Bearer $token"
```

### 🔄 Bật/tắt tự động gia hạn gói proxy
```bash
curl -s $API_URL/api/v1/plans/PLAN_ID/toggle-auto-renew \
  -X POST \
  -H "Authorization: Bearer $token"
```

### ❌ Hủy gói proxy
```bash
curl -s $API_URL/api/v1/plans/PLAN_ID/cancel \
  -X POST \
  -H "Authorization: Bearer $token"
```

### 🔄 Gia hạn gói proxy
```bash
curl -s $API_URL/api/v1/plans/PLAN_ID/renew \
  -X POST \
  -H "Authorization: Bearer $token"
```

┌─────────────────────────────────────────────────────────────┐
│                  💰 Quản lý Ví tiền                         │
└─────────────────────────────────────────────────────────────┘
---

### 🔍 Xem thông tin ví của tôi

```bash
curl -X GET http://localhost:3001/api/v1/wallet/me \
  -H "Authorization: Bearer ${TOKEN}"
```

### 📋 Xem lịch sử giao dịch

```bash
curl -X GET http://localhost:3001/api/v1/wallet/transactions \
  -H "Authorization: Bearer ${TOKEN}"
```

### ➕ Yêu cầu nạp tiền

```bash
curl -X POST http://localhost:3001/api/v1/wallet/deposit \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "payment_details": {
      "payment_method": "bank_transfer",
      "bank_name": "Techcombank",
      "account_number": "19023849203",
      "account_name": "Nguyen Van A"
    }
  }'
```

### ➕ Yêu cầu rút tiền

```bash
curl -X POST http://localhost:3001/api/v1/wallet/withdraw \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "payment_details": {
      "bank_name": "Vietcombank",
      "account_number": "1902384920",
      "account_name": "Nguyen Van A"
    }
  }'
```

### 📊 Thống kê ví (Chỉ Admin)

```bash
curl -X GET http://localhost:3001/api/v1/wallet/stats \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### 🔍 Xem ví của người dùng khác (Chỉ Admin)

```bash
curl -X GET http://localhost:3001/api/v1/wallet/user/USER_ID \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

┌─────────────────────────────────────────────────────────────┐
│                   👑 Quản lý Admin                          │
└─────────────────────────────────────────────────────────────┘
---

### 📊 Thông tin dashboard admin
```bash
curl -s $API_URL/api/v1/admin/dashboard \
  -H "Authorization: Bearer $admin_token"
```

### 👥 Lấy danh sách roles
```bash
curl -s $API_URL/api/v1/admin/roles \
  -H "Authorization: Bearer $admin_token"
```

### 🔍 Lấy role theo ID
```bash
curl -s $API_URL/api/v1/admin/roles/ROLE_ID \
  -H "Authorization: Bearer $admin_token"
```

### ➕ Tạo role mới
```bash
curl -s $API_URL/api/v1/admin/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "name": "Support",
    "description": "Support staff role",
    "level": 2,
    "is_admin": true,
    "is_reseller": false
  }'
```

### 🔒 Lấy danh sách permissions
```bash
curl -s $API_URL/api/v1/admin/permissions \
  -H "Authorization: Bearer $admin_token"
```

### 🔍 Lấy danh sách nhóm permission
```bash
curl -s $API_URL/api/v1/admin/permissions/groups \
  -H "Authorization: Bearer $admin_token"
```

### ➡️ Gán permission cho role
```bash
curl -s $API_URL/api/v1/admin/role-permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "role_id": "ROLE_ID",
    "permission_id": "PERMISSION_ID"
  }'
```

### ➡️ Gán role cho user
```bash
curl -s $API_URL/api/v1/admin/user-roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "user_id": "USER_ID",
    "role_id": "ROLE_ID"
  }'
```

┌─────────────────────────────────────────────────────────────┐
│                  🏪 Quản lý Đại lý                          │
└─────────────────────────────────────────────────────────────┘
---

### 🔍 Lấy thông tin đại lý
```bash
curl -s $API_URL/api/v1/reseller/profile \
  -H "Authorization: Bearer $token"
```

### ✏️ Cập nhật thông tin đại lý
```bash
curl -s $API_URL/api/v1/reseller/profile \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "payment_details": {
      "bank_name": "Vietcombank",
      "account_number": "1234567890",
      "account_name": "Nguyen Van A"
    }
  }'
```

### 👥 Lấy danh sách khách hàng của đại lý
```bash
curl -s $API_URL/api/v1/reseller/customers \
  -H "Authorization: Bearer $token"
```

### ➕ Tạo khách hàng mới (Reseller)
```bash
curl -s $API_URL/api/v1/reseller/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "username": "newcustomer",
    "email": "customer@example.com",
    "password": "password123",
    "fullname": "New Customer",
    "phone": "0987654321"
  }'
```

### 💰 Lấy lịch sử hoa hồng
```bash
curl -s $API_URL/api/v1/reseller/commissions \
  -H "Authorization: Bearer $token"
```

### 💸 Yêu cầu rút tiền hoa hồng
```bash
curl -s $API_URL/api/v1/reseller/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "amount": 500000,
    "bank_info": {
      "bank_name": "Vietcombank",
      "account_number": "1234567890",
      "account_name": "Nguyen Van A"
    }
  }'
```

### 📊 Lấy thống kê của đại lý
```bash
curl -s $API_URL/api/v1/reseller/stats \
  -H "Authorization: Bearer $token"
```

┌─────────────────────────────────────────────────────────────┐
│                 🌐 Quản lý Proxy Pool                       │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy danh sách pool proxy (Admin)
```bash
curl -s $API_URL/api/v1/proxy-pools \
  -H "Authorization: Bearer $admin_token"
```

### 🔍 Lấy thông tin pool proxy theo ID
```bash
curl -s $API_URL/api/v1/proxy-pools/POOL_ID \
  -H "Authorization: Bearer $admin_token"
```

### ➕ Tạo pool proxy mới (Admin)
```bash
curl -s $API_URL/api/v1/proxy-pools \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "name": "US Datacenter Pool",
    "description": "Pool of US datacenter proxies",
    "group": "US-DC",
    "countries": ["US"],
    "isps": ["Amazon", "Google"],
    "connection_types": ["datacenter"],
    "entry_point": "us-proxy.example.com",
    "port_range": {
      "start": 10000,
      "end": 20000
    },
    "username": "admin",
    "password": "secure_pass",
    "is_bandwidth_pool": false,
    "active": true
  }'
```

### ✏️ Cập nhật pool proxy (Admin)
```bash
curl -s $API_URL/api/v1/proxy-pools/POOL_ID \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $admin_token" \
  -d '{
    "name": "Updated Pool Name",
    "description": "Updated description",
    "active": true
  }'
```

### ❌ Xóa pool proxy (Admin)
```bash
curl -s $API_URL/api/v1/proxy-pools/POOL_ID \
  -X DELETE \
  -H "Authorization: Bearer $admin_token"
```

┌─────────────────────────────────────────────────────────────┐
│                 🔔 Quản lý Thông báo                        │
└─────────────────────────────────────────────────────────────┘
---

### 📋 Lấy thông báo của người dùng
```bash
curl -s $API_URL/api/v1/alerts \
  -H "Authorization: Bearer $token"
```

### ✓ Đánh dấu thông báo đã đọc
```bash
curl -s $API_URL/api/v1/alerts/ALERT_ID/read \
  -X PATCH \
  -H "Authorization: Bearer $token"
```

### ✓✓ Đánh dấu tất cả thông báo là đã đọc
```bash
curl -s $API_URL/api/v1/alerts/read-all \
  -X PATCH \
  -H "Authorization: Bearer $token"
```

### ❌ Xóa một thông báo
```bash
curl -s $API_URL/api/v1/alerts/ALERT_ID \
  -X DELETE \
  -H "Authorization: Bearer $token"
```

### 🗑️ Xóa tất cả thông báo
```bash
curl -s $API_URL/api/v1/alerts/delete-all \
  -X DELETE \
  -H "Authorization: Bearer $token"
```

┌─────────────────────────────────────────────────────────────┐
│                ⚙️ Cài đặt Người dùng                        │
└─────────────────────────────────────────────────────────────┘
---

### 🔍 Lấy cài đặt người dùng
```bash
curl -s $API_URL/api/v1/settings \
  -H "Authorization: Bearer $token"
```

### ✏️ Cập nhật cài đặt người dùng
```bash
curl -s $API_URL/api/v1/settings \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "theme": "dark",
    "language": "vi",
    "notification_prefs": {
      "email": true,
      "dashboard": true,
      "proxy_expiry": true,
      "balance_low": true
    }
  }'
```

### 🔄 Reset cài đặt về mặc định
```bash
curl -s $API_URL/api/v1/settings/reset \
  -X POST \
  -H "Authorization: Bearer $token"
```

┌─────────────────────────────────────────────────────────────┐
│                      🛠️ Scripts                            │
└─────────────────────────────────────────────────────────────┘
---

### 🌱 Seed dữ liệu mẫu
```bash
bun run seed
```

### 🚀 Khởi động server
```bash
bun run dev
```

### 🧪 Chạy test
```bash
bun test
```

## 📦 Quản lý Gói Proxy (Proxy Package Management)

---

### 📋 Lấy danh sách gói proxy đang hoạt động

```bash
curl -X GET http://localhost:3001/api/v1/packages/active \
  -H "Authorization: Bearer ${TOKEN}"
```

### 🔍 Xem chi tiết gói proxy

```bash
curl -X GET http://localhost:3001/api/v1/packages/PACKAGE_ID \
  -H "Authorization: Bearer ${TOKEN}"
```

## 🛒 Quản lý Đơn Hàng (Order Management)

---

### 📋 Lấy danh sách đơn hàng

```bash
curl -X GET http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer ${TOKEN}"
```

### 🔍 Xem chi tiết đơn hàng

```bash
curl -X GET http://localhost:3001/api/v1/orders/ORDER_ID \
  -H "Authorization: Bearer ${TOKEN}"
```

### ➕ Tạo đơn hàng mới

```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": "PACKAGE_ID",
    "quantity": 1,
    "payment_method": "wallet"
  }'
```

## 👑 Quản lý Admin (Admin Management)

---

### 📊 Xem thống kê tổng quan

```bash
curl -X GET http://localhost:3001/api/v1/admin/dashboard \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### 👥 Quản lý vai trò

```bash
curl -X GET http://localhost:3001/api/v1/admin/roles \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### 🔑 Quản lý quyền hạn

```bash
curl -X GET http://localhost:3001/api/v1/admin/permissions \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

## 📊 Thống kê và Báo cáo (Statistics and Reports)

---

### 📈 Thống kê doanh thu

```bash
curl -X GET http://localhost:3001/api/v1/admin/reports/revenue \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2023-01-01",
    "end_date": "2023-12-31"
  }'
```

### 📊 Thống kê người dùng

```bash
curl -X GET http://localhost:3001/api/v1/admin/reports/users \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### 🧾 Thống kê đơn hàng

```bash
curl -X GET http://localhost:3001/api/v1/admin/reports/orders \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2023-01-01",
    "end_date": "2023-12-31"
  }'
```

## 🔑 Sử dụng API Key thay cho Token (API Key Usage)

---

### 🛡️ Xác thực với API Key

API key là một cách xác thực thay thế cho JWT token, đặc biệt hữu ích cho các kết nối tự động và ứng dụng bên thứ ba.

```bash
curl -X GET http://localhost:3001/api/v1/wallet/me \
  -H "X-API-Key: YOUR_API_KEY"
```

### 🔄 Các API hỗ trợ API Key

Các API sau đây hỗ trợ cả JWT token và API key:

- Tất cả các API GET (xem thông tin, danh sách)
- API kiểm tra trạng thái proxy
- API kiểm tra băng thông

*Lưu ý: Các API quan trọng như tạo đơn hàng, nạp tiền, rút tiền vẫn ưu tiên sử dụng JWT token để đảm bảo an toàn.*

### 📋 Quy tắc bảo mật

- API key chỉ cho phép truy cập dữ liệu của chính người dùng đó
- Admin có thể truy cập tất cả dữ liệu
- Reseller chỉ có thể truy cập dữ liệu của mình và khách hàng của họ

```bash
# Lấy thông tin API key (yêu cầu đăng nhập bằng JWT token)
curl -X GET http://localhost:3001/api/v1/users/me/api-key \
  -H "Authorization: Bearer ${TOKEN}"

# Tạo mới hoặc reset API key (yêu cầu đăng nhập bằng JWT token)
curl -X POST http://localhost:3001/api/v1/users/me/api-key \
  -H "Authorization: Bearer ${TOKEN}"
``` 