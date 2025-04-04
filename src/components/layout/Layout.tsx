import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onThemeChange: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, darkMode, onThemeChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar 
        darkMode={darkMode} 
        onThemeChange={onThemeChange} 
        onMenuToggle={isMobile ? handleDrawerToggle : undefined} 
      />
      
      <Sidebar 
        open={drawerOpen}
        variant={isMobile ? 'temporary' : 'permanent'}
        onClose={isMobile ? handleDrawerToggle : undefined}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          position: 'relative',
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
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 