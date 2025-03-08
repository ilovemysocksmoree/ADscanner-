import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Router as RouterIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import AlertBar from '../components/AlertBar';
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { HeatMapGrid } from 'react-grid-heatmap';

interface NetworkDevice {
  ip: string;
  hostname: string;
  type: 'computer' | 'router';
  services: {
    port: number;
    name: string;
    status: string;
  }[];
}

interface NetworkAlert {
  id: string;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  deviceIp?: string;
}

interface AnalysisDetails {
  timestamp: string;
  totalPackets: number;
  totalBytes: number;
  duration: string;
  protocols: typeof mockProtocolData;
  endpoints: typeof mockEndpointData;
  applications: typeof mockAppData;
  topTalkers: {
    ip: string;
    packets: number;
    bytes: string;
    protocols: string[];
  }[];
  suspiciousActivities: {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }[];
}

interface MITREAttack {
  technique: string;
  tactic: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface NetworkMetrics {
  timestamp: string;
  inboundTraffic: number;
  outboundTraffic: number;
  activeConnections: number;
  anomalyScore: number;
}

interface VulnerabilityData {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedDevices: string[];
  mitigation: string;
}

const mockDevices: NetworkDevice[] = [
  {
    ip: '192.168.1.1',
    hostname: 'Gateway-Router',
    type: 'router',
    services: [
      { port: 80, name: 'HTTP', status: 'open' },
      { port: 443, name: 'HTTPS', status: 'open' },
      { port: 53, name: 'DNS', status: 'open' },
    ],
  },
  {
    ip: '192.168.1.100',
    hostname: 'Desktop-PC',
    type: 'computer',
    services: [
      { port: 445, name: 'SMB', status: 'open' },
      { port: 139, name: 'NetBIOS', status: 'open' },
    ],
  },
];

const mockNetworkAlerts: NetworkAlert[] = [
  {
    id: '1',
    title: 'Suspicious Network Activity',
    message: 'Unusual port scanning detected from device 192.168.1.150',
    severity: 'error',
    deviceIp: '192.168.1.150',
  },
  {
    id: '2',
    title: 'New Device Detected',
    message: 'Unrecognized device joined the network: 192.168.1.200',
    severity: 'warning',
    deviceIp: '192.168.1.200',
  },
];

export default function NetworkScanner() {
  const { user } = useAuth();
  const [networkRange, setNetworkRange] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>(mockNetworkAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleStartScan = () => {
    setIsScanning(true);
    loggingService.addLog(
      user,
      'START_NETWORK_SCAN',
      `Started network scan on range: ${networkRange}`,
      '/network-scanner'
    );

    // Simulate network scan
    setTimeout(() => {
      setDevices(mockDevices);
      setIsScanning(false);
      
      // Simulate finding new network activity
      const newAlert: NetworkAlert = {
        id: Date.now().toString(),
        title: 'Network Anomaly Detected',
        message: `Unusual traffic pattern detected in network range ${networkRange}`,
        severity: 'warning',
      };
      setAlerts(prev => [...prev, newAlert]);

      loggingService.addLog(
        user,
        'NETWORK_SCAN_COMPLETE',
        `Completed network scan on range: ${networkRange}. Found ${mockDevices.length} devices`,
        '/network-scanner'
      );
    }, 3000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    loggingService.addLog(
      user,
      'STOP_NETWORK_SCAN',
      `Stopped network scan on range: ${networkRange}`,
      '/network-scanner'
    );
  };

  const handleTakeAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Investigating network activity${alert?.deviceIp ? ` for device ${alert.deviceIp}` : ''}`);
    setSnackbarOpen(true);
    setAlerts(alerts.filter(alert => alert.id !== alertId));

    loggingService.addLog(
      user,
      'NETWORK_ALERT_ACTION',
      `Took action on network alert: ${alert?.title}`,
      '/network-scanner'
    );
  };

  const handleMarkBenign = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage('Network activity marked as normal');
    setSnackbarOpen(true);
    setAlerts(alerts.filter(alert => alert.id !== alertId));

    loggingService.addLog(
      user,
      'NETWORK_ALERT_BENIGN',
      `Marked network alert as benign: ${alert?.title}`,
      '/network-scanner'
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      // Simulate analysis
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 2000);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 2000);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAnalyzeFile = () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setShowDetailedResults(false);
    loggingService.addLog(
      user,
      'PCAP_ANALYSIS_START',
      `Started analysis of PCAP file: ${file.name}`,
      '/network-scanner'
    );

    // Simulate PCAP analysis
    setTimeout(() => {
      const mockAnalysisDetails: AnalysisDetails = {
        timestamp: new Date().toISOString(),
        totalPackets: 15420,
        totalBytes: 2345678,
        duration: '00:15:30',
        protocols: mockProtocolData,
        endpoints: mockEndpointData,
        applications: mockAppData,
        topTalkers: [
          {
            ip: '192.168.1.100',
            packets: 5230,
            bytes: '1.2 GB',
            protocols: ['HTTP', 'DNS', 'TLS']
          },
          {
            ip: '192.168.1.150',
            packets: 3150,
            bytes: '850 MB',
            protocols: ['SMTP', 'TLS']
          }
        ],
        suspiciousActivities: [
          {
            type: 'Port Scan',
            description: 'Rapid connection attempts to multiple ports',
            severity: 'high',
            timestamp: new Date().toISOString()
          },
          {
            type: 'Data Exfiltration',
            description: 'Large outbound data transfer detected',
            severity: 'medium',
            timestamp: new Date().toISOString()
          }
        ]
      };

      setAnalysisResults({
        protocols: mockProtocolData,
        endpoints: mockEndpointData,
        applications: mockAppData
      });
      setAnalysisDetails(mockAnalysisDetails);
      setIsAnalyzing(false);
      setShowDetailedResults(true);
      setSnackbarMessage('PCAP file analysis completed successfully');
      setSnackbarOpen(true);
      
      loggingService.addLog(
        user,
        'PCAP_ANALYSIS_COMPLETE',
        `Completed analysis of PCAP file: ${file.name}`,
        '/network-scanner'
      );
    }, 3000);
  };

  const handleExportResults = () => {
    if (!analysisDetails) return;

    const exportData = {
      fileInfo: {
        name: file?.name,
        analyzedAt: analysisDetails.timestamp
      },
      summary: {
        totalPackets: analysisDetails.totalPackets,
        totalBytes: analysisDetails.totalBytes,
        duration: analysisDetails.duration
      },
      protocols: analysisDetails.protocols,
      endpoints: analysisDetails.endpoints,
      applications: analysisDetails.applications,
      topTalkers: analysisDetails.topTalkers,
      suspiciousActivities: analysisDetails.suspiciousActivities
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pcap-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSnackbarMessage('Analysis results exported successfully');
    setSnackbarOpen(true);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, deviceIp: string) => {
    setSelectedDevice(deviceIp);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedDevice(null);
  };

  const handleBlockIP = () => {
    if (selectedDevice) {
      setSnackbarMessage(`Blocked IP: ${selectedDevice}`);
      setSnackbarOpen(true);
      handleActionMenuClose();
    }
  };

  const handleIsolateDevice = () => {
    if (selectedDevice) {
      setSnackbarMessage(`Isolated device: ${selectedDevice}`);
      setSnackbarOpen(true);
      handleActionMenuClose();
    }
  };

  const handleGenerateReport = () => {
    if (selectedDevice) {
      setSnackbarMessage(`Generating security report for: ${selectedDevice}`);
      setSnackbarOpen(true);
      handleActionMenuClose();
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header with Dark Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Network Scanner Dashboard</Typography>
        <ToggleButton
          value="darkMode"
          selected={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </ToggleButton>
      </Box>

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="network analysis tabs">
          <Tab label="Network Scan" icon={<NetworkCheckIcon />} {...a11yProps(0)} />
          <Tab label="Protocol Analysis" icon={<AssessmentIcon />} {...a11yProps(1)} />
          <Tab label="Endpoint Analysis" icon={<ComputerIcon />} {...a11yProps(2)} />
          <Tab label="Application Analysis" icon={<AppsIcon />} {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        {/* Existing Network Scan Configuration */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Network Scan Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Network Range (CIDR)"
                    value={networkRange}
                    onChange={(e) => setNetworkRange(e.target.value)}
                    disabled={isScanning}
                    helperText="Example: 192.168.1.0/24"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color={isScanning ? 'error' : 'primary'}
                    startIcon={isScanning ? <StopIcon /> : <StartIcon />}
                    onClick={isScanning ? handleStopScan : handleStartScan}
                    sx={{ mr: 2 }}
                  >
                    {isScanning ? 'Stop Scan' : 'Start Network Scan'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

        {/* Scan Results */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Discovered Devices
            </Typography>
            {isScanning ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {devices.map((device, index) => (
                  <div key={device.ip}>
                    <ListItem>
                      <ListItemIcon>
                        {device.type === 'router' ? (
                          <RouterIcon color="primary" />
                        ) : (
                          <ComputerIcon color="primary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{device.hostname}</Typography>
                            <Chip
                              label={device.ip}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Open Services:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {device.services.map((service) => (
                                <Chip
                                  key={service.port}
                                  label={`${service.name} (${service.port})`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < devices.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            )}
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