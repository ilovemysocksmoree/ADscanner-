import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle, 
  Close, 
  Https, 
  Lock, 
  Person, 
  Public, 
  Info
} from '@mui/icons-material';
import { activeDirectoryService, HealthCheckResponse, ConnectionResponse } from '../../services/ActiveDirectoryService';
import { useAuth } from '../../contexts/AuthContext';

interface ConnectionFormProps {
  onConnect?: (serverIP: string) => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnect }) => {
  const { user } = useAuth();
  const [serverIP, setServerIP] = useState('');
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [healthCheckData, setHealthCheckData] = useState<HealthCheckResponse | null>(null);
  const [connectionData, setConnectionData] = useState<ConnectionResponse | null>(null);

  const handleTestConnection = async () => {
    if (!serverIP) {
      setError('Please enter the Active Directory server IP address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the service to check health
      const data = await activeDirectoryService.checkHealth(serverIP);
      setHealthCheckData(data);
      
      if (data.status === 'success' && data.stats.healthy) {
        setSuccess('Connection test successful! Server is healthy and ready.');
        setHealthDialogOpen(true);
        
        // Log the successful health check
        if (user) {
          activeDirectoryService.logOperation(
            user,
            'AD_HEALTH_CHECK',
            `Health check successful for server: ${serverIP}`
          );
        }
      } else {
        setError(`Connection test failed. Server reported: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to connect to Active Directory server: ${err.message}`);
      } else {
        setError('Failed to connect to Active Directory server: Unknown error');
      }
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!serverIP || !domain || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the service to connect
      const data = await activeDirectoryService.connect(serverIP, domain, username, password);
      setConnectionData(data);
      
      if (data.status === 'success') {
        setSuccess(`Successfully connected to Active Directory! ${data.message || ''}`);
        
        // Log the successful connection
        if (user) {
          activeDirectoryService.logOperation(
            user,
            'AD_CONNECT',
            `Connected to AD server: ${serverIP} with domain: ${domain}`
          );
        }
        
        if (onConnect) {
          onConnect(serverIP);
        }
      } else {
        setError(`Connection failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to connect to Active Directory: ${err.message}`);
      } else {
        setError('Failed to connect to Active Directory: Unknown error');
      }
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseHealthDialog = () => {
    setHealthDialogOpen(false);
  };

  const isIPValid = (ip: string): boolean => {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ip ? ipPattern.test(ip) : true;
  };

  return (
    <>
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
          label="Server IP Address"
          placeholder="e.g., 192.168.1.8"
          value={serverIP}
          onChange={(e) => setServerIP(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
          error={serverIP !== '' && !isIPValid(serverIP)}
          helperText={serverIP !== '' && !isIPValid(serverIP) ? "Please enter a valid IP address" : ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Public />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Enter the IP address of your Active Directory server">
                  <Info color="action" fontSize="small" />
                </Tooltip>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ mt: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleTestConnection}
            disabled={loading || !isIPValid(serverIP) || !serverIP}
            startIcon={loading ? <CircularProgress size={20} /> : <Https />}
          >
            Test Connection
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Authentication Details
        </Typography>

        <TextField
          label="Domain"
          placeholder="e.g., example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading || !success}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Public />
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="Username"
          placeholder="e.g., administrator or admin@example.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading || !success}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading || !success}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={loading || !success || !domain || !username || !password}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
            color="primary"
          >
            Connect
          </Button>
        </Box>
      </Paper>

      {/* Health Check Results Dialog */}
      <Dialog 
        open={healthDialogOpen} 
        onClose={handleCloseHealthDialog}
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            Active Directory Health Check
          </Box>
          <IconButton onClick={handleCloseHealthDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {healthCheckData && (
            <Box component="pre" sx={{ 
              p: 2, 
              backgroundColor: 'rgba(0, 0, 0, 0.05)', 
              borderRadius: 1,
              overflow: 'auto'
            }}>
              {JSON.stringify(healthCheckData, null, 4)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHealthDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConnectionForm; 