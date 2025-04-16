import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

interface UnauthorizedPageProps {
  message?: string;
  isAuthenticated?: boolean;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ 
  message = "You don't have permission to access this page", 
  isAuthenticated = false 
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/'); // Go to dashboard if logged in
    } else {
      navigate('/login'); // Go to login if not authenticated
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <LockIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary">
            {message}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAction}
            sx={{ mt: 2 }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Login'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage; 