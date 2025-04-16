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
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Check as CheckIcon,
  PlaylistAdd as PlaylistAddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { proxyPoolAPI } from '../../services/api';

const ProxyPoolsManagement = () => {
  const [proxyPools, setProxyPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingPool, setEditingPool] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [proxyInput, setProxyInput] = useState({});
  const [fileUploaded, setFileUploaded] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef(null);

  // Fetch proxy pools
  useEffect(() => {
    fetchProxyPools();
  }, [page, rowsPerPage]);

  const fetchProxyPools = async () => {
    try {
      setLoading(true);
      const response = await proxyPoolAPI.getPools({
        page: page + 1,
        limit: rowsPerPage
      });
      
      if (response.data && response.data.data) {
        setProxyPools(response.data.data.proxyPools || response.data.data.pools || response.data.data);
        setTotalCount(response.data.data.totalCount || response.data.data.total || response.data.data.length);
      }
    } catch (err) {
      console.error('Error fetching proxy pools:', err);
      setError('Không thể tải danh sách proxy xoay. Vui lòng thử lại sau.');
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
    setProxyInput({});
    setFileUploaded(null);
    setTabValue(0);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
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

  const handleAddProxyPools = async () => {
    if (tabValue === 0 && !proxyInput.name) {
      handleShowNotification('Vui lòng nhập tên Proxy Pool', 'error');
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
        // Thêm proxy từ thông tin
        response = await proxyPoolAPI.createPool(proxyInput);
      } else {
        // Thêm proxy từ file
        const formData = new FormData();
        formData.append('file', fileUploaded);

        response = await proxyPoolAPI.createPool(formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data && (response.data.success || response.data.status === 'success')) {
        handleShowNotification('Thêm proxy xoay thành công!');
        fetchProxyPools();
        handleCloseAddDialog();
      }
    } catch (err) {
      console.error('Error adding proxy pools:', err);
      handleShowNotification(
        err.response?.data?.message || 'Không thể thêm proxy xoay. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteProxyPool = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa proxy xoay này?')) return;

    try {
      await proxyPoolAPI.deletePool(id);
      handleShowNotification('Xóa proxy xoay thành công!');
      fetchProxyPools();
    } catch (err) {
      console.error('Error deleting proxy pool:', err);
      handleShowNotification('Không thể xóa proxy xoay. Vui lòng thử lại.', 'error');
    }
  };

  const handleRotateProxyPool = async (id) => {
    try {
      await proxyPoolAPI.togglePoolStatus(id, true);
      handleShowNotification('Rotate proxy xoay thành công!');
      fetchProxyPools();
    } catch (err) {
      console.error('Error rotating proxy pool:', err);
      handleShowNotification('Không thể rotate proxy xoay. Vui lòng thử lại.', 'error');
    }
  };

  const handleCheckProxyPool = async (id) => {
    try {
      await proxyPoolAPI.getPoolStats(id);
      handleShowNotification('Kiểm tra proxy xoay thành công!');
      fetchProxyPools();
    } catch (err) {
      console.error('Error checking proxy pool:', err);
      handleShowNotification('Không thể kiểm tra proxy xoay. Vui lòng thử lại.', 'error');
    }
  };

  const handleOpenEditDialog = (pool) => {
    // Khởi tạo state với dữ liệu của pool
    setEditingPool({
      ...pool,
      port_start: pool.port_range?.start || '',
      port_end: pool.port_range?.end || ''
    });
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingPool(null);
  };
  
  const handleEditChange = (field, value) => {
    setEditingPool({
      ...editingPool,
      [field]: value,
      ...(field === 'port_start' ? {
        port_range: {
          ...editingPool.port_range,
          start: parseInt(value)
        }
      } : {}),
      ...(field === 'port_end' ? {
        port_range: {
          ...editingPool.port_range,
          end: parseInt(value)
        }
      } : {})
    });
  };
  
  const handleUpdatePool = async () => {
    if (!editingPool) return;
    
    setEditLoading(true);
    
    try {
      // Tạo dữ liệu cập nhật
      const updateData = {
        name: editingPool.name,
        description: editingPool.description,
        entry_point: editingPool.entry_point,
        username: editingPool.username,
        password: editingPool.password,
        port_range: {
          start: parseInt(editingPool.port_start) || editingPool.port_range?.start,
          end: parseInt(editingPool.port_end) || editingPool.port_range?.end
        },
        active: editingPool.active
      };
      
      const response = await proxyPoolAPI.updatePool(editingPool._id || editingPool.id, updateData);
      
      if (response.data && (response.data.success || response.data.status === 'success')) {
        handleShowNotification('Cập nhật proxy xoay thành công!');
        fetchProxyPools();
        handleCloseEditDialog();
      }
    } catch (err) {
      console.error('Error updating proxy pool:', err);
      handleShowNotification(
        err.response?.data?.message || 'Không thể cập nhật proxy xoay. Vui lòng thử lại.',
        'error'
      );
    } finally {
      setEditLoading(false);
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
          Quản lý Proxy Xoay
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Thêm Proxy Xoay
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Entry Point</TableCell>
                <TableCell>Port Range</TableCell>
                <TableCell>Số lượng proxy</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={40} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : proxyPools.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell colSpan={7} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                proxyPools.map((pool, index) => (
                  <TableRow key={pool._id || pool.id || `pool-${index}`}>
                    <TableCell>{pool._id || pool.id}</TableCell>
                    <TableCell>{pool.name}</TableCell>
                    <TableCell>{pool.entry_point}</TableCell>
                    <TableCell>
                      {pool.port_range ? `${pool.port_range.start} - ${pool.port_range.end}` : '-'}
                    </TableCell>
                    <TableCell>
                      {pool.active_proxy_count}/{pool.proxy_count}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={pool.active ? 'Hoạt động' : 'Không hoạt động'} 
                        color={pool.active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="warning" 
                        size="small" 
                        onClick={() => handleOpenEditDialog(pool)}
                        title="Chỉnh sửa"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleRotateProxyPool(pool._id || pool.id)}
                        title="Rotate proxy"
                        sx={{ mr: 1 }}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="info" 
                        size="small" 
                        onClick={() => handleCheckProxyPool(pool._id || pool.id)}
                        title="Kiểm tra proxy"
                        sx={{ mr: 1 }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteProxyPool(pool._id || pool.id)}
                        title="Xóa proxy"
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
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          labelRowsPerPage="Dòng trên trang:"
        />
      </Paper>

      {/* Dialog thêm proxy */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Thêm Proxy Xoay</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Nhập thông tin" />
            <Tab label="Thêm từ file" />
          </Tabs>
          
          {tabValue === 0 && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Nhập thông tin của Proxy Pool xoay
              </DialogContentText>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên"
                    variant="outlined"
                    value={proxyInput.name || ''}
                    onChange={(e) => setProxyInput({...proxyInput, name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Entry Point (hostname/IP)"
                    variant="outlined"
                    value={proxyInput.entry_point || ''}
                    onChange={(e) => setProxyInput({...proxyInput, entry_point: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Port bắt đầu"
                    type="number"
                    variant="outlined"
                    value={proxyInput.port_start || ''}
                    onChange={(e) => setProxyInput({
                      ...proxyInput, 
                      port_start: e.target.value,
                      port_range: {
                        ...proxyInput.port_range,
                        start: parseInt(e.target.value)
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Port kết thúc"
                    type="number"
                    variant="outlined"
                    value={proxyInput.port_end || ''}
                    onChange={(e) => setProxyInput({
                      ...proxyInput, 
                      port_end: e.target.value,
                      port_range: {
                        ...proxyInput.port_range,
                        end: parseInt(e.target.value)
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={proxyInput.username || ''}
                    onChange={(e) => setProxyInput({...proxyInput, username: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    value={proxyInput.password || ''}
                    onChange={(e) => setProxyInput({...proxyInput, password: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={2}
                    variant="outlined"
                    value={proxyInput.description || ''}
                    onChange={(e) => setProxyInput({...proxyInput, description: e.target.value})}
                  />
                </Grid>
              </Grid>
            </>
          )}
          
          {tabValue === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <input
                type="file"
                accept=".txt,.csv,.json"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={triggerFileInput}
                sx={{ mb: 2 }}
              >
                Chọn file
              </Button>
              {fileUploaded && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Đã chọn: {fileUploaded.name}
                </Typography>
              )}
              <DialogContentText sx={{ mt: 2 }}>
                Hỗ trợ file .json chứa thông tin proxy pool
              </DialogContentText>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button 
            onClick={handleAddProxyPools} 
            variant="contained" 
            disabled={addLoading}
            startIcon={addLoading ? <CircularProgress size={20} /> : null}
          >
            {addLoading ? 'Đang xử lý...' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog chỉnh sửa proxy xoay */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa Proxy Xoay</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Chỉnh sửa thông tin của Proxy Pool xoay
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên"
                variant="outlined"
                value={editingPool?.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Entry Point (hostname/IP)"
                variant="outlined"
                value={editingPool?.entry_point || ''}
                onChange={(e) => handleEditChange('entry_point', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Port bắt đầu"
                type="number"
                variant="outlined"
                value={editingPool?.port_start || (editingPool?.port_range?.start || '')}
                onChange={(e) => handleEditChange('port_start', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Port kết thúc"
                type="number"
                variant="outlined"
                value={editingPool?.port_end || (editingPool?.port_range?.end || '')}
                onChange={(e) => handleEditChange('port_end', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={editingPool?.username || ''}
                onChange={(e) => handleEditChange('username', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                value={editingPool?.password || ''}
                onChange={(e) => handleEditChange('password', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={2}
                variant="outlined"
                value={editingPool?.description || ''}
                onChange={(e) => handleEditChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button 
            onClick={handleUpdatePool} 
            variant="contained" 
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : null}
          >
            {editLoading ? 'Đang cập nhật...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProxyPoolsManagement; 