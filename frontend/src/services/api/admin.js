import api from './client';

/**
 * API liên quan đến quản trị hệ thống
 */
const adminAPI = {
  /**
   * Lấy bảng điều khiển tổng quan
   * @returns {Promise}
   */
  getDashboard: () => api.get('/admin/dashboard'),
  
  /**
   * Lấy danh sách vai trò
   * @returns {Promise}
   */
  getRoles: () => api.get('/admin/roles'),
  
  /**
   * Lấy chi tiết vai trò
   * @param {string} id - ID vai trò
   * @returns {Promise}
   */
  getRoleById: (id) => api.get(`/admin/roles/${id}`),
  
  /**
   * Tạo vai trò mới
   * @param {Object} roleData - Thông tin vai trò
   * @returns {Promise}
   */
  createRole: (roleData) => api.post('/admin/roles', roleData),
  
  /**
   * Cập nhật vai trò
   * @param {string} id - ID vai trò
   * @param {Object} roleData - Thông tin cập nhật
   * @returns {Promise}
   */
  updateRole: (id, roleData) => api.put(`/admin/roles/${id}`, roleData),
  
  /**
   * Xóa vai trò
   * @param {string} id - ID vai trò
   * @returns {Promise}
   */
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  
  /**
   * Lấy danh sách quyền hạn
   * @returns {Promise}
   */
  getPermissions: () => api.get('/admin/permissions'),
  
  /**
   * Lấy danh sách nhóm quyền hạn
   * @returns {Promise}
   */
  getPermissionGroups: () => api.get('/admin/permissions/groups'),
  
  /**
   * Gán quyền cho vai trò
   * @param {Object} data - Thông tin gán quyền
   * @returns {Promise}
   */
  assignPermissionToRole: (data) => api.post('/admin/role-permissions', data),
  
  /**
   * Xóa quyền khỏi vai trò
   * @param {string} roleId - ID vai trò
   * @param {string} permissionId - ID quyền hạn
   * @returns {Promise}
   */
  removePermissionFromRole: (roleId, permissionId) => 
    api.delete(`/admin/role-permissions/${roleId}/${permissionId}`),
  
  /**
   * Gán vai trò cho người dùng
   * @param {Object} data - Thông tin gán vai trò
   * @returns {Promise}
   */
  assignRoleToUser: (data) => api.post('/admin/user-roles', data),
  
  /**
   * Xóa vai trò khỏi người dùng
   * @param {string} userId - ID người dùng
   * @param {string} roleId - ID vai trò
   * @returns {Promise}
   */
  removeRoleFromUser: (userId, roleId) => 
    api.delete(`/admin/user-roles/${userId}/${roleId}`),
  
  /**
   * Lấy báo cáo doanh thu
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  
  /**
   * Lấy báo cáo người dùng
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getUsersReport: (params) => api.get('/admin/reports/users', { params }),
  
  /**
   * Lấy báo cáo đơn hàng
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getOrdersReport: (params) => api.get('/admin/reports/orders', { params }),
  
  /**
   * Nạp tiền vào ví người dùng (Admin)
   * @param {Object} data - Thông tin nạp tiền
   * @returns {Promise}
   */
  creditWallet: (data) => api.post('/admin/wallet/credit', data),
  
  /**
   * Lấy cài đặt hệ thống
   * @returns {Promise}
   */
  getSystemSettings: () => api.get('/admin/settings'),
  
  /**
   * Cập nhật cài đặt hệ thống
   * @param {Object} data - Thông tin cài đặt
   * @returns {Promise}
   */
  updateSystemSettings: (data) => api.put('/admin/settings', data),
  
  /**
   * Lấy tất cả proxy (Admin)
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getAllProxies: (params) => api.get('/admin/proxies', { params }),
  
  /**
   * Cập nhật thông tin proxy (Admin)
   * @param {string} id - ID proxy
   * @param {Object} proxyData - Thông tin cập nhật
   * @returns {Promise}
   */
  updateProxy: (id, proxyData) => api.put(`/admin/proxies/${id}`, proxyData),
  
  /**
   * Xóa proxy (Admin)
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  deleteProxy: (id) => api.delete(`/admin/proxies/${id}`),
  
  /**
   * Xoay proxy (Admin)
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  rotateProxy: (id) => api.post(`/admin/proxies/${id}/rotate`),
  
  /**
   * Kiểm tra proxy (Admin)
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  checkProxy: (id) => api.get(`/admin/proxies/${id}/check`),
};

export default adminAPI; 