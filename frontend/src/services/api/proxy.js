import api from './client';

/**
 * API liên quan đến quản lý proxy
 */
const proxyAPI = {
  /**
   * Lấy danh sách proxy của người dùng
   * @param {Object} params - Tham số truy vấn (page, limit, type)
   * @returns {Promise}
   */
  getProxies: (params) => api.get('/proxies', { params }),
  
  /**
   * Lấy chi tiết gói proxy đã mua
   * @param {string} planId - ID của gói proxy
   * @returns {Promise}
   */
  getPlan: (planId) => api.get(`/plans/${planId}`),
  
  /**
   * Lấy chi tiết một proxy
   * @param {string} proxyId - ID của proxy
   * @returns {Promise}
   */
  getProxyDetails: (proxyId) => api.get(`/proxies/${proxyId}`),
  
  /**
   * Kiểm tra trạng thái một proxy
   * @param {string} proxyId - ID của proxy
   * @returns {Promise}
   */
  checkProxyStatus: (proxyId) => api.get(`/proxies/${proxyId}/status`),
  
  /**
   * Yêu cầu thay thế proxy
   * @param {string} proxyId - ID của proxy
   * @param {Object} requestData - Thông tin yêu cầu
   * @param {string} requestData.reason - Lý do thay thế
   * @param {string} requestData.details - Chi tiết bổ sung
   * @returns {Promise}
   */
  requestProxyReplacement: (proxyId, requestData) => api.post(`/proxies/${proxyId}/replace`, requestData),
  
  /**
   * Xoay proxy (chỉ dành cho proxy xoay)
   * @param {Object} rotateData - Thông tin xoay proxy
   * @param {string} rotateData.plan_id - ID của gói proxy
   * @returns {Promise}
   */
  rotateProxy: (rotateData) => api.post('/proxies/rotate', rotateData),
  
  /**
   * Nạp thêm băng thông cho proxy (nếu có giới hạn băng thông)
   * @param {string} planId - ID của gói proxy
   * @param {Object} topupData - Thông tin nạp thêm
   * @param {number} topupData.gb_amount - Số GB muốn nạp thêm
   * @param {string} topupData.payment_source - Nguồn thanh toán
   * @returns {Promise}
   */
  topupBandwidth: (planId, topupData) => api.post(`/plans/${planId}/topup`, topupData),
  
  /**
   * Gia hạn proxy
   * @param {string} planId - ID của gói proxy
   * @param {Object} renewData - Thông tin gia hạn
   * @param {string} renewData.payment_source - Nguồn thanh toán
   * @param {number} renewData.duration_months - Số tháng muốn gia hạn
   * @returns {Promise}
   */
  renewProxy: (planId, renewData) => api.post(`/plans/${planId}/renew`, renewData),
};

export default proxyAPI; 