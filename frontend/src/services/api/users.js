import api from './client';

/**
 * API liên quan đến quản lý người dùng
 */
const usersAPI = {
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise}
   */
  getProfile: () => api.get('/users/profile'),
  
  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Thông tin cần cập nhật {email, fullname, phone}
   * @returns {Promise}
   */
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  /**
   * Đổi mật khẩu
   * @param {Object} passwordData - {oldPassword, newPassword}
   * @returns {Promise}
   */
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  
  /**
   * Tạo API key mới
   * @returns {Promise}
   */
  generateApiKey: () => api.post('/users/api-key/generate'),
  
  /**
   * Lấy danh sách người dùng (admin only)
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số lượng item mỗi trang
   * @returns {Promise}
   */
  getAllUsers: (page = 1, limit = 10) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  
  /**
   * Lấy thông tin chi tiết người dùng theo ID (admin only)
   * @param {string} userId - ID người dùng
   * @returns {Promise}
   */
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  
  /**
   * Cập nhật người dùng (admin only)
   * @param {string} userId - ID người dùng
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise}
   */
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  
  /**
   * Kích hoạt/vô hiệu hóa người dùng (admin only)
   * @param {string} userId - ID người dùng
   * @param {boolean} isActive - Trạng thái kích hoạt
   * @returns {Promise}
   */
  toggleUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { active: isActive }),
  
  /**
   * Lấy danh sách roles (admin only)
   * @returns {Promise}
   */
  getRoles: () => api.get('/admin/roles'),
  
  /**
   * Gán role cho người dùng (admin only)
   * @param {string} userId - ID người dùng
   * @param {string} roleId - ID role
   * @returns {Promise}
   */
  assignRoleToUser: (userId, roleId) => api.post(`/admin/users/${userId}/roles`, { role_id: roleId }),
  
  /**
   * Gỡ bỏ role khỏi người dùng (admin only)
   * @param {string} userId - ID người dùng
   * @param {string} roleId - ID role
   * @returns {Promise}
   */
  removeRoleFromUser: (userId, roleId) => api.delete(`/admin/users/${userId}/roles/${roleId}`),
  
  /**
   * Nạp tiền vào ví người dùng (admin only)
   * @param {string} userId - ID người dùng
   * @param {Object} data - Dữ liệu nạp tiền {amount, note}
   * @returns {Promise}
   */
  creditWallet: (userId, data) => api.post(`/admin/users/${userId}/wallet/credit`, data),
};

export default usersAPI; 