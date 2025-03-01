import React, { useState } from 'react';
import { Grid, Paper, Typography, Box, LinearProgress, Snackbar } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import AlertBar from '../components/AlertBar';

const mockData = {
  vulnerabilities: 12,
  scannedPorts: 1024,
  activeServices: 45,
  secureServices: 38,
  scanHistory: [
    { name: 'Mon', vulnerabilities: 4, ports: 150, threats: 2 },
    { name: 'Tue', vulnerabilities: 7, ports: 220, threats: 5 },
    { name: 'Wed', vulnerabilities: 12, ports: 380, threats: 8 },
    { name: 'Thu', vulnerabilities: 8, ports: 290, threats: 4 },
    { name: 'Fri', vulnerabilities: 5, ports: 180, threats: 3 },
  ],
  vulnerabilityTypes: [
    { name: 'SQL Injection', value: 4 },
    { name: 'XSS', value: 3 },
    { name: 'CSRF', value: 2 },
    { name: 'Misconfiguration', value: 5 },
  ],
  securityMetrics: [
    { name: 'Firewall', score: 85 },
    { name: 'Encryption', score: 92 },
    { name: 'Access Control', score: 78 },
    { name: 'Updates', score: 95 },
  ],
  networkTraffic: [
    { time: '00:00', inbound: 120, outbound: 80 },
    { time: '04:00', inbound: 180, outbound: 150 },
    { time: '08:00', inbound: 350, outbound: 280 },
    { time: '12:00', inbound: 420, outbound: 380 },
    { time: '16:00', inbound: 280, outbound: 250 },
    { time: '20:00', inbound: 160, outbound: 120 },
  ],
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Potential SQL Injection Detected',
    message: 'Suspicious SQL patterns detected from IP: 192.168.1.105 on port 3306',
    severity: 'error',
  },
  {
    id: '2',
    title: 'Unusual Network Traffic',
    message: 'High volume of outbound traffic detected on port 445',
    severity: 'warning',
  },
];

const StatCard = ({ title, value, icon, color, progress }: any) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: `linear-gradient(45deg, ${color}22, transparent)`,
      border: `1px solid ${color}44`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      <Box
        sx={{
          backgroundColor: `${color}22`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography color="text.secondary">{title}</Typography>
      </Box>
    </Box>
    {progress && (
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: `${color}22`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            }
          }} 
        />
      </Box>
    )}
  </Paper>
);

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTakeAction = (alertId: string) => {
    setSnackbarMessage('Taking action on the alert...');
    setSnackbarOpen(true);
    // Remove the alert from the list
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleMarkBenign = (alertId: string) => {
    setSnackbarMessage('Alert marked as benign traffic');
    setSnackbarOpen(true);
    // Remove the alert from the list
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Alerts Section */}
      <Box sx={{ mb: 3 }}>
        {alerts.map((alert) => (
          <AlertBar
            key={alert.id}
            severity={alert.severity}
            title={alert.title}
            message={alert.message}
            onTakeAction={() => handleTakeAction(alert.id)}
            onMarkBenign={() => handleMarkBenign(alert.id)}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Total Vulnerabilities"
            value={mockData.vulnerabilities}
            icon={<WarningIcon sx={{ color: '#ff9800' }} />}
            color="#ff9800"
            progress={70}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Scanned Ports"
            value={mockData.scannedPorts}
            icon={<NetworkIcon sx={{ color: '#2196f3' }} />}
            color="#2196f3"
            progress={85}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Active Services"
            value={mockData.activeServices}
            icon={<SecurityIcon sx={{ color: '#f44336' }} />}
            color="#f44336"
            progress={60}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Secure Services"
            value={mockData.secureServices}
            icon={<CheckCircleIcon sx={{ color: '#4caf50' }} />}
            color="#4caf50"
            progress={90}
          />
        </Grid>

        {/* Network Traffic Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Network Traffic Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.networkTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="inbound" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Area type="monotone" dataKey="outbound" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Vulnerability Types */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Vulnerability Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.vulnerabilityTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.vulnerabilityTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Security Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              {mockData.securityMetrics.map((metric) => (
                <Box key={metric.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{metric.name}</Typography>
                    <Typography variant="body2" color="primary">{metric.score}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#1e293b',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.score > 90 ? '#4caf50' : metric.score > 70 ? '#ff9800' : '#f44336',
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Scan History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Threat Detection History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.scanHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="threats" stroke="#ff4081" strokeWidth={2} />
                <Line type="monotone" dataKey="vulnerabilities" stroke="#ff9800" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
} 