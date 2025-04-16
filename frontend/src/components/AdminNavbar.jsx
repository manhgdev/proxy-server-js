import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ShoppingCart as OrdersIcon,
  AccountCircle,
  Logout,
  BusinessCenter as PackagesIcon,
  ExpandLess,
  ExpandMore,
  Router as RouterIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const AdminNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [proxyMenuOpen, setProxyMenuOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/admin' },
    { 
      text: 'Quản lý Proxy', 
      icon: <StorageIcon />, 
      hasSubmenu: true,
      submenu: [
        { text: 'Proxy tĩnh', icon: <RouterIcon />, path: '/admin/proxies' },
        { text: 'Proxy xoay', icon: <DevicesIcon />, path: '/admin/proxy-pools' },
      ]
    },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý đơn hàng', icon: <OrdersIcon />, path: '/admin/orders' },
    { text: 'Quản lý gói dịch vụ', icon: <PackagesIcon />, path: '/admin/packages' },
    { text: 'Cài đặt hệ thống', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  const handleToggleProxyMenu = () => {
    setProxyMenuOpen(!proxyMenuOpen);
  };

  const drawer = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Proxy Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          item.hasSubmenu ? (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton onClick={handleToggleProxyMenu}>
                  <ListItemIcon sx={{ color: proxyMenuOpen ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {proxyMenuOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={proxyMenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItemButton 
                      key={subItem.text} 
                      component={Link} 
                      to={subItem.path}
                      selected={isActive(subItem.path)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon sx={{ color: isActive(subItem.path) ? 'primary.main' : 'inherit' }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Proxy Server - Trang quản trị
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/" sx={{ mr: 2 }}>
              Về trang chính
            </Button>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              {user?.avatar ? (
                <Avatar src={user.avatar} alt={user.username} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem dense onClick={handleMenuClose} component={Link} to="/profile">
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Hồ sơ cá nhân</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem dense onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Đăng xuất</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default AdminNavbar; 