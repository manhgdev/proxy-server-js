# Tài liệu API Proxy Server

## Tổng quan
API Proxy Server cung cấp giao diện RESTful để quản lý và sử dụng dịch vụ proxy. Toàn bộ API sử dụng JWT để xác thực và phân quyền. Base URL: `/api/v1`

## 1. Xác thực (Authentication) `/api/v1/auth`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| POST | `/register` | Đăng ký tài khoản mới | Public |
| POST | `/login` | Đăng nhập | Public |
| POST | `/refresh-token` | Làm mới access token | Public (cần refresh token) |
| POST | `/logout` | Đăng xuất | Authenticated |
| GET | `/me` | Lấy thông tin người dùng hiện tại | Authenticated |
| POST | `/change-password` | Đổi mật khẩu | Authenticated |
| POST | `/forgot-password` | Yêu cầu khôi phục mật khẩu | Public |
| POST | `/reset-password` | Đặt lại mật khẩu | Public (cần reset token) |
| GET | `/validate-reset-token` | Xác nhận token đặt lại mật khẩu | Public |
| POST | `/generate-api-key` | Tạo API key mới | Authenticated |

## 2. Quản lý người dùng (Users) `/api/v1/users`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách người dùng | Admin/Manager/Reseller |
| GET | `/search` | Tìm kiếm người dùng | Admin/Manager/Reseller |
| GET | `/:id` | Chi tiết người dùng | Admin/Manager/Reseller/Chủ tài khoản |
| POST | `/` | Tạo người dùng mới | Admin (manage_users) |
| PUT | `/:id` | Cập nhật người dùng | Admin (manage_users) |
| DELETE | `/:id` | Xóa người dùng | Admin (manage_users) |
| PUT | `/profile/update` | Cập nhật hồ sơ cá nhân | Authenticated |
| GET | `/:id/plans` | Danh sách gói dịch vụ của người dùng | Admin/Manager/Reseller/Chủ tài khoản |
| GET | `/:id/roles` | Vai trò của người dùng | Admin/Manager/Reseller |
| GET | `/:id/permissions` | Quyền hạn của người dùng | Admin/Manager/Reseller |
| GET | `/me/api-key` | Xem API key | Authenticated |
| POST | `/me/api-key` | Tạo API key mới | Authenticated |
| GET | `/me/orders` | Danh sách đơn hàng của người dùng hiện tại | Authenticated |
| GET | `/me/orders/:orderId` | Chi tiết đơn hàng của người dùng hiện tại | Authenticated |

## 3. Quản lý Proxy `/api/v1/proxies`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách proxy | Authenticated |
| GET | `/:id` | Chi tiết proxy | Authenticated (người dùng sở hữu) |
| POST | `/:id/rotate` | Quay vòng proxy | Authenticated (người dùng sở hữu) |
| GET | `/:id/status` | Kiểm tra trạng thái proxy | Authenticated (người dùng sở hữu) |
| PATCH | `/:id/settings` | Cập nhật cài đặt proxy | Authenticated (người dùng sở hữu) |

## 4. Quản lý đơn hàng (Orders) `/api/v1/orders`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách đơn hàng | Admin/Manager (manage_orders, view_orders) |
| GET | `/my` | Đơn hàng của tôi | Authenticated |
| GET | `/reseller` | Đơn hàng đại lý | Reseller |
| GET | `/:id` | Chi tiết đơn hàng | Admin/Manager/Chủ đơn hàng |
| GET | `/:id/items` | Chi tiết mục đơn hàng | Admin/Manager/Chủ đơn hàng |
| POST | `/` | Tạo đơn hàng mới | Authenticated |
| POST | `/:id/cancel` | Hủy đơn hàng | Admin/Manager/Chủ đơn hàng |

## 5. Quản lý gói dịch vụ (Plans) `/api/v1/plans`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách gói dịch vụ | Admin/Manager (manage_orders, view_orders) |
| GET | `/my` | Gói dịch vụ của tôi | Authenticated |
| GET | `/reseller` | Gói dịch vụ đại lý | Reseller |
| GET | `/:id` | Chi tiết gói dịch vụ | Admin/Manager/Chủ gói |
| POST | `/:id/toggle-auto-renew` | Bật/tắt tự động gia hạn | Admin/Manager/Chủ gói |
| POST | `/:id/cancel` | Hủy gói dịch vụ | Admin/Manager/Chủ gói |
| POST | `/:id/renew` | Gia hạn gói dịch vụ | Admin/Manager/Chủ gói |

## 6. Quản lý ví (Wallet) `/api/v1/wallet`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/me` | Thông tin ví của tôi | Authenticated |
| GET | `/user/:userId` | Ví của người dùng | Admin/Manager (manage_finances) |
| GET | `/transactions` | Lịch sử giao dịch | Authenticated |
| POST | `/deposit` | Yêu cầu nạp tiền | Authenticated |
| POST | `/withdraw` | Yêu cầu rút tiền | Authenticated |
| GET | `/stats` | Thống kê ví | Admin/Manager (manage_finances) |

## 7. Quản lý gói sản phẩm (Packages) `/api/v1/packages`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách gói sản phẩm | Authenticated |
| GET | `/active` | Gói sản phẩm đang hoạt động | Public |
| GET | `/:id` | Chi tiết gói sản phẩm | Authenticated |
| POST | `/` | Tạo gói sản phẩm mới | Admin/Manager (manage_proxies) |
| PUT | `/:id` | Cập nhật gói sản phẩm | Admin/Manager (manage_proxies) |
| DELETE | `/:id` | Xóa gói sản phẩm | Admin/Manager (manage_proxies) |

## 8. Quản trị hệ thống (Admin) `/api/v1/admin`

### Bảng điều khiển (Dashboard)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/dashboard` | Bảng điều khiển tổng quan | Admin |

### Quản lý vai trò (Roles)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/roles` | Danh sách vai trò | Admin |
| GET | `/roles/:id` | Chi tiết vai trò | Admin |
| POST | `/roles` | Tạo vai trò mới | Admin |
| PUT | `/roles/:id` | Cập nhật vai trò | Admin |
| DELETE | `/roles/:id` | Xóa vai trò | Admin |

### Quản lý quyền hạn (Permissions)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/permissions` | Danh sách quyền hạn | Admin |
| GET | `/permissions/groups` | Danh sách nhóm quyền hạn | Admin |

### Quản lý vai trò-quyền hạn (Role-Permissions)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| POST | `/role-permissions` | Gán quyền cho vai trò | Admin |
| DELETE | `/role-permissions/:roleId/:permissionId` | Xóa quyền khỏi vai trò | Admin |

### Quản lý người dùng-vai trò (User-Roles)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| POST | `/user-roles` | Gán vai trò cho người dùng | Admin |
| DELETE | `/user-roles/:userId/:roleId` | Xóa vai trò khỏi người dùng | Admin |

### Báo cáo (Reports)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/reports/revenue` | Báo cáo doanh thu | Admin |
| GET | `/reports/users` | Báo cáo người dùng | Admin |
| GET | `/reports/orders` | Báo cáo đơn hàng | Admin |

### Tài chính (Finance)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| POST | `/wallet/credit` | Nạp tiền vào ví người dùng | Admin |

## 9. Đại lý (Reseller) `/api/v1/reseller`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/dashboard` | Bảng điều khiển đại lý | Reseller |
| GET | `/customers` | Danh sách khách hàng | Reseller |
| POST | `/customers` | Tạo khách hàng mới | Reseller |
| GET | `/customers/:id` | Chi tiết khách hàng | Reseller |
| GET | `/earnings` | Thu nhập đại lý | Reseller |
| POST | `/withdraw` | Yêu cầu rút tiền hoa hồng | Reseller |
| GET | `/commission/rates` | Tỷ lệ hoa hồng | Reseller |

## 10. Thông báo (Alerts) `/api/v1/alerts`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách thông báo của người dùng | Authenticated |
| POST | `/` | Tạo thông báo mới | Authenticated |
| PATCH | `/:id` | Cập nhật thông báo | Authenticated |
| DELETE | `/:id` | Xóa thông báo | Authenticated |

## 11. Cài đặt (Settings) `/api/v1/settings`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Lấy cài đặt người dùng | Authenticated |
| PATCH | `/` | Cập nhật cài đặt người dùng | Authenticated |
| POST | `/reset` | Khôi phục cài đặt mặc định | Authenticated |

## 12. Nhóm Proxy (Proxy Pools) `/api/v1/proxy-pools`

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/` | Danh sách nhóm proxy | Admin/Manager (manage_proxies, view_proxies) |
| GET | `/:id` | Chi tiết nhóm proxy | Admin/Manager (manage_proxies, view_proxies) |
| POST | `/` | Tạo nhóm proxy mới | Admin (manage_proxies) |
| PATCH | `/:id` | Cập nhật nhóm proxy | Admin (manage_proxies) |
| DELETE | `/:id` | Xóa nhóm proxy | Admin (manage_proxies) |

## 13. Kiểm tra sức khỏe (Health Check)

| Phương thức | Endpoint | Mô tả | Quyền hạn |
|-------------|----------|-------|-----------|
| GET | `/health` | Kiểm tra trạng thái API | Public |

## Mã lỗi chung

| Mã lỗi | Mô tả |
|--------|-------|
| 400 | Bad Request - Lỗi dữ liệu đầu vào |
| 401 | Unauthorized - Chưa xác thực |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 429 | Too Many Requests - Vượt quá giới hạn request |
| 500 | Internal Server Error - Lỗi hệ thống |

## Định dạng Response

### Thành công
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional success message"
}
```

### Thất bại
```json
{
  "status": "error",
  "message": "Error message",
  "errors": [ ... ]
}
``` 