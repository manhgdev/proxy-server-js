import React, { createContext, useState, useContext, useEffect } from 'react';
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
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // TODO: Implement user profile fetch
          // For now we'll use stored user info
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            setUser(storedUser);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to initialize auth:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { access_token, refresh_token, user: userData } = response.data.data;
      
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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