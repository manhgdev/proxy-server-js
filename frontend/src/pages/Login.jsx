import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Box,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Snackbar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Kiểm tra thông báo từ trang khác chuyển đến
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get('message');
    
    if (message) {
      setNotification({
        open: true,
        message,
        type: searchParams.get('type') || 'success'
      });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'remember' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        username: formData.username,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 8
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Đăng nhập
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <FormControlLabel
            control={
              <Checkbox 
                name="remember" 
                color="primary" 
                checked={formData.remember}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Ghi nhớ đăng nhập"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              Quên mật khẩu?
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Đăng ký
            </Link>
          </Box>
          <Box mt={4}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Proxy Server
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 