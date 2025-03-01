import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  useTheme,
  Container,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility,
  VisibilityOff,
  LightMode,
  DarkMode,
  MenuBook,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginFormData {
  email: string;
  password: string;
  companyName?: string;
  phoneNumber?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  companyName?: string;
  phoneNumber?: string;
}

const DEFAULT_ADMIN = {
  email: 'admin@company.com',
  password: 'admin@123',
  isAdmin: true,
};

const DEFAULT_USER = {
  email: 'user@company.com',
  password: 'user@123',
  isAdmin: false,
};

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    companyName: '',
    phoneNumber: '',
  });

  const theme = useTheme();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Registration specific validations
    if (isRegistering) {
      if (!formData.companyName) {
        errors.companyName = 'Company name is required';
        isValid = false;
      }

      if (!formData.phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Phone number must be 10 digits';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await signInWithGoogle();
        navigate('/');
      } catch (err) {
        setError('Failed to sign in with Google');
      }
    },
    onError: () => {
      setError('Google sign in failed');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isRegistering) {
        await register(formData);
        navigate('/');
      } else {
        // Check for default accounts
        if (
          formData.email === DEFAULT_ADMIN.email &&
          formData.password === DEFAULT_ADMIN.password
        ) {
          await signInWithEmail(formData.email, formData.password, true);
        } else if (
          formData.email === DEFAULT_USER.email &&
          formData.password === DEFAULT_USER.password
        ) {
          await signInWithEmail(formData.email, formData.password, false);
        } else {
          throw new Error('Invalid credentials');
        }
        navigate('/');
      }
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: darkMode ? 'background.default' : '#ffffff',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Left side - Illustration */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          bgcolor: darkMode ? 'primary.dark' : '#1976d2',
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          <MenuBook sx={{ 
            fontSize: 120, 
            mb: 4, 
            opacity: 0.9,
            color: '#ffffff',
          }} />
          <Typography variant="h3" sx={{ 
            mb: 2, 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            color: '#ffffff',
          }}>
            Ready to start your
          </Typography>
          <Typography variant="h3" sx={{ 
            mb: 3,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ffffff 30%, #f8f9fa 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            success story?
          </Typography>
          <Typography variant="h6" sx={{ 
            opacity: 0.9,
            maxWidth: 400,
            mx: 'auto',
            lineHeight: 1.6,
            color: '#ffffff',
          }}>
            Join us to secure your network and protect your digital assets today!
          </Typography>
        </Box>
      </Box>

      {/* Right side - Login Form */}
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6 },
          width: { xs: '100%', md: '50%' },
          bgcolor: darkMode ? 'transparent' : '#ffffff',
        }}
      >
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            mb: 2,
            color: darkMode ? '#ffffff' : '#1565c0',
          }}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </Typography>
          <Typography variant="body1" color={darkMode ? 'text.secondary' : '#475569'}>
            {isRegistering 
              ? 'Fill in your details to get started'
              : 'Sign in to access your dashboard'}
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={!darkMode}
              onChange={() => setDarkMode(!darkMode)}
              icon={<DarkMode />}
              checkedIcon={<LightMode />}
            />
          }
          label={darkMode ? 'Dark' : 'Light'}
          sx={{ 
            position: 'absolute',
            right: 24,
            top: 24,
            color: darkMode ? '#fff' : '#475569',
          }}
        />

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={() => login()}
          sx={{ 
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            borderWidth: 2,
            borderColor: darkMode ? 'rgba(255,255,255,0.2)' : '#1976d2',
            color: darkMode ? '#fff' : '#1976d2',
            '&:hover': {
              borderWidth: 2,
              borderColor: darkMode ? 'rgba(255,255,255,0.3)' : '#1565c0',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(25,118,210,0.15)',
            },
          }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ 
          my: 4,
          '&::before, &::after': {
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
          },
        }}>
          <Typography color={darkMode ? 'text.secondary' : '#475569'} sx={{ px: 2 }}>OR</Typography>
        </Divider>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              animation: 'slideDown 0.3s ease',
              '@keyframes slideDown': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                error={!!formErrors.companyName}
                helperText={formErrors.companyName}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? '#fff' : '#475569',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: darkMode ? '#fff' : '#1e293b',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? '#fff' : '#475569',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: darkMode ? '#fff' : '#1e293b',
                  },
                }}
              />
            </>
          )}
          
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                },
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#fff' : '#475569',
              },
              '& .MuiOutlinedInput-input': {
                color: darkMode ? '#fff' : '#1e293b',
              },
            }}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            required
            error={!!formErrors.password}
            helperText={formErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: darkMode ? '#fff' : '#475569',
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                },
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#fff' : '#475569',
              },
              '& .MuiOutlinedInput-input': {
                color: darkMode ? '#fff' : '#1e293b',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: darkMode
                ? 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)'
                : 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
              },
            }}
          >
            {isRegistering ? 'Create Account' : 'Sign In'}
          </Button>

          <Button
            fullWidth
            onClick={() => {
              setIsRegistering(!isRegistering);
              setFormErrors({});
              setError(null);
            }}
            sx={{ 
              mt: 2,
              textTransform: 'none',
              fontSize: '0.9rem',
              color: darkMode ? 'text.secondary' : '#475569',
              '&:hover': {
                background: 'transparent',
                color: '#1565c0',
              },
            }}
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register"}
          </Button>
        </form>

        {!isRegistering && (
          <Box
            sx={{ 
              mt: 4,
              p: 2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              borderRadius: 2,
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
            }}
          >
            <Typography 
              variant="body2" 
              color={darkMode ? 'text.secondary' : '#1e293b'}
              align="center"
              sx={{ 
                fontSize: '0.9rem',
                mb: 1,
                fontWeight: 500,
              }}
            >
              Test Accounts
            </Typography>
            <Divider sx={{ 
              my: 1,
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
            }} />
            <Typography 
              variant="body2" 
              color={darkMode ? 'text.secondary' : '#475569'}
              align="center"
              sx={{ fontSize: '0.8rem' }}
            >
              Admin: {DEFAULT_ADMIN.email} / {DEFAULT_ADMIN.password}<br />
              User: {DEFAULT_USER.email} / {DEFAULT_USER.password}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
} 