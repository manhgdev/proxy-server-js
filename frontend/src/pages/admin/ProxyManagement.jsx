import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Grid,
  Alert,
  AlertTitle,
  Snackbar,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  NetworkCheck as NetworkCheckIcon,
  Upload as UploadIcon,
  Check as CheckIcon,
  PlaylistAdd as PlaylistAddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { proxyAPI, proxyPoolAPI, adminAPI } from '../../services/api';

const ProxyManagement = () => {
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingProxy, setEditingProxy] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [proxyInput, setProxyInput] = useState('');
  const [fileUploaded, setFileUploaded] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef(null);

  // Fetch proxies
  useEffect(() => {
    fetchProxies();
  }, [page, rowsPerPage]);

  const fetchProxies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProxies({
        page: page + 1,
        limit: rowsPerPage
      });
      
      if (response.data && response.data.data) {
        setProxies(response.data.data.proxies);
        setTotalCount(response.data.data.pagination.total || response.data.data.proxies.length);
      }
    } catch (err) {
      console.error('Error fetching proxies:', err);
      setError('Không thể tải danh sách proxy. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileUploaded(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setProxyInput('');
    setFileUploaded(null);
    setTabValue(0);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (proxy) => {
    setEditingProxy({...proxy});
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingProxy(null);
  };

  const handleShowNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleEditProxyChange = (field, value) => {
    setEditingProxy({
      ...editingProxy,
      [field]: value
    });
  };

  const handleUpdateProxy = async () => {
    if (!editingProxy) return;
    
    setEditLoading(true);
    
    try {
      const response = await adminAPI.updateProxy(
        editingProxy._id || editingProxy.id, 
        {
          ip: editingProxy.ip,
          port: editingProxy.port,
          username: editingProxy.username,
          password: editingProxy.password,
          protocol: editingProxy.protocol,
          type: editingProxy.type,
          status: editingProxy.status,
          country: editingProxy.country,
          city: editingProxy.city,
          region: editingProxy.region,
          isp: editingProxy.isp,
          host: editingProxy.host
        }
      );
      
      if (response.data && (response.data.success || response.data.status === 'success')) {
        handleShowNotification('Cập nhật proxy thành công!');
        fetchProxies();
        handleCloseEditDialog();
      }
    } catch (err) {
      console.error('Error updating proxy:', err);
      handleShowNotification(
        err.response?.data?.message || 'Không thể cập nhật proxy. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddProxies = async () => {
    if (tabValue === 0 && !proxyInput.trim()) {
      handleShowNotification('Vui lòng nhập danh sách proxy', 'error');
      return;
    }

    if (tabValue === 1 && !fileUploaded) {
      handleShowNotification('Vui lòng chọn file', 'error');
      return;
    }

    setAddLoading(true);

    try {
      let response;

      if (tabValue === 0) {
        // Thêm proxy từ text input
        const proxyList = proxyInput.split('\n')
          .map(proxy => proxy.trim())
          .filter(proxy => proxy !== '');

        response = await proxyAPI.bulkImport({ proxies: proxyList });
      } else {
        // Thêm proxy từ file
        const formData = new FormData();
        formData.append('file', fileUploaded);

        response = await proxyAPI.bulkImport(formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data && response.data.success) {
        handleShowNotification('Thêm proxy thành công!');
        fetchProxies();
        handleCloseAddDialog();
      }
    } catch (err) {
      console.error('Error adding proxies:', err);
      handleShowNotification(
        err.response?.data?.message || 'Không thể thêm proxy. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteProxy = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa proxy này?')) return;

    try {
      await adminAPI.deleteProxy(id);
      handleShowNotification('Xóa proxy thành công!');
      fetchProxies();
    } catch (err) {
      console.error('Error deleting proxy:', err);
      handleShowNotification('Không thể xóa proxy. Vui lòng thử lại.', 'error');
    }
  };

  const handleRotateProxy = async (id) => {
    try {
      await adminAPI.rotateProxy(id);
      handleShowNotification('Rotate proxy thành công!');
      fetchProxies();
    } catch (err) {
      console.error('Error rotating proxy:', err);
      handleShowNotification('Không thể rotate proxy. Vui lòng thử lại.', 'error');
    }
  };

  const handleCheckProxy = async (id) => {
    try {
      await adminAPI.checkProxy(id);
      handleShowNotification('Kiểm tra proxy thành công!');
      fetchProxies();
    } catch (err) {
      console.error('Error checking proxy:', err);
      handleShowNotification('Không thể kiểm tra proxy. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý Proxy
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Thêm Proxy
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>IP</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Quốc gia</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : proxies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có proxy nào
                  </TableCell>
                </TableRow>
              ) : (
                proxies.map((proxy) => (
                  <TableRow key={proxy._id || proxy.id}>
                    <TableCell>{proxy.ip}</TableCell>
                    <TableCell>{proxy.port}</TableCell>
                    <TableCell>{proxy.username || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={proxy.type === 'SOCKS5' ? 'SOCKS5' : proxy.type === 'HTTPS' ? 'HTTPS' : 'HTTP'} 
                        size="small" 
                        color={
                          proxy.type === 'SOCKS5' ? 'secondary' : 
                          proxy.type === 'HTTPS' ? 'info' : 'primary'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={proxy.status === 'active' ? 'Hoạt động' : 'Không hoạt động'} 
                        size="small" 
                        color={proxy.status === 'active' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{proxy.country || 'Không xác định'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleOpenEditDialog(proxy)}
                        title="Chỉnh sửa"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleRotateProxy(proxy._id || proxy.id)}
                        title="Rotate"
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleCheckProxy(proxy._id || proxy.id)}
                        title="Kiểm tra"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProxy(proxy._id || proxy.id)}
                        title="Xóa"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>

      {/* Dialog thêm proxy */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Thêm proxy</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Thêm proxy bằng cách nhập danh sách hoặc tải lên file.
          </DialogContentText>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab icon={<PlaylistAddIcon />} label="Danh sách" />
            <Tab icon={<UploadIcon />} label="Tải file" />
          </Tabs>

          {tabValue === 0 && (
            <TextField
              label="Danh sách proxy"
              multiline
              rows={10}
              fullWidth
              placeholder="Nhập mỗi proxy trên một dòng. Định dạng: ip:port hoặc ip:port:username:password"
              value={proxyInput}
              onChange={(e) => setProxyInput(e.target.value)}
              variant="outlined"
              helperText="Mỗi proxy trên một dòng. Ví dụ: 192.168.1.1:8080 hoặc 192.168.1.1:8080:user:pass"
            />
          )}

          {tabValue === 1 && (
            <Box>
              <input
                type="file"
                accept=".txt,.csv"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, border: '2px dashed #ccc', borderRadius: 2 }}>
                <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  {fileUploaded ? `File đã chọn: ${fileUploaded.name}` : 'Chọn file để tải lên'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Hỗ trợ file .txt hoặc .csv với mỗi proxy trên một dòng
                </Typography>
                <Button
                  variant="outlined"
                  onClick={triggerFileInput}
                  startIcon={<UploadIcon />}
                >
                  Chọn File
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button 
            onClick={handleAddProxies} 
            variant="contained" 
            disabled={addLoading}
            startIcon={addLoading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {addLoading ? 'Đang xử lý...' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa proxy */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Chỉnh sửa proxy</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Chỉnh sửa thông tin chi tiết của proxy.
          </DialogContentText>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="IP"
                fullWidth
                value={editingProxy?.ip || ''}
                onChange={(e) => handleEditProxyChange('ip', e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Port"
                fullWidth
                value={editingProxy?.port || ''}
                onChange={(e) => handleEditProxyChange('port', e.target.value)}
                variant="outlined"
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                fullWidth
                value={editingProxy?.username || ''}
                onChange={(e) => handleEditProxyChange('username', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                fullWidth
                value={editingProxy?.password || ''}
                onChange={(e) => handleEditProxyChange('password', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Loại"
                fullWidth
                value={editingProxy?.type || 'HTTP'}
                onChange={(e) => handleEditProxyChange('type', e.target.value)}
                variant="outlined"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="datacenter">Datacenter</option>
                <option value="residential">Residential</option>
                <option value="mobile">Mobile</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Trạng thái"
                fullWidth
                value={editingProxy?.status || 'active'}
                onChange={(e) => handleEditProxyChange('status', e.target.value)}
                variant="outlined"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quốc gia"
                fullWidth
                value={editingProxy?.country || ''}
                onChange={(e) => handleEditProxyChange('country', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Thành phố"
                fullWidth
                value={editingProxy?.city || ''}
                onChange={(e) => handleEditProxyChange('city', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Khu vực"
                fullWidth
                value={editingProxy?.region || ''}
                onChange={(e) => handleEditProxyChange('region', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ISP"
                fullWidth
                value={editingProxy?.isp || ''}
                onChange={(e) => handleEditProxyChange('isp', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button 
            onClick={handleUpdateProxy} 
            variant="contained" 
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProxyManagement; 