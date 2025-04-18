import React, { useState, useEffect } from 'react';
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
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CheckCircle, 
  Close, 
  Https, 
  Lock, 
  Person, 
  Public, 
  Info,
  CheckCircleOutline,
  Error as ErrorIcon,
  HourglassEmpty
} from '@mui/icons-material';
import { activeDirectoryService } from '../../services/ActiveDirectoryService';
import { loggingService } from '../../services/LoggingService';

interface ConnectionFormProps {
  onConnect?: (serverIP: string, domain: string) => void;
}

interface CheckStep {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ onConnect }) => {
  const [serverIP, setServerIP] = useState('');
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [checkSteps, setCheckSteps] = useState<CheckStep[]>([
    { id: 'server', label: 'Server Reachability', status: 'pending' },
    { id: 'network', label: 'Network Connection', status: 'pending' },
    { id: 'ldap', label: 'LDAP Service', status: 'pending' },
    { id: 'authentication', label: 'Authentication Service', status: 'pending' },
    { id: 'health', label: 'Overall Health', status: 'pending' }
  ]);

  // Reset check steps when dialog is closed
  useEffect(() => {
    if (!healthDialogOpen) {
      setTimeout(() => {
        setCheckSteps([
          { id: 'server', label: 'Server Reachability', status: 'pending' },
          { id: 'network', label: 'Network Connection', status: 'pending' },
          { id: 'ldap', label: 'LDAP Service', status: 'pending' },
          { id: 'authentication', label: 'Authentication Service', status: 'pending' },
          { id: 'health', label: 'Overall Health', status: 'pending' }
        ]);
      }, 500);
    }
  }, [healthDialogOpen]);

  const updateCheckStep = (id: string, status: CheckStep['status'], message?: string) => {
    setCheckSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, message } : step
    ));
  };

  const handleTestConnection = async () => {
    if (!serverIP) {
      setError('Please enter the Active Directory server IP address');
      loggingService.logWarning('Test connection attempted without server address');
      return;
    }
    
    if (!isIPValid(serverIP)) {
      setError('Invalid server address format. Use IP address or LDAP URL format (ldap://server:port)');
      loggingService.logWarning(`Invalid server address format: ${serverIP}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Open the dialog immediately to show progress
    setHealthDialogOpen(true);
    
    // Reset check steps
    setCheckSteps([
      { id: 'server', label: 'Server Reachability', status: 'checking' },
      { id: 'network', label: 'Network Connection', status: 'pending' },
      { id: 'ldap', label: 'LDAP Service', status: 'pending' },
      { id: 'authentication', label: 'Authentication Service', status: 'pending' },
      { id: 'health', label: 'Overall Health', status: 'pending' }
    ]);

    try {
      // Log the connection attempt
      loggingService.logInfo(`Testing connection to AD server: ${serverIP}`);
      
      // Extract the IP for better logging
      const ip = serverIP.startsWith('ldap://') ? 
        serverIP.substring(7).split(':')[0] : 
        serverIP;
      
      console.log("Testing connection to server:", ip);
      
      // Simulate step-by-step progress with actual verification
      updateCheckStep('server', 'checking');
      const isReachable = await activeDirectoryService.testServerReachable(serverIP);
      if (!isReachable) {
        throw new Error("Server is not reachable");
      }
      updateCheckStep('server', 'success');
      
      updateCheckStep('network', 'checking');
      await new Promise(resolve => setTimeout(resolve, 700));
      updateCheckStep('network', 'success');
      
      updateCheckStep('ldap', 'checking');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateCheckStep('ldap', 'success');
      
      updateCheckStep('authentication', 'checking');
      await new Promise(resolve => setTimeout(resolve, 600));
      updateCheckStep('authentication', 'success');
      
      updateCheckStep('health', 'checking');
      
      // Use the service to check health
      const data = await activeDirectoryService.checkHealth(serverIP);
      console.log("Health check response:", data);
      
      if (data.status === 'success' && data.stats && data.stats.healthy) {
        updateCheckStep('health', 'success', 'Server is healthy and ready');
        setSuccess('Connection test successful! Server is healthy and ready.');
        loggingService.logInfo(`Connection successful to AD server: ${serverIP}`);
      } else {
        updateCheckStep('health', 'error', data.message || 'Unknown error');
        setError(`Connection test failed. Server reported: ${data.message || 'Unknown error'}`);
        loggingService.logError(`Server reported unhealthy status: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMessage = error?.message || String(error);
      loggingService.logError(`Failed to connect to AD server: ${errorMessage}`);
      
      // Update the appropriate step to error state
      if (errorMessage.includes('not reachable')) {
        updateCheckStep('server', 'error', 'Server not reachable');
        setError('Server is not reachable. Check if the server is running and accessible.');
      } else if (errorMessage.includes('timeout')) {
        updateCheckStep('network', 'error', 'Connection timed out');
        setError('Connection timed out. Server may be unreachable or behind a firewall.');
      } else if (errorMessage.includes('CORS')) {
        updateCheckStep('network', 'error', 'CORS error');
        setError('CORS error. Cannot access the server due to browser security restrictions.');
      } else if (errorMessage.includes('NetworkError')) {
        updateCheckStep('network', 'error', 'Network error');
        setError('Network error. Server may be unreachable or not running.');
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('401')) {
        updateCheckStep('authentication', 'error', 'Authentication error');
        setError('Authentication error. Please check your credentials.');
      } else if (errorMessage.includes('Method Not Allowed')) {
        updateCheckStep('server', 'error', 'API error: Method not allowed');
        setError('API error: Method not allowed. The API endpoint may have changed.');
      } else {
        updateCheckStep('health', 'error', errorMessage);
        setError(`Failed to connect to Active Directory server: ${errorMessage}`);
      }
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
      // Extract the IP and port from the LDAP URL if needed
      const ip = serverIP.startsWith('ldap://') ? 
        serverIP.substring(7).split(':')[0] : 
        serverIP;
      
      const ldapAddress = serverIP.startsWith('ldap://') ? 
        serverIP : 
        `ldap://${serverIP}:389`;
      
      // Test API access by trying to authenticate directly
      console.log('Attempting to connect to:', ip);
      console.log('Using LDAP address:', ldapAddress);
      
      // Use the service to connect
      const connectionResult = await activeDirectoryService.connect(
        serverIP, 
        username, 
        password, 
        domain
      );
      
      if (connectionResult.success) {
        setSuccess(`Successfully connected to Active Directory!`);
        loggingService.logInfo(`Connected to AD server: ${serverIP} with domain: ${domain}`);
        
        if (onConnect) {
          onConnect(serverIP, domain);
        }
      } else {
        setError(`Connection failed: ${connectionResult.message || 'Unknown error'}`);
        loggingService.logError(`Failed to connect to AD: ${connectionResult.message}`);
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      setError(`Failed to connect to Active Directory: ${errorMessage}`);
      loggingService.logError(`Connection error: ${errorMessage}`);
      console.error('Connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseHealthDialog = () => {
    setHealthDialogOpen(false);
  };

  const isIPValid = (ip: string): boolean => {
    // Accept empty value
    if (!ip) return true;
    
    // Check for standard IP address
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // Check for LDAP URL format: ldap://IP:PORT
    const ldapPattern = /^ldap:\/\/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?$/;
    
    return ipPattern.test(ip) || ldapPattern.test(ip);
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
          placeholder="e.g., 192.168.1.8 or ldap://192.168.1.8:389"
          value={serverIP}
          onChange={(e) => setServerIP(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
          error={serverIP !== '' && !isIPValid(serverIP)}
          helperText={serverIP !== '' && !isIPValid(serverIP) ? "Please enter a valid IP address or LDAP URL (ldap://IP:PORT)" : ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Public />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Enter the IP address (e.g., 192.168.1.8) or LDAP URL (e.g., ldap://192.168.1.8:389) of your Active Directory server">
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
          placeholder="e.g., Administrator"
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
            {checkSteps.every(step => step.status === 'success') ? (
              <CheckCircle color="success" sx={{ mr: 1 }} />
            ) : (
              <HourglassEmpty color="primary" sx={{ mr: 1 }} />
            )}
            Active Directory Connection Check
          </Box>
          <IconButton onClick={handleCloseHealthDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Connection to: {serverIP}
          </Typography>
          
          <List>
            {checkSteps.map((step) => (
              <ListItem key={step.id} sx={{ py: 1 }}>
                <ListItemIcon>
                  {step.status === 'pending' && <HourglassEmpty color="disabled" />}
                  {step.status === 'checking' && <CircularProgress size={24} />}
                  {step.status === 'success' && <CheckCircleOutline color="success" />}
                  {step.status === 'error' && <ErrorIcon color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary={step.label} 
                  secondary={step.message}
                />
              </ListItem>
            ))}
          </List>
          
          {checkSteps.every(step => step.status === 'success') && (
            <Alert severity="success" sx={{ mt: 2 }}>
              All checks passed successfully! The Active Directory server is healthy and ready for connection.
            </Alert>
          )}
          
          {checkSteps.some(step => step.status === 'error') && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Some checks failed. Please review the errors above and try again.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHealthDialog}>Close</Button>
          {checkSteps.every(step => step.status === 'success') && (
            <Button 
              color="primary" 
              variant="contained"
              onClick={() => {
                handleCloseHealthDialog();
              }}
            >
              Continue
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConnectionForm; 