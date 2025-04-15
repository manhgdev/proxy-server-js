import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import UserProxy from '../../models/UserProxy.js';
import Proxy from '../../models/Proxy.js';
import ProxyService from '../../services/proxyService.js';

/**
 * Lấy danh sách proxy của người dùng
 */
export const getUserProxies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type, page = 1, limit = 20 } = req.query;
    
    // Tạo query object
    const queryObj = { user_id: userId };
    
    // Filter theo status (active/inactive)
    if (status) {
      if (status === 'active') {
        queryObj.is_active = true;
        queryObj.expires_at = { $gt: new Date() };
      } else if (status === 'expired') {
        queryObj.expires_at = { $lte: new Date() };
      } else if (status === 'inactive') {
        queryObj.is_active = false;
      }
    }
    
    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Lấy proxies
    const userProxies = await UserProxy.find(queryObj)
      .populate({
        path: 'proxy_id',
        select: 'ip port username password protocol type category country city isp status host',
        match: type ? { type } : {}
      })
      .populate('plan_id', 'name type category')
      .sort({ expires_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    // Filter lại những proxy_id là null (có thể do match filter type không trùng khớp)
    const filteredProxies = userProxies.filter(up => up.proxy_id !== null);
    
    // Đếm tổng số lượng theo query
    const total = await UserProxy.countDocuments(queryObj);
    
    // Format response
    const formattedProxies = filteredProxies.map(userProxy => {
      const proxy = userProxy.proxy_id;
      return {
        id: userProxy._id,
        proxy_id: proxy._id,
        connection_data: {
          host: proxy.host || proxy.ip,
          port: proxy.port,
          username: userProxy.custom_settings.username || proxy.username,
          password: userProxy.custom_settings.password || proxy.password,
          protocol: proxy.protocol
        },
        details: {
          type: proxy.type,
          category: proxy.category,
          location: {
            country: proxy.country,
            city: proxy.city || '',
            isp: proxy.isp || ''
          }
        },
        status: proxy.status,
        is_active: userProxy.is_active,
        expires_at: userProxy.expires_at,
        is_expired: userProxy.expires_at < new Date(),
        plan: userProxy.plan_id ? {
          id: userProxy.plan_id._id,
          name: userProxy.plan_id.name,
          type: userProxy.plan_id.type
        } : null,
        last_used_at: userProxy.last_used_at,
        created_at: userProxy.created_at
      };
    });
    
    return res.status(200).json({
      success: true,
      data: {
        proxies: formattedProxies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user proxies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

/**
 * Lấy chi tiết proxy theo ID
 */
export const getProxyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID proxy không hợp lệ'
      });
    }
    
    // Tìm proxy
    const userProxy = await UserProxy.findOne({
      _id: id,
      user_id: userId
    })
    .populate('proxy_id')
    .populate('plan_id', 'name type category');
    
    if (!userProxy || !userProxy.proxy_id) {
      return res.status(404).json({
        success: false,
        message: 'Proxy không tìm thấy'
      });
    }
    
    const proxy = userProxy.proxy_id;
    
    // Format response
    const proxyData = {
      id: userProxy._id,
      proxy_id: proxy._id,
      connection_data: {
        host: proxy.host || proxy.ip,
        port: proxy.port,
        username: userProxy.custom_settings.username || proxy.username,
        password: userProxy.custom_settings.password || proxy.password,
        protocol: proxy.protocol,
        connection_string: proxy.getConnectionString()
      },
      details: {
        type: proxy.type,
        category: proxy.category,
        location: {
          country: proxy.country,
          city: proxy.city || '',
          region: proxy.region || '',
          isp: proxy.isp || ''
        }
      },
      status: proxy.status,
      is_active: userProxy.is_active,
      expires_at: userProxy.expires_at,
      is_expired: userProxy.expires_at < new Date(),
      plan: userProxy.plan_id ? {
        id: userProxy.plan_id._id,
        name: userProxy.plan_id.name,
        type: userProxy.plan_id.type
      } : null,
      usage_stats: userProxy.usage_stats,
      custom_settings: userProxy.custom_settings,
      last_used_at: userProxy.last_used_at,
      created_at: userProxy.created_at,
      updated_at: userProxy.updated_at
    };
    
    return res.status(200).json({
      success: true,
      data: proxyData
    });
  } catch (error) {
    console.error('Get proxy by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

/**
 * Xoay proxy (đối với proxy quay vòng)
 */
export const rotateProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID proxy không hợp lệ'
      });
    }
    
    // Tìm proxy
    const userProxy = await UserProxy.findOne({
      _id: id,
      user_id: userId
    }).populate('proxy_id');
    
    if (!userProxy || !userProxy.proxy_id) {
      return res.status(404).json({
        success: false,
        message: 'Proxy không tìm thấy'
      });
    }
    
    const proxy = userProxy.proxy_id;
    
    // Kiểm tra proxy có phải loại rotating không
    if (proxy.type !== 'rotating') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xoay proxy loại rotating'
      });
    }
    
    try {
      // Gọi service để xoay proxy
      const rotatedProxy = await ProxyService.rotateProxy(proxy._id);
      
      if (!rotatedProxy) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xoay proxy, vui lòng thử lại sau'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Proxy đã được xoay thành công',
        data: {
          id: userProxy._id,
          proxy_id: rotatedProxy._id,
          connection_data: {
            host: rotatedProxy.host || rotatedProxy.ip,
            port: rotatedProxy.port,
            username: userProxy.custom_settings.username || rotatedProxy.username,
            password: userProxy.custom_settings.password || rotatedProxy.password,
            protocol: rotatedProxy.protocol
          }
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xoay proxy: ' + error.message
      });
    }
  } catch (error) {
    console.error('Rotate proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

/**
 * Kiểm tra trạng thái proxy
 */
export const checkProxyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID proxy không hợp lệ'
      });
    }
    
    // Tìm proxy
    const userProxy = await UserProxy.findOne({
      _id: id,
      user_id: userId
    }).populate('proxy_id');
    
    if (!userProxy || !userProxy.proxy_id) {
      return res.status(404).json({
        success: false,
        message: 'Proxy không tìm thấy'
      });
    }
    
    const proxy = userProxy.proxy_id;
    
    try {
      // Gọi service để kiểm tra trạng thái
      const proxyStatus = await ProxyService.checkProxyStatus(proxy);
      
      // Cập nhật trạng thái proxy
      proxy.last_checked = new Date();
      proxy.last_status = proxyStatus.online ? 'online' : 'offline';
      proxy.last_response_time = proxyStatus.responseTime || 0;
      await proxy.save();
      
      return res.status(200).json({
        success: true,
        data: {
          id: userProxy._id,
          proxy_id: proxy._id,
          status: {
            online: proxyStatus.online,
            response_time: proxyStatus.responseTime,
            checked_at: proxy.last_checked,
            ip: proxyStatus.ip
          }
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Không thể kiểm tra proxy: ' + error.message
      });
    }
  } catch (error) {
    console.error('Check proxy status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

/**
 * Cập nhật tùy chỉnh proxy
 */
export const updateProxySettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      username, 
      password, 
      rotation_interval,
      sticky_session, 
      notes 
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID proxy không hợp lệ'
      });
    }
    
    // Tìm proxy
    const userProxy = await UserProxy.findOne({
      _id: id,
      user_id: userId
    });
    
    if (!userProxy) {
      return res.status(404).json({
        success: false,
        message: 'Proxy không tìm thấy'
      });
    }
    
    // Cập nhật tùy chỉnh
    if (username !== undefined) {
      userProxy.custom_settings.username = username;
    }
    
    if (password !== undefined) {
      userProxy.custom_settings.password = password;
    }
    
    if (rotation_interval !== undefined) {
      userProxy.custom_settings.rotation_interval = rotation_interval;
    }
    
    if (sticky_session !== undefined) {
      userProxy.custom_settings.sticky_session = sticky_session;
    }
    
    if (notes !== undefined) {
      userProxy.notes = notes;
    }
    
    userProxy.updated_at = Date.now();
    await userProxy.save();
    
    return res.status(200).json({
      success: true,
      message: 'Cập nhật tùy chỉnh proxy thành công',
      data: {
        id: userProxy._id,
        custom_settings: userProxy.custom_settings,
        notes: userProxy.notes
      }
    });
  } catch (error) {
    console.error('Update proxy settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};