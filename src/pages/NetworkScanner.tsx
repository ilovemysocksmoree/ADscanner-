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
  Tabs,
  Tab,
  ToggleButton,
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Router as RouterIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  NetworkCheck as NetworkCheckIcon,
  Apps as AppsIcon,
  Info as InfoIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
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
import { HeatMapGrid } from 'react-grid-heatmap';

// Constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Mock data for analysis
const mockProtocolData = [
  { protocol: 'TCP', count: 1250, percentage: 45 },
  { protocol: 'UDP', count: 850, percentage: 30 },
  { protocol: 'ICMP', count: 400, percentage: 15 },
  { protocol: 'Other', count: 280, percentage: 10 },
];

const mockEndpointData = [
  { ip: '192.168.1.100', packetsIn: 2500, packetsOut: 1800, bytesIn: 250000, bytesOut: 180000 },
  { ip: '192.168.1.101', packetsIn: 1500, packetsOut: 1200, bytesIn: 150000, bytesOut: 120000 },
];

const mockAppData = [
  { application: 'HTTP/HTTPS', connections: 450, bytesTransferred: 500000 },
  { application: 'DNS', connections: 250, bytesTransferred: 25000 },
  { application: 'SMB', connections: 150, bytesTransferred: 300000 },
];

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `network-tab-${index}`,
    'aria-controls': `network-tabpanel-${index}`,
  };
}

export default function NetworkScanner() {
  const { user } = useAuth();
  const [networkRange, setNetworkRange] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>(mockNetworkAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);
  const [analysisResults, setAnalysisResults] = useState({
    protocols: mockProtocolData,
    endpoints: mockEndpointData,
    applications: mockAppData,
  });
  const [protocolTimeData, setProtocolTimeData] = useState([
    { time: '00:00', TCP: 120, UDP: 80, ICMP: 30 },
    { time: '04:00', TCP: 180, UDP: 150, ICMP: 45 },
    { time: '08:00', TCP: 350, UDP: 280, ICMP: 90 },
    { time: '12:00', TCP: 420, UDP: 380, ICMP: 120 },
    { time: '16:00', TCP: 280, UDP: 250, ICMP: 75 },
    { time: '20:00', TCP: 160, UDP: 120, ICMP: 40 },
  ]);
  const [applicationTimeData, setApplicationTimeData] = useState([
    { time: '00:00', HTTP: 120, DNS: 80, SMB: 30 },
    { time: '04:00', HTTP: 180, DNS: 150, SMB: 45 },
    { time: '08:00', HTTP: 350, DNS: 280, SMB: 90 },
    { time: '12:00', HTTP: 420, DNS: 380, SMB: 120 },
    { time: '16:00', HTTP: 280, DNS: 250, SMB: 75 },
    { time: '20:00', HTTP: 160, DNS: 120, SMB: 40 },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

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

  // Add interval for real-time updates
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        
        setProtocolTimeData(prev => {
          const newData = [...prev.slice(1), {
            time: timeStr,
            TCP: Math.floor(Math.random() * 300) + 100,
            UDP: Math.floor(Math.random() * 200) + 50,
            ICMP: Math.floor(Math.random() * 100) + 20,
          }];
          return newData;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
        
        setApplicationTimeData(prev => {
          const newData = [...prev.slice(1), {
            time: timeStr,
            HTTP: Math.floor(Math.random() * 300) + 100,
            DNS: Math.floor(Math.random() * 200) + 50,
            SMB: Math.floor(Math.random() * 100) + 20,
          }];
          return newData;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

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
        {/* Network Scan Configuration */}
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
                              <Chip label={device.ip} size="small" variant="outlined" />
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
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                PCAP File Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ mr: 2 }}
                  >
                    Upload PCAP File
                    <input
                      type="file"
                      hidden
                      accept=".pcap,.pcapng"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  {file && (
                    <Button
                      variant="contained"
                      onClick={handleAnalyzeFile}
                      disabled={isAnalyzing}
                      startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AssessmentIcon />}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Protocol Distribution
                </Typography>
                <Tooltip title="Real-time distribution of network protocols">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResults.protocols}
                      dataKey="count"
                      nameKey="protocol"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {analysisResults.protocols.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Protocol Traffic Over Time
                </Typography>
                <Tooltip title="Real-time view of protocol traffic">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={protocolTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time"
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="TCP" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="UDP" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      isAnimationActive={true}
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ICMP" 
                      stackId="1" 
                      stroke="#ffc658" 
                      fill="#ffc658"
                      isAnimationActive={true}
                      animationBegin={400}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Network Traffic Overview
                </Typography>
                <Tooltip title="Comprehensive view of network traffic patterns">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisResults.endpoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="ip" 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="packetsIn" 
                      name="Inbound Packets"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dot={{ fill: '#4CAF50', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="packetsOut" 
                      name="Outbound Packets"
                      stroke="#2196F3"
                      strokeWidth={2}
                      dot={{ fill: '#2196F3', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationBegin={200}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Data Transfer Analysis
                  </Typography>
                  <Tooltip title="Detailed view of data transfer patterns">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    select
                    size="small"
                    label="Time Range"
                    value="1h"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="1h">Last Hour</MenuItem>
                    <MenuItem value="6h">Last 6 Hours</MenuItem>
                    <MenuItem value="24h">Last 24 Hours</MenuItem>
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Top IPs"
                    value="10"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="10">Top 10</MenuItem>
                    <MenuItem value="20">Top 20</MenuItem>
                    <MenuItem value="50">Top 50</MenuItem>
                    <MenuItem value="100">Top 100</MenuItem>
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Group By"
                    value="ip"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="ip">IP Address</MenuItem>
                    <MenuItem value="subnet">Subnet</MenuItem>
                    <MenuItem value="department">Department</MenuItem>
                    <MenuItem value="location">Location</MenuItem>
                  </TextField>
                </Box>
              </Box>

              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analysisResults.endpoints}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8E24AA" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8E24AA" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ACC1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00ACC1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#eee" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="ip"
                      stroke="#666"
                      tick={{ fill: '#666' }}
                      axisLine={{ stroke: '#eee' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                      tickFormatter={(value) => `${(value / 1024 / 1024).toFixed(1)} MB`}
                      axisLine={{ stroke: '#eee' }}
                    />
                    <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number) => [`${(value / 1024 / 1024).toFixed(2)} MB`, '']}
                      labelStyle={{ color: '#666' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        paddingBottom: '20px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bytesIn" 
                      name="Inbound Data"
                      stroke="#8E24AA"
                      strokeWidth={2}
                      fill="url(#inboundGradient)"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bytesOut" 
                      name="Outbound Data"
                      stroke="#00ACC1"
                      strokeWidth={2}
                      fill="url(#outboundGradient)"
                      isAnimationActive={true}
                      animationBegin={200}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Active IPs
                      </Typography>
                      <Typography variant="h6">
                        2,547
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary">
                        Peak Traffic
                      </Typography>
                      <Typography variant="h6">
                        847 MB/s
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary">
                        Active Subnets
                      </Typography>
                      <Typography variant="h6">
                        18
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary">
                        Anomaly Score
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        Low
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Traffic Distribution
                </Typography>
                <Tooltip title="Distribution of network traffic across endpoints">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResults.endpoints.map(endpoint => ({
                        name: endpoint.ip,
                        value: endpoint.bytesIn + endpoint.bytesOut
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {analysisResults.endpoints.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => `${(value / 1024).toFixed(2)} KB`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Statistics
                </Typography>
                <Tooltip title="Comprehensive endpoint traffic statistics">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets In</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets Out</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data In</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data Out</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Traffic</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisResults.endpoints.map((endpoint) => {
                      const totalBytes = endpoint.bytesIn + endpoint.bytesOut;
                      const isHighTraffic = totalBytes > 300000;
                      return (
                        <TableRow 
                          key={endpoint.ip}
                          sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{endpoint.ip}</TableCell>
                          <TableCell align="right">{endpoint.packetsIn.toLocaleString()}</TableCell>
                          <TableCell align="right">{endpoint.packetsOut.toLocaleString()}</TableCell>
                          <TableCell align="right">{(endpoint.bytesIn / 1024).toFixed(2)} KB</TableCell>
                          <TableCell align="right">{(endpoint.bytesOut / 1024).toFixed(2)} KB</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {(totalBytes / 1024).toFixed(2)} KB
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={isHighTraffic ? 'warning' : 'success'}
                              label={isHighTraffic ? 'High Traffic' : 'Normal'}
                              sx={{ 
                                fontWeight: 500,
                                minWidth: 85,
                                '& .MuiChip-label': { px: 2 }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Application Layer Traffic
                </Typography>
                <Tooltip title="Real-time application protocol usage">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time"
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="HTTP" 
                      stroke="#8884d8"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="DNS" 
                      stroke="#82ca9d"
                      isAnimationActive={true}
                      animationBegin={200}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="SMB" 
                      stroke="#ffc658"
                      isAnimationActive={true}
                      animationBegin={400}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="FTP" 
                      stroke="#ff7300"
                      isAnimationActive={true}
                      animationBegin={600}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Application Distribution
                </Typography>
                <Tooltip title="Distribution of application protocols">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResults.applications}
                      dataKey="bytesTransferred"
                      nameKey="application"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {analysisResults.applications.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Application Layer Statistics
                </Typography>
                <Tooltip title="Detailed application protocol statistics">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Application</TableCell>
                      <TableCell align="right">Connections</TableCell>
                      <TableCell align="right">Bytes Transferred</TableCell>
                      <TableCell align="right">% of Total Traffic</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisResults.applications.map((app) => {
                      const totalBytes = analysisResults.applications.reduce((acc, curr) => acc + curr.bytesTransferred, 0);
                      const percentage = ((app.bytesTransferred / totalBytes) * 100).toFixed(1);
                      const isHighUsage = app.connections > 300;
                      return (
                        <TableRow key={app.application}>
                          <TableCell>{app.application}</TableCell>
                          <TableCell align="right">{app.connections.toLocaleString()}</TableCell>
                          <TableCell align="right">{(app.bytesTransferred / 1024).toFixed(2)} KB</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={isHighUsage ? 'warning' : 'success'}
                              label={isHighUsage ? 'High Usage' : 'Normal'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
} 