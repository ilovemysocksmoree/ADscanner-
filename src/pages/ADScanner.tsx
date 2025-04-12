import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ADConnectionForm from '../components/ADConnectionForm';

const ADScanner = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AD Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect to your Active Directory server to manage users, groups, and monitor your domain.
        </Typography>
        <ADConnectionForm />
      </Box>
    </Container>
  );
};

export default ADScanner; 