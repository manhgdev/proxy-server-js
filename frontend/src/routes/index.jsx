import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import MyProxies from '../pages/MyProxies';
import ProxyShop from '../pages/ProxyShop';
import Wallet from '../pages/Wallet';

// Admin pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import ProxyManagement from '../pages/admin/ProxyManagement';
import ProxyPoolsManagement from '../pages/admin/ProxyPoolsManagement';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu có yêu cầu quyền nhưng user không có quyền đó
  if (allowedRoles.length > 0) {
    // Kiểm tra cả role và user_level để đảm bảo tương thích
    const hasPermission = allowedRoles.some(role => 
      user.role === role || 
      (role === 'admin' && user.user_level === 0) || 
      (role === 'manager' && user.user_level === 1)
    );
    
    if (!hasPermission) {
      return <Navigate to="/user/dashboard" replace />;
    }
  }
  
  return children;
};

// Public Route component - ngăn người dùng đã đăng nhập vào các trang công khai
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  // Chỉ chuyển hướng khi user hợp lệ, tránh vòng lặp
  if (user && Object.keys(user).length > 0) {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};

// Trang tạm thời cho các route chưa hoàn thiện
const TempPage = ({ title }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{title}</h2>
      <p>Trang này đang được phát triển</p>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes - chỉ hiển thị khi chưa đăng nhập */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Home page - accessible to all */}
      <Route path="/" element={<HomePage />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="proxies" element={<ProxyManagement />} />
        <Route path="proxy-pools" element={<ProxyPoolsManagement />} />
        <Route path="users" element={<TempPage title="Quản lý người dùng" />} />
        <Route path="orders" element={<TempPage title="Quản lý đơn hàng" />} />
        <Route path="packages" element={<TempPage title="Quản lý gói dịch vụ" />} />
        <Route path="settings" element={<TempPage title="Cài đặt hệ thống" />} />
      </Route>
      
      {/* Protected routes */}
      <Route path="/user" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="proxies" element={<MyProxies />} />
        <Route path="orders" element={<TempPage title="Quản lý đơn hàng" />} />
        <Route path="orders/new" element={<ProxyShop />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="profile" element={<TempPage title="Hồ sơ người dùng" />} />
      </Route>
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 