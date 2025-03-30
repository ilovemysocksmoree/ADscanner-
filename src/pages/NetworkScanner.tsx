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
  ToggleButton, // Note: ToggleButton was imported but not used, consider removing if not needed elsewhere
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Menu, // Added Menu import for action menu
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Router as RouterIcon, // Note: RouterIcon was imported but not used, consider removing if not needed elsewhere
  PlayArrow as StartIcon, // Note: StartIcon was imported but not used, consider removing if not needed elsewhere
  Stop as StopIcon, // Note: StopIcon was imported but not used, consider removing if not needed elsewhere
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  NetworkCheck as NetworkCheckIcon,
  Apps as AppsIcon,
  Info as InfoIcon,
  LightMode as LightModeIcon, // Note: LightModeIcon was imported but not used, consider removing if not needed elsewhere
  DarkMode as DarkModeIcon, // Note: DarkModeIcon was imported but not used, consider removing if not needed elsewhere
  MoreVert as MoreVertIcon, // Added for action menu trigger
  Block as BlockIcon, // Added for action menu
  Security as SecurityIcon, // Added for action menu
  Description as ReportIcon, // Added for action menu
  Download as DownloadIcon, // Added for export button
} from '@mui/icons-material';
import {
  BarChart, // Note: BarChart was imported but not used, consider removing if not needed elsewhere
  Bar, // Note: Bar was imported but not used, consider removing if not needed elsewhere
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
// Assuming AlertBar, useAuth, loggingService are correctly imported from your project structure
// import AlertBar from '../components/AlertBar'; // Example path
// import { useAuth } from '../contexts/AuthContext'; // Example path
// import { loggingService } from '../services/LoggingService'; // Example path

// --- Mock Implementations (Replace with your actual imports) ---
const AlertBar = ({ severity, title, message, onTakeAction, onMarkBenign }: any) => (
  <Paper elevation={2} sx={{ p: 2, mb: 1, borderLeft: 5, borderColor: `${severity}.main`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
      <Typography variant="body2">{message}</Typography>
    </Box>
    <Box>
      <Button size="small" onClick={onTakeAction} sx={{ mr: 1 }}>Investigate</Button>
      <Button size="small" onClick={onMarkBenign} color="secondary">Mark Benign</Button>
    </Box>
  </Paper>
);

const useAuth = () => ({ user: { id: 'mockUser123', name: 'Mock User' } }); // Mock Auth Context

const loggingService = { // Mock Logging Service
  addLog: (user: any, event: string, message: string, context: string) => {
    console.log(`[Log] User: ${user?.name || 'Unknown'}, Event: ${event}, Context: ${context}, Message: ${message}`);
  },
};
// --- End Mock Implementations ---


// Constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#AF19FF']; // Added more colors

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
  { ip: '192.168.1.150', packetsIn: 5230, packetsOut: 4100, bytesIn: 1200000, bytesOut: 850000 }, // Added from top talkers
  { ip: '192.168.1.200', packetsIn: 500, packetsOut: 300, bytesIn: 50000, bytesOut: 30000 }, // Added from alert
];

const mockAppData = [
  { application: 'HTTP/HTTPS', connections: 450, bytesTransferred: 500000 },
  { application: 'DNS', connections: 250, bytesTransferred: 25000 },
  { application: 'SMB', connections: 150, bytesTransferred: 300000 },
  { application: 'SMTP', connections: 80, bytesTransferred: 150000 }, // Added from top talkers
  { application: 'TLS', connections: 600, bytesTransferred: 1000000 }, // Added from top talkers
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
    bytes: string; // Keep as string for display flexibility
    protocols: string[];
  }[];
  suspiciousActivities: {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }[];
}

// Mock devices (can be populated by scan)
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
   {
    ip: '192.168.1.101',
    hostname: 'Laptop-User',
    type: 'computer',
    services: [
      { port: 22, name: 'SSH', status: 'closed' },
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
  value: number; // This should be the currently selected tab index
}

// TabPanel component remains the same
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index} // Only show if the panel's index matches the selected tab value
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
      {...other}
    >
      {value === index && ( // Render content only when the tab is active
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// a11yProps function remains the same
function a11yProps(index: number) {
  return {
    id: `network-tab-${index}`,
    'aria-controls': `network-tabpanel-${index}`,
  };
}

export default function NetworkScanner() {
  const { user } = useAuth();
  // const [networkRange, setNetworkRange] = useState('192.168.1.0/24'); // Removed as network scan part is commented out
  // const [isScanning, setIsScanning] = useState(false); // Removed as network scan part is commented out
  // const [devices, setDevices] = useState<NetworkDevice[]>([]); // Removed as network scan part is commented out
  const [alerts, setAlerts] = useState<NetworkAlert[]>(mockNetworkAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // State to control the currently selected tab index
  // const [darkMode, setDarkMode] = useState(false); // Removed as dark mode toggle is commented out

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false); // Controls if analysis results are ready to be shown
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null); // Holds the full analysis details

  // State for the charts based on analysis results
  const [analysisResults, setAnalysisResults] = useState({
    protocols: mockProtocolData, // Initialize with mock data or empty array
    endpoints: mockEndpointData,
    applications: mockAppData,
  });

  // State for time-series data (updated during analysis simulation)
  const [protocolTimeData, setProtocolTimeData] = useState([
    { time: '00:00', TCP: 120, UDP: 80, ICMP: 30 },
    { time: '04:00', TCP: 180, UDP: 150, ICMP: 45 },
    { time: '08:00', TCP: 350, UDP: 280, ICMP: 90 },
    { time: '12:00', TCP: 420, UDP: 380, ICMP: 120 },
    { time: '16:00', TCP: 280, UDP: 250, ICMP: 75 },
    { time: '20:00', TCP: 160, UDP: 120, ICMP: 40 },
  ]);
  const [applicationTimeData, setApplicationTimeData] = useState([
    { time: '00:00', HTTP: 120, DNS: 80, SMB: 30, FTP: 10, TLS: 150 }, // Added FTP/TLS
    { time: '04:00', HTTP: 180, DNS: 150, SMB: 45, FTP: 15, TLS: 200 },
    { time: '08:00', HTTP: 350, DNS: 280, SMB: 90, FTP: 25, TLS: 400 },
    { time: '12:00', HTTP: 420, DNS: 380, SMB: 120, FTP: 30, TLS: 500 },
    { time: '16:00', HTTP: 280, DNS: 250, SMB: 75, FTP: 20, TLS: 350 },
    { time: '20:00', HTTP: 160, DNS: 120, SMB: 40, FTP: 12, TLS: 180 },
  ]);

  // State for the action menu
  const [selectedDeviceIp, setSelectedDeviceIp] = useState<string | null>(null); // Use specific state for IP
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);


  // Handles changing the selected tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue); // Directly set the selected tab index
  };

  // Network Scan Handlers (Currently commented out as they weren't the focus of the fix)
  /*
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
  */

  // Alert Action Handlers
  const handleTakeAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Investigating network activity${alert?.deviceIp ? ` for device ${alert.deviceIp}` : ''}`);
    setSnackbarOpen(true);
    // Keep the alert for now, maybe just change its state later
    // setAlerts(alerts.filter(alert => alert.id !== alertId));

    loggingService.addLog(
      user,
      'NETWORK_ALERT_ACTION',
      `Took action on network alert: ${alert?.title}`,
      '/network-scanner'
    );
  };

  const handleMarkBenign = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Network activity marked as normal for alert: ${alert?.title}`);
    setSnackbarOpen(true);
    setAlerts(alerts.filter(alert => alert.id !== alertId)); // Remove the benign alert

    loggingService.addLog(
      user,
      'NETWORK_ALERT_BENIGN',
      `Marked network alert as benign: ${alert?.title}`,
      '/network-scanner'
    );
  };

  // File Handling and Analysis
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        setSnackbarMessage(`File "${uploadedFile.name}" selected. Click 'Analyze File'.`);
        setSnackbarOpen(true);
        // Reset previous analysis state if a new file is uploaded
        setShowDetailedResults(false);
        setAnalysisDetails(null);
        setSelectedTab(0); // Reset to the first tab
        loggingService.addLog(user, 'PCAP_FILE_SELECTED', `Selected file: ${uploadedFile.name}`, '/network-scanner');
    }
     // Clear the input value to allow uploading the same file again
    event.target.value = '';
  };

  // Drag and Drop handlers (Optional, can be added to a drop zone)
  /*
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      setFile(droppedFile);
      setSnackbarMessage(`File "${droppedFile.name}" dropped. Click 'Analyze File'.`);
      setSnackbarOpen(true);
      setShowDetailedResults(false);
      setAnalysisDetails(null);
      setSelectedTab(0);
      loggingService.addLog(user, 'PCAP_FILE_DROPPED', `Dropped file: ${droppedFile.name}`, '/network-scanner');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };
  */

  const handleAnalyzeFile = () => {
    if (!file) {
        setSnackbarMessage('Please upload a PCAP file first.');
        setSnackbarOpen(true);
        return;
    }

    setIsAnalyzing(true);
    setShowDetailedResults(false); // Hide results while analyzing
    setAnalysisDetails(null); // Clear previous details
    loggingService.addLog(
      user,
      'PCAP_ANALYSIS_START',
      `Started analysis of PCAP file: ${file.name}`,
      '/network-scanner'
    );

    // Simulate PCAP analysis
    setTimeout(() => {
      // --- Generate Mock Analysis Details ---
      const generatedAnalysisDetails: AnalysisDetails = {
        timestamp: new Date().toISOString(),
        totalPackets: Math.floor(Math.random() * 20000) + 5000, // Randomize
        totalBytes: Math.floor(Math.random() * 5000000) + 1000000, // Randomize
        duration: `00:${String(Math.floor(Math.random() * 50) + 10).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`, // Randomize duration
        protocols: mockProtocolData.map(p => ({...p, count: Math.floor(p.count * (Math.random() * 0.4 + 0.8)) })), // Slightly vary counts
        endpoints: mockEndpointData.map(e => ({ // Slightly vary counts
            ...e,
            packetsIn: Math.floor(e.packetsIn * (Math.random() * 0.4 + 0.8)),
            packetsOut: Math.floor(e.packetsOut * (Math.random() * 0.4 + 0.8)),
            bytesIn: Math.floor(e.bytesIn * (Math.random() * 0.4 + 0.8)),
            bytesOut: Math.floor(e.bytesOut * (Math.random() * 0.4 + 0.8)),
        })),
        applications: mockAppData.map(a => ({ // Slightly vary counts
            ...a,
            connections: Math.floor(a.connections * (Math.random() * 0.4 + 0.8)),
            bytesTransferred: Math.floor(a.bytesTransferred * (Math.random() * 0.4 + 0.8)),
        })),
        topTalkers: [ // Keep mock top talkers for simplicity
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
        suspiciousActivities: [ // Keep mock suspicious activities
          {
            type: 'Port Scan',
            description: 'Rapid connection attempts to multiple ports from 192.168.1.150',
            severity: 'high',
            timestamp: new Date(Date.now() - 60000).toISOString() // Slightly in the past
          },
          {
            type: 'Data Exfiltration Attempt',
            description: 'Large outbound data transfer detected from 192.168.1.100 to external IP',
            severity: 'medium',
            timestamp: new Date().toISOString()
          }
        ]
      };
      // --- End Mock Analysis Details ---


      // Update state with the generated/mock analysis results
      setAnalysisResults({
        protocols: generatedAnalysisDetails.protocols,
        endpoints: generatedAnalysisDetails.endpoints,
        applications: generatedAnalysisDetails.applications,
      });
      setAnalysisDetails(generatedAnalysisDetails); // Store the full details
      setIsAnalyzing(false);
      setShowDetailedResults(true); // IMPORTANT: Set this to true to show the tabs/panels
      setSnackbarMessage(`PCAP file "${file.name}" analysis completed successfully.`);
      setSnackbarOpen(true);

      loggingService.addLog(
        user,
        'PCAP_ANALYSIS_COMPLETE',
        `Completed analysis of PCAP file: ${file.name}`,
        '/network-scanner'
      );
    }, 3000); // Simulate 3 seconds analysis time
  };

  // Export Results Handler
  const handleExportResults = () => {
    if (!analysisDetails) {
        setSnackbarMessage('No analysis results available to export.');
        setSnackbarOpen(true);
        return;
    }

    const exportData = {
      fileInfo: {
        name: file?.name || 'Unknown File',
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

    try {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Sanitize filename slightly
        const safeFileName = file?.name.replace(/[^a-z0-9_.-]/gi, '_') || 'analysis';
        a.download = `pcap-analysis-${safeFileName}-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbarMessage('Analysis results exported successfully.');
        setSnackbarOpen(true);
        loggingService.addLog(user, 'PCAP_EXPORT_SUCCESS', 'Exported analysis results', '/network-scanner');
    } catch (error) {
        console.error("Export failed:", error);
        setSnackbarMessage('Failed to export results. See console for details.');
        setSnackbarOpen(true);
        loggingService.addLog(user, 'PCAP_EXPORT_FAIL', `Export failed: ${error}`, '/network-scanner');
    }
  };

  // Action Menu Handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, deviceIp: string) => {
    setSelectedDeviceIp(deviceIp); // Store the IP of the device clicked
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedDeviceIp(null); // Clear selected IP when menu closes
  };

  // Placeholder actions for the menu items
  const handleBlockIP = () => {
    if (selectedDeviceIp) {
      setSnackbarMessage(`Simulating: Blocked IP ${selectedDeviceIp}`);
      setSnackbarOpen(true);
      loggingService.addLog(user, 'DEVICE_ACTION_BLOCK', `Blocked IP: ${selectedDeviceIp}`, '/network-scanner');
      handleActionMenuClose();
    }
  };

  const handleIsolateDevice = () => {
    if (selectedDeviceIp) {
      setSnackbarMessage(`Simulating: Isolated device ${selectedDeviceIp}`);
      setSnackbarOpen(true);
      loggingService.addLog(user, 'DEVICE_ACTION_ISOLATE', `Isolated device: ${selectedDeviceIp}`, '/network-scanner');
      handleActionMenuClose();
    }
  };

  const handleGenerateReport = () => {
    if (selectedDeviceIp) {
      setSnackbarMessage(`Simulating: Generating security report for ${selectedDeviceIp}`);
      setSnackbarOpen(true);
      loggingService.addLog(user, 'DEVICE_ACTION_REPORT', `Generated report for: ${selectedDeviceIp}`, '/network-scanner');
      handleActionMenuClose();
    }
  };

  // Effect for real-time chart updates (only when analysis is complete and results shown)
  useEffect(() => {
    let protocolInterval: NodeJS.Timeout | null = null;
    let appInterval: NodeJS.Timeout | null = null;

    if (showDetailedResults && !isAnalyzing) { // Update only when results are shown and not currently analyzing
      // --- Protocol Time Data Update ---
      protocolInterval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setProtocolTimeData(prev => {
          const newData = [...prev.slice(1), { // Shift old data out, add new data point
            time: timeStr,
            TCP: Math.floor(Math.random() * 300) + 100, // Simulate new data
            UDP: Math.floor(Math.random() * 200) + 50,
            ICMP: Math.floor(Math.random() * 100) + 20,
          }];
          return newData;
        });
      }, 5000); // Update every 5 seconds

      // --- Application Time Data Update ---
       appInterval = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setApplicationTimeData(prev => {
          const newData = [...prev.slice(1), { // Shift old data out, add new data point
            time: timeStr,
            HTTP: Math.floor(Math.random() * 300) + 100, // Simulate new data
            DNS: Math.floor(Math.random() * 200) + 50,
            SMB: Math.floor(Math.random() * 100) + 20,
            FTP: Math.floor(Math.random() * 50) + 5,
            TLS: Math.floor(Math.random() * 400) + 100,
          }];
          return newData;
        });
      }, 5000); // Update every 5 seconds
    }

    // Cleanup function to clear intervals when component unmounts or conditions change
    return () => {
      if (protocolInterval) clearInterval(protocolInterval);
      if (appInterval) clearInterval(appInterval);
    };
  }, [showDetailedResults, isAnalyzing]); // Rerun effect if analysis state changes


  // --- Render Component ---
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}> {/* Add padding */}
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
        {alerts.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', my: 2}}>No active alerts.</Typography>
        )}
      </Box>

      {/* PCAP Upload and Analysis Control */}
       <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
         <Typography variant="h6" gutterBottom component="div"> {/* Use component="div" for better semantics */}
           PCAP File Analysis
         </Typography>
         <Grid container spacing={2} alignItems="center">
           <Grid item xs={12} sm={file ? 4 : 6} md={file ? 3 : 4}> {/* Adjust grid based on file presence */}
             <Button
               fullWidth
               variant="outlined"
               component="label" // Allows the button to act as a file input trigger
               startIcon={<UploadIcon />}
             >
               {file ? "Change File" : "Upload PCAP"}
               <input
                 type="file"
                 hidden // Hide the default browser input element
                 accept=".pcap,.pcapng" // Specify acceptable file types
                 onChange={handleFileUpload}
               />
             </Button>
           </Grid>
           {file && ( // Show file name and analyze button only if a file is selected
             <>
                <Grid item xs={12} sm={4} md={6}>
                    <Tooltip title={file.name}>
                        <Typography noWrap variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: { xs: 'center', sm: 'left'} }}>
                            Selected: {file.name}
                        </Typography>
                    </Tooltip>
                </Grid>
               <Grid item xs={12} sm={4} md={3}>
                 <Button
                   fullWidth
                   variant="contained"
                   color="primary"
                   onClick={handleAnalyzeFile}
                   disabled={isAnalyzing} // Disable button while analysis is in progress
                   startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />}
                 >
                   {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                 </Button>
               </Grid>
             </>
           )}
           {/* Optional: Add Drag and Drop Area */}
           {/*
           <Grid item xs={12}>
             <Box
               onDrop={handleDrop}
               onDragOver={handleDragOver}
               sx={{ border: '2px dashed grey', p: 3, textAlign: 'center', mt: 2, borderRadius: 1 }}
             >
               <Typography>Or drag and drop a PCAP file here</Typography>
             </Box>
           </Grid>
           */}
         </Grid>
         {analysisDetails && showDetailedResults && ( // Show export button only after successful analysis
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportResults}
                    size="small"
                >
                    Export Results (JSON)
                </Button>
            </Box>
         )}
       </Paper>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab} // Use the state variable for the active tab
          onChange={handleTabChange}
          aria-label="network analysis tabs"
          variant="scrollable" // Allow scrolling on smaller screens
          scrollButtons="auto" // Show scroll buttons automatically
        >
          {/* Tab 0: Always visible */}
          <Tab label="Protocol Analysis" icon={<AssessmentIcon />} {...a11yProps(0)} />

          {/* Tabs 1, 2, 3: Visible only after successful analysis */}
          {showDetailedResults && ( // Conditionally render the Tabs based on analysis completion
            <Tab label="Network Overview" icon={<NetworkCheckIcon />} {...a11yProps(1)} />
          )}
           {showDetailedResults && (
            <Tab label="Endpoint Analysis" icon={<ComputerIcon />} {...a11yProps(2)} />
          )}
           {showDetailedResults && (
            <Tab label="Application Analysis" icon={<AppsIcon />} {...a11yProps(3)} />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {/* Panel 0: Protocol Analysis */}
      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          {/* Protocol Distribution Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div"> {/* Use component="div" */}
                  Protocol Distribution
                </Typography>
                <Tooltip title="Distribution of network protocols by packet count based on the analyzed file.">
                  <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
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
                      // labelLine={false} // Keep label line for clarity if needed
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {analysisResults.protocols.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} packets`, 'Count']} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Protocol Traffic Over Time Area Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div">
                  Protocol Traffic Over Time
                </Typography>
                <Tooltip title="Simulated real-time view of protocol traffic volume (packets/sec). Updates every 5 seconds.">
                  <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={protocolTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                      dataKey="time"
                      interval="preserveStartEnd" // Show first and last tick
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip />
                    <Legend iconType="circle" />
                    <defs>
                        <linearGradient id="colorTcp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorUdp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorIcmp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="TCP"
                      stackId="1"
                      stroke={COLORS[0]}
                      fillOpacity={1} fill="url(#colorTcp)"
                      isAnimationActive={true} // Keep animation subtle
                      animationDuration={500}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="UDP"
                      stackId="1"
                      stroke={COLORS[1]}
                       fillOpacity={1} fill="url(#colorUdp)"
                      isAnimationActive={true}
                      animationDuration={500}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="ICMP"
                      stackId="1"
                      stroke={COLORS[2]}
                       fillOpacity={1} fill="url(#colorIcmp)"
                      isAnimationActive={true}
                      animationDuration={500}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Analysis Summary (if details exist) */}
            {analysisDetails && showDetailedResults && (
                <Grid item xs={12}>
                    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography variant="h6" gutterBottom>Analysis Summary</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={3}> <Typography variant="body2"><strong>Analyzed At:</strong> {new Date(analysisDetails.timestamp).toLocaleString()}</Typography> </Grid>
                            <Grid item xs={6} sm={3}> <Typography variant="body2"><strong>Duration:</strong> {analysisDetails.duration}</Typography> </Grid>
                            <Grid item xs={6} sm={3}> <Typography variant="body2"><strong>Total Packets:</strong> {analysisDetails.totalPackets.toLocaleString()}</Typography> </Grid>
                            <Grid item xs={6} sm={3}> <Typography variant="body2"><strong>Total Bytes:</strong> {(analysisDetails.totalBytes / 1024 / 1024).toFixed(2)} MB</Typography> </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            )}

             {/* Suspicious Activities (if details exist) */}
            {analysisDetails && showDetailedResults && analysisDetails.suspiciousActivities.length > 0 && (
                <Grid item xs={12}>
                    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography variant="h6" gutterBottom>Suspicious Activities Detected</Typography>
                        <List dense>
                            {analysisDetails.suspiciousActivities.map((activity, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText
                                        primary={`${activity.type} (${activity.severity.toUpperCase()})`}
                                        secondary={`${activity.description} - ${new Date(activity.timestamp).toLocaleTimeString()}`}
                                    />
                                     <Chip
                                        label={activity.severity}
                                        size="small"
                                        color={activity.severity === 'high' ? 'error' : activity.severity === 'medium' ? 'warning' : 'info'}
                                        sx={{ ml: 2 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            )}

            {/* Top Talkers (if details exist) */}
            {analysisDetails && showDetailedResults && analysisDetails.topTalkers.length > 0 && (
                <Grid item xs={12}>
                    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography variant="h6" gutterBottom>Top Talkers</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IP Address</TableCell>
                                        <TableCell align="right">Packets</TableCell>
                                        <TableCell align="right">Bytes</TableCell>
                                        <TableCell>Protocols</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analysisDetails.topTalkers.map((talker, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{talker.ip}</TableCell>
                                            <TableCell align="right">{talker.packets.toLocaleString()}</TableCell>
                                            <TableCell align="right">{talker.bytes}</TableCell>
                                            <TableCell>
                                                {talker.protocols.map(p => <Chip key={p} label={p} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            )}

        </Grid>
      </TabPanel>

      {/* Panel 1: Network Overview (Conditionally Rendered) */}
      {showDetailedResults && (
        <TabPanel value={selectedTab} index={1}>
           <Grid container spacing={3}>
             {/* Network Traffic Overview Chart */}
             <Grid item xs={12}>
               <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" component="div">Network Traffic Overview</Typography>
                   <Tooltip title="Inbound vs. Outbound packets per endpoint based on analyzed file.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                 </Box>
                 <Box sx={{ height: 400 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     {/* Using BarChart for clearer comparison per IP */}
                     <BarChart data={analysisResults.endpoints} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}> {/* Increased bottom margin for labels */}
                       <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                       <XAxis
                            dataKey="ip"
                            angle={-45} // Angle labels
                            textAnchor="end" // Anchor angled labels correctly
                            interval={0} // Show all labels
                            tick={{ fontSize: 10 }}
                            height={60} // Allocate space for angled labels
                        />
                       <YAxis tick={{ fontSize: 10 }} />
                       <RechartsTooltip formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name.includes('In') ? 'Inbound Packets' : 'Outbound Packets']} />
                       <Legend iconType="circle" verticalAlign="top" />
                       <Bar dataKey="packetsIn" name="Inbound Packets" fill={COLORS[0]} />
                       <Bar dataKey="packetsOut" name="Outbound Packets" fill={COLORS[1]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </Box>
               </Paper>
             </Grid>

            {/* Data Transfer Analysis Chart */}
            <Grid item xs={12}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div">Data Transfer Analysis</Typography>
                        <Tooltip title="Inbound vs. Outbound data volume (bytes) per endpoint based on analyzed file.">
                            <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                        </Tooltip>
                     </Box>
                    {/* Filters (Optional - Add functionality later if needed) */}
                    {/*
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                       <TextField select size="small" label="Time Range" defaultValue="all" sx={{ minWidth: 120 }}>
                         <MenuItem value="all">All Time (from PCAP)</MenuItem>
                       </TextField>
                       <TextField select size="small" label="Top IPs" defaultValue="all" sx={{ minWidth: 120 }}>
                           <MenuItem value="all">All IPs</MenuItem>
                           <MenuItem value="10">Top 10 by Traffic</MenuItem>
                       </TextField>
                    </Box>
                    */}
                    <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analysisResults.endpoints} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                                <defs>
                                    <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={COLORS[3]} stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS[4]} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={COLORS[4]} stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis
                                    dataKey="ip"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    tick={{ fontSize: 10 }}
                                    height={60}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${(value / 1024).toFixed(1)} KB`} // Format Y-axis ticks
                                    tick={{ fontSize: 10 }}
                                    width={80} // Adjust width for KB labels
                                />
                                <RechartsTooltip formatter={(value: number, name: string) => [`${(value / 1024).toFixed(2)} KB`, name.includes('In') ? 'Inbound Data' : 'Outbound Data']} />
                                <Legend iconType="circle" verticalAlign="top" />
                                <Area
                                    type="monotone"
                                    dataKey="bytesIn"
                                    name="Inbound Data"
                                    stroke={COLORS[3]}
                                    strokeWidth={2}
                                    fill="url(#inboundGradient)"
                                    isAnimationActive={true}
                                    animationDuration={800}
                                    dot={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="bytesOut"
                                    name="Outbound Data"
                                    stroke={COLORS[4]}
                                    strokeWidth={2}
                                    fill="url(#outboundGradient)"
                                    isAnimationActive={true}
                                    animationDuration={800}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

             {/* Quick Stats (Example - populate with real data if available) */}
             {/*
             <Grid item xs={12}>
                <Paper sx={{ p: 2, mt: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Quick Stats</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}> <Paper sx={{ p: 1, bgcolor: 'action.hover' }}><Typography variant="caption">Total Active IPs</Typography><Typography variant="h6">{analysisResults.endpoints.length}</Typography></Paper> </Grid>
                        <Grid item xs={6} sm={3}> <Paper sx={{ p: 1, bgcolor: 'action.hover' }}><Typography variant="caption">Peak Traffic (Example)</Typography><Typography variant="h6">847 MB/s</Typography></Paper> </Grid>
                        <Grid item xs={6} sm={3}> <Paper sx={{ p: 1, bgcolor: 'action.hover' }}><Typography variant="caption">Active Subnets (Example)</Typography><Typography variant="h6">18</Typography></Paper> </Grid>
                        <Grid item xs={6} sm={3}> <Paper sx={{ p: 1, bgcolor: 'action.hover' }}><Typography variant="caption">Anomaly Score (Example)</Typography><Typography variant="h6" color="success.main">Low</Typography></Paper> </Grid>
                    </Grid>
                </Paper>
             </Grid>
             */}
           </Grid>
        </TabPanel>
      )}

      {/* Panel 2: Endpoint Analysis (Conditionally Rendered) */}
      {showDetailedResults && (
        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            {/* Endpoint Traffic Distribution Pie Chart */}
            <Grid item xs={12} md={5}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div">Endpoint Traffic Distribution</Typography>
                        <Tooltip title="Distribution of total traffic (In + Out bytes) across endpoints.">
                            <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analysisResults.endpoints.map(endpoint => ({
                                        name: endpoint.ip,
                                        value: endpoint.bytesIn + endpoint.bytesOut // Sum bytes for total traffic
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60} // Make it a donut chart
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''} // Show label for significant slices
                                    isAnimationActive={true}
                                    animationDuration={800}
                                >
                                    {analysisResults.endpoints.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number, name: string) => [`${(value / 1024).toFixed(2)} KB`, name]} />
                                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* Endpoint Statistics Table */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">Endpoint Statistics</Typography>
                   <Tooltip title="Detailed traffic statistics per endpoint from the analyzed file. Click the dots for actions.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                </Box>
                <TableContainer sx={{ maxHeight: 400 }}> {/* Make table scrollable */}
                  <Table stickyHeader size="small"> {/* Use stickyHeader */}
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets In</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets Out</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data In</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data Out</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Traffic</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell> {/* Action column */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysisResults.endpoints
                        .sort((a, b) => (b.bytesIn + b.bytesOut) - (a.bytesIn + a.bytesOut)) // Sort by total traffic desc
                        .map((endpoint) => {
                            const totalBytes = endpoint.bytesIn + endpoint.bytesOut;
                            // Define traffic thresholds (example)
                            const isHighTraffic = totalBytes > 500000; // e.g., > 500 KB
                            const isMediumTraffic = totalBytes > 100000 && totalBytes <= 500000; // e.g., 100-500 KB
                            let statusLabel = 'Normal';
                            let statusColor: "success" | "warning" | "error" = 'success';
                            if (isHighTraffic) {
                                statusLabel = 'High Traffic';
                                statusColor = 'error';
                            } else if (isMediumTraffic) {
                                statusLabel = 'Medium Traffic';
                                statusColor = 'warning';
                            }

                            return (
                                <TableRow
                                    key={endpoint.ip}
                                    hover // Add hover effect
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>{endpoint.ip}</TableCell>
                                    <TableCell align="right">{endpoint.packetsIn.toLocaleString()}</TableCell>
                                    <TableCell align="right">{endpoint.packetsOut.toLocaleString()}</TableCell>
                                    <TableCell align="right">{(endpoint.bytesIn / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell align="right">{(endpoint.bytesOut / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                                        {(totalBytes / 1024).toFixed(1)} KB
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            color={statusColor}
                                            label={statusLabel}
                                            sx={{ fontWeight: 500, minWidth: 75 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Actions">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleActionMenuOpen(e, endpoint.ip)}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
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
      )}

      {/* Panel 3: Application Analysis (Conditionally Rendered) */}
      {showDetailedResults && (
        <TabPanel value={selectedTab} index={3}>
          <Grid container spacing={3}>
            {/* Application Layer Traffic Over Time Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" component="div">Application Traffic Over Time</Typography>
                   <Tooltip title="Simulated real-time view of application protocol traffic volume. Updates every 5 seconds.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                 </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={applicationTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="time"
                        interval="preserveStartEnd"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Legend iconType="circle" />
                      {/* Dynamically generate lines for available keys except 'time' */}
                      {Object.keys(applicationTimeData[0] || {})
                        .filter(key => key !== 'time')
                        .map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={COLORS[index % COLORS.length]} // Cycle through colors
                                strokeWidth={2}
                                isAnimationActive={true}
                                animationDuration={500}
                                dot={false}
                            />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Application Distribution Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" component="div">Application Distribution</Typography>
                   <Tooltip title="Distribution of application protocols by bytes transferred based on the analyzed file.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
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
                        label={({ name, percent }) => percent > 0.03 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''} // Label only significant slices
                        isAnimationActive={true}
                        animationDuration={800}
                      >
                        {analysisResults.applications.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [`${(value / 1024).toFixed(2)} KB`, 'Bytes']} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Application Layer Statistics Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" component="div">Application Layer Statistics</Typography>
                    <Tooltip title="Detailed statistics per application protocol based on the analyzed file.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                 </Box>
                <TableContainer sx={{ maxHeight: 400 }}> {/* Scrollable */}
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Application</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Connections</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bytes Transferred</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>% of Total Traffic</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysisResults.applications
                        .sort((a, b) => b.bytesTransferred - a.bytesTransferred) // Sort by bytes desc
                        .map((app) => {
                            const totalBytesAllApps = analysisResults.applications.reduce((acc, curr) => acc + curr.bytesTransferred, 0);
                            const percentage = totalBytesAllApps > 0 ? ((app.bytesTransferred / totalBytesAllApps) * 100) : 0;
                            // Define usage thresholds (example)
                            const isHighUsage = app.connections > 300 || percentage > 30; // High connections or > 30% traffic
                            const isMediumUsage = (app.connections > 100 && app.connections <= 300) || (percentage > 10 && percentage <= 30);
                            let statusLabel = 'Normal';
                            let statusColor: "success" | "warning" | "error" = 'success';
                            if (isHighUsage) {
                                statusLabel = 'High Usage';
                                statusColor = 'error';
                            } else if (isMediumUsage) {
                                statusLabel = 'Medium Usage';
                                statusColor = 'warning';
                            }

                            return (
                                <TableRow key={app.application} hover>
                                    <TableCell component="th" scope="row">{app.application}</TableCell>
                                    <TableCell align="right">{app.connections.toLocaleString()}</TableCell>
                                    <TableCell align="right">{(app.bytesTransferred / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            color={statusColor}
                                            label={statusLabel}
                                            sx={{ fontWeight: 500, minWidth: 75 }}
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
      )}

      {/* Action Menu for Endpoint Table */}
        <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={handleActionMenuClose}
        >
            <MenuItem onClick={handleBlockIP}>
                <ListItemIcon> <BlockIcon fontSize="small" /> </ListItemIcon>
                <ListItemText>Block IP</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleIsolateDevice}>
                <ListItemIcon> <SecurityIcon fontSize="small" /> </ListItemIcon>
                <ListItemText>Isolate Device</ListItemText>
            </MenuItem>
             <MenuItem onClick={handleGenerateReport}>
                <ListItemIcon> <ReportIcon fontSize="small" /> </ListItemIcon>
                <ListItemText>Generate Report</ListItemText>
            </MenuItem>
        </Menu>


      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Hide after 6 seconds
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position snackbar
      />
    </Box>
  );
}
