import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'primary.light',
              color: 'white'
            }}
          >
            <Typography component="h1" variant="h5">
              Chào mừng, {user?.fullname || 'Người dùng'}!
            </Typography>
            <Typography variant="body1">
              Đây là trang quản lý Proxy Server của bạn.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Proxy đang hoạt động
            </Typography>
            <Typography component="p" variant="h4">
              {user?.activeProxies || 0}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Số dư tài khoản
            </Typography>
            <Typography component="p" variant="h4">
              {user?.balance ? `${user.balance.toFixed(2)} USD` : '0.00 USD'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Đơn hàng
            </Typography>
            <Typography component="p" variant="h4">
              {user?.totalOrders || 0}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Chưa có hoạt động nào gần đây.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 