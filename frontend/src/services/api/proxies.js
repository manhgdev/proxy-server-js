import api from './client';

/**
 * API liên quan đến quản lý proxy
 */
const proxiesAPI = {
  /**
   * Lấy danh sách proxy đang sử dụng
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise}
   */
  getProxies: (page = 1, limit = 10) => api.get(`/proxies?page=${page}&limit=${limit}`),
  
  /**
   * Kiểm tra tình trạng proxy
   * @param {string} proxyId - ID proxy
   * @returns {Promise}
   */
  checkProxyStatus: (proxyId) => api.get(`/proxies/${proxyId}/status`),
  
  /**
   * Yêu cầu thay thế proxy
   * @param {string} proxyId - ID proxy
   * @param {Object} data - Thông tin yêu cầu
   * @returns {Promise}
   */
  replaceProxy: (proxyId, data) => api.post(`/proxies/${proxyId}/replace`, data),
  
  /**
   * Xoay proxy (cho Rotating Proxy)
   * @param {string} planId - ID gói dịch vụ
   * @returns {Promise}
   */
  rotateProxy: (planId) => api.post('/proxies/rotate', { plan_id: planId }),
  
  /**
   * Lấy chi tiết gói proxy đã mua
   * @param {string} planId - ID gói dịch vụ
   * @returns {Promise}
   */
  getPlanDetails: (planId) => api.get(`/plans/${planId}`),
  
  /**
   * Nạp thêm băng thông cho proxy (cho Bandwidth Proxy)
   * @param {string} planId - ID gói proxy
   * @param {Object} data - Thông tin nạp băng thông
   * @returns {Promise}
   */
  topupBandwidth: (planId, data) => api.post(`/plans/${planId}/topup`, data),
  
  /**
   * Gia hạn gói proxy
   * @param {string} planId - ID gói proxy
   * @param {Object} renewData - Thông tin gia hạn
   * @returns {Promise}
   */
  renewPlan: (planId, renewData) => api.post(`/plans/${planId}/renew`, renewData),
  
  /**
   * Lấy tất cả proxy (admin only)
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise}
   */
  getAllProxies: (page = 1, limit = 20) => api.get(`/admin/proxies?page=${page}&limit=${limit}`),
  
  /**
   * Cập nhật thông tin proxy (admin only)
   * @param {string} proxyId - ID proxy
   * @param {Object} proxyData - Thông tin cập nhật
   * @returns {Promise}
   */
  updateProxy: (proxyId, proxyData) => api.put(`/admin/proxies/${proxyId}`, proxyData),
  
  /**
   * Xóa proxy (admin only)
   * @param {string} proxyId - ID proxy
   * @returns {Promise}
   */
  deleteProxy: (proxyId) => api.delete(`/admin/proxies/${proxyId}`),
  
  /**
   * Tạo proxy mới (admin only)
   * @param {Object} proxyData - Thông tin proxy
   * @returns {Promise}
   */
  createProxy: (proxyData) => api.post('/admin/proxies', proxyData),
};

export default proxiesAPI; 