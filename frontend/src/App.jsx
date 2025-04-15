import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Trang đã tạo
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Tạo theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="proxies" element={<TempPage title="Danh sách Proxy" />} />
                <Route path="proxies/:id" element={<TempPage title="Chi tiết Proxy" />} />
                <Route path="profile" element={<TempPage title="Hồ sơ người dùng" />} />
                <Route path="orders" element={<TempPage title="Quản lý đơn hàng" />} />
                <Route path="wallet" element={<TempPage title="Ví tiền" />} />
                <Route path="admin/users" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <TempPage title="Quản lý người dùng" />
                  </ProtectedRoute>
                } />
                <Route path="admin/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TempPage title="Cài đặt hệ thống" />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 