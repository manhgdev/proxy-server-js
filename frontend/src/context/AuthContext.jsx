import React, { createContext, useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

// Context
const AuthContext = createContext();

// Hook để sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // Không có token, logout
          logout();
          setLoading(false);
          return;
        }
        
        // Kiểm tra nếu có user trong localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        // Đã có token, thử lấy thông tin user từ API
        try {
          const response = await authAPI.me();
          
          if (response.data && response.data.status === 'success' && response.data.data) {
            // Lấy user từ API thành công
            setUser(response.data.data);
          } else if (storedUser) {
            // API không trả về user nhưng có user trong localStorage
            setUser(storedUser);
          } else {
            // Không có thông tin user, logout
            logout();
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          
          // Nếu lỗi 401 Unauthorized, logout
          if (err.response && err.response.status === 401) {
            logout();
          } 
          // Các lỗi khác (mạng, server), sử dụng thông tin từ localStorage
          else if (storedUser) {
            setUser(storedUser);
          } else {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      
      // Kiểm tra cấu trúc response từ server 
      if (response.data && response.data.status === 'success' && response.data.data) {
        const userData = response.data.data.user;
        const accessToken = response.data.data.access_token;
        const refreshToken = response.data.data.refresh_token;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Cập nhật thông tin user
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Kiểm tra user có quyền không
  const hasPermission = (resource, action) => {
    if (!user || !user.roles) return false;
    
    // Admin has all permissions
    if (user.roles.includes('admin')) return true;
    
    // TODO: Implement proper permission checking based on the backend RBAC
    // This is a simplified version
    const rolePermissions = {
      manager: ['users:read', 'proxies:*', 'orders:*'],
      reseller: ['proxies:read', 'orders:create'],
      customer: ['proxies:read', 'orders:create']
    };
    
    for (const role of user.roles) {
      const permissions = rolePermissions[role] || [];
      if (
        permissions.includes('*') || 
        permissions.includes(`${resource}:*`) ||
        permissions.includes(`${resource}:${action}`)
      ) {
        return true;
      }
    }
    
    return false;
  };

  // Giá trị context
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasPermission,
    isAuthenticated: !!user,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 