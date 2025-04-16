import api from './client';

/**
 * API liên quan đến bảng điều khiển
 */
const dashboardAPI = {
  /**
   * Lấy thống kê tổng quan
   * @returns {Promise}
   */
  getStats: () => api.get('/dashboard/stats'),
  
  /**
   * Lấy hoạt động gần đây
   * @returns {Promise}
   */
  getRecentActivity: () => api.get('/dashboard/activity'),
  
  /**
   * Lấy trạng thái hệ thống
   * @returns {Promise}
   */
  getSystemStatus: () => api.get('/dashboard/system'),
};

export default dashboardAPI; 