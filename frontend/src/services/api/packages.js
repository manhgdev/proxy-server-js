import api from './client';

/**
 * API liên quan đến quản lý gói sản phẩm
 */
const packageAPI = {
  /**
   * Lấy danh sách gói sản phẩm
   * @param {Object} params - Tham số truy vấn
   * @returns {Promise}
   */
  getPackages: (params) => api.get('/packages', { params }),
  
  /**
   * Lấy danh sách gói sản phẩm đang hoạt động
   * @returns {Promise}
   */
  getActivePackages: () => api.get('/packages/active'),
  
  /**
   * Lấy thông tin chi tiết gói sản phẩm
   * @param {string} id - ID gói sản phẩm
   * @returns {Promise}
   */
  getPackageById: (id) => api.get(`/packages/${id}`),
  
  /**
   * Tạo gói sản phẩm mới (Admin)
   * @param {Object} packageData - Thông tin gói sản phẩm
   * @returns {Promise}
   */
  createPackage: (packageData) => api.post('/packages', packageData),
  
  /**
   * Cập nhật gói sản phẩm (Admin)
   * @param {string} id - ID gói sản phẩm
   * @param {Object} packageData - Thông tin cập nhật
   * @returns {Promise}
   */
  updatePackage: (id, packageData) => api.put(`/packages/${id}`, packageData),
  
  /**
   * Xóa gói sản phẩm (Admin)
   * @param {string} id - ID gói sản phẩm
   * @returns {Promise}
   */
  deletePackage: (id) => api.delete(`/packages/${id}`),
};

export default packageAPI; 