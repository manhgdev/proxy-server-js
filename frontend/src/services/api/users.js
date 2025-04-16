import api from './client';

/**
 * API liên quan đến quản lý người dùng
 */
const userAPI = {
  /**
   * Lấy danh sách người dùng
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getUsers: (params) => api.get('/users', { params }),
  
  /**
   * Tìm kiếm người dùng
   * @param {Object} params - Tham số tìm kiếm
   * @returns {Promise}
   */
  searchUsers: (params) => api.get('/users/search', { params }),
  
  /**
   * Lấy thông tin chi tiết người dùng
   * @param {string} id - ID người dùng
   * @returns {Promise}
   */
  getUserById: (id) => api.get(`/users/${id}`),
  
  /**
   * Tạo người dùng mới
   * @param {Object} userData - Thông tin người dùng
   * @returns {Promise}
   */
  createUser: (userData) => api.post('/users', userData),
  
  /**
   * Cập nhật thông tin người dùng
   * @param {string} id - ID người dùng
   * @param {Object} userData - Thông tin cập nhật
   * @returns {Promise}
   */
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  /**
   * Xóa người dùng
   * @param {string} id - ID người dùng
   * @returns {Promise}
   */
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  /**
   * Cập nhật hồ sơ cá nhân
   * @param {Object} profileData - Thông tin hồ sơ
   * @returns {Promise}
   */
  updateProfile: (profileData) => api.put('/users/profile/update', profileData),
  
  /**
   * Lấy danh sách gói dịch vụ của người dùng
   * @param {string} id - ID người dùng
   * @returns {Promise}
   */
  getUserPlans: (id) => api.get(`/users/${id}/plans`),
  
  /**
   * Lấy danh sách vai trò của người dùng
   * @param {string} id - ID người dùng
   * @returns {Promise}
   */
  getUserRoles: (id) => api.get(`/users/${id}/roles`),
  
  /**
   * Lấy danh sách quyền hạn của người dùng
   * @param {string} id - ID người dùng
   * @returns {Promise}
   */
  getUserPermissions: (id) => api.get(`/users/${id}/permissions`),
  
  /**
   * Xem API key của người dùng hiện tại
   * @returns {Promise}
   */
  getApiKey: () => api.get('/users/me/api-key'),
  
  /**
   * Tạo API key mới cho người dùng hiện tại
   * @returns {Promise}
   */
  createApiKey: () => api.post('/users/me/api-key'),
  
  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   * @returns {Promise}
   */
  getMyOrders: () => api.get('/users/me/orders'),
  
  /**
   * Lấy chi tiết đơn hàng của người dùng hiện tại
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise}
   */
  getMyOrderById: (orderId) => api.get(`/users/me/orders/${orderId}`),
  
  /**
   * Thay đổi mật khẩu người dùng
   * @param {string} id - ID người dùng
   * @param {Object} passwordData - Thông tin mật khẩu mới
   * @returns {Promise}
   */
  changePassword: (id, passwordData) => api.post(`/users/${id}/change-password`, passwordData),
};

export default userAPI; 