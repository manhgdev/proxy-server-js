import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { proxyAPI } from '../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  Refresh as RefreshIcon, Search as SearchIcon, 
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  ImportExport as ImportExportIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const STATUS_COLORS = {
  active: 'success',
  inactive: 'error',
  checking: 'warning',
  expired: 'default'
};

const ProxyList = () => {
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProxyId, setSelectedProxyId] = useState(null);
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user && (user.is_admin || user.user_level === 0);

  const fetchProxies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await proxyAPI.getProxies({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      setProxies(response.data.data.proxies);
      setTotalCount(response.data.data.pagination.total);
    } catch (err) {
      console.error('Error fetching proxies:', err);
      setError('Không thể tải danh sách proxy. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProxies();
  }, [page, rowsPerPage, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProxies();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleDeleteClick = (proxyId) => {
    setSelectedProxyId(proxyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await proxyAPI.deleteProxy(selectedProxyId);
      setDeleteDialogOpen(false);
      showNotification('Proxy đã được xóa thành công', 'success');
      fetchProxies();
    } catch (error) {
      console.error('Error deleting proxy:', error);
      showNotification('Xóa proxy thất bại. Vui lòng thử lại sau.', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProxyId(null);
  };

  const handleRotateClick = (proxyId) => {
    setSelectedProxyId(proxyId);
    setRotateDialogOpen(true);
  };

  const handleRotateConfirm = async () => {
    try {
      await proxyAPI.replaceProxy(selectedProxyId);
      setRotateDialogOpen(false);
      showNotification('Proxy đã được quay vòng thành công', 'success');
      fetchProxies();
    } catch (error) {
      console.error('Error rotating proxy:', error);
      showNotification('Quay vòng proxy thất bại. Vui lòng thử lại sau.', 'error');
    }
  };

  const handleRotateCancel = () => {
    setRotateDialogOpen(false);
    setSelectedProxyId(null);
  };

  const handleCopyProxy = (proxyStr) => {
    navigator.clipboard.writeText(proxyStr);
    showNotification('Đã sao chép proxy vào clipboard', 'success');
  };

  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  const getProxyString = (proxy) => {
    if (!proxy) return '';
    if (proxy.type === 'socks5') {
      return `socks5://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    } else {
      return `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">Proxy Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/proxies/new')}
          >
            Add New Proxy
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by IP, username or country..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                )
              }}
            />
          </Grid>
          <Grid item xs={4} md={2}>
            <Select
              fullWidth
              value={statusFilter}
              onChange={handleStatusFilterChange}
              displayEmpty
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={4} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Host:Port</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Authentication</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Expiration</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : proxies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1">No proxies found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    proxies.map((proxy) => (
                      <TableRow key={proxy.id}>
                        <TableCell>
                          <Typography variant="body2">{proxy.host}:{proxy.port}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={proxy.type.toUpperCase()} size="small" />
                        </TableCell>
                        <TableCell>{proxy.country}</TableCell>
                        <TableCell>
                          {proxy.username ? (
                            <Tooltip title={`${proxy.username}:${proxy.password}`}>
                              <Chip 
                                label="Authenticated" 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </Tooltip>
                          ) : (
                            <Chip label="Anonymous" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={proxy.active ? 'Active' : 'Inactive'}
                            color={proxy.active ? STATUS_COLORS.active : STATUS_COLORS.inactive}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {proxy.expires_at ? 
                            format(new Date(proxy.expires_at), 'dd/MM/yyyy') : 
                            'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Sao chép">
                              <IconButton size="small" onClick={() => handleCopyProxy(getProxyString(proxy))}>
                                <ImportExportIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Quay vòng">
                              <IconButton size="small" onClick={() => handleRotateClick(proxy.id)}>
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                component={Link} 
                                to={`/proxies/${proxy.id}/edit`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteClick(proxy.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this proxy? This action cannot be undone.
            {selectedProxyId && (
              <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                {selectedProxyId}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProxyList; 