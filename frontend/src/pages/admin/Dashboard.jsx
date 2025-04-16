import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
  AttachMoney as MoneyIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { adminAPI, dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboard();
        if (response.data && response.data.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // Dữ liệu mẫu trong trường hợp API chưa sẵn sàng
  const placeholderStats = {
    totalUsers: 125,
    newUsersToday: 8,
    totalProxies: 1438,
    availableProxies: 947,
    totalRevenue: 12500000,
    revenueToday: 1250000,
    totalOrders: 230,
    pendingOrders: 12,
    recentActivities: [
      { id: 1, activity: 'Người dùng manhg đã tạo order mới', time: '15 phút trước' },
      { id: 2, activity: 'Hệ thống đã rotate 100 proxy', time: '1 giờ trước' },
      { id: 3, activity: '5 proxy đã được thêm vào hệ thống', time: '2 giờ trước' },
      { id: 4, activity: 'Người dùng admin đã thay đổi cài đặt hệ thống', time: '5 giờ trước' },
    ]
  };

  const dashboardData = stats || placeholderStats;

  // Định dạng tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bảng điều khiển quản trị
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Xin chào, {user?.fullname || 'Admin'}! Đây là tổng quan về hệ thống.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Thống kê người dùng */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="h2" color="text.secondary">
                Người dùng
              </Typography>
              <PersonIcon color="primary" />
            </Box>
            <Typography variant="h4" component="p" sx={{ mt: 2, fontWeight: 'bold' }}>
              {dashboardData.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboardData.newUsersToday} người dùng mới hôm nay
            </Typography>
          </Paper>
        </Grid>
        
        {/* Thống kê proxy */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="h2" color="text.secondary">
                Proxy
              </Typography>
              <StorageIcon color="secondary" />
            </Box>
            <Typography variant="h4" component="p" sx={{ mt: 2, fontWeight: 'bold' }}>
              {dashboardData.totalProxies}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboardData.availableProxies} proxy khả dụng
            </Typography>
          </Paper>
        </Grid>
        
        {/* Thống kê doanh thu */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="h2" color="text.secondary">
                Doanh thu
              </Typography>
              <MoneyIcon sx={{ color: '#4caf50' }} />
            </Box>
            <Typography variant="h4" component="p" sx={{ mt: 2, fontWeight: 'bold' }}>
              {formatCurrency(dashboardData.totalRevenue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(dashboardData.revenueToday)} hôm nay
            </Typography>
          </Paper>
        </Grid>
        
        {/* Thống kê đơn hàng */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="h2" color="text.secondary">
                Đơn hàng
              </Typography>
              <ArticleIcon sx={{ color: '#ff9800' }} />
            </Box>
            <Typography variant="h4" component="p" sx={{ mt: 2, fontWeight: 'bold' }}>
              {dashboardData.totalOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboardData.pendingOrders} đơn hàng đang chờ xử lý
            </Typography>
          </Paper>
        </Grid>
        
        {/* Hoạt động gần đây */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {dashboardData.recentActivities && dashboardData.recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemText
                    primary={activity.activity}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 