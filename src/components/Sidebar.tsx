import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Assessment as ReportIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const commonNavigationItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/vulnerability-scanner', label: 'Vulnerability Scanner', icon: <SecurityIcon /> },
  { path: '/network-scanner', label: 'Network Scanner', icon: <NetworkIcon /> },
  { path: '/reports', label: 'Reports', icon: <ReportIcon /> },
];

const adminNavigationItems = [
  { path: '/admin/domain-groups', label: 'Domain Groups', icon: <GroupIcon /> },
  { path: '/admin/domain-users', label: 'Domain Users', icon: <PeopleIcon /> },
  { path: '/admin/add-domain-user', label: 'Add Domain Users', icon: <PersonAddIcon /> },
  { path: '/admin/logs', label: 'Activity Logs', icon: <AssessmentIcon /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          mt: '64px', // Height of AppBar
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          {commonNavigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.dark',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: location.pathname === item.path ? 'inherit' : 'primary.main',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {user?.isAdmin && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ px: 3, py: 1, fontWeight: 600 }}
            >
              Admin
            </Typography>
            <List sx={{ p: 0 }}>
              {adminNavigationItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.dark',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: location.pathname === item.path ? 'inherit' : 'primary.main',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: location.pathname === item.path ? 600 : 400,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
} 