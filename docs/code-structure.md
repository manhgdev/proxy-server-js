# Cấu trúc Code - Proxy Server System

## Tổng quan

Hệ thống Proxy Server được tổ chức theo kiến trúc clean architecture, phân tách rõ ràng các lớp và dễ dàng mở rộng. Mã nguồn được tổ chức như sau:

```
proxy-server/
├── config/                     # Cấu hình hệ thống
├── src/
│   ├── api/                    # API server 
│   │   ├── controllers/        # Điều khiển API
│   │   │   ├── auth/           # Xác thực người dùng
│   │   │   ├── users/          # Quản lý người dùng
│   │   │   ├── wallet/         # Quản lý ví
│   │   │   ├── packages/       # Quản lý gói proxy 
│   │   │   ├── orders/         # Quản lý đơn hàng
│   │   │   ├── proxies/        # Quản lý proxy
│   │   │   ├── plans/          # Quản lý gói đã mua
│   │   │   └── alerts/         # Thông báo
│   │   │
│   │   ├── middlewares/        # Middlewares
│   │   │   ├── auth/           # Xác thực
│   │   │   ├── validation/     # Xác thực dữ liệu
│   │   │   ├── logging/        # Ghi log
│   │   │   └── error/          # Xử lý lỗi
│   │   │
│   │   ├── routes/             # Định nghĩa routes
│   │   ├── validators/         # Xác thực đầu vào
│   │   └── server.js           # Khởi tạo server
│   │
│   ├── core/                   # Core modules
│   │   ├── user/               # Quản lý người dùng 
│   │   │   ├── services/       # Dịch vụ người dùng
│   │   │   ├── repositories/   # Repository người dùng
│   │   │   └── models/         # User models
│   │   │
│   │   ├── proxy/              # Quản lý proxy
│   │   │   ├── services/       # Dịch vụ proxy
│   │   │   ├── repositories/   # Repository proxy
│   │   │   ├── lifecycle/      # Quản lý vòng đời proxy
│   │   │   ├── rotator/        # Xoay proxy
│   │   │   ├── pool/           # Quản lý pool proxy
│   │   │   └── models/         # Proxy models
│   │   │
│   │   ├── financial/          # Quản lý tài chính
│   │   │   ├── wallet/         # Dịch vụ ví
│   │   │   ├── transactions/   # Quản lý giao dịch
│   │   │   ├── commission/     # Quản lý hoa hồng
│   │   │   └── withdrawal/     # Quản lý rút tiền
│   │   │
│   │   ├── ordering/           # Quản lý đơn hàng
│   │   │   ├── services/       # Dịch vụ đơn hàng
│   │   │   ├── checkout/       # Thanh toán đơn hàng
│   │   │   ├── confirmation/   # Xác nhận thanh toán
│   │   │   └── models/         # Order models
│   │   │
│   │   ├── plan/               # Quản lý gói proxy
│   │   │   ├── services/       # Dịch vụ gói proxy
│   │   │   ├── renewal/        # Gia hạn gói proxy
│   │   │   ├── expiration/     # Xử lý hết hạn
│   │   │   ├── allocation/     # Cấp phát proxy
│   │   │   └── models/         # Plan models
│   │   │
│   │   └── notification/       # Thông báo người dùng
│   │       ├── services/       # Dịch vụ thông báo
│   │       ├── channels/       # Kênh thông báo
│   │       └── templates/      # Mẫu thông báo
│   │
│   ├── database/               # Quản lý cơ sở dữ liệu
│   │   ├── models/             # MongoDB models
│   │   │   ├── user/           # User models
│   │   │   ├── proxy/          # Proxy models
│   │   │   ├── financial/      # Financial models
│   │   │   ├── order/          # Order models
│   │   │   └── plan/           # Plan models
│   │   │
│   │   ├── repositories/       # Repository pattern
│   │   └── connection.js       # Kết nối MongoDB
│   │
│   ├── infrastructure/         # Hạ tầng hệ thống
│   │   ├── auth/               # Xác thực
│   │   │   ├── strategies/     # Chiến lược xác thực
│   │   │   ├── jwt/            # JWT
│   │   │   └── roles/          # Quản lý quyền
│   │   │
│   │   ├── logging/            # Ghi log
│   │   ├── monitoring/         # Giám sát proxy
│   │   ├── caching/            # Bộ nhớ đệm
│   │   └── queue/              # Hàng đợi
│   │
│   ├── scheduled/              # Tác vụ định kỳ
│   │   ├── renewal/            # Gia hạn tự động
│   │   ├── expiration/         # Kiểm tra hết hạn
│   │   ├── monitoring/         # Giám sát proxy
│   │   └── notification/       # Thông báo định kỳ
│   │
│   ├── utils/                  # Tiện ích
│   │   ├── errors/             # Quản lý lỗi
│   │   ├── formatters/         # Định dạng dữ liệu
│   │   ├── validators/         # Xác thực dữ liệu
│   │   └── helpers/            # Hàm trợ giúp
│   │
│   └── web/                    # Giao diện người dùng
│       ├── dashboard/          # Bảng điều khiển
│       ├── auth/               # Xác thực
│       ├── account/            # Quản lý tài khoản
│       ├── proxies/            # Quản lý proxy
│       ├── billing/            # Thanh toán
│       └── admin/              # Quản trị
│
├── scripts/                    # Scripts tiện ích
├── tests/                      # Unit & integration tests
├── docs/                       # Tài liệu
└── .env                        # Biến môi trường
```

## Chi tiết các module chính

### 1. User Management (`src/core/user`)

Quản lý người dùng, vai trò và quyền hạn:

- **UserService**: Đăng ký, đăng nhập, quản lý thông tin người dùng
- **RoleService**: Quản lý vai trò (Admin, Manager, Reseller, Customer)
- **PermissionService**: Quản lý quyền hạn
- **ResellerService**: Quản lý mạng lưới đại lý và khách hàng

```javascript
// src/core/user/services/user.service.js
class UserService {
  async register(userData) {
    // Validate input
    // Hash password
    // Create user
    // Create wallet
    // Return user
  }

  async login(username, password) {
    // Validate credentials
    // Generate tokens
    // Return user and tokens
  }

  async getProfile(userId) {
    // Get user details
    // Get wallet details
    // Get roles
    // Return user profile
  }

  async getCustomers(resellerId, paginationOptions) {
    // Get customers of a reseller
    // Return paginated list
  }
}
```

### 2. Proxy Management (`src/core/proxy`)

Quản lý proxy, pool và lifecycle:

- **ProxyService**: Thêm, sửa, xóa proxy
- **ProxyLifecycleService**: Quản lý vòng đời proxy (tạo, gán, giải phóng)
- **ProxyPoolService**: Quản lý nhóm proxy
- **ProxyRotatorService**: Xoay proxy cho gói rotating

```javascript
// src/core/proxy/lifecycle/proxy-lifecycle.service.js
class ProxyLifecycleService {
  async assignProxiesToUser(userId, planId, quantity, criteria) {
    // Find available proxies matching criteria
    // Mark proxies as assigned
    // Log the assignment
    // Return assigned proxies
  }

  async releaseProxies(planId) {
    // Find proxies assigned to the plan
    // Mark them as not assigned
    // Add to available pool
    // Log the release
  }

  async rotateProxy(planId, userId) {
    // Find current proxy
    // Find new proxy
    // Update current proxy in plan
    // Log rotation
    // Return new proxy
  }

  async handleExpiredPlan(planId) {
    // Mark plan as expired
    // Release proxies after grace period
    // Log lifecycle event
    // Return status
  }
}
```

### 3. Financial Management (`src/core/financial`)

Quản lý ví và giao dịch tài chính:

- **WalletService**: Quản lý ví người dùng
- **TransactionService**: Quản lý giao dịch
- **CommissionService**: Tính toán và phân phối hoa hồng
- **WithdrawalService**: Xử lý rút tiền

```javascript
// src/core/financial/wallet/wallet.service.js
class WalletService {
  async getWallet(userId) {
    // Get wallet by user ID
    // Return wallet details
  }

  async getTransactions(userId, filters, paginationOptions) {
    // Get transactions
    // Apply filters
    // Return paginated list
  }

  async deposit(userId, amount, paymentDetails) {
    // Validate amount
    // Create transaction
    // Apply bonus if eligible
    // Update wallet balance
    // Return transaction
  }

  async withdraw(userId, amount, withdrawalDetails) {
    // Validate amount
    // Check balance
    // Create withdrawal request
    // Lock amount
    // Return withdrawal request
  }

  async processPayment(orderId, paymentSource) {
    // Get order
    // Check payment source
    // Process payment
    // Update order status
    // Return payment result
  }
}
```

### 4. Order Management (`src/core/ordering`)

Quản lý đơn hàng:

- **OrderService**: Tạo và quản lý đơn hàng
- **CheckoutService**: Thanh toán đơn hàng
- **PaymentConfirmationService**: Xác nhận thanh toán thủ công

```javascript
// src/core/ordering/services/order.service.js
class OrderService {
  async createOrder(userId, orderData) {
    // Validate items
    // Calculate total
    // Create order
    // Process payment if wallet
    // Return order
  }

  async getOrders(userId, paginationOptions) {
    // Get orders
    // Return paginated list
  }

  async confirmPayment(orderId, paymentDetails) {
    // Find order
    // Create payment confirmation
    // Notify admin
    // Return confirmation
  }
}
```

### 5. Plan Management (`src/core/plan`)

Quản lý gói proxy đã mua:

- **UserPlanService**: Tạo và quản lý gói proxy người dùng
- **PlanRenewalService**: Gia hạn gói proxy
- **PlanExpirationService**: Xử lý gói hết hạn
- **ProxyAllocationService**: Cấp phát proxy cho gói

```javascript
// src/core/plan/expiration/plan-expiration.service.js
class PlanExpirationService {
  async processPlanExpiration() {
    // Find plans that expired
    // Mark them as expired
    // Create alerts for users
    // Return processed plans
  }

  async handleGracePeriod() {
    // Find plans in grace period
    // Send urgent reminders
    // Return processed plans
  }

  async suspendExpiredPlans() {
    // Find plans past grace period
    // Mark as inactive
    // Release proxies to pool
    // Create suspended records
    // Notify users
    // Return suspended plans
  }

  async restorePlan(planId, paymentResult) {
    // Find expired plan
    // Create new period
    // Try to restore original proxies
    // Or allocate new proxies
    // Notify user
    // Return restored plan
  }
}
```

### 6. Scheduled Tasks (`src/scheduled`)

Tác vụ chạy định kỳ:

- **RenewalScheduler**: Lập lịch gia hạn tự động
- **ExpirationChecker**: Kiểm tra gói hết hạn
- **ProxyMonitor**: Giám sát tình trạng proxy
- **NotificationScheduler**: Gửi thông báo định kỳ

```javascript
// src/scheduled/expiration/expiration-checker.js
export async function checkExpiringPlans() {
  const expirationService = new PlanExpirationService();
  
  // Check plans expiring soon
  const expiringPlans = await expirationService.findPlansExpiringSoon(7); // 7 days
  
  // Send reminders
  for (const plan of expiringPlans) {
    await NotificationService.sendExpiryReminder(plan);
  }
  
  // Check plans in grace period
  const gracePeriodPlans = await expirationService.findPlansInGracePeriod();
  
  // Send urgent reminders
  for (const plan of gracePeriodPlans) {
    await NotificationService.sendGracePeriodAlert(plan);
  }
  
  // Find plans to suspend
  const plansToSuspend = await expirationService.findPlansToSuspend();
  
  // Suspend plans
  for (const plan of plansToSuspend) {
    await expirationService.suspendPlan(plan._id);
  }
  
  return {
    expiringSoon: expiringPlans.length,
    inGracePeriod: gracePeriodPlans.length,
    suspended: plansToSuspend.length
  };
}
```

## Mô hình xử lý dữ liệu

Ứng dụng sử dụng mô hình Repository Pattern để tương tác với MongoDB, tách biệt logic nghiệp vụ khỏi truy cập dữ liệu:

```javascript
// src/database/repositories/proxy.repository.js
class ProxyRepository {
  async findAvailableProxies(criteria, quantity) {
    return Proxy.find({
      ...criteria,
      assigned: false,
      status: 'active'
    }).limit(quantity);
  }
  
  async markAsAssigned(proxyIds, userId) {
    return Proxy.updateMany(
      { _id: { $in: proxyIds } },
      { 
        $set: { 
          assigned: true,
          last_assigned_at: new Date(),
          current_user_id: userId
        }
      }
    );
  }
  
  async markAsUnassigned(proxyIds, userId) {
    return Proxy.updateMany(
      { _id: { $in: proxyIds } },
      { 
        $set: { 
          assigned: false,
          last_unassigned_at: new Date(),
          last_user_id: userId,
          current_user_id: null
        }
      }
    );
  }
  
  async findProxiesByPlan(planId) {
    const staticPlan = await StaticProxyPlan.findOne({ user_plan_id: planId });
    return staticPlan ? Proxy.find({ _id: { $in: staticPlan.proxies } }) : [];
  }
}
```

## API Controllers

Controllers xử lý yêu cầu API và gọi các service tương ứng:

```javascript
// src/api/controllers/plans/my-plans.controller.js
class MyPlansController {
  async getPlans(req, res) {
    const userId = req.user.id;
    const { page, limit } = req.query;
    
    const planService = new UserPlanService();
    const plans = await planService.getUserPlans(userId, { page, limit });
    
    return res.json({
      status: 'success',
      data: plans
    });
  }
  
  async getPlanById(req, res) {
    const userId = req.user.id;
    const planId = req.params.id;
    
    const planService = new UserPlanService();
    const plan = await planService.getUserPlanDetails(userId, planId);
    
    if (!plan) {
      return res.status(404).json({
        status: 'error',
        message: 'Plan not found'
      });
    }
    
    return res.json({
      status: 'success',
      data: plan
    });
  }
  
  async rotateProxy(req, res) {
    const userId = req.user.id;
    const planId = req.params.id;
    
    const rotatorService = new ProxyRotatorService();
    const result = await rotatorService.rotateProxy(userId, planId);
    
    return res.json({
      status: 'success',
      message: 'Proxy đã được xoay thành công',
      data: {
        new_proxy: {
          ip: result.ip,
          port: result.port
        },
        rotated_at: result.rotatedAt
      }
    });
  }
  
  async setRenewalStatus(req, res) {
    const userId = req.user.id;
    const planId = req.params.id;
    const { renewal_status } = req.body;
    
    const renewalService = new PlanRenewalService();
    const result = await renewalService.setRenewalStatus(userId, planId, renewal_status);
    
    return res.json({
      status: 'success',
      message: 'Cài đặt gia hạn tự động thành công',
      data: {
        plan_id: planId,
        renewal_status: renewal_status,
        renewal_price: result.renewal_price
      }
    });
  }
}
```

## Công nghệ sử dụng

- **Runtime**: Node.js với Bun
- **API Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT, API Keys
- **Logging**: Winston, Pino
- **Testing**: Jest, Supertest
- **Documentation**: Swagger, JSDoc
- **Frontend**: React, Material UI (Dashboard)
- **DevOps**: Docker, Docker Compose, GitHub Actions 