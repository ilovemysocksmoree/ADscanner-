import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

interface ConnectionFormProps {
  onConnect?: () => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnect }) => {
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!domain || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Connection test successful!');
    } catch (err) {
      setError('Failed to connect to Active Directory');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!domain || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Successfully connected to Active Directory!');
      if (onConnect) {
        onConnect();
      }
    } catch (err) {
      setError('Failed to connect to Active Directory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Active Directory Connection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect to your Active Directory server to manage users and groups
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        label="Domain URL"
        placeholder="e.g., ad.example.com or 192.168.1.1"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        fullWidth
        margin="normal"
        disabled={loading}
      />

      <TextField
        label="Username"
        placeholder="e.g., administrator or admin@example.com"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        disabled={loading}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        disabled={loading}
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleTestConnection}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Test Connection
        </Button>
        <Button
          variant="contained"
          onClick={handleConnect}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Connect
        </Button>
      </Box>
    </Paper>
  );
};

export default ConnectionForm; 