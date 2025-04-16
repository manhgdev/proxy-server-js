import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Public as PublicIcon,
  SyncAlt as SyncAltIcon,
  Language as LanguageIcon,
  CreditCard as CreditCardIcon,
  HowToReg as HowToRegIcon
} from '@mui/icons-material';
import { packagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Hero section background
const heroBg = 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const pricingRef = React.useRef(null);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await packagesAPI.getActivePackages();
        if (response.data) {
          // Xử lý dữ liệu phân loại theo các loại proxy
          const data = response.data.data || response.data.packages || [];
          const categorizedPackages = {
            staticIPv4: data.filter(pkg => pkg.type === 'static' && pkg.ip_version === 'ipv4'),
            staticIPv6: data.filter(pkg => pkg.type === 'static' && pkg.ip_version === 'ipv6'),
            rotating: data.filter(pkg => pkg.type === 'rotating'),
          };
          setPackages(categorizedPackages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, []);
  
  // Fallback package data if API fails
  const fallbackPackages = {
    staticIPv4: [
      {
        _id: 'static_ipv4_basic',
        name: 'Basic IPv4',
        description: 'Proxy tĩnh cho cá nhân',
        price: 9.99,
        billing_cycle: 'monthly',
        features: [
          '10 Proxies IPv4 tĩnh',
          'Băng thông không giới hạn',
          'Truy cập từ 5 quốc gia',
          'Hỗ trợ HTTP/HTTPS',
          'Hỗ trợ 99% uptime'
        ],
        is_most_popular: false
      },
      {
        _id: 'static_ipv4_pro',
        name: 'Pro IPv4',
        description: 'Cho doanh nghiệp vừa',
        price: 19.99,
        billing_cycle: 'monthly',
        features: [
          '50 Proxies IPv4 tĩnh',
          'Băng thông không giới hạn',
          'Truy cập từ 15 quốc gia',
          'Hỗ trợ HTTP/HTTPS/SOCKS5',
          'Hỗ trợ API truy cập',
          'Hỗ trợ 99.5% uptime',
          'Hỗ trợ kỹ thuật 24/7'
        ],
        is_most_popular: true
      },
      {
        _id: 'static_ipv4_enterprise',
        name: 'Enterprise IPv4',
        description: 'Cho doanh nghiệp lớn',
        price: 49.99,
        billing_cycle: 'monthly',
        features: [
          '200+ Proxies IPv4 tĩnh',
          'Băng thông không giới hạn',
          'Truy cập toàn cầu (50+ quốc gia)',
          'Proxy cố định riêng biệt',
          'Đầy đủ giao thức',
          'Hỗ trợ 99.9% uptime',
          'Quản lý tài khoản chuyên biệt',
          'SLA cam kết'
        ],
        is_most_popular: false
      }
    ],
    staticIPv6: [
      {
        _id: 'static_ipv6_basic',
        name: 'Basic IPv6',
        description: 'Proxy IPv6 giá rẻ',
        price: 5.99,
        billing_cycle: 'monthly',
        features: [
          '20 Proxies IPv6 tĩnh',
          'Băng thông không giới hạn',
          'Truy cập từ 5 quốc gia',
          'Hỗ trợ HTTP/HTTPS',
          'Hỗ trợ 99% uptime'
        ],
        is_most_popular: false
      },
      {
        _id: 'static_ipv6_pro',
        name: 'Pro IPv6',
        description: 'Tối ưu chi phí',
        price: 12.99,
        billing_cycle: 'monthly',
        features: [
          '100 Proxies IPv6 tĩnh',
          'Băng thông không giới hạn',
          'Truy cập từ 15 quốc gia',
          'Hỗ trợ HTTP/HTTPS/SOCKS5',
          'Hỗ trợ API truy cập',
          'Hỗ trợ 99.5% uptime'
        ],
        is_most_popular: true
      },
      {
        _id: 'static_ipv6_enterprise',
        name: 'Enterprise IPv6',
        description: 'Quy mô lớn',
        price: 29.99,
        billing_cycle: 'monthly',
        features: [
          '500+ Proxies IPv6 tĩnh',
          'Băng thông không giới hạn',
          'Truy cập toàn cầu (50+ quốc gia)',
          'Tùy chỉnh subnet',
          'Đầy đủ giao thức',
          'Hỗ trợ 99.9% uptime',
          'SLA cam kết'
        ],
        is_most_popular: false
      }
    ],
    rotating: [
      {
        _id: 'rotating_basic',
        name: 'Xoay Cơ bản',
        description: 'Xoay IP theo nhu cầu',
        price: 14.99,
        billing_cycle: 'monthly',
        features: [
          '1 Proxy xoay',
          '100 IP/ngày',
          'Băng thông không giới hạn',
          'Truy cập từ 10 quốc gia',
          'Xoay IP mỗi 10 phút',
          'Hỗ trợ HTTP/HTTPS'
        ],
        is_most_popular: false
      },
      {
        _id: 'rotating_pro',
        name: 'Xoay Chuyên nghiệp',
        description: 'Linh hoạt cao',
        price: 29.99,
        billing_cycle: 'monthly',
        features: [
          '3 Proxy xoay đồng thời',
          '1,000 IP/ngày',
          'Băng thông không giới hạn',
          'Truy cập từ 30 quốc gia',
          'Xoay IP theo lệnh hoặc tự động (5 phút)',
          'Hỗ trợ HTTP/HTTPS/SOCKS5',
          'API đầy đủ'
        ],
        is_most_popular: true
      },
      {
        _id: 'rotating_enterprise',
        name: 'Xoay Doanh nghiệp',
        description: 'Quy mô lớn',
        price: 79.99,
        billing_cycle: 'monthly',
        features: [
          '10+ Proxy xoay đồng thời',
          'IP không giới hạn',
          'Băng thông không giới hạn',
          'Truy cập toàn cầu',
          'Xoay IP theo yêu cầu',
          'Lọc IP theo quốc gia/thành phố',
          'API tùy chỉnh',
          'SLA cam kết'
        ],
        is_most_popular: false
      }
    ]
  };
  
  // Testimonials data
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Marketing Specialist',
      company: 'Digital Solutions',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'Proxy Server giúp chúng tôi tiếp cận thị trường toàn cầu dễ dàng hơn. Sản phẩm ổn định và hỗ trợ kỹ thuật rất tốt.'
    },
    {
      name: 'Trần Thị B',
      role: 'Data Analyst',
      company: 'Research Group',
      avatar: 'https://i.pravatar.cc/150?img=5',
      content: 'Tôi sử dụng Proxy Server để thu thập dữ liệu nghiên cứu. Chất lượng proxy rất tốt, ít bị chặn và tốc độ ổn định.'
    },
    {
      name: 'Lê Văn C',
      role: 'E-commerce Manager',
      company: 'ShopNow',
      avatar: 'https://i.pravatar.cc/150?img=3',
      content: 'Giải pháp proxy xoay giúp chúng tôi quản lý nhiều tài khoản mạng xã hội hiệu quả. Tiết kiệm thời gian và công sức.'
    }
  ];
  
  // FAQ data
  const faqs = [
    {
      question: 'Proxy là gì?',
      answer: 'Proxy là một máy chủ trung gian giữa bạn và internet. Khi bạn sử dụng proxy, yêu cầu của bạn sẽ đi qua máy chủ proxy trước khi đến đích, giúp ẩn địa chỉ IP thật và mở khóa nội dung bị chặn theo vùng địa lý.'
    },
    {
      question: 'Sự khác biệt giữa proxy tĩnh và proxy xoay là gì?',
      answer: 'Proxy tĩnh sử dụng cùng một địa chỉ IP cho mọi kết nối, trong khi proxy xoay sẽ thay đổi địa chỉ IP theo mỗi yêu cầu hoặc theo khoảng thời gian nhất định. Proxy xoay thích hợp cho các tác vụ cần nhiều IP khác nhau.'
    },
    {
      question: 'Làm thế nào để thanh toán?',
      answer: 'Chúng tôi chấp nhận nhiều phương thức thanh toán, bao gồm thẻ tín dụng, PayPal, chuyển khoản ngân hàng và các loại tiền điện tử phổ biến. Bạn có thể thanh toán theo chu kỳ hàng tháng hoặc hàng năm.'
    },
    {
      question: 'Tôi có thể dùng thử trước khi mua không?',
      answer: 'Có, chúng tôi cung cấp gói dùng thử miễn phí 3 ngày với 3 proxy. Sau khi đăng ký tài khoản, bạn có thể kích hoạt gói dùng thử từ trang dashboard.'
    },
    {
      question: 'Proxy của bạn có hỗ trợ streaming không?',
      answer: 'Có, proxy của chúng tôi tương thích với các dịch vụ streaming phổ biến. Tuy nhiên, không phải tất cả các proxy đều hoạt động với mọi nền tảng. Chúng tôi đề xuất gói Professional hoặc Enterprise cho các nhu cầu streaming.'
    }
  ];
  
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        background: heroBg,
        color: 'white',
        py: { xs: 8, md: 12 },
        textAlign: 'center'
      }}>
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Proxy Server
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom mb={4}>
            Giải pháp proxy nhanh, an toàn và đáng tin cậy
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button 
                variant="contained" 
                color="secondary" 
                component={RouterLink}
                to={isAuthenticated ? "/user/dashboard" : "/register"}
                size="large"
              >
                {isAuthenticated ? "Quản lý Proxy" : "Dùng thử miễn phí"}
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                sx={{ color: 'white', borderColor: 'white' }}
                onClick={scrollToPricing}
                size="large"
              >
                Xem bảng giá
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
          Tính năng nổi bật
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <SpeedIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Tốc độ cao
                </Typography>
                <Typography>
                  Máy chủ proxy của chúng tôi được tối ưu hóa để đảm bảo tốc độ và độ ổn định cao,
                  giúp bạn thực hiện công việc một cách nhanh chóng mà không gặp gián đoạn.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <SecurityIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Bảo mật cao
                </Typography>
                <Typography>
                  Dữ liệu của bạn luôn được bảo vệ với mã hóa cao cấp và chính sách không lưu trữ log,
                  đảm bảo quyền riêng tư và an toàn thông tin.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <PublicIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Phủ sóng toàn cầu
                </Typography>
                <Typography>
                  Mạng lưới proxy phủ khắp hơn 100 quốc gia, cho phép bạn truy cập internet từ bất kỳ đâu
                  và mở khóa nội dung bị giới hạn địa lý.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <SyncAltIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Proxy xoay
                </Typography>
                <Typography>
                  Hệ thống proxy xoay tự động thay đổi IP theo thời gian hoặc yêu cầu,
                  giúp bạn vượt qua giới hạn truy cập và tăng mức độ ẩn danh.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <LanguageIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Hỗ trợ đa giao thức
                </Typography>
                <Typography>
                  Hỗ trợ đầy đủ các giao thức HTTP, HTTPS, SOCKS4 và SOCKS5,
                  tương thích với mọi ứng dụng và nhu cầu của bạn.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <HowToRegIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Hỗ trợ 24/7
                </Typography>
                <Typography>
                  Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
                  thông qua chat trực tuyến, email hoặc điện thoại.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Pricing Section */}
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }} id="pricing" ref={pricingRef}>
        <Container>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
            Bảng giá dịch vụ
          </Typography>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Paper sx={{ borderRadius: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                aria-label="proxy type tabs"
                sx={{ mb: 2 }}
              >
                <Tab label="Proxy Tĩnh IPv4" />
                <Tab label="Proxy Tĩnh IPv6" />
                <Tab label="Proxy Xoay" />
              </Tabs>
            </Paper>
          </Box>
          
          {/* Static IPv4 Proxy Packages */}
          <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
            <Typography variant="h6" component="h3" textAlign="center" gutterBottom mb={4} color="primary.main">
              Gói dịch vụ Proxy Tĩnh IPv4
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {(packages.staticIPv4?.length ? packages.staticIPv4 : fallbackPackages.staticIPv4).map((pkg) => (
                <Grid item key={pkg._id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      ...(pkg.is_most_popular ? {
                        transform: { md: 'scale(1.05)' },
                        border: '2px solid',
                        borderColor: 'primary.main'
                      } : {})
                    }}
                  >
                    {pkg.is_most_popular && (
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
                      titleTypographyProps={{ align: 'center', variant: 'h5' }}
                      subheaderTypographyProps={{ align: 'center' }}
                      sx={{ 
                        backgroundColor: pkg.is_most_popular ? 'primary.light' : 'grey.100'
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Typography variant="h4" component="span">
                          {pkg.price.toLocaleString()}đ
                        </Typography>
                        <Typography variant="h6" component="span">
                          /tháng
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
                        variant={pkg.is_most_popular ? "contained" : "outlined"} 
                        color={pkg.is_most_popular ? "primary" : "primary"}
                        component={RouterLink}
                        to={isAuthenticated ? `/user/orders/new?package=${pkg._id}&type=ipv4` : "/register"}
                        size="large"
                      >
                        {isAuthenticated ? "Mua ngay" : "Đăng ký ngay"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* Static IPv6 Proxy Packages */}
          <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
            <Typography variant="h6" component="h3" textAlign="center" gutterBottom mb={4} color="primary.main">
              Gói dịch vụ Proxy Tĩnh IPv6
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {(packages.staticIPv6?.length ? packages.staticIPv6 : fallbackPackages.staticIPv6).map((pkg) => (
                <Grid item key={pkg._id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      ...(pkg.is_most_popular ? {
                        transform: { md: 'scale(1.05)' },
                        border: '2px solid',
                        borderColor: 'primary.main'
                      } : {})
                    }}
                  >
                    {pkg.is_most_popular && (
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
                      titleTypographyProps={{ align: 'center', variant: 'h5' }}
                      subheaderTypographyProps={{ align: 'center' }}
                      sx={{ 
                        backgroundColor: pkg.is_most_popular ? 'primary.light' : 'grey.100'
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Typography variant="h4" component="span">
                          {pkg.price.toLocaleString()}đ
                        </Typography>
                        <Typography variant="h6" component="span">
                          /tháng
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
                        variant={pkg.is_most_popular ? "contained" : "outlined"} 
                        color={pkg.is_most_popular ? "primary" : "primary"}
                        component={RouterLink}
                        to={isAuthenticated ? `/user/orders/new?package=${pkg._id}&type=ipv6` : "/register"}
                        size="large"
                      >
                        {isAuthenticated ? "Mua ngay" : "Đăng ký ngay"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* Rotating Proxy Packages */}
          <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
            <Typography variant="h6" component="h3" textAlign="center" gutterBottom mb={4} color="primary.main">
              Gói dịch vụ Proxy Xoay
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {(packages.rotating?.length ? packages.rotating : fallbackPackages.rotating).map((pkg) => (
                <Grid item key={pkg._id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      ...(pkg.is_most_popular ? {
                        transform: { md: 'scale(1.05)' },
                        border: '2px solid',
                        borderColor: 'primary.main'
                      } : {})
                    }}
                  >
                    {pkg.is_most_popular && (
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
                      titleTypographyProps={{ align: 'center', variant: 'h5' }}
                      subheaderTypographyProps={{ align: 'center' }}
                      sx={{ 
                        backgroundColor: pkg.is_most_popular ? 'primary.light' : 'grey.100'
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Typography variant="h4" component="span">
                          {pkg.price.toLocaleString()}đ
                        </Typography>
                        <Typography variant="h6" component="span">
                          /tháng
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
                        variant={pkg.is_most_popular ? "contained" : "outlined"} 
                        color={pkg.is_most_popular ? "primary" : "primary"}
                        component={RouterLink}
                        to={isAuthenticated ? `/user/orders/new?package=${pkg._id}&type=rotating` : "/register"}
                        size="large"
                      >
                        {isAuthenticated ? "Mua ngay" : "Đăng ký ngay"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={6}>
          Khách hàng nói gì về chúng tôi
        </Typography>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item key={index} xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" component="p" sx={{ fontStyle: 'italic', mb: 2 }}>
                    "{testimonial.content}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Avatar src={testimonial.avatar} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}, {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={6}>
            Câu hỏi thường gặp
          </Typography>
          
          <Paper sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ 
        py: 8, 
        background: heroBg,
        color: 'white',
        textAlign: 'center'
      }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom>
            Sẵn sàng bắt đầu?
          </Typography>
          <Typography variant="h6" component="p" gutterBottom sx={{ mb: 4 }}>
            Đăng ký ngay hôm nay để nhận 3 ngày dùng thử miễn phí
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              color="secondary" 
              component={RouterLink}
              to={isAuthenticated ? "/user/orders/new" : "/register"}
              size="large"
            >
              {isAuthenticated ? "Mua proxy ngay" : "Đăng ký ngay"}
            </Button>
            <Button 
              variant="outlined" 
              sx={{ color: 'white', borderColor: 'white' }}
              component={RouterLink}
              to={isAuthenticated ? "/user/dashboard" : "/login"}
              size="large"
            >
              {isAuthenticated ? "Quản lý proxy" : "Đăng nhập"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 