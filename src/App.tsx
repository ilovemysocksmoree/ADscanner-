import React from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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

const DRAWER_WIDTH = 240;

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#0a1929' : '#f5f5f5',
        paper: darkMode ? '#1a2027' : '#ffffff',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            zIndex: 1300,
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#1a2027' : '#ffffff',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        },
      },
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
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
                        ml: `${DRAWER_WIDTH}px`,
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
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Box>
                  </Box>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 