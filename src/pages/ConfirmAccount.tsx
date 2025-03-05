import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';

export default function ConfirmAccount() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      console.log('Confirming account for email:', emailParam);
      
      // Check if user exists and is in pending status
      const savedUsers = localStorage.getItem('domainUsers');
      console.log('Retrieved users from localStorage:', savedUsers);
      
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        console.log('Parsed users:', users);
        
        const user = users.find((u: any) => u.email.toLowerCase() === emailParam.toLowerCase());
        console.log('Found user:', user);
        
        if (!user) {
          console.error('User not found in localStorage for email:', emailParam);
          setError('User not found');
        } else if (user.status === 'active') {
          console.log('User already confirmed:', user);
          setError('Account is already confirmed');
        } else if (user.status === 'inactive') {
          console.log('User account inactive:', user);
          setError('Account is deactivated. Please contact administrator');
        } else {
          console.log('User ready for confirmation:', user);
        }
      } else {
        console.error('No users found in localStorage');
        setError('User database not found');
      }
      
      setLoading(false);
    } else {
      console.error('No email parameter found in URL');
      setError('Invalid confirmation link');
      setLoading(false);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Handling confirmation submit for email:', email);

    // Password validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Get the user from localStorage
      const savedUsers = localStorage.getItem('domainUsers');
      console.log('Retrieved users for update:', savedUsers);
      
      if (!savedUsers) {
        console.error('User database not found during confirmation');
        setError('User database not found');
        return;
      }

      const users = JSON.parse(savedUsers);
      console.log('Parsed users for update:', users);
      
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      console.log('Found user index:', userIndex);

      if (userIndex === -1) {
        console.error('User not found during confirmation for email:', email);
        setError('User not found');
        return;
      }

      // Verify user status
      if (users[userIndex].status === 'active') {
        console.log('User already confirmed during update:', users[userIndex]);
        setError('Account is already confirmed');
        return;
      }

      if (users[userIndex].status === 'inactive') {
        console.log('User inactive during update:', users[userIndex]);
        setError('Account is deactivated. Please contact administrator');
        return;
      }

      // Update user status and password
      const updatedUser = {
        ...users[userIndex],
        status: 'active',
        password: newPassword,
        lastLogin: new Date().toISOString()
      };
      users[userIndex] = updatedUser;
      console.log('Updating user to:', updatedUser);

      // Save updated users
      localStorage.setItem('domainUsers', JSON.stringify(users));
      console.log('Saved updated users to localStorage');

      // Log the confirmation
      loggingService.addLog(
        updatedUser,
        'CONFIRM_ACCOUNT',
        'User confirmed account and set new password',
        '/confirm-account'
      );

      setConfirmed(true);
      console.log('Account confirmation successful');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Failed to confirm account:', error);
      setError('Failed to confirm account. Please try again.');
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
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          pt: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <LockResetIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Confirm Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please set a new password to activate your account
            </Typography>
          </Box>

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

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              disabled
              sx={{ mb: 3 }}
              InputProps={{
                sx: { bgcolor: 'action.hover' }
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Password must:
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Be at least 8 characters long</li>
                <li>Contain at least one uppercase letter</li>
                <li>Contain at least one lowercase letter</li>
                <li>Contain at least one number</li>
              </ul>
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                mt: 2,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Confirm Account
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 