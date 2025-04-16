import api from './client';

/**
 * API liên quan đến quản lý proxy đơn lẻ
 */
const proxyAPI = {
  /**
   * Lấy danh sách proxy
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getProxies: (params) => api.get('/proxies', { params }),
  
  /**
   * Lấy thông tin chi tiết proxy
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  getProxyById: (id) => api.get(`/proxies/${id}`),
  
  /**
   * Tạo proxy mới
   * @param {Object} proxyData - Thông tin proxy
   * @returns {Promise}
   */
  createProxy: (proxyData) => api.post('/proxies', proxyData),
  
  /**
   * Cập nhật thông tin proxy
   * @param {string} id - ID proxy
   * @param {Object} proxyData - Thông tin cập nhật
   * @returns {Promise}
   */
  updateProxy: (id, proxyData) => api.put(`/proxies/${id}`, proxyData),
  
  /**
   * Xóa proxy
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  deleteProxy: (id) => api.delete(`/proxies/${id}`),
  
  /**
   * Quay vòng proxy
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  rotateProxy: (id) => api.post(`/proxies/${id}/rotate`),
  
  /**
   * Kiểm tra trạng thái proxy
   * @param {string} id - ID proxy
   * @returns {Promise}
   */
  checkProxy: (id) => api.get(`/proxies/${id}/check`),
  
  /**
   * Nhập proxy hàng loạt
   * @param {Object} proxyData - Dữ liệu proxy hoặc FormData
   * @param {Object} config - Cấu hình request (nếu cần)
   * @returns {Promise}
   */
  bulkImport: (proxyData, config) => api.post('/proxies/bulk', proxyData, config),
  
  /**
   * Xóa proxy hàng loạt
   * @param {Array} ids - Danh sách ID proxy cần xóa
   * @returns {Promise}
   */
  bulkDelete: (ids) => api.post('/proxies/bulk-delete', { ids }),
  
  /**
   * Cập nhật cài đặt proxy
   * @param {string} id - ID proxy
   * @param {Object} settings - Cài đặt mới
   * @returns {Promise}
   */
  updateSettings: (id, settings) => api.patch(`/proxies/${id}/settings`, settings),
};

export default proxyAPI; 