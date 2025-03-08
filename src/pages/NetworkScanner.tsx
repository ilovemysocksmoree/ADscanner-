import React, { useState } from 'react';
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
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
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

interface ProtocolStats {
  protocol: string;
  count: number;
  percentage: number;
}

interface EndpointStats {
  ip: string;
  packetsIn: number;
  packetsOut: number;
  bytesIn: number;
  bytesOut: number;
}

interface ApplicationStats {
  application: string;
  connections: number;
  bytesTransferred: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function NetworkScanner() {
  const { user } = useAuth();
  const [networkRange, setNetworkRange] = useState('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>(mockNetworkAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Mock data for analysis results
  const [protocolStats, setProtocolStats] = useState<ProtocolStats[]>([
    { protocol: 'TCP', count: 1250, percentage: 45 },
    { protocol: 'UDP', count: 850, percentage: 30 },
    { protocol: 'ICMP', count: 400, percentage: 15 },
    { protocol: 'Other', count: 280, percentage: 10 },
  ]);

  const [endpointStats, setEndpointStats] = useState<EndpointStats[]>([
    { ip: '192.168.1.100', packetsIn: 2500, packetsOut: 1800, bytesIn: 250000, bytesOut: 180000 },
    { ip: '192.168.1.101', packetsIn: 1500, packetsOut: 1200, bytesIn: 150000, bytesOut: 120000 },
  ]);

  const [applicationStats, setApplicationStats] = useState<ApplicationStats[]>([
    { application: 'HTTP/HTTPS', connections: 450, bytesTransferred: 500000 },
    { application: 'DNS', connections: 250, bytesTransferred: 25000 },
    { application: 'SMB', connections: 150, bytesTransferred: 300000 },
  ]);

  const [protocolTimeData, setProtocolTimeData] = useState([
    { time: '00:00', TCP: 120, UDP: 80, ICMP: 30 },
    { time: '04:00', TCP: 180, UDP: 150, ICMP: 45 },
    { time: '08:00', TCP: 350, UDP: 280, ICMP: 90 },
    { time: '12:00', TCP: 420, UDP: 380, ICMP: 120 },
    { time: '16:00', TCP: 280, UDP: 250, ICMP: 75 },
    { time: '20:00', TCP: 160, UDP: 120, ICMP: 40 },
  ]);

  const [applicationTimeData, setApplicationTimeData] = useState([
    { time: '00:00', HTTP: 50, DNS: 30, SMB: 20, FTP: 10 },
    { time: '04:00', HTTP: 80, DNS: 45, SMB: 35, FTP: 15 },
    { time: '08:00', HTTP: 150, DNS: 80, SMB: 60, FTP: 30 },
    { time: '12:00', HTTP: 200, DNS: 100, SMB: 80, FTP: 40 },
    { time: '16:00', HTTP: 120, DNS: 70, SMB: 50, FTP: 25 },
    { time: '20:00', HTTP: 70, DNS: 40, SMB: 30, FTP: 15 },
  ]);

  // Fix the type definition for the interval
  const [updateInterval, setUpdateInterval] = useState<number | null>(null);

  // Function to generate new data point
  const generateNewDataPoint = (time: string) => ({
    time,
    TCP: Math.floor(Math.random() * 300) + 100,
    UDP: Math.floor(Math.random() * 200) + 50,
    ICMP: Math.floor(Math.random() * 100) + 20,
    HTTP: Math.floor(Math.random() * 150) + 50,
    DNS: Math.floor(Math.random() * 80) + 20,
    SMB: Math.floor(Math.random() * 60) + 10,
    FTP: Math.floor(Math.random() * 40) + 5,
  });

  // Function to update protocol stats
  const updateProtocolStats = () => {
    const total = protocolTimeData[protocolTimeData.length - 1];
    setProtocolStats([
      { protocol: 'TCP', count: total.TCP, percentage: Math.round((total.TCP / (total.TCP + total.UDP + total.ICMP)) * 100) },
      { protocol: 'UDP', count: total.UDP, percentage: Math.round((total.UDP / (total.TCP + total.UDP + total.ICMP)) * 100) },
      { protocol: 'ICMP', count: total.ICMP, percentage: Math.round((total.ICMP / (total.TCP + total.UDP + total.ICMP)) * 100) },
    ]);
  };

  // Function to update data in real-time
  const updateData = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    setProtocolTimeData(prev => {
      const newData = [...prev.slice(1), generateNewDataPoint(timeStr)];
      return newData;
    });

    setApplicationTimeData(prev => {
      const newData = [...prev.slice(1), generateNewDataPoint(timeStr)];
      return newData;
    });

    // Update endpoint stats
    setEndpointStats(prev => prev.map(stat => ({
      ...stat,
      packetsIn: stat.packetsIn + Math.floor(Math.random() * 100),
      packetsOut: stat.packetsOut + Math.floor(Math.random() * 100),
      bytesIn: stat.bytesIn + Math.floor(Math.random() * 10000),
      bytesOut: stat.bytesOut + Math.floor(Math.random() * 10000),
    })));

    updateProtocolStats();
  };

  // Start/stop real-time updates when analyzing
  React.useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(updateData, 2000); // Update every 2 seconds
      setUpdateInterval(interval);
    } else if (updateInterval) {
      clearInterval(updateInterval);
      setUpdateInterval(null);
    }
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [isAnalyzing]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setSnackbarMessage(`File selected: ${event.target.files[0].name}`);
      setSnackbarOpen(true);
    }
  };

  const handleAnalyzeFile = () => {
    if (!selectedFile) {
      setSnackbarMessage('Please select a PCAP file first');
      setSnackbarOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setSnackbarMessage('Starting real-time analysis...');
    setSnackbarOpen(true);
    setSelectedTab(1);
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

          {/* Existing Scan Results */}
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
                  {selectedFile && (
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
                <Tooltip title="Real-time distribution of network protocols in the captured traffic">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolStats}
                      dataKey="count"
                      nameKey="protocol"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    >
                      {protocolStats.map((entry, index) => (
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
                <Tooltip title="Real-time view of protocol usage over time">
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
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="UDP" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ICMP" 
                      stackId="1" 
                      stroke="#ffc658" 
                      fill="#ffc658"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
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
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Endpoint Statistics
                </Typography>
                <Tooltip title="Real-time traffic statistics for each endpoint">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={endpointStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ip" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      dataKey="packetsIn" 
                      name="Packets In" 
                      fill="#8884d8"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                    <Bar 
                      dataKey="packetsOut" 
                      name="Packets Out" 
                      fill="#82ca9d"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <TableContainer sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>IP Address</TableCell>
                      <TableCell align="right">Packets In</TableCell>
                      <TableCell align="right">Packets Out</TableCell>
                      <TableCell align="right">Bytes In</TableCell>
                      <TableCell align="right">Bytes Out</TableCell>
                      <TableCell align="right">Total Traffic</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {endpointStats.map((stat) => (
                      <TableRow key={stat.ip}>
                        <TableCell>{stat.ip}</TableCell>
                        <TableCell align="right">{stat.packetsIn.toLocaleString()}</TableCell>
                        <TableCell align="right">{stat.packetsOut.toLocaleString()}</TableCell>
                        <TableCell align="right">{stat.bytesIn.toLocaleString()}</TableCell>
                        <TableCell align="right">{stat.bytesOut.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          {((stat.bytesIn + stat.bytesOut) / 1024).toFixed(2)} KB
                        </TableCell>
                      </TableRow>
                    ))}
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
                <Tooltip title="Real-time application-level protocol usage">
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
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="DNS" 
                      stroke="#82ca9d"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="SMB" 
                      stroke="#ffc658"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="FTP" 
                      stroke="#ff7300"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={500}
                      animationEasing="ease-out"
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
                  Application Statistics
                </Typography>
                <Tooltip title="Detailed statistics for each application protocol">
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
                    {applicationStats.map((stat) => {
                      const percentage = ((stat.bytesTransferred / applicationStats.reduce((acc, curr) => acc + curr.bytesTransferred, 0)) * 100).toFixed(1);
                      return (
                        <TableRow key={stat.application}>
                          <TableCell>{stat.application}</TableCell>
                          <TableCell align="right">{stat.connections.toLocaleString()}</TableCell>
                          <TableCell align="right">{(stat.bytesTransferred / 1024).toFixed(2)} KB</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={stat.connections > 300 ? 'warning' : 'success'}
                              label={stat.connections > 300 ? 'High Usage' : 'Normal'}
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