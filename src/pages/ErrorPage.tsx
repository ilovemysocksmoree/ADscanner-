import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorPageProps {
  code?: number;
  message?: string;
}

export default function ErrorPage({ code = 404, message = 'Access Denied' }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'error.main' }}>
          {code}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, color: 'text.secondary' }}>
          {message}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ 
            px: 4, 
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
} 