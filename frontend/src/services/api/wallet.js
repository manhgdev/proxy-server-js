import api from './client';

/**
 * API liên quan đến quản lý ví và giao dịch tài chính
 */
const walletAPI = {
  /**
   * Lấy thông tin ví của người dùng
   * @returns {Promise}
   */
  getWallet: () => api.get('/wallet'),
  
  /**
   * Lấy lịch sử giao dịch
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise}
   */
  getTransactions: (page = 1, limit = 10) => api.get(`/wallet/transactions?page=${page}&limit=${limit}`),
  
  /**
   * Tạo yêu cầu nạp tiền
   * @param {Object} depositData - Thông tin nạp tiền
   * @param {number} depositData.amount - Số tiền nạp
   * @param {string} depositData.payment_method - Phương thức thanh toán (bank_transfer, e_wallet, ...)
   * @param {Object} depositData.payment_details - Chi tiết thanh toán
   * @returns {Promise}
   */
  createDeposit: (depositData) => api.post('/wallet/deposit', depositData),
  
  /**
   * Tạo yêu cầu rút tiền (chỉ dành cho Reseller)
   * @param {Object} withdrawData - Thông tin rút tiền
   * @param {number} withdrawData.amount - Số tiền rút
   * @param {string} withdrawData.payment_method - Phương thức rút tiền
   * @param {Object} withdrawData.payment_details - Chi tiết thanh toán
   * @returns {Promise}
   */
  createWithdrawal: (withdrawData) => api.post('/wallet/withdraw', withdrawData),
  
  /**
   * Lấy danh sách yêu cầu nạp tiền (admin only)
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise}
   */
  getDepositRequests: (page = 1, limit = 10) => api.get(`/admin/deposits?page=${page}&limit=${limit}`),
  
  /**
   * Lấy danh sách yêu cầu rút tiền (admin only)
   * @param {number} page - Số trang
   * @param {number} limit - Số lượng kết quả mỗi trang
   * @returns {Promise}
   */
  getWithdrawalRequests: (page = 1, limit = 10) => api.get(`/admin/withdrawals?page=${page}&limit=${limit}`),
  
  /**
   * Xác nhận yêu cầu nạp tiền (admin only)
   * @param {string} depositId - ID yêu cầu nạp tiền
   * @param {Object} data - Dữ liệu xác nhận
   * @returns {Promise}
   */
  approveDeposit: (depositId) => api.put(`/admin/deposit/${depositId}/approve`),
  
  /**
   * Từ chối yêu cầu nạp tiền (admin only)
   * @param {string} depositId - ID yêu cầu nạp tiền
   * @param {Object} data - Dữ liệu từ chối
   * @returns {Promise}
   */
  rejectDeposit: (depositId, data) => api.put(`/admin/deposit/${depositId}/reject`, data),
  
  /**
   * Xác nhận yêu cầu rút tiền (admin only)
   * @param {string} withdrawalId - ID yêu cầu rút tiền
   * @returns {Promise}
   */
  approveWithdrawal: (withdrawalId) => api.put(`/admin/withdrawal/${withdrawalId}/approve`),
  
  /**
   * Từ chối yêu cầu rút tiền (admin only)
   * @param {string} withdrawalId - ID yêu cầu rút tiền
   * @param {Object} data - Dữ liệu từ chối
   * @returns {Promise}
   */
  rejectWithdrawal: (withdrawalId, data) => api.put(`/admin/withdrawal/${withdrawalId}/reject`, data),
};

export default walletAPI; 