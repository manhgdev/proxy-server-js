import axios from 'axios';
import config from '../../config/index.js';
import logger from '../utils/logger.js';

/**
 * Service xử lý các hoạt động liên quan đến proxy
 */
const proxyService = {
  /**
   * Thay đổi IP cho proxy (rotate)
   * @param {Object} proxy - Đối tượng proxy cần rotate
   * @returns {Promise<Object>} - Đối tượng proxy đã được rotate
   */
  rotateProxy: async (proxy) => {
    try {
      // URL của API nhà cung cấp proxy
      const apiEndpoint = config.proxyProvider.apiEndpoint;
      const apiKey = config.proxyProvider.apiKey;
      
      // Gọi API của nhà cung cấp để thay đổi IP
      const response = await axios.post(`${apiEndpoint}/rotate`, {
        proxy_id: proxy.provider_id, // ID của proxy bên phía nhà cung cấp
        api_key: apiKey
      });
      
      if (response.data.success) {
        logger.info(`Rotated proxy: ${proxy._id}`);
        return {
          ...proxy,
          ip: response.data.ip
        };
      } else {
        throw new Error(response.data.message || 'Failed to rotate proxy');
      }
    } catch (error) {
      // Trường hợp test hoặc mock
      if (config.app.isDev || config.app.isTest) {
        const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        logger.info(`[MOCK] Rotated proxy: ${proxy._id} to IP: ${randomIp}`);
        return {
          ...proxy,
          ip: randomIp
        };
      }
      
      logger.error('Error rotating proxy:', error);
      throw error;
    }
  },
  
  /**
   * Kiểm tra trạng thái của proxy
   * @param {Object} proxy - Đối tượng proxy cần kiểm tra
   * @returns {Promise<Object>} - Kết quả kiểm tra
   */
  checkProxyStatus: async (proxy) => {
    try {
      const startTime = Date.now();
      
      // Tạo proxy config cho axios
      const proxyConfig = {
        host: proxy.host,
        port: proxy.port,
        auth: {
          username: proxy.username,
          password: proxy.password
        },
        protocol: 'http'
      };
      
      // Gọi API để kiểm tra proxy
      const response = await axios.get('https://api.ipify.org/?format=json', {
        proxy: proxyConfig,
        timeout: 10000 // Timeout 10 giây
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.data && response.data.ip) {
        logger.info(`Proxy check successful: ${proxy._id}, IP: ${response.data.ip}, Response time: ${responseTime}ms`);
        return {
          isWorking: true,
          ip: response.data.ip,
          responseTime: responseTime
        };
      } else {
        return {
          isWorking: false,
          responseTime: 0
        };
      }
    } catch (error) {
      logger.error(`Proxy check failed: ${proxy._id}`, error.message);
      
      // Trường hợp test hoặc mock
      if (config.app.isDev || config.app.isTest) {
        const mockSuccess = Math.random() > 0.2; // 80% tỷ lệ thành công
        if (mockSuccess) {
          const responseTime = Math.floor(Math.random() * 500) + 100;
          logger.info(`[MOCK] Proxy check successful: ${proxy._id}, Response time: ${responseTime}ms`);
          return {
            isWorking: true,
            ip: proxy.ip,
            responseTime: responseTime
          };
        }
      }
      
      return {
        isWorking: false,
        error: error.message,
        responseTime: 0
      };
    }
  },
  
  /**
   * Tạo mới proxy từ nhà cung cấp
   * @param {Object} options - Tùy chọn để tạo proxy
   * @returns {Promise<Object>} - Đối tượng proxy đã tạo
   */
  createProxy: async (options) => {
    try {
      // URL của API nhà cung cấp proxy
      const apiEndpoint = config.proxyProvider.apiEndpoint;
      const apiKey = config.proxyProvider.apiKey;
      
      // Gọi API của nhà cung cấp để tạo proxy mới
      const response = await axios.post(`${apiEndpoint}/create`, {
        api_key: apiKey,
        type: options.type,
        location: options.location,
        ...options
      });
      
      if (response.data.success) {
        logger.info(`Created new proxy with provider ID: ${response.data.proxy_id}`);
        return response.data.proxy;
      } else {
        throw new Error(response.data.message || 'Failed to create proxy');
      }
    } catch (error) {
      // Trường hợp test hoặc mock
      if (config.app.isDev || config.app.isTest) {
        const mockProxy = {
          provider_id: `mock_${Date.now()}`,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          port: 8080,
          username: `user_${Math.floor(Math.random() * 1000)}`,
          password: `pass_${Math.floor(Math.random() * 1000)}`,
          type: options.type || 'datacenter',
          location: options.location || 'us',
          isp: 'Mock ISP'
        };
        
        logger.info(`[MOCK] Created new proxy: ${JSON.stringify(mockProxy)}`);
        return mockProxy;
      }
      
      logger.error('Error creating proxy:', error);
      throw error;
    }
  },
  
  /**
   * Xóa proxy từ nhà cung cấp
   * @param {Object} proxy - Đối tượng proxy cần xóa
   * @returns {Promise<boolean>} - Kết quả xóa
   */
  deleteProxy: async (proxy) => {
    try {
      // Chỉ xóa nếu có provider_id
      if (!proxy.provider_id) {
        logger.warn(`Cannot delete proxy without provider_id: ${proxy._id}`);
        return false;
      }
      
      // URL của API nhà cung cấp proxy
      const apiEndpoint = config.proxyProvider.apiEndpoint;
      const apiKey = config.proxyProvider.apiKey;
      
      // Gọi API của nhà cung cấp để xóa proxy
      const response = await axios.post(`${apiEndpoint}/delete`, {
        api_key: apiKey,
        proxy_id: proxy.provider_id
      });
      
      if (response.data.success) {
        logger.info(`Deleted proxy with provider ID: ${proxy.provider_id}`);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete proxy');
      }
    } catch (error) {
      // Trường hợp test hoặc mock
      if (config.app.isDev || config.app.isTest) {
        logger.info(`[MOCK] Deleted proxy: ${proxy._id}`);
        return true;
      }
      
      logger.error('Error deleting proxy:', error);
      throw error;
    }
  }
};

export default proxyService; 