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
  Paper,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LightMode,
  DarkMode,
  MenuBook,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginProps {
  darkMode: boolean;
  onThemeChange: () => void;
}

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

export default function Login({ darkMode, onThemeChange }: LoginProps) {
  const navigate = useNavigate();
  const { login, signInWithGoogle, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        await login(formData.email, formData.password);
        navigate('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign in');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Failed to sign in with Google');
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side - Illustration */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          bgcolor: 'primary.main',
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
          <MenuBook sx={{ fontSize: 120, mb: 4, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Ready to start your
          </Typography>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
            success story?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
            Join us to secure your network and protect your digital assets today!
          </Typography>
        </Box>
      </Box>

      {/* Right side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 4,
          pt: 8,
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Theme Toggle */}
        <IconButton
          onClick={onThemeChange}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'text.primary',
          }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>

        <Box sx={{ width: '100%', maxWidth: '600px', mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to access your dashboard
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: '600px',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{
              mb: 3,
              py: 1.5,
              borderRadius: 1,
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            CONTINUE WITH GOOGLE
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
              OR
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
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
              error={!!formErrors.password}
              helperText={formErrors.password}
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
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {isRegistering && (
              <>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  error={!!formErrors.companyName}
                  helperText={formErrors.companyName}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'background.paper',
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mb: 2.5,
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {isRegistering ? 'Register' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Button
                onClick={() => setIsRegistering(!isRegistering)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.95rem',
                }}
              >
                {isRegistering
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Register"}
              </Button>
            </Box>
          </form>

          {/* Test Accounts Info */}
          <Box 
            sx={{ 
              mt: 2,
              p: 2.5,
              borderRadius: 1,
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Test Accounts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Admin: admin@company.com / admin@123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              User: user@company.com / user@123
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 