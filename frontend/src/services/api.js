import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

// Tạo một instance của axios với cấu hình chung
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor cho request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor cho response
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Xử lý token hết hạn
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post('/auth/refresh-token', {
          refresh_token: refreshToken,
        });
        const { access_token } = response.data.data;
        localStorage.setItem('accessToken', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        // Refresh token không hợp lệ, đăng xuất
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// API xác thực
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refresh_token: refreshToken }),
  getProfile: () => apiClient.get('/users/profile'),
};

// API người dùng
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.put('/users/password', data),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
};

// API proxy
export const proxyAPI = {
  getProxies: (params) => apiClient.get('/proxies', { params }),
  getProxyById: (id) => apiClient.get(`/proxies/${id}`),
  createProxy: (data) => apiClient.post('/proxies', data),
  updateProxy: (id, data) => apiClient.put(`/proxies/${id}`, data),
  deleteProxy: (id) => apiClient.delete(`/proxies/${id}`),
  replaceProxy: (id) => apiClient.post(`/proxies/${id}/replace`),
};

// API đơn hàng
export const orderAPI = {
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (data) => apiClient.post('/orders', data),
  updateOrder: (id, data) => apiClient.put(`/orders/${id}`, data),
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),
  confirmOrder: (id) => apiClient.put(`/orders/${id}/confirm`),
};

// API ví điện tử
export const walletAPI = {
  getBalance: () => apiClient.get('/wallet'),
  getTransactions: (params) => apiClient.get('/wallet/transactions', { params }),
  deposit: (data) => apiClient.post('/wallet/deposit', data),
  withdraw: (data) => apiClient.post('/wallet/withdraw', data),
};

// API gói dịch vụ
export const packageAPI = {
  getPackages: (params) => apiClient.get('/packages', { params }),
  getPackageById: (id) => apiClient.get(`/packages/${id}`),
};

// API dành cho quản trị viên
export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getSystemSettings: () => apiClient.get('/admin/settings'),
  updateSystemSettings: (data) => apiClient.put('/admin/settings', data),
};

export default apiClient; 