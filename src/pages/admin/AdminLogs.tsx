import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loggingService } from '../../services/LoggingService';
import ConnectionForm from '../../components/active-directory/ConnectionForm';
import { LogEvent } from '../../interfaces/common';

// Define the LogEntry interface locally if it's not exported
interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  path: string;
}

const actionTypes = [
  // Authentication
  'LOGIN',
  'LOGOUT',
  'REGISTER',
  'PASSWORD_RESET',
  'ACCOUNT_CONFIRMATION',
  
  // User Management
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'EXPORT_USERS',
  
  // Domain Groups
  'CREATE_DOMAIN_GROUP',
  'UPDATE_DOMAIN_GROUP',
  'DELETE_DOMAIN_GROUP',
  
  // Role Management
  'ADD_ROLE',
  'EDIT_ROLE',
  'DELETE_ROLE',
  
  // Scanning Activities
  'START_VULNERABILITY_SCAN',
  'STOP_VULNERABILITY_SCAN',
  'VULNERABILITY_SCAN_COMPLETE',
  'VULNERABILITY_SCAN_ERROR',
  'START_NETWORK_SCAN',
  'STOP_NETWORK_SCAN',
  'NETWORK_SCAN_COMPLETE',
  'NETWORK_SCAN_ERROR',
  
  // Alerts and Actions
  'VULNERABILITY_ACTION_TAKEN',
  'VULNERABILITY_MARKED_BENIGN',
  'NETWORK_ALERT_ACTION',
  'NETWORK_ALERT_BENIGN',
  
  // Reports
  'GENERATE_REPORT',
  'EXPORT_REPORT',
  'DOWNLOAD_REPORT',
  'SHARE_REPORT',
  
  // System
  'PAGE_VIEW',
  'EXPORT_LOGS',
  'CLEAR_LOGS',
];

const actionCategories = {
  'Authentication': ['LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_RESET', 'ACCOUNT_CONFIRMATION'],
  'User Management': ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'EXPORT_USERS'],
  'Domain Groups': ['CREATE_DOMAIN_GROUP', 'UPDATE_DOMAIN_GROUP', 'DELETE_DOMAIN_GROUP'],
  'Role Management': ['ADD_ROLE', 'EDIT_ROLE', 'DELETE_ROLE'],
  'Scanning': [
    'START_VULNERABILITY_SCAN', 'STOP_VULNERABILITY_SCAN', 'VULNERABILITY_SCAN_COMPLETE', 'VULNERABILITY_SCAN_ERROR',
    'START_NETWORK_SCAN', 'STOP_NETWORK_SCAN', 'NETWORK_SCAN_COMPLETE', 'NETWORK_SCAN_ERROR'
  ],
  'Alerts': ['VULNERABILITY_ACTION_TAKEN', 'VULNERABILITY_MARKED_BENIGN', 'NETWORK_ALERT_ACTION', 'NETWORK_ALERT_BENIGN'],
  'Reports': ['GENERATE_REPORT', 'EXPORT_REPORT', 'DOWNLOAD_REPORT', 'SHARE_REPORT'],
  'System': ['PAGE_VIEW', 'EXPORT_LOGS', 'CLEAR_LOGS']
};

export default function AdminLogs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    user: '',
  });
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    // Load logs
    const allLogs = loggingService.getLogs();
    setLogs(allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));

    // Log this view
    loggingService.addLog(user, 'PAGE_VIEW', 'Viewed admin logs', '/admin/logs');
  }, [user, navigate]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = !selectedAction || log.eventType === selectedAction;
    
    if (selectedCategory) {
      const category = actionTypes.find(action => action === log.eventType)?.split('_')[0];
      return matchesSearch && matchesAction && category === selectedCategory;
    }
    
    return matchesSearch && matchesAction;
  });

  const handleExportLogs = () => {
    const csvData = [
      ['Timestamp', 'User ID', 'Event Type', 'Message', 'Context'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userId,
        log.eventType,
        log.message,
        log.context || ''
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toISOString()}.csv`;
    link.click();

    if (user) {
      loggingService.addLog(
        user,
        'EXPORT_LOGS',
        `Exported ${filteredLogs.length} log entries`,
        '/admin/logs'
      );
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      loggingService.clearLogs();
      setLogs([]);
      
      if (user) {
        loggingService.addLog(
          user,
          'CLEAR_LOGS',
          'Cleared all activity logs',
          '/admin/logs'
        );
      }
    }
  };

  const getActionColor = (eventType: string) => {
    // Map action prefixes to colors
    const actionColors: Record<string, 'success' | 'error' | 'info' | 'warning' | 'default'> = {
      LOGIN: 'success',
      LOGOUT: 'info',
      REGISTER: 'success',
      PASSWORD: 'warning',
      ACCOUNT: 'info',
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'error',
      EXPORT: 'info',
      GENERATE: 'info',
      START: 'success',
      STOP: 'warning',
      ERROR: 'error',
      VULNERABILITY: 'warning',
      NETWORK: 'info',
      DOMAIN: 'info',
      ROLE: 'info',
      CLEAR: 'error',
    };

    // Find matching prefix
    const prefix = Object.keys(actionColors).find(prefix => 
      eventType.startsWith(prefix)
    );

    return prefix ? actionColors[prefix] : 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Activity Logs
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportLogs}
            sx={{ mr: 2 }}
          >
            Export Logs
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearLogs}
          >
            Clear Logs
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedAction(''); // Reset action when category changes
            }}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {Object.keys(actionCategories).map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Action Type</InputLabel>
          <Select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            label="Action Type"
          >
            <MenuItem value="">All Actions</MenuItem>
            {(selectedCategory 
              ? actionCategories[selectedCategory as keyof typeof actionCategories] 
              : actionTypes
            ).map(action => (
              <MenuItem key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="date"
          label="Start Date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="date"
          label="End Date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Context</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.timestamp + log.userId + log.eventType}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.userId}</TableCell>
                <TableCell>
                  <Chip
                    label={log.eventType.replace(/_/g, ' ')}
                    color={getActionColor(log.eventType)}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.context}</TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Active Directory Connection</Typography>
        <ConnectionForm />
      </Box>
    </Box>
  );
} 