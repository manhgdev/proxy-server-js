import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proxyAPI } from '../services/api';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { viVN } from 'date-fns/locale';

const ProxyEdit = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const defaultProxyData = {
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'http',
    country: 'VN',
    active: true,
    expires_at: null
  };
  
  const [proxyData, setProxyData] = useState(defaultProxyData);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Kiểm tra quyền admin
  useEffect(() => {
    if (!user || (!user.is_admin && user.user_level !== 0)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Nếu đang ở chế độ sửa, lấy thông tin proxy
  useEffect(() => {
    if (isEditMode) {
      fetchProxyData();
    }
  }, [id]);
  
  const fetchProxyData = async () => {
    setFetchLoading(true);
    try {
      const response = await proxyAPI.getProxyById(id);
      const proxyData = response.data.data;
      
      setProxyData({
        ...proxyData,
        expires_at: proxyData.expires_at ? new Date(proxyData.expires_at) : null
      });
    } catch (error) {
      console.error('Error fetching proxy:', error);
      setNotification({
        open: true,
        message: 'Không thể lấy thông tin proxy. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setProxyData({
      ...proxyData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const handleDateChange = (newDate) => {
    setProxyData({
      ...proxyData,
      expires_at: newDate
    });
    
    if (errors.expires_at) {
      setErrors({
        ...errors,
        expires_at: undefined
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!proxyData.host) {
      newErrors.host = 'Host không được để trống';
    }
    
    if (!proxyData.port) {
      newErrors.port = 'Port không được để trống';
    } else if (isNaN(proxyData.port) || parseInt(proxyData.port) <= 0 || parseInt(proxyData.port) > 65535) {
      newErrors.port = 'Port phải là số từ 1 đến 65535';
    }
    
    if (!proxyData.username) {
      newErrors.username = 'Username không được để trống';
    }
    
    if (!proxyData.password) {
      newErrors.password = 'Password không được để trống';
    }
    
    if (!proxyData.country) {
      newErrors.country = 'Quốc gia không được để trống';
    }
    
    if (!proxyData.type) {
      newErrors.type = 'Loại proxy không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Chuẩn bị dữ liệu để gửi đi
      const formattedData = {
        ...proxyData,
        port: parseInt(proxyData.port)
      };
      
      let response;
      if (isEditMode) {
        response = await proxyAPI.updateProxy(id, formattedData);
      } else {
        response = await proxyAPI.createProxy(formattedData);
      }
      
      setNotification({
        open: true,
        message: isEditMode ? 'Cập nhật proxy thành công!' : 'Tạo proxy mới thành công!',
        severity: 'success'
      });
      
      // Chuyển hướng về trang danh sách sau khi lưu thành công
      setTimeout(() => {
        navigate('/proxies');
      }, 1500);
    } catch (error) {
      console.error('Error saving proxy:', error);
      
      // Xử lý lỗi từ API
      if (error.response && error.response.data && error.response.data.message) {
        setNotification({
          open: true,
          message: error.response.data.message,
          severity: 'error'
        });
      } else {
        setNotification({
          open: true,
          message: isEditMode 
            ? 'Lỗi khi cập nhật proxy. Vui lòng thử lại sau.' 
            : 'Lỗi khi tạo proxy mới. Vui lòng thử lại sau.',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/proxies');
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Danh sách quốc gia
  const countries = [
    { code: 'VN', name: 'Việt Nam' },
    { code: 'US', name: 'Hoa Kỳ' },
    { code: 'JP', name: 'Nhật Bản' },
    { code: 'KR', name: 'Hàn Quốc' },
    { code: 'SG', name: 'Singapore' },
    { code: 'TH', name: 'Thái Lan' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'UK', name: 'Anh' },
    { code: 'AU', name: 'Úc' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Đức' },
    { code: 'FR', name: 'Pháp' },
    { code: 'IT', name: 'Ý' },
    { code: 'RU', name: 'Nga' },
    { code: 'CN', name: 'Trung Quốc' },
    { code: 'IN', name: 'Ấn Độ' },
    { code: 'BR', name: 'Brazil' },
    { code: 'OT', name: 'Khác' }
  ];
  
  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Chỉnh sửa Proxy' : 'Thêm Proxy mới'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                label="Host"
                name="host"
                value={proxyData.host}
                onChange={handleChange}
                error={!!errors.host}
                helperText={errors.host}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Port"
                name="port"
                type="number"
                value={proxyData.port}
                onChange={handleChange}
                error={!!errors.port}
                helperText={errors.port}
                disabled={loading}
                inputProps={{ min: 1, max: 65535 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Username"
                name="username"
                value={proxyData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={proxyData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel>Loại Proxy</InputLabel>
                <Select
                  name="type"
                  value={proxyData.type}
                  label="Loại Proxy"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value="http">HTTP</MenuItem>
                  <MenuItem value="https">HTTPS</MenuItem>
                  <MenuItem value="socks4">SOCKS4</MenuItem>
                  <MenuItem value="socks5">SOCKS5</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.country}>
                <InputLabel>Quốc gia</InputLabel>
                <Select
                  name="country"
                  value={proxyData.country}
                  label="Quốc gia"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="active"
                  value={proxyData.active}
                  label="Trạng thái"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value={true}>Hoạt động</MenuItem>
                  <MenuItem value={false}>Không hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viVN}>
                <DatePicker
                  label="Ngày hết hạn"
                  value={proxyData.expires_at}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.expires_at}
                      helperText={errors.expires_at}
                      disabled={loading}
                    />
                  )}
                  disabled={loading}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProxyEdit; 