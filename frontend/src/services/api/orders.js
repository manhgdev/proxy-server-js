import api from './client';

/**
 * API liên quan đến quản lý đơn hàng
 */
const ordersAPI = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Thông tin đơn hàng
   * @returns {Promise}
   */
  createOrder: (orderData) => api.post('/orders', orderData),
  
  /**
   * Lấy lịch sử đơn hàng
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise}
   */
  getOrders: (page = 1, limit = 10) => api.get(`/orders?page=${page}&limit=${limit}`),
  
  /**
   * Lấy chi tiết đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise}
   */
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  
  /**
   * Lấy danh sách đơn hàng (admin only)
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @param {Object} filters - Bộ lọc
   * @returns {Promise}
   */
  getAllOrders: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    return api.get(`/admin/orders?${params}`);
  },
  
  /**
   * Cập nhật trạng thái đơn hàng (admin only)
   * @param {string} orderId - ID đơn hàng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise}
   */
  updateOrderStatus: (orderId, data) => api.put(`/admin/orders/${orderId}/status`, data),
  
  /**
   * Hủy đơn hàng (admin only)
   * @param {string} orderId - ID đơn hàng
   * @param {Object} data - Dữ liệu hủy đơn
   * @returns {Promise}
   */
  cancelOrder: (orderId, data) => api.put(`/admin/orders/${orderId}/cancel`, data),
};

export default ordersAPI; 