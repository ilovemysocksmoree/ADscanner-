import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loggingService } from '../../services/LoggingService';
import { EmailService } from '../../services/EmailService';

interface DomainGroup {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  groupId: string;
  role: string;
  status: 'pending' | 'active' | 'inactive';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  groupId?: string;
  role?: string;
}

const generatePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export default function AddDomainUser() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [groups] = useState<DomainGroup[]>(() => {
    const saved = localStorage.getItem('domainGroups');
    return saved ? JSON.parse(saved) : [];
  });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: generatePassword(),
    groupId: location.state?.groupId || '',
    role: 'user',
    status: 'pending',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    if (userId) {
      const savedUsers = localStorage.getItem('domainUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      const userToEdit = users.find((u: any) => u.id === userId);
      
      if (userToEdit) {
        setFormData({
          ...userToEdit,
          password: '', // Don't load existing password
        });
      } else {
        setError('User not found');
      }
    }

    loggingService.addLog(
      user,
      'PAGE_VIEW',
      userId ? 'Editing domain user' : 'Adding new domain user',
      '/admin/add-domain-user'
    );
  }, [user, navigate, userId]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!userId && !formData.password) {
      errors.password = 'Password is required for new users';
      isValid = false;
    }

    if (!formData.groupId) {
      errors.groupId = 'Domain group is required';
      isValid = false;
    }

    if (!formData.role) {
      errors.role = 'Role is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      const savedUsers = localStorage.getItem('domainUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      if (userId) {
        // Update existing user
        const updatedUsers = users.map((u: any) =>
          u.id === userId ? { ...formData, id: userId } : u
        );
        localStorage.setItem('domainUsers', JSON.stringify(updatedUsers));
        
        loggingService.addLog(
          user,
          'UPDATE_USER',
          `Updated user: ${formData.email}`,
          '/admin/add-domain-user'
        );
        
        setSuccess('User updated successfully');
      } else {
        // Add new user
        const newUser = {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          lastLogin: null,
          status: 'pending',
        };
        
        localStorage.setItem('domainUsers', JSON.stringify([...users, newUser]));
        
        // Send confirmation email using EmailService
        try {
          await EmailService.sendConfirmationEmail(
            formData.email,
            formData.password,
            formData.name
          );
          
          loggingService.addLog(
            user,
            'CREATE_USER',
            `Created new user: ${formData.email} and sent confirmation email`,
            '/admin/add-domain-user'
          );
          
          setSuccess('User created successfully and confirmation email sent');
        } catch (error) {
          console.error('Failed to send confirmation email:', error);
          loggingService.addLog(
            user,
            'ERROR',
            `Failed to send confirmation email to: ${formData.email}`,
            '/admin/add-domain-user'
          );
          
          setError('User created but failed to send confirmation email. Please try sending it again.');
        }
      }

      // Update group user count
      const savedGroups = localStorage.getItem('domainGroups');
      if (savedGroups) {
        const groups = JSON.parse(savedGroups);
        const updatedGroups = groups.map((g: DomainGroup) => ({
          ...g,
          userCount: users.filter((u: any) => u.groupId === g.id).length,
        }));
        localStorage.setItem('domainGroups', JSON.stringify(updatedGroups));
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/domain-users');
      }, 1500);
    } catch (error) {
      setError('Failed to save user');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
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

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {userId ? 'Edit Domain User' : 'Add Domain User'}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />

          {!userId && (
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{ mb: 2 }}
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
          )}

          {!userId && (
            <Button
              variant="outlined"
              onClick={handleGeneratePassword}
              sx={{ mb: 2 }}
            >
              Generate Random Password
            </Button>
          )}

          <FormControl fullWidth error={!!formErrors.groupId} sx={{ mb: 2 }}>
            <InputLabel>Domain Group</InputLabel>
            <Select
              name="groupId"
              value={formData.groupId}
              onChange={handleInputChange}
              label="Domain Group"
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.groupId && (
              <FormHelperText>{formErrors.groupId}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={!!formErrors.role} sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            {formErrors.role && (
              <FormHelperText>{formErrors.role}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/domain-users')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {userId ? 'Save Changes' : 'Add User'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
} 