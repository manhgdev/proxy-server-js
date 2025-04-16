import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Button,
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  ShoppingCart as CartIcon,
  AddShoppingCart as AddCartIcon,
  DeleteOutline as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Public as CountryIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { packagesAPI, ordersAPI, walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Các tabs chính của shop
const PROXY_TYPES = [
  { id: 'static_ipv4', label: 'Proxy Tĩnh IPv4', type: 'static', ip_version: 'ipv4' },
  { id: 'static_ipv6', label: 'Proxy Tĩnh IPv6', type: 'static', ip_version: 'ipv6' },
  { id: 'rotating', label: 'Proxy Xoay', type: 'rotating' },
];

// Component chính
const ProxyShop = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [walletInfo, setWalletInfo] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [depositDialog, setDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState(500000);
  const [depositMethod, setDepositMethod] = useState('bank_transfer');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentType = PROXY_TYPES[activeTab];
        
        let queryParams = { type: currentType.type };
        if (currentType.ip_version) {
          queryParams.ip_version = currentType.ip_version;
        }
        
        const response = await packagesAPI.getPackages(queryParams);
        if (response.data && response.data.packages) {
          setPackages(response.data.packages);
        } else {
          setPackages([]);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Không thể tải danh sách gói Proxy. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [activeTab]);

  // Fetch wallet info if user is authenticated
  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!isAuthenticated) return;
      
      try {
        setWalletLoading(true);
        const response = await walletAPI.getWalletInfo();
        if (response.data && response.data.data) {
          setWalletInfo(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching wallet info:', err);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletInfo();
  }, [isAuthenticated]);

  // Xử lý chuyển tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (pkg) => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Vui lòng đăng nhập để mua hàng',
        severity: 'warning'
      });
      return;
    }

    const existingItem = cart.find(item => item.package_id === pkg._id);
    
    if (existingItem) {
      // Nếu đã có trong giỏ thì tăng số lượng
      const updatedCart = cart.map(item => 
        item.package_id === pkg._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      // Thêm mới vào giỏ
      setCart([...cart, {
        package_id: pkg._id,
        package_name: pkg.name,
        price: pkg.price,
        quantity: 1,
        type: pkg.type,
        ip_version: pkg.ip_version || 'ipv4',
        image: pkg.image || null,
        custom_config: {}
      }]);
    }
    
    setSnackbar({
      open: true,
      message: 'Đã thêm vào giỏ hàng',
      severity: 'success'
    });
  };

  // Xử lý xóa khỏi giỏ hàng
  const handleRemoveFromCart = (packageId) => {
    setCart(cart.filter(item => item.package_id !== packageId));
  };

  // Tính tổng giá trị giỏ hàng
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Xử lý mở dialog nạp tiền
  const handleOpenDepositDialog = () => {
    setDepositDialog(true);
  };

  // Xử lý gửi yêu cầu nạp tiền
  const handleDeposit = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Vui lòng đăng nhập để nạp tiền',
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await walletAPI.createDepositRequest({
        amount: depositAmount,
        payment_method: depositMethod,
        payment_details: {
          bank_name: "Vietcombank",
          account_number: "1234567890",
        }
      });

      if (response.data && response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Yêu cầu nạp tiền đã được gửi, vui lòng chờ xác nhận',
          severity: 'success'
        });
        setDepositDialog(false);
      }
    } catch (err) {
      console.error('Error creating deposit request:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  // Xử lý tiến hành thanh toán
  const handleCheckout = () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'Giỏ hàng trống, vui lòng thêm proxy vào giỏ hàng',
        severity: 'warning'
      });
      return;
    }

    if (!walletInfo || walletInfo.balance < calculateTotal()) {
      setSnackbar({
        open: true,
        message: 'Số dư không đủ, vui lòng nạp thêm tiền',
        severity: 'warning'
      });
      return;
    }

    setCheckoutOpen(true);
    setActiveStep(0);
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    try {
      setProcessingOrder(true);
      setOrderError(null);

      const items = cart.map(item => ({
        package_id: item.package_id,
        quantity: item.quantity,
        custom_config: item.custom_config || {}
      }));

      const response = await ordersAPI.createOrder({
        items,
        payment_source: 'wallet'
      });

      if (response.data && response.data.status === 'success') {
        setActiveStep(2);
        setOrderSuccess(true);
        setCart([]);
        
        // Refresh wallet info
        const walletResponse = await walletAPI.getWalletInfo();
        if (walletResponse.data && walletResponse.data.data) {
          setWalletInfo(walletResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setOrderError('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Xử lý đóng checkout
  const handleCloseCheckout = () => {
    if (orderSuccess) {
      setCheckoutOpen(false);
      setOrderSuccess(false);
      navigate('/user/proxies');
    } else {
      setCheckoutOpen(false);
    }
  };

  // Xử lý đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Checkout steps
  const steps = ['Xác nhận giỏ hàng', 'Thanh toán', 'Hoàn tất'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mua Proxy
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Chọn loại Proxy phù hợp với nhu cầu của bạn
        </Typography>
      </Box>

      {/* Thông tin ví */}
      {isAuthenticated && (
        <Paper sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1">
              Số dư ví: {walletLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Typography component="span" variant="h6" color="primary">
                  {walletInfo ? `${walletInfo.balance.toLocaleString()}đ` : '0đ'}
                </Typography>
              )}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenDepositDialog}
          >
            Nạp tiền
          </Button>
        </Paper>
      )}

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

      {/* Giỏ hàng mini */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {PROXY_TYPES[activeTab].label}
        </Typography>
        <Box>
          <Badge badgeContent={cart.length} color="secondary" sx={{ mr: 2 }}>
            <IconButton 
              color="primary" 
              onClick={() => setCheckoutOpen(true)}
              disabled={cart.length === 0}
            >
              <CartIcon />
            </IconButton>
          </Badge>
          <Typography variant="body1" component="span">
            Tổng: {calculateTotal().toLocaleString()}đ
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ ml: 2 }}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Thanh toán
          </Button>
        </Box>
      </Box>

      {/* Danh sách gói proxy */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : packages.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>Không có gói dịch vụ nào</Alert>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  ...(pkg.is_popular ? {
                    border: '2px solid',
                    borderColor: 'primary.main'
                  } : {})
                }}
              >
                {pkg.is_popular && (
                  <Box sx={{
                    position: 'absolute',
                    top: -12,
                    left: 0,
                    right: 0,
                    textAlign: 'center'
                  }}>
                    <Chip
                      label="Phổ biến nhất"
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}

                <CardHeader
                  title={pkg.name}
                  subheader={pkg.description}
                  titleTypographyProps={{ align: 'center', variant: 'h6' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  sx={{
                    backgroundColor: pkg.is_popular ? 'primary.light' : 'grey.100'
                  }}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography variant="h4" component="span">
                      {pkg.price.toLocaleString()}đ
                    </Typography>
                    <Typography variant="subtitle1" component="span">
                      /{pkg.duration_days} ngày
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    {pkg.features && pkg.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCartIcon />}
                    onClick={() => handleAddToCart(pkg)}
                  >
                    Thêm vào giỏ
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog nạp tiền */}
      <Dialog open={depositDialog} onClose={() => setDepositDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nạp tiền vào ví</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vui lòng nhập số tiền bạn muốn nạp và chọn phương thức thanh toán.
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="Số tiền"
            type="number"
            fullWidth
            variant="outlined"
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value)}
              label="Phương thức thanh toán"
            >
              <MenuItem value="bank_transfer">Chuyển khoản ngân hàng</MenuItem>
              <MenuItem value="momo">Ví MoMo</MenuItem>
              <MenuItem value="zalopay">ZaloPay</MenuItem>
            </Select>
            {depositMethod === 'bank_transfer' && (
              <FormHelperText>
                Thông tin tài khoản: Ngân hàng Vietcombank - STK: 1234567890 - Chủ TK: Nguyễn Văn A
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialog(false)}>Hủy</Button>
          <Button onClick={handleDeposit} variant="contained" color="primary">
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog checkout */}
      <Dialog open={checkoutOpen} onClose={handleCloseCheckout} maxWidth="md" fullWidth>
        <DialogTitle>Thanh toán</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Xác nhận giỏ hàng
              </Typography>
              {cart.length === 0 ? (
                <Alert severity="info">Giỏ hàng trống</Alert>
              ) : (
                <>
                  <List>
                    {cart.map((item) => (
                      <ListItem
                        key={item.package_id}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFromCart(item.package_id)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={item.package_name}
                          secondary={`${item.quantity} x ${item.price.toLocaleString()}đ = ${(item.quantity * item.price).toLocaleString()}đ`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                    <Typography variant="h6" color="primary">{calculateTotal().toLocaleString()}đ</Typography>
                  </Box>
                </>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Thanh toán
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Số dư ví: {walletInfo ? walletInfo.balance.toLocaleString() : 0}đ
              </Alert>
              <Alert severity={walletInfo && walletInfo.balance >= calculateTotal() ? 'success' : 'warning'}>
                {walletInfo && walletInfo.balance >= calculateTotal()
                  ? 'Số dư đủ để thanh toán'
                  : 'Số dư không đủ, vui lòng nạp thêm tiền'
                }
              </Alert>
              {orderError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {orderError}
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Đặt hàng thành công
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                Đơn hàng của bạn đã được xử lý thành công. Bạn có thể xem proxy của mình trong mục "Proxy của tôi".
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!orderSuccess && (
            <Button onClick={handleCloseCheckout}>Hủy</Button>
          )}
          {activeStep === 0 && cart.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveStep(1)}
            >
              Tiếp tục
            </Button>
          )}
          {activeStep === 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlaceOrder}
              disabled={processingOrder || !walletInfo || walletInfo.balance < calculateTotal()}
            >
              {processingOrder ? <CircularProgress size={24} /> : 'Đặt hàng'}
            </Button>
          )}
          {activeStep === 2 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseCheckout}
            >
              Xem proxy của tôi
            </Button>
          )}
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
    </Container>
  );
};

export default ProxyShop; 