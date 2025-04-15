# Sơ đồ mối quan hệ - Hệ thống Proxy Server

## Sơ đồ tổng quan MongoDB Schema

### Phân cấp theo Chức năng và Mối quan hệ

```
┌──────────────────────────────────────────────────────── QUẢN LÝ NGƯỜI DÙNG ────────────────────────────────────────────────────────┐
│                                                                                                                                    │
│  ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐ │
│  │      Users        │      │      Roles        │      │   UserRoles       │      │   Permissions     │      │  RolePermissions  │ │
│  ├───────────────────┤      ├───────────────────┤      ├───────────────────┤      ├───────────────────┤      ├───────────────────┤ │
│  │ _id               │◄─────┤ _id               │◄─────┤ _id               │      │ _id               │◄─────┤ _id               │ │
│  │ username          │      │ name              │      │ user_id           │      │ name              │      │ role_id           │ │
│  │ password_hash     │      │ description       │      │ role_id           │      │ code              │      │ permission_id     │ │
│  │ email             │      │ level             │      │ assigned_at       │      │ description       │      │ created_at        │ │
│  │ fullname          │      │ is_admin          │      │ assigned_by       │      │ group             │      └───────────────────┘ │
│  │ phone             │      │ is_reseller       │      │ created_at        │      │ created_at        │                            │
│  │ created_at        │      │ created_at        │      └───────────────────┘      └───────────────────┘     ┌───────────────────┐  │
│  │ updated_at        │      │ updated_at        │                                                           │   UserSettings    │  │
│  │ active            │      └───────────────────┘                                                           ├───────────────────┤  │
│  │ api_key           │                                                                                      │ _id               │  │
│  │ access_token      │      ┌───────────────────┐                                                           │ user_id           │  │
│  │ wallet_id   ──────┼─────►│     Wallets       │                                                           │ theme             │  │
│  │ billing_info      │      ├───────────────────┤                                                           │ language          │  │
│  │ parent_id    ─────┼───┐  │ _id               │                                                           │ notification_prefs│  │
│  │ user_level        │   │  │ user_id           │                                                           │ created_at        │  │
│  └───────────────────┘   │  │ balance           │                                                           │ updated_at        │  │
│                          │  │ currency          │                                                           └───────────────────┘  │
│                          │  │ locked_amount     │                                                                                  │
│                          │  │ created_at        │  ┌───────────────────┐                                                           │
│                          │  │ updated_at        │  │  ResellerDetails  │                                                           │
│                          │  │ last_deposit_at   │  ├───────────────────┤                                                           │
│                          │  │ is_active         │  │ _id               │                                                           │
│                          │  └───────────────────┘  │ user_id           │                                                           │
│                          │                         │ commission_rate   │                                                           │
│                          └────────────────────────►│ downline_count    │                                                           │
│                                                    │ total_sales       │                                                           │
│                                                    │ payment_details   │                                                           │
│                                                    │ created_at        │                                                           │
│                                                    │ updated_at        │                                                           │
│                                                    └───────────────────┘                                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────── QUẢN LÝ TÀI CHÍNH ───────────────────────────────────────────────────────────┐
│                                                                                                                                      │
│  ┌───────────────────┐      ┌───────────────────────┐      ┌───────────────────┐      ┌───────────────────┐                          │
│  │    BonusTiers     │      │  WalletTransactions   │      │    CommissionLog  │      │ WithdrawalRequests│                          │
│  ├───────────────────┤      ├───────────────────────┤      ├───────────────────┤      ├───────────────────┤                          │
│  │ _id               │      │ _id                   │      │ _id               │      │ _id               │                          │
│  │ name              │      │ wallet_id             │      │ reseller_id       │      │ user_id           │                          │
│  │ min_amount        │      │ user_id               │      │ customer_id       │      │ amount            │                          │
│  │ bonus_percent     │      │ type                  │      │ order_id          │      │ currency          │                          │
│  │ bonus_max         │      │ amount                │      │ transaction_id    │      │ status            │                          │
│  │ active            │      │ balance_before        │      │ amount            │      │ payment_method    │                          │
│  │ currency          │      │ balance_after         │      │ commission_rate   │      │ payment_details   │                          │
│  │ start_date        │      │ currency              │      │ commission_amount │      │ requested_at      │                          │
│  │ end_date          │      │ status                │      │ created_at        │      │ processed_at      │                          │
│  │ description       │      │ description           │      └───────────────────┘      │ created_at        │                          │
│  │ created_at        │      │ bonus_amount          │                                 │ updated_at        │                          │
│  │ updated_at        │      │ metadata              │                                 └───────────────────┘                          │
│  └───────────────────┘      │ created_at            │                                                                                │
│                             │ updated_at            │                                                                                │
│                             └───────────────────────┘                                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────── QUẢN LÝ PROXY ───────────────────────────────────────────────────────────────┐
│                                                                                                                                      │
│  ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐                                                         │
│  │  ProductPackages  │      │      Proxies      │      │    ProxyPools     │                                                         │
│  ├───────────────────┤      ├───────────────────┤      ├───────────────────┤                                                         │
│  │ _id               │      │ _id               │      │ _id               │                                                         │
│  │ name              │      │ ip                │      │ name              │                                                         │
│  │ description       │      │ port              │      │ description       │                                                         │
│  │ type              │      │ username          │      │ group             │                                                         │
│  │ category          │      │ password          │      │ countries         │                                                         │
│  │ protocol          │      │ protocol          │      │ isps              │                                                         │
│  │ is_rotating       │      │ type              │      │ connection_types  │                                                         │
│  │ is_bandwidth      │      │ category          │      │ proxy_count       │                                                         │
│  │ duration_days     │      │ country           │      │ active_proxy_count│                                                         │
│  │ price             │      │ city              │      │ entry_point       │                                                         │
│  │ price_tiers       │      │ region            │      │ port_range        │                                                         │
│  │ allowed_countries │      │ isp               │      │ username          │                                                         │
│  │ allowed_isps      │      │ status            │      │ password          │                                                         │
│  │ features          │      │ sold              │      │ is_bandwidth_pool │                                                         │
│  │ active            │      │ assigned          │      │ active            │                                                         │
│  │ created_at        │      │ created_at        │      │ created_at        │                                                         │
│  │ updated_at        │      │ updated_at        │      │ updated_at        │                                                         │
│  └─────────┬─────────┘      └────────┬──────────┘      └─────────┬─────────┘                                                         │
│            │                         │                           │                                                                   │
│            │                         │                           │                                                                   │
│            ▼                         ▼                           ▼                                                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐ │
│  │     UserPlans       │    │  ProxyReplacements  │    │  BandwidthTopups    │    │  RenewalRecords     │    │  ProxyUsageLogs     │ │
│  ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤ │
│  │ _id                 │    │ _id                 │    │ _id                 │    │ _id                 │    │ _id                 │ │
│  │ user_id             │    │ user_id             │    │ user_id             │    │ user_id             │    │ user_id             │ │
│  │ package_id          │    │ plan_id             │    │ plan_id             │    │ original_plan_id    │    │ plan_id             │ │
│  │ order_id            │    │ original_proxy_id   │    │ order_id            │    │ new_plan_id         │    │ proxy_id            │ │
│  │ plan_type           │    │ new_proxy_id        │    │ gb_amount           │    │ order_id            │    │ timestamp           │ │
│  │ start_date          │    │ reason              │    │ price               │    │ renewal_date        │    │ request_url         │ │
│  │ end_date            │    │ requested_at        │    │ previous_gb_remaining│   │ renewal_price       │    │ bytes_sent          │ │
│  │ active              │    │ processed_at        │    │ new_gb_total        │    │ auto_renewal        │    │ bytes_received      │ │
│  │ renewal_status      │    │ status              │    │ created_at          │    │ status              │    │ total_bytes         │ │
│  │ renewal_price       │    │ created_at          │    └─────────────────────┘    │ created_at          │    │ gb_used             │ │
│  │ created_at          │    │ updated_at          │                               └─────────────────────┘    │ success             │ │
│  │ updated_at          │    └─────────────────────┘                                                          │ created_at          │ │
│  └─────────┬───────────┘                                                                                     └─────────────────────┘ │
│            │                                                                                                                         │
│            ├───────────────────────────────────┐                                                                                     │
│            │                                   │                                                                                     │
│            ▼                                   ▼                                                                                     │
│  ┌─────────────────────┐            ┌─────────────────────┐                                                                          │
│  │  StaticProxyPlans   │            │   BandwidthPlans    │                                                                          │
│  ├─────────────────────┤            ├─────────────────────┤                                                                          │
│  │ _id                 │            │ _id                 │                                                                          │
│  │ user_plan_id        │            │ user_plan_id        │                                                                          │
│  │ proxies: [ObjectId] │            │ gb_amount           │                                                                          │
│  │ protocol            │            │ gb_remaining        │                                                                          │
│  │ category            │            │ gb_used             │                                                                          │
│  │ is_rotating         │            │ price_per_gb        │                                                                          │
│  │ rotation_interval   │            │ custom_settings     │                                                                          │
│  │ rotation_url        │            │ allowed_pools       │                                                                          │
│  │ custom_username     │            │ allowed_countries   │                                                                          │
│  │ custom_password     │            │ current_proxy_id    │                                                                          │
│  │ current_proxy_id    │            │ access_key          │                                                                          │
│  │ last_rotation       │            └─────────────────────┘                                                                          │
│  └─────────────────────┘                                                                                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────── QUẢN LÝ ĐƠN HÀNG ─────────────────────────────────────────────────────────────┐
│                                                                                                                                       │
│  ┌───────────────────┐               ┌───────────────────────────┐               ┌────────────────────┐                               │
│  │      Orders       │               │        OrderItems         │               │      Alerts        │                               │
│  ├───────────────────┤               ├───────────────────────────┤               ├────────────────────┤                               │
│  │ _id               │◄──────────────┤ _id                       │               │ _id                │                               │
│  │ user_id           │               │ order_id                  │               │ user_id            │                               │
│  │ wallet_id         │               │ package_id                │               │ plan_id            │                               │
│  │ order_number      │               │ quantity                  │               │ type               │                               │
│  │ total_amount      │               │ price                     │               │ message            │                               │
│  │ payment_source    │               │ subtotal                  │               │ data               │                               │
│  │ wallet_trans_id   │               │ custom_config             │               │ triggered_at       │                               │
│  │ status            │               │ created_at                │               │ is_read            │                               │
│  │ payment_method    │               └───────────────────────────┘               │ notification_sent  │                               │
│  │ payment_status    │                                                           │ notification_method│                               │
│  │ reseller_id       │               ┌───────────────────────────┐               └────────────────────┘                               │
│  │ commission_rate   │               │    PaymentConfirmations   │                                                                    │
│  │ created_at        │               ├───────────────────────────┤                                                                    │
│  │ updated_at        │               │ _id                       │                                                                    │
│  └───────────────────┘               │ order_id                  │                                                                    │
│                                      │ user_id                   │                                                                    │
│                                      │ amount                    │                                                                    │
│                                      │ payment_method            │                                                                    │
│                                      │ payment_proof             │                                                                    │
│                                      │ confirmation_status       │                                                                    │
│                                      │ confirmed_by              │                                                                    │
│                                      │ confirmed_at              │                                                                    │
│                                      │ created_at                │                                                                    │
│                                      │ updated_at                │                                                                    │
│                                      └───────────────────────────┘                                                                    │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mối quan hệ chính

1. **Phân cấp người dùng**:
   - Users → Roles: Người dùng có một hoặc nhiều vai trò thông qua UserRoles
   - Roles → Permissions: Vai trò có nhiều quyền thông qua RolePermissions
   - Users → Users: Cấu trúc đa cấp qua parent_id (người dùng reseller quản lý nhiều khách hàng)
   - Users → ResellerDetails: Thông tin chi tiết cho người dùng là đại lý

2. **Các mối quan hệ tài chính**:
   - Users → Wallets: Mỗi người dùng có một ví điện tử riêng
   - Wallets → WalletTransactions: Ví ghi nhận tất cả các giao dịch
   - Users → CommissionLog: Ghi lại các khoản hoa hồng cho reseller
   - Users → WithdrawalRequests: Yêu cầu rút tiền của người dùng

3. **Quản lý proxy và đơn hàng**:
   - Users → Orders: Người dùng tạo đơn hàng
   - Orders → OrderItems: Mỗi đơn hàng có nhiều mặt hàng
   - Orders → PaymentConfirmations: Xác nhận thanh toán cho đơn hàng
   - Orders → UserPlans: Đơn hàng thành công tạo ra các gói dịch vụ
   - UserPlans → StaticProxyPlans/BandwidthPlans: Chi tiết gói dịch vụ

4. **Quản lý proxy và performance**:
   - StaticProxyPlans → Proxies: Tham chiếu đến các proxy cụ thể
   - BandwidthPlans → ProxyPools: Tham chiếu đến pool proxy
   - UserPlans → ProxyUsageLogs: Ghi lại việc sử dụng proxy
   - UserPlans → ProxyReplacements: Lưu lịch sử thay thế proxy
   - UserPlans → BandwidthTopups: Nạp thêm băng thông
   - UserPlans → RenewalRecords: Ghi lại lịch sử gia hạn
   - UserPlans → Alerts: Thông báo cho người dùng