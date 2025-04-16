import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Tạo một instance của axios với cấu hình chung
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor cho request
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý token hết hạn - chỉ xóa thông tin đăng nhập
    if (error.response?.status === 401) {
      // Token hết hạn, xóa thông tin đăng nhập
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
    }
    return Promise.reject(error);
  }
);

export default api; 