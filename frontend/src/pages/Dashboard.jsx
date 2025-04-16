import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WebIcon from '@mui/icons-material/Web';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useAuth } from '../context/AuthContext';
import { proxiesAPI, walletAPI, ordersAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [proxies, setProxies] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy thông tin ví
        const walletResponse = await walletAPI.getWallet();
        if (walletResponse.data.status === 'success') {
          setWallet(walletResponse.data.data);
        }

        // Lấy danh sách proxy đang hoạt động
        const proxiesResponse = await proxiesAPI.getProxies(1, 5);
        if (proxiesResponse.data.status === 'success') {
          setProxies(proxiesResponse.data.data.proxies || []);
        }

        // Lấy đơn hàng gần đây
        const ordersResponse = await ordersAPI.getOrders(1, 5);
        if (ordersResponse.data.status === 'success') {
          setRecentOrders(ordersResponse.data.data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper để định dạng số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper để định dạng thời gian
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Helper để xác định màu sắc tương ứng với trạng thái
  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      pending: 'warning',
      expired: 'error',
      inactive: 'default',
      completed: 'success',
      processing: 'warning',
      cancelled: 'error',
      failed: 'error'
    };
    return statusMap[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bảng điều khiển
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Thông tin ví */}
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              height: '100%',
              boxShadow: 3
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Số dư ví</Typography>
                <AccountBalanceWalletIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                {wallet ? formatCurrency(wallet.balance) : '0 ₫'}
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="small"
                onClick={() => navigate('/user/wallet')}
                sx={{ mt: 2 }}
              >
                Nạp tiền
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Số lượng Proxy */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Proxy đang dùng</Typography>
                <WebIcon fontSize="large" color="primary" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                {proxies.length}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                onClick={() => navigate('/user/proxies')}
                sx={{ mt: 2 }}
              >
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Đơn hàng */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Đơn hàng</Typography>
                <ReceiptIcon fontSize="large" color="primary" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
                {recentOrders.length}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                onClick={() => navigate('/user/orders')}
                sx={{ mt: 2 }}
              >
                Lịch sử mua hàng
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Mua Proxy mới */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Mua Proxy</Typography>
                <CreditCardIcon fontSize="large" />
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Chọn và mua Proxy theo nhu cầu của bạn
              </Typography>
              <Button 
                variant="contained" 
                color="info" 
                size="small"
                onClick={() => navigate('/user/orders/new')}
                sx={{ mt: 2, bgcolor: 'white', color: 'secondary.main' }}
              >
                Mua ngay
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Danh sách Proxy */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Proxy đang sử dụng
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell>IP</TableCell>
                  <TableCell align="center">Port</TableCell>
                  <TableCell align="center">Loại</TableCell>
                  <TableCell align="center">Quốc gia</TableCell>
                  <TableCell align="center">Hết hạn</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proxies.length > 0 ? (
                  proxies.map((proxy) => (
                    <TableRow key={proxy._id}>
                      <TableCell>{proxy.ip}</TableCell>
                      <TableCell align="center">{proxy.port}</TableCell>
                      <TableCell align="center">{proxy.type}</TableCell>
                      <TableCell align="center">{proxy.country}</TableCell>
                      <TableCell align="center">{formatDate(proxy.expiry_date)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={proxy.status} 
                          color={getStatusColor(proxy.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Bạn chưa có proxy nào. <Link to="/user/orders/new">Mua ngay</Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {proxies.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/user/proxies')}
              >
                Xem tất cả
              </Button>
            </Box>
          )}
        </Grid>

        {/* Đơn hàng gần đây */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Đơn hàng gần đây
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell align="right">Tổng tiền</TableCell>
                  <TableCell align="center">Phương thức</TableCell>
                  <TableCell align="center">Ngày tạo</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <Link to={`/user/orders/${order._id}`}>
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell align="center">{order.payment_method}</TableCell>
                      <TableCell align="center">{formatDate(order.created_at)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={order.status} 
                          color={getStatusColor(order.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Bạn chưa có đơn hàng nào. <Link to="/user/orders/new">Đặt hàng ngay</Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {recentOrders.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/user/orders')}
              >
                Xem tất cả
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 