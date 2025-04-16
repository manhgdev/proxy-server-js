import api from './client';

/**
 * API liên quan đến quản lý đơn hàng
 */
const orderAPI = {
  /**
   * Lấy danh sách đơn hàng
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getOrders: (params) => api.get('/orders', { params }),
  
  /**
   * Lấy danh sách đơn hàng của tôi
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getMyOrders: (params) => api.get('/orders/my', { params }),
  
  /**
   * Lấy danh sách đơn hàng đại lý
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getResellerOrders: (params) => api.get('/orders/reseller', { params }),
  
  /**
   * Lấy thông tin chi tiết đơn hàng
   * @param {string} id - ID đơn hàng
   * @returns {Promise}
   */
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  /**
   * Lấy chi tiết mục đơn hàng
   * @param {string} id - ID đơn hàng
   * @returns {Promise}
   */
  getOrderItems: (id) => api.get(`/orders/${id}/items`),
  
  /**
   * Tạo đơn hàng mới
   * @param {Object} data - Thông tin đơn hàng
   * @returns {Promise}
   */
  createOrder: (data) => api.post('/orders', data),
  
  /**
   * Cập nhật đơn hàng
   * @param {string} id - ID đơn hàng
   * @param {Object} data - Thông tin cập nhật
   * @returns {Promise}
   */
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  
  /**
   * Hủy đơn hàng
   * @param {string} id - ID đơn hàng
   * @returns {Promise}
   */
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  
  /**
   * Xác nhận đơn hàng
   * @param {string} id - ID đơn hàng
   * @returns {Promise}
   */
  confirmOrder: (id) => api.put(`/orders/${id}/confirm`),
};

export default orderAPI; 