import api from './client';

/**
 * API liên quan đến quản lý gói dịch vụ proxy
 */
const packagesAPI = {
  /**
   * Lấy danh sách gói proxy
   * @param {Object} params - Tham số truy vấn {type, category}
   * @returns {Promise}
   */
  getPackages: (params) => api.get('/packages', { params }),
  
  /**
   * Lấy danh sách gói proxy đang hoạt động
   * @returns {Promise}
   */
  getActivePackages: () => api.get('/packages', { params: { active: true } }),
  
  /**
   * Lấy chi tiết gói proxy
   * @param {string} packageId - ID gói dịch vụ
   * @returns {Promise}
   */
  getPackageById: (packageId) => api.get(`/packages/${packageId}`),
  
  /**
   * Tạo gói dịch vụ mới (admin only)
   * @param {Object} packageData - Thông tin gói dịch vụ
   * @returns {Promise}
   */
  createPackage: (packageData) => api.post('/admin/packages', packageData),
  
  /**
   * Cập nhật gói dịch vụ (admin only)
   * @param {string} packageId - ID gói dịch vụ
   * @param {Object} packageData - Thông tin cập nhật
   * @returns {Promise}
   */
  updatePackage: (packageId, packageData) => api.put(`/admin/packages/${packageId}`, packageData),
  
  /**
   * Xóa gói dịch vụ (admin only)
   * @param {string} packageId - ID gói dịch vụ
   * @returns {Promise}
   */
  deletePackage: (packageId) => api.delete(`/admin/packages/${packageId}`),
  
  /**
   * Kích hoạt/vô hiệu hóa gói dịch vụ (admin only)
   * @param {string} packageId - ID gói dịch vụ
   * @param {boolean} isActive - Trạng thái kích hoạt
   * @returns {Promise}
   */
  togglePackageStatus: (packageId, isActive) => api.put(`/admin/packages/${packageId}/status`, { active: isActive }),
};

export default packagesAPI; 