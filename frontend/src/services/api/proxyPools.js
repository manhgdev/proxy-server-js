import api from './client';

/**
 * API liên quan đến quản lý nhóm proxy (Proxy Pools)
 */
const proxyPoolAPI = {
  /**
   * Lấy danh sách nhóm proxy
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getPools: (params) => api.get('/proxy-pools', { params }),
  
  /**
   * Lấy thông tin chi tiết nhóm proxy
   * @param {string} id - ID nhóm proxy
   * @returns {Promise}
   */
  getPoolById: (id) => api.get(`/proxy-pools/${id}`),
  
  /**
   * Tạo nhóm proxy mới
   * @param {Object} poolData - Thông tin nhóm proxy
   * @returns {Promise}
   */
  createPool: (poolData) => api.post('/proxy-pools', poolData),
  
  /**
   * Cập nhật thông tin nhóm proxy
   * @param {string} id - ID nhóm proxy
   * @param {Object} poolData - Thông tin cập nhật
   * @returns {Promise}
   */
  updatePool: (id, poolData) => api.put(`/proxy-pools/${id}`, poolData),
  
  /**
   * Xóa nhóm proxy
   * @param {string} id - ID nhóm proxy
   * @returns {Promise}
   */
  deletePool: (id) => api.delete(`/proxy-pools/${id}`),
  
  /**
   * Lấy thống kê của nhóm proxy
   * @param {string} id - ID nhóm proxy
   * @returns {Promise}
   */
  getPoolStats: (id) => api.get(`/proxy-pools/${id}/stats`),
  
  /**
   * Bật/tắt trạng thái nhóm proxy
   * @param {string} id - ID nhóm proxy
   * @param {boolean} active - Trạng thái hoạt động
   * @returns {Promise}
   */
  togglePoolStatus: (id, active) => api.patch(`/proxy-pools/${id}/status`, { active }),
};

export default proxyPoolAPI; 