import React from 'react';
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkCheckIcon,
  BarChart as ReportsIcon,
  Group as UsersIcon,
  GroupWork as GroupsIcon,
  History as LogsIcon,
  AdminPanelSettings as RoleManagementIcon,
  Shield as TrustIPIcon,
  Storage as ADScannerIcon,
  People as ADUsersIcon,
  Folder as ADGroupsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open?: boolean;
  variant?: 'permanent' | 'persistent' | 'temporary';
  onClose?: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  open = true,
  variant = 'permanent',
  onClose,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.isAdmin;

  const navigationItems: NavItem[] = [
    { title: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { title: 'Vulnerability Scanner', path: '/vulnerability-scanner', icon: <SecurityIcon /> },
    { title: 'Network Scanner', path: '/network-scanner', icon: <NetworkCheckIcon /> },
    { title: 'Reports', path: '/reports', icon: <ReportsIcon /> },
    { title: 'Trust IP Analytics', path: '/trust-ip', icon: <TrustIPIcon /> },
  ];

  const adminNavigationItems: NavItem[] = [
    { title: 'Domain Groups', path: '/admin/domain-groups', icon: <GroupsIcon />, adminOnly: true },
    { title: 'Domain Users', path: '/admin/domain-users', icon: <UsersIcon />, adminOnly: true },
    { title: 'Role Management', path: '/admin/role-management', icon: <RoleManagementIcon />, adminOnly: true },
    { title: 'Admin Logs', path: '/admin/logs', icon: <LogsIcon />, adminOnly: true },
  ];

  const activeDirectoryItems: NavItem[] = [
    { title: 'AD Scanner', path: '/active-directory/scanner', icon: <ADScannerIcon /> },
    { title: 'AD Users', path: '/active-directory/users', icon: <ADUsersIcon /> },
    { title: 'AD Groups', path: '/active-directory/groups', icon: <ADGroupsIcon /> },
  ];

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {isAdmin && (
        <>
          <Divider />
          <List>
            {adminNavigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Divider />
      <Typography
        variant="subtitle1"
        sx={{ 
          px: 2,
          py: 1,
          fontWeight: 700,
          color: 'primary.main'
        }}
      >
        Active Directory
      </Typography>
      <List>
        {activeDirectoryItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar; 