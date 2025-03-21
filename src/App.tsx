import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import VulnerabilityScanner from './pages/VulnerabilityScanner';
import NetworkScanner from './pages/NetworkScanner';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import DomainGroups from './pages/admin/DomainGroups';
import DomainUsers from './pages/admin/DomainUsers';
import AddDomainUser from './pages/admin/AddDomainUser';
import AdminLogs from './pages/admin/AdminLogs';
import ConfirmAccount from './pages/ConfirmAccount';
import RoleManagement from './pages/RoleManagement';
import { createAppTheme } from './theme';
import TrustIPAnalytics from './pages/TrustIPAnalytics';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';

const DRAWER_WIDTH = 240;

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = useMemo(() => createAppTheme(darkMode), [darkMode]);

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const isAdminRoute = (path: string) => {
    return path.startsWith('/admin/');
  };

  const hasResourceAccess = (resourceId: string | null) => {
    if (!resourceId) return true;
    if (user.isAdmin) return true;
    
    const savedUsers = localStorage.getItem('domainUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const targetUser = users.find((u: any) => u.id === resourceId);
    
    // If resource doesn't exist, deny access
    if (!targetUser) return false;
    
    // Allow access only if it's the user's own resource
    return targetUser.email === user.email;
  };

  const urlParts = location.pathname.split('/');
  const resourceId = urlParts[urlParts.length - 1];
  const isResourceRequest = !['domain-groups', 'domain-users', 'add-domain-user', 'logs'].includes(resourceId);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: 'background.default',
            color: 'text.primary'
          }}>
            <Routes>
              <Route path="/login" element={
                <Box sx={{ 
                  display: 'flex',
                  minHeight: '100vh',
                  bgcolor: 'background.default',
                  color: 'text.primary'
                }}>
                  <Login darkMode={darkMode} onThemeChange={handleThemeChange} />
                </Box>
              } />
              
              <Route path="/confirm-account" element={
                <Box sx={{ 
                  display: 'flex',
                  minHeight: '100vh',
                  bgcolor: 'background.default',
                  color: 'text.primary'
                }}>
                  <ConfirmAccount />
                </Box>
              } />

              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                      <Navbar darkMode={darkMode} onThemeChange={handleThemeChange} />
                      <Sidebar />
                      <Box
                        component="main"
                        sx={{
                          flexGrow: 1,
                          height: '100vh',
                          overflow: 'auto',
                          position: 'relative',
                          // ml: `${DRAWER_WIDTH}px`,
                          mt: '64px',
                          pl: 2,
                          pr: 4,
                          pt: 3,
                          pb: 3,
                          backgroundColor: 'background.default',
                          borderLeft: '1px solid',
                          borderColor: 'divider',
                          '& > *': {
                            maxWidth: 'calc(100% - 32px)',
                            mx: 'auto',
                          }
                        }}
                      >
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/vulnerability-scanner" element={<VulnerabilityScanner />} />
                          <Route path="/network-scanner" element={<NetworkScanner />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/profile" element={<Profile />} />
                          
                          {/* Admin Routes */}
                          <Route path="/admin/domain-groups" element={<DomainGroups />} />
                          <Route path="/admin/domain-users" element={<DomainUsers />} />
                          <Route path="/admin/add-domain-user" element={<AddDomainUser />} />
                          <Route path="/admin/add-domain-user/:userId" element={<AddDomainUser />} />
                          <Route path="/admin/role-management" element={<RoleManagement />} />
                          <Route path="/admin/logs" element={<AdminLogs />} />
                          
                          <Route path="/trust-ip" element={<TrustIPAnalytics />} />
                          
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 