import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Box,
  Switch,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  History as HistoryIcon,
  Speed as PerformanceIcon,
  Tune as ConfigIcon,
  CloudUpload as UpdateIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  onThemeChange: () => void;
}

interface AlertHistoryItem {
  id: string;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  timestamp: string;
}

const mockAlertHistory: AlertHistoryItem[] = [
  {
    id: '1',
    title: 'Critical Vulnerability',
    message: 'Remote code execution vulnerability detected',
    severity: 'error',
    timestamp: '2024-03-20 15:30:00',
  },
  {
    id: '2',
    title: 'Network Anomaly',
    message: 'Unusual traffic pattern detected',
    severity: 'warning',
    timestamp: '2024-03-20 14:45:00',
  },
];

export default function Navbar({ darkMode, onThemeChange }: NavbarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationDrawer, setNotificationDrawer] = useState(false);
  const [settingsDrawer, setSettingsDrawer] = useState(false);
  const [alertHistory] = useState<AlertHistoryItem[]>(mockAlertHistory);
  const [autoScan, setAutoScan] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleMyAccount = () => {
    handleMenuClose();
    navigate('/profile');  // You can create a separate account page if needed
  };

  const handleLogout = async () => {
    try {
      await signOut();
      handleMenuClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      case 'success':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Security Dashboard
          </Typography>

          <IconButton color="inherit" onClick={() => setNotificationDrawer(true)}>
            <Badge badgeContent={alertHistory.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={() => setSettingsDrawer(true)}>
            <SettingsIcon />
          </IconButton>

          <IconButton color="inherit" onClick={onThemeChange}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton
            edge="end"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleMyAccount}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          My Account
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notification History Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawer}
        onClose={() => setNotificationDrawer(false)}
      >
        <Box sx={{ width: 350, pt: 8 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Notification History
          </Typography>
          <Divider />
          <List>
            {alertHistory.map((alert) => (
              <ListItem key={alert.id}>
                <ListItemIcon>
                  <HistoryIcon sx={{ color: getSeverityColor(alert.severity) }} />
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.timestamp}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsDrawer}
        onClose={() => setSettingsDrawer(false)}
      >
        <Box sx={{ width: 300, pt: 8 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Settings
          </Typography>
          <Divider />
          <List>
            <ListItem>
              <ListItemIcon>
                <PerformanceIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Automatic Scanning" 
                secondary="Periodically scan for vulnerabilities"
              />
              <Switch 
                checked={autoScan} 
                onChange={(e) => setAutoScan(e.target.checked)} 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Push Notifications" 
                secondary="Get alerts for security events"
              />
              <Switch defaultChecked />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <UpdateIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Real-time Updates" 
                secondary="Live monitoring and alerts"
              />
              <Switch 
                checked={realTimeUpdates}
                onChange={(e) => setRealTimeUpdates(e.target.checked)}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <ConfigIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Scan Configuration" 
                secondary="Set scanning intervals and targets"
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
} 