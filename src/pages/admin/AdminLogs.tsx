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
import { loggingService, LogEntry } from '../../services/LoggingService';

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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = !selectedAction || log.action === selectedAction;
    
    const matchesCategory = !selectedCategory || 
      Object.entries(actionCategories).find(([category, actions]) => 
        category === selectedCategory && actions.includes(log.action)
      );

    const logDate = new Date(log.timestamp);
    const matchesDateRange = (
      (!dateRange.start || logDate >= new Date(dateRange.start)) &&
      (!dateRange.end || logDate <= new Date(dateRange.end))
    );

    return matchesSearch && matchesAction && matchesCategory && matchesDateRange;
  });

  const handleExport = () => {
    const csvData = [
      ['Timestamp', 'User Email', 'Action', 'Details', 'IP Address', 'Path'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userEmail,
        log.action,
        log.details,
        log.ipAddress || '',
        log.path || ''
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

    loggingService.addLog(
      user,
      'EXPORT_LOGS',
      `Exported ${filteredLogs.length} log entries`,
      '/admin/logs'
    );
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      loggingService.clearLogs();
      setLogs([]);
      loggingService.addLog(
        user,
        'CLEAR_LOGS',
        'Cleared all activity logs',
        '/admin/logs'
      );
    }
  };

  const getActionColor = (action: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (action.includes('ERROR') || action.includes('DELETE')) return 'error';
    if (action.includes('CREATE') || action.includes('ADD')) return 'success';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    if (action.includes('SCAN')) return 'info';
    if (action.includes('LOGIN') || action.includes('REGISTER')) return 'primary';
    if (action.includes('ALERT')) return 'secondary';
    return 'default';
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
            onClick={handleExport}
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Path</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.userEmail}</TableCell>
                <TableCell>
                  <Chip
                    label={log.action.replace(/_/g, ' ')}
                    color={getActionColor(log.action)}
                    size="small"
                    sx={{ minWidth: 120 }}
                  />
                </TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
                <TableCell>{log.path}</TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 