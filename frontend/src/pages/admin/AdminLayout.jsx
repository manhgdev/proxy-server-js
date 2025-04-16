import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const drawerWidth = 240;
  
  // Kiểm tra nếu đang tải
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  // Kiểm tra quyền admin
  if (!user || (user.roles && !user.roles.includes('admin'))) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AdminNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, sm: `${drawerWidth}px` },
          mt: '64px', // AppBar height
          overflow: 'auto',
          height: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 