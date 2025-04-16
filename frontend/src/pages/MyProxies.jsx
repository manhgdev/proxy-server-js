import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  MenuItem,
  Menu,
  ListItemIcon,
} from '@mui/material';
import {
  FileCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  SwapHoriz as SwapIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  ContentCopy as ContentCopyIcon,
  RotateRight as RotateRightIcon,
  BugReport as BugReportIcon,
  RestartAlt as RestartAltIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { proxiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Các loại proxy
const PROXY_TYPES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'static', label: 'Proxy Tĩnh' },
  { id: 'rotating', label: 'Proxy Xoay' },
];

// Component chính
const MyProxies = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProxy, setSelectedProxy] = useState(null);
  const [proxyDetails, setProxyDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [checkingProxy, setCheckingProxy] = useState(null);
  const [replacingProxy, setReplacingProxy] = useState(null);
  const [replaceReason, setReplaceReason] = useState('');
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshingProxy, setRefreshingProxy] = useState(null);
  const [statusCheckLoading, setStatusCheckLoading] = useState({});
  const [proxyActions, setProxyActions] = useState(null);

  // Fetch proxies
  useEffect(() => {
    const fetchProxies = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await proxiesAPI.getProxies(page, rowsPerPage);
        
        if (response.data.status === 'success') {
          setProxies(response.data.data.proxies || []);
          setTotalPages(Math.ceil(response.data.data.total / rowsPerPage) || 1);
        } else {
          setProxies([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Error fetching proxies:', err);
        setError('Không thể tải danh sách proxy. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProxies();
  }, [isAuthenticated, page, rowsPerPage]);

  // Xử lý chuyển tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  // Xử lý phân trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Xử lý chọn proxy để xem chi tiết
  const handleViewDetails = async (proxy) => {
    setSelectedProxy(proxy);
    setProxyDetails(null);
    setDetailsOpen(true);
    
    try {
      const response = await proxiesAPI.getProxyDetails(proxy._id);
      if (response.data && response.data.data) {
        setProxyDetails(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching proxy details:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin chi tiết của proxy',
        severity: 'error'
      });
    }
  };

  // Xử lý kiểm tra trạng thái proxy
  const handleCheckProxy = async (proxyId) => {
    setCheckingProxy(proxyId);
    
    try {
      const response = await proxiesAPI.checkProxyStatus(proxyId);
      
      if (response.data && response.data.status === 'success') {
        // Cập nhật trạng thái proxy trong danh sách
        setProxies(proxies.map(proxy => 
          proxy._id === proxyId
            ? { ...proxy, status: response.data.data.is_active ? 'active' : 'inactive', last_check: response.data.data.last_check }
            : proxy
        ));
        
        setSnackbar({
          open: true,
          message: `Kiểm tra proxy ${response.data.data.is_active ? 'thành công' : 'thất bại'}`,
          severity: response.data.data.is_active ? 'success' : 'warning'
        });
      }
    } catch (err) {
      console.error('Error checking proxy:', err);
      setSnackbar({
        open: true,
        message: 'Không thể kiểm tra trạng thái proxy',
        severity: 'error'
      });
    } finally {
      setCheckingProxy(null);
    }
  };


  // Xử lý gửi yêu cầu thay thế proxy
  const handleReplaceProxy = async () => {
    if (!replacingProxy || !replaceReason) return;
    
    try {
      const response = await proxiesAPI.replaceProxy(replacingProxy._id, {
        reason: replaceReason,
        details: `Yêu cầu thay thế proxy vào ${new Date().toLocaleString()}`
      });
      
      if (response.data && response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Yêu cầu thay thế proxy đã được gửi',
          severity: 'success'
        });
        setReplaceDialogOpen(false);
      }
    } catch (err) {
      console.error('Error requesting proxy replacement:', err);
      setSnackbar({
        open: true,
        message: 'Không thể gửi yêu cầu thay thế proxy',
        severity: 'error'
      });
    }
  };

  // Xử lý xoay proxy
  const handleRotateProxy = async (planId) => {
    setRefreshingProxy(planId);
    try {
      const response = await proxiesAPI.rotateProxy(planId);
      
      if (response.data && response.data.status === 'success') {
        // Cập nhật IP mới trong danh sách
        const updatedProxies = proxies.map(proxy => 
          proxy.plan_id === planId && proxy.ip === response.data.data.previous_ip
            ? { ...proxy, ip: response.data.data.new_ip }
            : proxy
        );
        
        setProxies(updatedProxies);
        
        setSnackbar({
          open: true,
          message: `Xoay proxy thành công. IP mới: ${response.data.data.new_ip}`,
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error rotating proxy:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xoay proxy',
        severity: 'error'
      });
    } finally {
      setRefreshingProxy(null);
    }
  };

  // Xử lý sao chép proxy string
  const handleCopyProxyString = (proxy) => {
    const proxyString = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    navigator.clipboard.writeText(proxyString).then(() => {
      setSnackbar({
        open: true,
        message: 'Đã sao chép proxy string vào clipboard',
        severity: 'success'
      });
    });
  };

  // Xử lý đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format proxy string
  const formatProxyString = (proxy) => {
    return `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
  };

  // Trạng thái proxy
  const renderProxyStatus = (status) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Đang hoạt động"
            color="success"
            variant="outlined"
            size="small"
          />
        );
      case 'inactive':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Không hoạt động"
            color="error"
            variant="outlined"
            size="small"
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<RefreshIcon />}
            label="Chờ xử lý"
            color="warning"
            variant="outlined"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<InfoIcon />}
            label="Không xác định"
            color="default"
            variant="outlined"
            size="small"
          />
        );
    }
  };

  const handleProxyActions = (event, proxy) => {
    setAnchorEl(event.currentTarget);
    setProxyActions(proxy);
  };

  const handleCloseActions = () => {
    setAnchorEl(null);
    setProxyActions(null);
  };

  const handleCheckStatus = async (proxyId) => {
    setStatusCheckLoading((prev) => ({ ...prev, [proxyId]: true }));
    try {
      const response = await proxiesAPI.checkProxyStatus(proxyId);
      if (response.data.status === 'success') {
        const updatedProxy = proxies.map(proxy => 
          proxy._id === proxyId ? { ...proxy, status_info: response.data.data } : proxy
        );
        setProxies(updatedProxy);
      }
    } catch (err) {
      console.error('Error checking proxy status:', err);
    } finally {
      setStatusCheckLoading((prev) => ({ ...prev, [proxyId]: false }));
    }
    handleCloseActions();
  };

  const handleOpenDetailsDialog = (proxy) => {
    setSelectedProxy(proxy);
    setDetailsOpen(true);
    handleCloseActions();
  };

  const handleCloseDetailsDialog = () => {
    setDetailsOpen(false);
    setSelectedProxy(null);
  };

  const handleOpenReplaceDialog = (proxy) => {
    setSelectedProxy(proxy);
    setReplaceDialogOpen(true);
    handleCloseActions();
  };

  const handleCloseReplaceDialog = () => {
    setReplaceDialogOpen(false);
    setSelectedProxy(null);
    setReplaceReason('');
    setReplaceDetails('');
  };

  const handleReplaceSubmit = async () => {
    if (!selectedProxy || !replaceReason) return;

    setLoading(true);
    try {
      const response = await proxiesAPI.replaceProxy(selectedProxy._id, {
        reason: replaceReason,
        details: replaceDetails
      });
      
      if (response.data.status === 'success') {
        // Success message
        alert('Yêu cầu thay thế đã được gửi. Chúng tôi sẽ xử lý sớm nhất có thể.');
        handleCloseReplaceDialog();
        fetchProxies();
      }
    } catch (err) {
      console.error('Error replacing proxy:', err);
      setError('Không thể gửi yêu cầu thay thế. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Đã sao chép vào clipboard');
    });
    handleCloseActions();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getProxyString = (proxy) => {
    if (proxy.protocol === 'http' || proxy.protocol === 'https') {
      return `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    } else {
      return `${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      pending: 'warning',
      expired: 'error',
      inactive: 'default',
      'slow_speed': 'warning'
    };
    return statusMap[status] || 'default';
  };

  const getProxyTypeLabel = (type) => {
    const typeMap = {
      datacenter: 'Datacenter',
      residential: 'Residential',
      mobile: 'Mobile',
      rotating: 'Rotating'
    };
    return typeMap[type] || type;
  };

  const proxyReasons = [
    { value: 'slow_speed', label: 'Tốc độ chậm' },
    { value: 'frequent_block', label: 'Bị chặn thường xuyên' },
    { value: 'not_working', label: 'Không hoạt động' },
    { value: 'not_expected_location', label: 'Không đúng vị trí' },
    { value: 'other', label: 'Khác' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Proxy của tôi
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Quản lý tất cả proxy đã mua
        </Typography>
      </Box>

      {/* Tabs chọn loại proxy */}
      <Box sx={{ mb: 4 }}>
        <Paper>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            aria-label="proxy types tabs"
          >
            {PROXY_TYPES.map((type, index) => (
              <Tab key={type.id} label={type.label} />
            ))}
          </Tabs>
        </Paper>
      </Box>

      {/* Danh sách proxy */}
      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : proxies.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          Bạn chưa có proxy nào. Hãy <Button color="primary" href="/shop">mua proxy</Button> để bắt đầu.
        </Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="proxy table">
              <TableHead>
                <TableRow>
                  <TableCell>IP</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Giao thức</TableCell>
                  <TableCell>Quốc gia</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hết hạn</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proxies.map((proxy) => (
                  <TableRow key={proxy._id} hover>
                    <TableCell>{proxy.ip}</TableCell>
                    <TableCell>{proxy.port}</TableCell>
                    <TableCell>
                      {proxy.type === 'static' ? 'Tĩnh' : 'Xoay'}
                    </TableCell>
                    <TableCell>{proxy.protocol.toUpperCase()}</TableCell>
                    <TableCell>{proxy.country}</TableCell>
                    <TableCell>{renderProxyStatus(proxy.status)}</TableCell>
                    <TableCell>
                      {new Date(proxy.expiry_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sao chép">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyProxyString(proxy)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kiểm tra">
                        <IconButton
                          size="small"
                          onClick={() => handleCheckProxy(proxy._id)}
                          disabled={checkingProxy === proxy._id}
                        >
                          {checkingProxy === proxy._id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SpeedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      {proxy.type === 'rotating' && (
                        <Tooltip title="Xoay">
                          <IconButton
                            size="small"
                            onClick={() => handleRotateProxy(proxy.plan_id)}
                          >
                            <RotateRightIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Thay thế">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenReplaceDialog(proxy)}
                        >
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(proxy)}
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalPages * rowsPerPage}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số proxy mỗi trang:"
          />
        </Paper>
      )}

      {/* Dialog chi tiết proxy */}
      <Dialog open={detailsOpen} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết Proxy</DialogTitle>
        <DialogContent>
          {!selectedProxy ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">ID Proxy:</Typography>
                      <Typography variant="body1">{selectedProxy._id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Loại:</Typography>
                      <Typography variant="body1">
                        {selectedProxy.type === 'static' ? 'Proxy Tĩnh' : 'Proxy Xoay'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Proxy String:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          value={formatProxyString(selectedProxy)}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                        <IconButton 
                          onClick={() => handleCopyProxyString(selectedProxy)}
                          sx={{ ml: 1 }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Trạng thái:</Typography>
                      <Box>{renderProxyStatus(selectedProxy.status)}</Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin kết nối
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">IP:</Typography>
                      <Typography variant="body1">{selectedProxy.ip}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Port:</Typography>
                      <Typography variant="body1">{selectedProxy.port}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Username:</Typography>
                      <Typography variant="body1">{selectedProxy.username}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Password:</Typography>
                      <Typography variant="body1">{selectedProxy.password}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Giao thức:</Typography>
                      <Typography variant="body1">{selectedProxy.protocol.toUpperCase()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Quốc gia:</Typography>
                      <Typography variant="body1">{selectedProxy.country}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin bổ sung
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Ngày hết hạn:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedProxy.expiry_date).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Lần kiểm tra cuối:</Typography>
                      <Typography variant="body1">
                        {selectedProxy.last_check ? new Date(selectedProxy.last_check).toLocaleString() : 'Chưa kiểm tra'}
                      </Typography>
                    </Grid>
                    {proxyDetails && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Tốc độ phản hồi:</Typography>
                          <Typography variant="body1">
                            {proxyDetails.response_time ? `${proxyDetails.response_time} ms` : 'Không có dữ liệu'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Tỷ lệ thành công:</Typography>
                          <Typography variant="body1">
                            {proxyDetails.success_rate ? `${proxyDetails.success_rate}%` : 'Không có dữ liệu'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Đóng</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => selectedProxy && copyToClipboard(getProxyString(selectedProxy))}
          >
            Sao chép proxy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thay thế proxy */}
      <Dialog open={replaceDialogOpen} onClose={handleCloseReplaceDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Yêu cầu thay thế Proxy</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vui lòng cho biết lý do bạn muốn thay thế proxy này.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Lý do"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={replaceReason}
            onChange={(e) => setReplaceReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplaceDialog}>Hủy</Button>
          <Button 
            onClick={handleReplaceSubmit} 
            variant="contained" 
            color="primary"
            disabled={!replaceReason.trim()}
          >
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseActions}
      >
        <MenuItem onClick={() => copyToClipboard(proxyActions && getProxyString(proxyActions))}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sao chép proxy</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => proxyActions && handleCheckStatus(proxyActions._id)}>
          <ListItemIcon>
            <BugReportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Kiểm tra trạng thái</ListItemText>
        </MenuItem>
        {proxyActions && proxyActions.type === 'rotating' && (
          <MenuItem onClick={() => proxyActions && handleRotateProxy(proxyActions.plan_id)}
            disabled={refreshingProxy === proxyActions?.plan_id}
          >
            <ListItemIcon>
              <RotateRightIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xoay proxy</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => proxyActions && handleOpenReplaceDialog(proxyActions)}>
          <ListItemIcon>
            <RestartAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Yêu cầu thay thế</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => proxyActions && handleOpenDetailsDialog(proxyActions)}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chi tiết</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default MyProxies; 