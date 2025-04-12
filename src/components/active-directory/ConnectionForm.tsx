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
  Divider
} from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';
import { activeDirectoryService, HealthCheckResponse } from '../../services/ActiveDirectoryService';
import { useAuth } from '../../contexts/AuthContext';

interface ConnectionFormProps {
  onConnect?: () => void;
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
        setSuccess('Connection test successful!');
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
        setError('Connection test failed. Server is not healthy.');
      }
    } catch (err) {
      setError('Failed to connect to Active Directory server');
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
      await activeDirectoryService.connect(serverIP, domain, username, password);
      setSuccess('Successfully connected to Active Directory!');
      
      // Log the successful connection
      if (user) {
        activeDirectoryService.logOperation(
          user,
          'AD_CONNECT',
          `Connected to AD server: ${serverIP} with domain: ${domain}`
        );
      }
      
      if (onConnect) {
        onConnect();
      }
    } catch (err) {
      setError('Failed to connect to Active Directory');
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseHealthDialog = () => {
    setHealthDialogOpen(false);
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
        />

        <Box sx={{ mt: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleTestConnection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
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

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={loading || !success}
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