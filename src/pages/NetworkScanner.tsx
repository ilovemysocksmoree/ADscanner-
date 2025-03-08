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
  Card,
  CardContent,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Router as RouterIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  UploadFile,
  NetworkCheck,
  DeviceHub,
  Layers,
  InfoOutlined,
  Delete,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  BugReport as BugIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  DeviceUnknown as IsolateIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
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

// Mock data - replace with real data in production
const mockProtocolData = [
  { name: 'TCP', value: 45 },
  { name: 'UDP', value: 25 },
  { name: 'HTTP', value: 20 },
  { name: 'HTTPS', value: 10 },
];

const mockEndpointData = [
  { ip: '192.168.1.1', packets: 1500, bytes: '1.2 MB', status: 'active' },
  { ip: '192.168.1.2', packets: 800, bytes: '750 KB', status: 'inactive' },
  { ip: '192.168.1.3', packets: 2000, bytes: '2.1 MB', status: 'active' },
];

const mockAppData = [
  { name: 'HTTP', requests: 150 },
  { name: 'DNS', requests: 80 },
  { name: 'SMTP', requests: 45 },
  { name: 'FTP', requests: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Mock data for new features
const mockNetworkMetrics: NetworkMetrics[] = [
  // Add mock network metrics data
];

const mockVulnerabilities: VulnerabilityData[] = [
  {
    id: 'CVE-2023-001',
    title: 'Critical SQL Injection Vulnerability',
    severity: 'critical',
    description: 'SQL injection vulnerability in web application',
    affectedDevices: ['192.168.1.100', '192.168.1.101'],
    mitigation: 'Update web application to latest version'
  },
  // Add more mock vulnerabilities
];

const mockMITREAttacks: MITREAttack[] = [
  {
    technique: 'T1046',
    tactic: 'Discovery',
    description: 'Network Service Scanning',
    severity: 'high'
  },
  // Add more MITRE ATT&CK data
];

// Styled components
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function NetworkScanner() {
  const { user } = useAuth();
  const [networkRange, setNetworkRange] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>(mockNetworkAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    protocols: typeof mockProtocolData;
    endpoints: typeof mockEndpointData;
    applications: typeof mockAppData;
  } | null>(null);
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityData[]>(mockVulnerabilities);
  const [mitreAttacks, setMitreAttacks] = useState<MITREAttack[]>(mockMITREAttacks);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  const theme = useTheme();

  // Simulate real-time network metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetric: NetworkMetrics = {
        timestamp: new Date().toISOString(),
        inboundTraffic: Math.random() * 1000,
        outboundTraffic: Math.random() * 800,
        activeConnections: Math.floor(Math.random() * 100),
        anomalyScore: Math.random()
      };
      setNetworkMetrics(prev => [...prev.slice(-19), newMetric]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

      <Grid container spacing={3}>
        {/* Scan Configuration */}
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

        {/* PCAP File Upload Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <UploadFile color="primary" />
              PCAP File Upload and Analysis
            </Typography>
            <input
              type="file"
              accept=".pcap,.pcapng"
              id="pcap-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="pcap-upload">
              <UploadBox
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {isAnalyzing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress />
                    <Typography>Analyzing PCAP file...</Typography>
                  </Box>
                ) : file ? (
                  <Box>
                    <Typography variant="body1">{file.name}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAnalyzeFile}
                        startIcon={<NetworkCheck />}
                      >
                        Analyze File
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => {
                          setFile(null);
                          setAnalysisResults(null);
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <UploadFile sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography>
                      Drag and drop your PCAP file here, or click to select
                    </Typography>
                  </Box>
                )}
              </UploadBox>
            </label>
          </Paper>
        </Grid>

        {/* Detailed Analysis Results Section */}
        {showDetailedResults && analysisDetails && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Detailed Analysis Results
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportResults}
                >
                  Export Results
                </Button>
              </Box>

              <Grid container spacing={3}>
                {/* Summary Stats */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ minWidth: 200 }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Packets
                        </Typography>
                        <Typography variant="h5">
                          {analysisDetails.totalPackets.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ minWidth: 200 }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Data
                        </Typography>
                        <Typography variant="h5">
                          {(analysisDetails.totalBytes / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ minWidth: 200 }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Duration
                        </Typography>
                        <Typography variant="h5">
                          {analysisDetails.duration}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>

                {/* Top Talkers */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Top Talkers
                  </Typography>
                  <List>
                    {analysisDetails.topTalkers.map((talker, index) => (
                      <React.Fragment key={talker.ip}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {talker.ip}
                                <Chip
                                  size="small"
                                  label={`${talker.packets} packets`}
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  Data Transfer: {talker.bytes}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                  {talker.protocols.map((protocol) => (
                                    <Chip
                                      key={protocol}
                                      label={protocol}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < analysisDetails.topTalkers.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>

                {/* Suspicious Activities */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Suspicious Activities
                  </Typography>
                  <List>
                    {analysisDetails.suspiciousActivities.map((activity, index) => (
                      <React.Fragment key={activity.type}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {activity.type}
                                <Chip
                                  size="small"
                                  label={activity.severity}
                                  color={
                                    activity.severity === 'high' ? 'error' :
                                    activity.severity === 'medium' ? 'warning' : 'info'
                                  }
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  {activity.description}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < analysisDetails.suspiciousActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Protocol Analysis Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NetworkCheck color="primary" />
              Protocol Analysis
              <Tooltip title="Distribution of network protocols in the captured traffic">
                <IconButton size="small">
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisResults?.protocols || mockProtocolData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analysisResults?.protocols || mockProtocolData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Endpoint Analysis Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DeviceHub color="primary" />
              Endpoint Analysis
            </Typography>
            <List>
              {(analysisResults?.endpoints || mockEndpointData).map((endpoint, index) => (
                <React.Fragment key={endpoint.ip}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {endpoint.ip}
                          <Chip
                            size="small"
                            label={endpoint.status}
                            color={endpoint.status === 'active' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                      secondary={`Packets: ${endpoint.packets} | Data: ${endpoint.bytes}`}
                    />
                  </ListItem>
                  {index < (analysisResults?.endpoints || mockEndpointData).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Application Layer Analysis Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Layers color="primary" />
              Application Layer Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysisResults?.applications || mockAppData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="requests" fill="#8884d8">
                  {(analysisResults?.applications || mockAppData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Real-time Network Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Live Network Traffic</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={networkMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="inboundTraffic"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Inbound"
                />
                <Area
                  type="monotone"
                  dataKey="outboundTraffic"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Network Health Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Network Health</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>85%</Typography>
              <LinearProgress variant="determinate" value={85} color="success" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6">Active Threats</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>3</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeviceHub color="info" />
                <Typography variant="h6">Active Devices</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>{devices.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugIcon color="error" />
                <Typography variant="h6">Vulnerabilities</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>{vulnerabilities.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* MITRE ATT&CK Mapping */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>MITRE ATT&CK Mapping</Typography>
            <List>
              {mitreAttacks.map((attack) => (
                <ListItem key={attack.technique}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {attack.technique} - {attack.tactic}
                        <Chip
                          size="small"
                          label={attack.severity}
                          color={
                            attack.severity === 'high' ? 'error' :
                            attack.severity === 'medium' ? 'warning' : 'info'
                          }
                        />
                      </Box>
                    }
                    secondary={attack.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Vulnerability Assessment */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Vulnerability Assessment</Typography>
            <List>
              {vulnerabilities.map((vuln) => (
                <ListItem key={vuln.id}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {vuln.title}
                        <Chip
                          size="small"
                          label={vuln.severity}
                          color={
                            vuln.severity === 'critical' ? 'error' :
                            vuln.severity === 'high' ? 'warning' :
                            vuln.severity === 'medium' ? 'info' : 'default'
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">{vuln.description}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Affected Devices: {vuln.affectedDevices.join(', ')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Device Discovery Section with Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Device Discovery</Typography>
            <List>
              {devices.map((device) => (
                <ListItem
                  key={device.ip}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => handleActionMenuOpen(e, device.ip)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {device.type === 'router' ? <RouterIcon /> : <ComputerIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {device.hostname}
                        <Chip label={device.ip} size="small" variant="outlined" />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Type: {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
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
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={handleBlockIP}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Block IP</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleIsolateDevice}>
            <ListItemIcon>
              <IsolateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Isolate Device</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleGenerateReport}>
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Report</ListItemText>
          </MenuItem>
        </Menu>
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