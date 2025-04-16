import api from './client';

/**
 * API liên quan đến xác thực và quản lý tài khoản người dùng
 */
const authAPI = {
  /**
   * Đăng nhập vào hệ thống
   * @param {Object} credentials - Thông tin đăng nhập {username, password}
   * @returns {Promise}
   */
  login: (credentials) => api.post('/auth/login', credentials),
  
  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Thông tin người dùng mới
   * @returns {Promise}
   */
  register: (userData) => api.post('/auth/register', userData),
  
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise}
   */
  me: () => api.get('/auth/me'),
  
  /**
   * Làm mới token truy cập
   * @returns {Promise}
   */
  refreshToken: () => api.post('/auth/refresh-token'),
  
  /**
   * Đăng xuất khỏi hệ thống
   * @returns {Promise}
   */
  logout: () => api.post('/auth/logout'),
  
  /**
   * Thay đổi mật khẩu
   * @param {Object} passwordData - Thông tin mật khẩu {oldPassword, newPassword, confirmPassword}
   * @returns {Promise}
   */
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  
  /**
   * Yêu cầu gửi email khôi phục mật khẩu
   * @param {Object} data - Thông tin email {email}
   * @returns {Promise}
   */
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  
  /**
   * Đặt lại mật khẩu với token
   * @param {Object} data - Thông tin đặt lại {token, newPassword, confirmPassword}
   * @returns {Promise}
   */
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  /**
   * Xác thực token đặt lại mật khẩu
   * @param {string} token - Token reset password
   * @returns {Promise}
   */
  validateResetToken: (token) => api.get(`/auth/validate-reset-token?token=${token}`),
  
  /**
   * Tạo API key mới
   * @returns {Promise}
   */
  generateApiKey: () => api.post('/auth/generate-api-key'),
};

export default authAPI; 