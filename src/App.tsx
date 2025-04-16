import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Pages
import Dashboard from './pages/Dashboard';
import VulnerabilityScanner from './pages/VulnerabilityScanner';
import NetworkScanner from './pages/NetworkScanner';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Profile from './components/Profile';
import ConfirmAccount from './pages/ConfirmAccount';
import TrustIPAnalytics from './pages/TrustIPAnalytics';
import ADScanner from './pages/active-directory/ADScanner';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin pages
import DomainGroups from './pages/admin/DomainGroups';
import DomainUsers from './pages/admin/DomainUsers';
import AddDomainUser from './pages/admin/AddDomainUser';
import AdminLogs from './pages/admin/AdminLogs';
import RoleManagement from './pages/RoleManagement';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Other
import { AuthProvider } from './contexts/AuthContext';
import { createAppTheme } from './theme';
import { useAuth } from './contexts/AuthContext';

// Define required permissions for different route types
const scannerPermissions = ['run_scans'];
const reportPermissions = ['view_reports'];
const adminPermissions = ['manage_domains', 'manage_users', 'view_logs'];

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
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
            
            <Route path="/unauthorized" element={
              <Box sx={{ 
                display: 'flex',
                minHeight: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary'
              }}>
                <UnauthorizedPage />
              </Box>
            } />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/vulnerability-scanner" element={
              <ProtectedRoute requiredPermissions={scannerPermissions}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <VulnerabilityScanner />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/network-scanner" element={
              <ProtectedRoute requiredPermissions={scannerPermissions}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <NetworkScanner />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute requiredPermissions={reportPermissions}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/ad-scanner" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_domains']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <ADScanner />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/active-directory/scanner" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_domains']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <ADScanner />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/active-directory/users" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_users']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <ADScanner />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/active-directory/groups" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_domains']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <ADScanner />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute requiredPermissions={['manage_profile']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/trust-ip" element={
              <ProtectedRoute requiredPermissions={['view_scans']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <TrustIPAnalytics />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/domain-groups" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_domains']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <DomainGroups />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/domain-users" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_users']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <DomainUsers />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-domain-user" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_users']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <AddDomainUser />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-domain-user/:userId" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_users']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <AddDomainUser />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/role-management" element={
              <ProtectedRoute requireAdmin requiredPermissions={['manage_users']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <RoleManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/logs" element={
              <ProtectedRoute requireAdmin requiredPermissions={['view_logs']}>
                <Layout darkMode={darkMode} onThemeChange={handleThemeChange}>
                  <AdminLogs />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Fallback - redirect to unauthorized for unknown routes */}
            <Route path="*" element={<Navigate to="/unauthorized" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 