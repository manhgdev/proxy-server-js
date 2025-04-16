import { test, describe, expect, beforeAll, afterAll } from "bun:test";
import supertest from 'supertest';
import app from '../src/app.js';
import connectDB from '../config/database.js';

let request;
let accessToken;
let userId;
let db;

beforeAll(async () => {
  try {
    db = await connectDB();
    request = supertest(app);
  } catch (error) {
    console.error("Không thể kết nối database:", error);
  }
});

afterAll(async () => {
  // Không cần đóng kết nối khi sử dụng supertest
});

// Thiết lập timeout cho test
test.timeout = 30000;

describe('API Tests cho người dùng mới', () => {
  // 1. Xác thực (Authentication)
  describe('1. Xác thực (Authentication)', () => {
    test('1.1 Đăng ký tài khoản mới', async () => {
      const randomSuffix = Math.floor(Math.random() * 10000);
      const res = await request
        .post('/api/v1/auth/register')
        .send({
          username: `testuser${randomSuffix}`,
          email: `test${randomSuffix}@example.com`,
          password: 'Test@123',
          fullname: 'Test User'
        });
      
      expect(res.status).toBe(201); // API trả về 201 Created thay vì 200 OK
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.access_token).toBeDefined();
      
      // Lưu token và userId để sử dụng trong các test sau
      accessToken = res.body.data.access_token;
      userId = res.body.data.user.id;
    });

    test('1.2 Đăng nhập', async () => {
      const randomSuffix = Math.floor(Math.random() * 10000);
      // Tạo một tài khoản mới cho test đăng nhập
      const registerRes = await request
        .post('/api/v1/auth/register')
        .send({
          username: `logintest${randomSuffix}`,
          email: `logintest${randomSuffix}@example.com`,
          password: 'Test@123',
          fullname: 'Login Test User'
        });
      
      const res = await request
        .post('/api/v1/auth/login')
        .send({
          username: `logintest${randomSuffix}`,
          password: 'Test@123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    test('1.3 Lấy thông tin người dùng hiện tại', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });
  });

  // 2. Quản lý người dùng (Users)
  describe('2. Quản lý người dùng (Users)', () => {
    test('2.1 Cập nhật hồ sơ cá nhân', async () => {
      const res = await request
        .put('/api/v1/users/profile/update')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullname: 'Updated Test User',
          phone: '0987654321'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.fullname).toBe('Updated Test User');
      expect(res.body.data.user.phone).toBe('0987654321');
    });
  });

  // 3. Quản lý Proxy
  describe('3. Quản lý Proxy', () => {
    test('3.1 Lấy danh sách proxy', async () => {
      const res = await request
        .get('/api/v1/proxies')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.proxies).toBeDefined();
      expect(Array.isArray(res.body.data.proxies)).toBe(true);
    });
  });

  // 4. Quản lý đơn hàng (Orders)
  describe('4. Quản lý đơn hàng (Orders)', () => {
    test('4.1 Xem đơn hàng của mình', async () => {
      const res = await request
        .get('/api/v1/orders/my')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.orders).toBeDefined();
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });
  });

  // 5. Quản lý gói dịch vụ (Plans)
  describe('5. Quản lý gói dịch vụ (Plans)', () => {
    test('5.1 Xem gói dịch vụ của tôi', async () => {
      const res = await request
        .get('/api/v1/plans/my')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plans).toBeDefined();
      expect(Array.isArray(res.body.data.plans)).toBe(true);
    });
  });

  // 6. Quản lý ví (Wallet)
  describe('6. Quản lý ví (Wallet)', () => {
    test('6.1 Xem thông tin ví của tôi', async () => {
      const res = await request
        .get('/api/v1/wallet/me')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.wallet).toBeDefined();
    });

    test('6.2 Xem lịch sử giao dịch', async () => {
      const res = await request
        .get('/api/v1/wallet/transactions')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.transactions).toBeDefined();
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
    });
  });

  // 7. Quản lý gói sản phẩm (Packages)
  describe('7. Quản lý gói sản phẩm (Packages)', () => {
    test('7.1 Xem danh sách gói sản phẩm', async () => {
      const res = await request
        .get('/api/v1/packages')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.packages).toBeDefined();
      expect(Array.isArray(res.body.data.packages)).toBe(true);
    });

    test('7.2 Xem gói sản phẩm đang hoạt động', async () => {
      const res = await request
        .get('/api/v1/packages/active');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.packages).toBeDefined();
      expect(Array.isArray(res.body.data.packages)).toBe(true);
    });
  });

  // 10. Thông báo (Alerts)
  describe('10. Thông báo (Alerts)', () => {
    test('10.1 Xem danh sách thông báo của người dùng', async () => {
      const res = await request
        .get('/api/v1/alerts')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alerts).toBeDefined();
      expect(Array.isArray(res.body.data.alerts)).toBe(true);
    });
  });

  // 11. Cài đặt (Settings)
  describe('11. Cài đặt (Settings)', () => {
    test('11.1 Lấy cài đặt người dùng', async () => {
      const res = await request
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${accessToken}`);
      
      // Có thể trả về lỗi nếu chưa có cài đặt
      expect([200, 404]).toContain(res.status);
    });
  });

  // 13. Kiểm tra sức khỏe (Health Check)
  describe('13. Kiểm tra sức khỏe (Health Check)', () => {
    test('13.1 Kiểm tra trạng thái API', async () => {
      const res = await request.get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Server is running');
    });
  });

  // Test cuối cùng: Đăng xuất
  describe('Đăng xuất', () => {
    test('Đăng xuất thành công', async () => {
      const res = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Đăng xuất thành công');
    });
  });
}); 