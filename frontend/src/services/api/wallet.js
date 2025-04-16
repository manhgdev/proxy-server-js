import api from './client';

/**
 * API liên quan đến quản lý ví điện tử
 */
const walletAPI = {
  /**
   * Lấy thông tin ví của người dùng hiện tại
   * @returns {Promise}
   */
  getBalance: () => api.get('/wallet/me'),
  
  /**
   * Lấy thông tin ví của người dùng cụ thể (Admin)
   * @param {string} userId - ID người dùng
   * @returns {Promise}
   */
  getUserWallet: (userId) => api.get(`/wallet/user/${userId}`),
  
  /**
   * Lấy lịch sử giao dịch
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  
  /**
   * Yêu cầu nạp tiền
   * @param {Object} data - Thông tin nạp tiền
   * @returns {Promise}
   */
  deposit: (data) => api.post('/wallet/deposit', data),
  
  /**
   * Yêu cầu rút tiền
   * @param {Object} data - Thông tin rút tiền
   * @returns {Promise}
   */
  withdraw: (data) => api.post('/wallet/withdraw', data),
  
  /**
   * Lấy thống kê ví (Admin)
   * @returns {Promise}
   */
  getStats: () => api.get('/wallet/stats'),
};

export default walletAPI; 