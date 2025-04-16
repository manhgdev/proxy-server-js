import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress, 
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import { walletAPI } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [depositDialog, setDepositDialog] = useState(false);
  const [depositData, setDepositData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    payment_details: {
      bank_name: '',
      account_number: '',
      transaction_id: ''
    }
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
    { value: 'momo', label: 'Ví MoMo' },
    { value: 'zalopay', label: 'ZaloPay' },
    { value: 'vnpay', label: 'VNPay' }
  ];

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (currentTab === 1) {
      fetchTransactions();
    }
  }, [currentTab, page]);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletAPI.getWallet();
      if (response.data.status === 'success') {
        setWalletData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Không thể tải thông tin ví. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletAPI.getTransactions(page, 10);
      if (response.data.status === 'success') {
        setTransactions(response.data.data.transactions || []);
        setTotalPages(Math.ceil(response.data.data.total / 10) || 1);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDeposit = () => {
    setDepositDialog(true);
  };

  const handleCloseDeposit = () => {
    setDepositDialog(false);
    // Reset form khi đóng dialog
    setDepositData({
      amount: '',
      payment_method: 'bank_transfer',
      payment_details: {
        bank_name: '',
        account_number: '',
        transaction_id: ''
      }
    });
  };

  const handleDepositChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setDepositData({
        ...depositData,
        [parent]: {
          ...depositData[parent],
          [child]: value
        }
      });
    } else {
      setDepositData({
        ...depositData,
        [name]: value
      });
    }
  };

  const handleDepositSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletAPI.createDeposit(depositData);
      if (response.data.status === 'success') {
        setDepositSuccess(true);
        setTimeout(() => {
          setDepositSuccess(false);
          handleCloseDeposit();
          fetchWalletData();
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating deposit request:', err);
      setError('Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

  const getTransactionTypeText = (type) => {
    const typeMap = {
      deposit: 'Nạp tiền',
      withdraw: 'Rút tiền',
      purchase: 'Mua hàng',
      refund: 'Hoàn tiền',
      transfer: 'Chuyển tiền',
      bonus: 'Tiền thưởng'
    };
    return typeMap[type] || type;
  };

  const getTransactionStatusColor = (status) => {
    const statusMap = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      processing: 'info',
      cancelled: 'default'
    };
    return statusMap[status] || 'default';
  };

  const getBankInfo = () => {
    return {
      bank_name: 'Techcombank',
      account_number: '19032882748016',
      account_holder: 'CÔNG TY TNHH PROXY SERVER',
      branch: 'Chi nhánh Hà Nội',
      note: 'Nạp tiền Proxy Server ' + (Math.floor(Math.random() * 10000)).toString().padStart(4, '0')
    };
  };

  const bankInfo = getBankInfo();

  if (loading && !walletData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Ví điện tử
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Thông tin ví */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Số dư hiện tại
              </Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
                {walletData ? formatCurrency(walletData.balance) : '0 ₫'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cập nhật: {walletData ? formatDate(new Date()) : '--'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenDeposit}
                sx={{ mt: 3 }}
              >
                Nạp tiền
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Thông tin ngân hàng */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Thông tin thanh toán
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngân hàng
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bankInfo.bank_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Số tài khoản
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bankInfo.account_number}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Chủ tài khoản
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bankInfo.account_holder}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nội dung chuyển khoản
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 1, 
                      backgroundColor: 'background.default', 
                      border: '1px dashed',
                      borderColor: 'primary.main',
                      mt: 1
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      fontWeight="medium"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {bankInfo.note}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ mt: 3, boxShadow: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Tổng quan" icon={<AttachMoneyIcon />} iconPosition="start" />
              <Tab label="Lịch sử giao dịch" icon={<HistoryIcon />} iconPosition="start" />
            </Tabs>

            {/* Tab Tổng quan */}
            {currentTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Hướng dẫn nạp tiền
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                          Bước 1: Chọn phương thức thanh toán
                        </Typography>
                        <Typography variant="body2">
                          Nhấn vào nút "Nạp tiền" và chọn phương thức thanh toán phù hợp (chuyển khoản ngân hàng, ví điện tử, v.v.)
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                          Bước 2: Thực hiện giao dịch
                        </Typography>
                        <Typography variant="body2">
                          Chuyển tiền theo thông tin chúng tôi cung cấp. Nhớ ghi rõ nội dung chuyển khoản để chúng tôi dễ dàng xác nhận.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                          Bước 3: Xác nhận nạp tiền
                        </Typography>
                        <Typography variant="body2">
                          Điền thông tin giao dịch vào form và gửi. Chúng tôi sẽ xác nhận và cập nhật số dư trong vòng 5-30 phút (trong giờ hành chính).
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Lưu ý quan trọng
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'primary.50',
                    border: '1px solid',
                    borderColor: 'primary.200',
                  }}
                >
                  <Typography variant="body2">
                    • Thời gian xử lý nạp tiền: từ 5-30 phút trong giờ hành chính.
                  </Typography>
                  <Typography variant="body2">
                    • Ngoài giờ hành chính, cuối tuần và ngày lễ: tối đa 24 giờ.
                  </Typography>
                  <Typography variant="body2">
                    • Số tiền tối thiểu mỗi lần nạp: 100,000₫
                  </Typography>
                  <Typography variant="body2">
                    • Vui lòng nhập chính xác thông tin giao dịch khi xác nhận nạp tiền.
                  </Typography>
                  <Typography variant="body2">
                    • Mọi thắc mắc vui lòng liên hệ hotline: 0123.456.789 hoặc email: support@proxyserver.com
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Tab Lịch sử giao dịch */}
            {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                )}

                {!loading && transactions.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Chưa có giao dịch nào được thực hiện.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.default' }}>
                          <TableCell>ID Giao dịch</TableCell>
                          <TableCell>Loại</TableCell>
                          <TableCell align="right">Số tiền</TableCell>
                          <TableCell align="right">Số dư sau</TableCell>
                          <TableCell align="center">Thời gian</TableCell>
                          <TableCell align="center">Trạng thái</TableCell>
                          <TableCell>Mô tả</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {transaction._id.slice(-8)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {getTransactionTypeText(transaction.type)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                                fontWeight="medium"
                              >
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(transaction.balance_after)}
                            </TableCell>
                            <TableCell align="center">
                              {formatDate(transaction.created_at)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={transaction.status} 
                                color={getTransactionStatusColor(transaction.status)} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap style={{ maxWidth: 200 }}>
                                {transaction.description}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {transactions.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button 
                      disabled={page === 1} 
                      onClick={() => setPage(page - 1)}
                    >
                      Trước
                    </Button>
                    <Typography sx={{ mx: 2, lineHeight: '40px' }}>
                      Trang {page} / {totalPages}
                    </Typography>
                    <Button 
                      disabled={page === totalPages} 
                      onClick={() => setPage(page + 1)}
                    >
                      Sau
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Nạp tiền Dialog */}
      <Dialog 
        open={depositDialog} 
        onClose={handleCloseDeposit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Nạp tiền vào ví
            <IconButton onClick={handleCloseDeposit} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {depositSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Yêu cầu nạp tiền đã được tạo thành công. Chúng tôi sẽ xác nhận và cập nhật số dư của bạn sớm nhất có thể.
            </Alert>
          ) : (
            <React.Fragment>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Số tiền nạp"
                    name="amount"
                    value={depositData.amount}
                    onChange={handleDepositChange}
                    fullWidth
                    required
                    type="number"
                    InputProps={{
                      endAdornment: <Typography variant="body2">VND</Typography>
                    }}
                    helperText="Số tiền tối thiểu: 100,000₫"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Phương thức thanh toán</InputLabel>
                    <Select
                      value={depositData.payment_method}
                      name="payment_method"
                      onChange={handleDepositChange}
                      label="Phương thức thanh toán"
                    >
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {depositData.payment_method === 'bank_transfer' && (
                  <React.Fragment>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Ngân hàng"
                        name="payment_details.bank_name"
                        value={depositData.payment_details.bank_name}
                        onChange={handleDepositChange}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Số tài khoản"
                        name="payment_details.account_number"
                        value={depositData.payment_details.account_number}
                        onChange={handleDepositChange}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Mã giao dịch"
                        name="payment_details.transaction_id"
                        value={depositData.payment_details.transaction_id}
                        onChange={handleDepositChange}
                        fullWidth
                        required
                        helperText="Mã giao dịch trên ứng dụng ngân hàng của bạn"
                      />
                    </Grid>
                  </React.Fragment>
                )}

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Lưu ý: Vui lòng thực hiện giao dịch trước khi xác nhận thông tin.
                  </Typography>
                </Grid>
              </Grid>
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeposit}>
            {depositSuccess ? 'Đóng' : 'Hủy'}
          </Button>
          {!depositSuccess && (
            <Button 
              onClick={handleDepositSubmit} 
              variant="contained" 
              disabled={loading || !depositData.amount || 
                (depositData.payment_method === 'bank_transfer' && 
                (!depositData.payment_details.bank_name || 
                !depositData.payment_details.account_number || 
                !depositData.payment_details.transaction_id))}
            >
              {loading ? <CircularProgress size={24} /> : 'Xác nhận'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet; 