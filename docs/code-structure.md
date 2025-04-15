# Cấu trúc mã nguồn - Hệ thống Proxy Server

## Tổng quan

Hệ thống Proxy Server được xây dựng theo kiến trúc microservices hiện đại, sử dụng Node.js và MongoDB làm nền tảng chính. Cấu trúc dự án tuân theo nguyên tắc separation of concerns và clean architecture.

## Cấu trúc thư mục chính

```
proxy-server-js/
├── config/               # Cấu hình hệ thống
├── src/                  # Mã nguồn chính
│   ├── api/              # API Controllers và Routes
│   ├── models/           # Các models MongoDB
│   ├── services/         # Business logic
│   ├── middlewares/      # Các middleware Express
│   ├── utils/            # Các tiện ích
│   ├── validators/       # Validation schemas
│   └── app.js            # Entry point
├── public/               # Tài nguyên tĩnh
├── tests/                # Unit tests & Integration tests
├── docs/                 # Tài liệu
├── scripts/              # Scripts utility và deployment
└── frontend/             # Frontend application (React)
```

## Chi tiết từng thư mục

### 1. `config/`

Chứa các file cấu hình cho các môi trường khác nhau (development, staging, production).

```
config/
├── index.js              # Điểm vào chính cho config, kết hợp config theo môi trường
├── database.js           # Cấu hình MongoDB
├── server.js             # Cấu hình HTTP server
├── cors.js               # Cấu hình CORS
├── auth.js               # Cấu hình xác thực
├── paymentGateways.js    # Cấu hình các cổng thanh toán
└── proxy.js              # Cấu hình quản lý proxy
```

### 2. `src/`

#### 2.1 `src/api/`

API endpoints được tổ chức theo chức năng, mỗi chức năng có controllers và routes riêng.

```
src/api/
├── index.js              # Điểm vào chính cho API
├── auth/                 # API xác thực
│   ├── authController.js
│   └── authRoutes.js
├── users/                # API quản lý người dùng
│   ├── userController.js
│   └── userRoutes.js
├── wallet/               # API quản lý ví
│   ├── walletController.js
│   └── walletRoutes.js
├── orders/               # API quản lý đơn hàng
│   ├── orderController.js
│   └── orderRoutes.js
├── proxy/                # API quản lý proxy
│   ├── proxyController.js
│   └── proxyRoutes.js
├── admin/                # API cho admin panel
│   ├── adminController.js
│   └── adminRoutes.js
└── reseller/             # API cho reseller panel
    ├── resellerController.js
    └── resellerRoutes.js
```

#### 2.2 `src/models/`

Models MongoDB sử dụng Mongoose, được tổ chức theo từng entity.

```
src/models/
├── index.js              # Điểm vào chính cho models
├── User.js               # Model người dùng
├── Role.js               # Model vai trò
├── Permission.js         # Model quyền
├── Wallet.js             # Model ví
├── Transaction.js        # Model giao dịch
├── Order.js              # Model đơn hàng
├── OrderItem.js          # Model chi tiết đơn hàng
├── ProductPackage.js     # Model gói dịch vụ
├── UserPlan.js           # Model gói người dùng
├── Proxy.js              # Model proxy
├── ProxyPool.js          # Model pool proxy
├── ProxyUsage.js         # Model sử dụng proxy
└── ...                   # Các models khác
```

#### 2.3 `src/services/`

Services chứa business logic chính của hệ thống, được tổ chức theo chức năng.

```
src/services/
├── index.js              # Điểm vào chính cho services
├── authService.js        # Service xác thực
├── userService.js        # Service quản lý người dùng
├── walletService.js      # Service quản lý ví
├── orderService.js       # Service quản lý đơn hàng
├── proxyService.js       # Service quản lý proxy
├── billingService.js     # Service quản lý thanh toán
├── emailService.js       # Service gửi email
├── notificationService.js# Service quản lý thông báo
├── resellerService.js    # Service cho reseller
└── adminService.js       # Service cho admin
```

#### 2.4 `src/middlewares/`

Các middleware Express cho xác thực, logging, error handling, etc.

```
src/middlewares/
├── auth.js               # Middleware xác thực
├── rbac.js               # Middleware phân quyền
├── errorHandler.js       # Middleware xử lý lỗi
├── validators.js         # Middleware validation
├── rateLimit.js          # Middleware giới hạn request
└── logger.js             # Middleware logging
```

#### 2.5 `src/utils/`

Các hàm tiện ích được sử dụng xuyên suốt ứng dụng.

```
src/utils/
├── errors.js             # Định nghĩa các lỗi
├── logger.js             # Utility cho logging
├── encryption.js         # Các hàm mã hóa
├── dateTime.js           # Xử lý ngày tháng
├── formatters.js         # Formatting data
├── validators.js         # Validation helpers
└── proxyUtils.js         # Utilities cho proxy management
```

#### 2.6 `src/validators/`

Schemas validation sử dụng Joi hoặc Yup.

```
src/validators/
├── auth.js               # Validation cho API xác thực
├── user.js               # Validation cho API người dùng
├── order.js              # Validation cho API đơn hàng
├── wallet.js             # Validation cho API ví
└── proxy.js              # Validation cho API proxy
```

### 3. `public/`

Tài nguyên tĩnh như hình ảnh, CSS, v.v.

```
public/
├── images/
├── styles/
└── uploads/             # Nơi lưu trữ các file upload
```

### 4. `tests/`

Unit tests và integration tests.

```
tests/
├── unit/                # Unit tests
│   ├── services/
│   ├── models/
│   └── utils/
├── integration/         # Integration tests
│   ├── api/
│   └── database/
└── fixtures/            # Test fixtures
```

### 5. `docs/`

Tài liệu hệ thống, API docs, và hướng dẫn.

```
docs/
├── api/                 # API documentation
├── setup/               # Setup guides
├── database-schema.md   # Database schema documentation
├── diagram.md           # Diagrams
├── code-structure.md    # Code structure documentation
└── readme.md            # Main documentation
```

### 6. `scripts/`

Scripts cho deployment, migrations, và các tác vụ tự động khác.

```
scripts/
├── seed-data.js         # Seed initial data
├── migrations/          # Database migrations
├── deploy.sh            # Deployment script
└── backup.sh            # Backup script
```

### 7. `frontend/`

Frontend React application.

```
frontend/
├── public/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Pages
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── utils/           # Utilities
│   ├── context/         # React contexts
│   ├── redux/           # Redux/state management
│   └── App.jsx          # Main component
├── package.json
└── vite.config.js
```

## Entry Points

- Backend: `src/app.js` - Main Express application
- Frontend: `frontend/src/main.jsx` - React application entry point

## Kiến trúc phần mềm

Hệ thống Proxy Server tuân theo kiến trúc 3-tier truyền thống:

1. **Presentation Layer**:
   - Express.js Routes và Controllers (Backend)
   - React Components (Frontend)

2. **Business Logic Layer**:
   - Services
   - Validators
   - Middlewares

3. **Data Access Layer**:
   - MongoDB Models
   - Database utilities

## Microservices Architecture

Hệ thống có thể được mở rộng theo hướng microservices bằng cách tách các chức năng riêng biệt:

1. **User Service**: Quản lý người dùng, xác thực, phân quyền
2. **Proxy Service**: Quản lý proxy, phân phối proxy
3. **Billing Service**: Quản lý thanh toán, ví điện tử
4. **Order Service**: Quản lý đơn hàng
5. **Notification Service**: Quản lý thông báo

## Cấu trúc API

API của hệ thống tuân theo tiêu chuẩn RESTful:

- **Xác thực**: JWT (JSON Web Tokens)
- **Format Data**: JSON
- **Versioning**: URL-based (v1, v2)
- **Documentation**: Swagger/OpenAPI

## Quy ước đặt tên và Coding Style

- **Files**: camelCase cho tất cả các files trừ models (PascalCase)
- **Variables & Functions**: camelCase
- **Classes & Models**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **API Endpoints**: kebab-case

## Quản lý Dependencies

Dependencies chính:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.2",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "joi": "^17.10.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0",
    "nodemailer": "^6.9.5",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.49.0",
    "nodemon": "^3.0.1"
  }
}
```

## Workflow Development

Quy trình phát triển:

1. **Local Development**: Sử dụng Docker Compose để chạy ứng dụng và MongoDB
2. **Testing**: Jest cho unit tests và integration tests
3. **CI/CD**: GitHub Actions
4. **Deployment**: Containerization với Docker, orchestration với Kubernetes

## Quy trình Deploy

1. **Build**: Tạo Docker images cho backend và frontend
2. **Test**: Chạy tests trên Docker containers
3. **Deploy**: Push images lên registry và deploy lên Kubernetes cluster
4. **Monitor**: Sử dụng Prometheus và Grafana

## Tiêu chuẩn bảo mật

- Xác thực mạnh với JWT và refresh tokens
- Mã hóa mật khẩu với bcrypt
- HTTPS cho tất cả các endpoints
- Rate limiting để ngăn chặn brute force attacks
- Input validation cho tất cả các API endpoints
- CORS configuration
- Helmet.js để bảo vệ các HTTP headers

## Monitoring và Logging

- **Logging**: Winston cho application logs
- **Error tracking**: Sentry
- **Performance monitoring**: New Relic hoặc Datadog
- **Infrastructure monitoring**: Prometheus & Grafana 