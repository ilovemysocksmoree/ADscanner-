import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';

export default function ConfirmAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      // In a real application, you would verify the confirmation token here
      setLoading(false);
    } else {
      setError('Invalid confirmation link');
      setLoading(false);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Get the user from localStorage
      const savedUsers = localStorage.getItem('domainUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      const userIndex = users.findIndex((u: any) => u.email === email);

      if (userIndex === -1) {
        setError('User not found');
        return;
      }

      // Update user status and password
      users[userIndex] = {
        ...users[userIndex],
        status: 'active',
        password: newPassword, // In a real app, this would be hashed
      };

      localStorage.setItem('domainUsers', JSON.stringify(users));

      loggingService.addLog(
        users[userIndex],
        'CONFIRM_ACCOUNT',
        'User confirmed account and set new password',
        '/confirm-account'
      );

      setConfirmed(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError('Failed to confirm account');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Confirm Your Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {confirmed && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Account confirmed successfully! Redirecting to login...
          </Alert>
        )}

        {!confirmed && (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
            >
              Confirm Account
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
} 