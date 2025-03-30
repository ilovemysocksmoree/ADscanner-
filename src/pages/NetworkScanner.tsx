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
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Menu,
  Alert, // Added for better info display
  AlertTitle, // Added for better info display
} from '@mui/material';
import {
  Computer as ComputerIcon,
  // Router as RouterIcon, // Not used
  // PlayArrow as StartIcon, // Not used
  // Stop as StopIcon, // Not used
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  NetworkCheck as NetworkCheckIcon,
  Apps as AppsIcon,
  Info as InfoIcon,
  // LightMode as LightModeIcon, // Not used
  // DarkMode as DarkModeIcon, // Not used
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Security as SecurityIcon,
  Description as ReportIcon,
  Download as DownloadIcon,
  Public as GlobeIcon, // For Geo Analysis
  Timer as TtlIcon, // For TTL Analysis
  BarChart as BarChartIcon, // For IP Traffic
  PieChart as PieChartIcon, // For Protocol Summary
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
// Assuming AlertBar, useAuth, loggingService are correctly imported from your project structure
// import AlertBar from '../components/AlertBar'; // Example path
// import { useAuth } from '../contexts/AuthContext'; // Example path
// import { loggingService } from '../services/LoggingService'; // Example path

// --- Mock Implementations (Replace with your actual imports) ---
const AlertBar = ({ severity, title, message, onTakeAction, onMarkBenign }: any) => (
  <Paper elevation={2} sx={{ p: 2, mb: 1, borderLeft: 5, borderColor: `${severity}.main`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
    <Box sx={{ flexGrow: 1, mr: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
      <Typography variant="body2">{message}</Typography>
    </Box>
    <Box sx={{ mt: { xs: 1, sm: 0 } }}> {/* Add margin top on small screens */}
      <Button size="small" onClick={onTakeAction} sx={{ mr: 1 }} variant="outlined" color={severity}>Investigate</Button>
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
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#AF19FF', '#FF5733', '#C70039']; // Added more colors
const TTL_COLOR = '#FF8042'; // Dedicated color for TTL chart bars

// --- Interfaces ---
interface ProtocolData {
    protocol: string;
    count: number;
    percentage?: number; // Optional as it can be calculated
}

interface EndpointData {
    ip: string;
    packetsIn: number;
    packetsOut: number;
    bytesIn: number;
    bytesOut: number;
    location?: { // Added for Geo Analysis
        city: string;
        country: string;
        countryCode: string; // e.g., 'US', 'NP'
    };
    hostname?: string; // Optional hostname
}

interface ApplicationData {
    application: string;
    connections: number;
    bytesTransferred: number;
}

interface TtlDistributionData {
    ttl: number; // TTL value (e.g., 64, 128)
    count: number; // Number of packets with this TTL
}

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
  protocols: ProtocolData[];
  endpoints: EndpointData[];
  applications: ApplicationData[];
  ttlDistribution: TtlDistributionData[]; // Added TTL analysis
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

// --- Mock Data ---
const mockProtocolData: ProtocolData[] = [
  { protocol: 'TCP', count: 1250 },
  { protocol: 'UDP', count: 850 },
  { protocol: 'ICMP', count: 400 },
  { protocol: 'Other', count: 280 },
];

const mockEndpointData: EndpointData[] = [
  { ip: '192.168.1.100', packetsIn: 2500, packetsOut: 1800, bytesIn: 250000, bytesOut: 180000, hostname: 'Desktop-PC' },
  { ip: '192.168.1.101', packetsIn: 1500, packetsOut: 1200, bytesIn: 150000, bytesOut: 120000, hostname: 'Laptop-User' },
  { ip: '192.168.1.150', packetsIn: 5230, packetsOut: 4100, bytesIn: 1200000, bytesOut: 850000, hostname: 'Server-Main' },
  { ip: '192.168.1.200', packetsIn: 500, packetsOut: 300, bytesIn: 50000, bytesOut: 30000, hostname: 'Unknown-Device' },
  { ip: '8.8.8.8', packetsIn: 100, packetsOut: 1000, bytesIn: 10000, bytesOut: 100000, hostname: 'google-dns' }, // External IP
  { ip: '104.16.132.229', packetsIn: 50, packetsOut: 800, bytesIn: 5000, bytesOut: 80000, hostname: 'cloudflare' }, // External IP
];

const mockAppData: ApplicationData[] = [
  { application: 'HTTPS', connections: 450, bytesTransferred: 500000 }, // Changed to HTTPS
  { application: 'DNS', connections: 250, bytesTransferred: 25000 },
  { application: 'SMB', connections: 150, bytesTransferred: 300000 },
  { application: 'SMTP', connections: 80, bytesTransferred: 150000 },
  { application: 'TLS', connections: 600, bytesTransferred: 1000000 }, // Often encapsulates others
];

const mockDevices: NetworkDevice[] = [ // Only used for the (commented out) scan feature
  { ip: '192.168.1.1', hostname: 'Gateway-Router', type: 'router', services: [{ port: 80, name: 'HTTP', status: 'open' }, { port: 443, name: 'HTTPS', status: 'open' }, { port: 53, name: 'DNS', status: 'open' }] },
  { ip: '192.168.1.100', hostname: 'Desktop-PC', type: 'computer', services: [{ port: 445, name: 'SMB', status: 'open' }, { port: 139, name: 'NetBIOS', status: 'open' }] },
   { ip: '192.168.1.101', hostname: 'Laptop-User', type: 'computer', services: [{ port: 22, name: 'SSH', status: 'closed' }] },
];

const mockNetworkAlerts: NetworkAlert[] = [
  { id: '1', title: 'Suspicious Network Activity', message: 'Unusual port scanning detected from device 192.168.1.150', severity: 'error', deviceIp: '192.168.1.150' },
  { id: '2', title: 'New Device Detected', message: 'Unrecognized device joined the network: 192.168.1.200', severity: 'warning', deviceIp: '192.168.1.200' },
  { id: '3', title: 'External Communication Anomaly', message: 'High outbound traffic from 192.168.1.150 to 104.16.132.229 (Cloudflare)', severity: 'warning', deviceIp: '192.168.1.150' },
];

// --- Helper Components ---
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`network-tabpanel-${index}`} aria-labelledby={`network-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return { id: `network-tab-${index}`, 'aria-controls': `network-tabpanel-${index}` };
}

// --- Main Component ---
export default function NetworkScanner() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<NetworkAlert[]>(mockNetworkAlerts);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);

  // Derived state for charts/tables based on analysisDetails
  const [analysisResults, setAnalysisResults] = useState({
    protocols: [] as ProtocolData[],
    endpoints: [] as EndpointData[],
    applications: [] as ApplicationData[],
    ttlDistribution: [] as TtlDistributionData[],
  });

  // State for time-series data (only updated when results are shown)
  const [protocolTimeData, setProtocolTimeData] = useState<{ time: string; [key: string]: any }[]>([]);
  const [applicationTimeData, setApplicationTimeData] = useState<{ time: string; [key: string]: any }[]>([]);

  // State for action menu
  const [selectedDeviceIp, setSelectedDeviceIp] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  // --- Handlers ---
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTakeAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Investigating: ${alert?.title || 'alert ' + alertId}`);
    setSnackbarOpen(true);
    loggingService.addLog(user, 'NETWORK_ALERT_ACTION', `Investigating alert: ${alert?.title}`, '/network-scanner');
  };

  const handleMarkBenign = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Alert marked as benign: ${alert?.title}`);
    setSnackbarOpen(true);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    loggingService.addLog(user, 'NETWORK_ALERT_BENIGN', `Marked alert as benign: ${alert?.title}`, '/network-scanner');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
        setSnackbarMessage(`File "${uploadedFile.name}" selected. Click 'Analyze File'.`);
        setSnackbarOpen(true);
        setShowDetailedResults(false);
        setAnalysisDetails(null);
        setAnalysisResults({ protocols: [], endpoints: [], applications: [], ttlDistribution: [] }); // Clear derived state too
        setProtocolTimeData([]); // Clear time series
        setApplicationTimeData([]); // Clear time series
        setSelectedTab(0);
        loggingService.addLog(user, 'PCAP_FILE_SELECTED', `Selected file: ${uploadedFile.name}`, '/network-scanner');
    }
    event.target.value = ''; // Allow re-uploading same file
  };

  const handleAnalyzeFile = () => {
    if (!file) {
        setSnackbarMessage('Please upload a PCAP file first.');
        setSnackbarOpen(true);
        return;
    }

    setIsAnalyzing(true);
    setShowDetailedResults(false);
    setAnalysisDetails(null);
    loggingService.addLog(user, 'PCAP_ANALYSIS_START', `Started analysis of PCAP file: ${file.name}`, '/network-scanner');

    // Simulate PCAP analysis
    setTimeout(() => {
      // --- Generate Mock Analysis Details ---
      const totalPackets = Math.floor(Math.random() * 20000) + 5000;
      const generatedProtocols = mockProtocolData.map(p => ({...p, count: Math.floor(p.count * (Math.random() * 0.4 + 0.8)) }));
      const generatedEndpoints = mockEndpointData.map(e => {
          // Simulate location based on IP type
          let location: EndpointData['location'] | undefined = undefined;
          if (e.ip === '8.8.8.8') location = { city: 'Mountain View', country: 'United States', countryCode: 'US' };
          else if (e.ip === '104.16.132.229') location = { city: 'San Francisco', country: 'United States', countryCode: 'US' };
          else if (e.ip.startsWith('192.168.')) location = { city: 'Kathmandu', country: 'Nepal', countryCode: 'NP' }; // Internal IPs -> Local
          else location = { city: 'Unknown', country: 'Unknown', countryCode: 'XX' }; // Default for others

          return {
            ...e,
            packetsIn: Math.floor(e.packetsIn * (Math.random() * 0.4 + 0.8)),
            packetsOut: Math.floor(e.packetsOut * (Math.random() * 0.4 + 0.8)),
            bytesIn: Math.floor(e.bytesIn * (Math.random() * 0.4 + 0.8)),
            bytesOut: Math.floor(e.bytesOut * (Math.random() * 0.4 + 0.8)),
            location: location, // Add simulated location
        }});
      const generatedApplications = mockAppData.map(a => ({ ...a, connections: Math.floor(a.connections * (Math.random() * 0.4 + 0.8)), bytesTransferred: Math.floor(a.bytesTransferred * (Math.random() * 0.4 + 0.8)) }));

      // Simulate TTL Distribution
      const generatedTtlDistribution: TtlDistributionData[] = [
          { ttl: 64, count: Math.floor(totalPackets * (Math.random() * 0.2 + 0.4)) }, // ~40-60% have TTL 64
          { ttl: 128, count: Math.floor(totalPackets * (Math.random() * 0.2 + 0.2)) }, // ~20-40% have TTL 128
          { ttl: 58, count: Math.floor(totalPackets * (Math.random() * 0.1 + 0.05)) }, // Smaller amounts for others
          { ttl: 255, count: Math.floor(totalPackets * (Math.random() * 0.05 + 0.02)) },
          { ttl: 32, count: Math.floor(totalPackets * (Math.random() * 0.05 + 0.01)) },
      ].filter(ttl => ttl.count > 0); // Filter out zero counts

      const generatedAnalysisDetails: AnalysisDetails = {
        timestamp: new Date().toISOString(),
        totalPackets: totalPackets,
        totalBytes: generatedEndpoints.reduce((sum, e) => sum + e.bytesIn + e.bytesOut, 0),
        duration: `00:${String(Math.floor(Math.random() * 50) + 10).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        protocols: generatedProtocols,
        endpoints: generatedEndpoints,
        applications: generatedApplications,
        ttlDistribution: generatedTtlDistribution, // Add TTL data
        topTalkers: [ // Keep mock top talkers for simplicity
          { ip: '192.168.1.150', packets: generatedEndpoints.find(e=>e.ip === '192.168.1.150')?.packetsOut || 4100, bytes: '1.5 GB', protocols: ['HTTPS', 'SMB', 'TLS'] },
          { ip: '192.168.1.100', packets: generatedEndpoints.find(e=>e.ip === '192.168.1.100')?.packetsOut || 1800, bytes: '850 MB', protocols: ['HTTPS', 'DNS', 'TLS'] },
          { ip: '8.8.8.8', packets: generatedEndpoints.find(e=>e.ip === '8.8.8.8')?.packetsIn || 100, bytes: '100 KB', protocols: ['DNS'] },
        ],
        suspiciousActivities: [ // Keep mock suspicious activities
          { type: 'Port Scan', description: 'Rapid connection attempts to multiple ports from 192.168.1.150', severity: 'high', timestamp: new Date(Date.now() - 60000).toISOString() },
          { type: 'Data Exfiltration Attempt', description: 'Large outbound data transfer detected from 192.168.1.150 to external IP (104.16.132.229)', severity: 'medium', timestamp: new Date().toISOString() }
        ]
      };
      // --- End Mock Analysis Details ---

      setAnalysisDetails(generatedAnalysisDetails); // Store the full details
      // Update derived state for direct use in charts/tables
      setAnalysisResults({
          protocols: generatedAnalysisDetails.protocols,
          endpoints: generatedAnalysisDetails.endpoints,
          applications: generatedAnalysisDetails.applications,
          ttlDistribution: generatedAnalysisDetails.ttlDistribution,
      });
      setIsAnalyzing(false);
      setShowDetailedResults(true); // IMPORTANT: Show the results tabs/panels
      setSnackbarMessage(`PCAP file "${file.name}" analysis completed successfully.`);
      setSnackbarOpen(true);
      loggingService.addLog(user, 'PCAP_ANALYSIS_COMPLETE', `Completed analysis of PCAP file: ${file.name}`, '/network-scanner');

      // Initialize time-series data based on analysis (optional)
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const initialProtoData = { time: timeStr };
      generatedProtocols.forEach(p => initialProtoData[p.protocol] = p.count / 10); // Example initial value
      setProtocolTimeData(Array(6).fill(initialProtoData)); // Fill buffer

      const initialAppData = { time: timeStr };
      generatedApplications.forEach(a => initialAppData[a.application] = a.connections / 10); // Example initial value
      setApplicationTimeData(Array(6).fill(initialAppData)); // Fill buffer


    }, 3000); // Simulate 3 seconds analysis time
  };

  const handleExportResults = () => {
    // ... (Export logic remains the same)
    if (!analysisDetails) {
        setSnackbarMessage('No analysis results available to export.');
        setSnackbarOpen(true);
        return;
    }
    const exportData = { /* ... construct exportData ... */ };
     try {
        const blob = new Blob([JSON.stringify(analysisDetails, null, 2)], { type: 'application/json' }); // Export full details
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
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

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, deviceIp: string) => {
    setSelectedDeviceIp(deviceIp);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedDeviceIp(null);
  };

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
    // ... (Real-time update logic remains the same, maybe adjust interval)
    let protocolInterval: NodeJS.Timeout | null = null;
    let appInterval: NodeJS.Timeout | null = null;

    if (showDetailedResults && !isAnalyzing) {
      protocolInterval = setInterval(() => {
          setProtocolTimeData(prev => {
              if (!prev || prev.length === 0) return prev; // Guard against empty array
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const newDataPoint = { time: timeStr };
              // Use keys from the first data point (excluding 'time') to generate new values
              Object.keys(prev[0]).filter(k => k !== 'time').forEach(key => {
                  newDataPoint[key] = Math.floor(Math.random() * (prev[0][key] * 1.5) + (prev[0][key] * 0.5)); // Simulate fluctuations
              });
              return [...prev.slice(1), newDataPoint];
          });
      }, 5000); // Update every 5 seconds

       appInterval = setInterval(() => {
          setApplicationTimeData(prev => {
              if (!prev || prev.length === 0) return prev; // Guard against empty array
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const newDataPoint = { time: timeStr };
               Object.keys(prev[0]).filter(k => k !== 'time').forEach(key => {
                  newDataPoint[key] = Math.floor(Math.random() * (prev[0][key] * 1.5) + (prev[0][key] * 0.5)); // Simulate fluctuations
              });
              return [...prev.slice(1), newDataPoint];
          });
      }, 5000);
    }
    return () => { // Cleanup
      if (protocolInterval) clearInterval(protocolInterval);
      if (appInterval) clearInterval(appInterval);
    };
  }, [showDetailedResults, isAnalyzing]);


  // --- Render Component ---
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Alerts Section */}
      <Box sx={{ mb: 3 }}>
        {alerts.length > 0 ? alerts.map((alert) => (
          <AlertBar key={alert.id} severity={alert.severity} title={alert.title} message={alert.message} onTakeAction={() => handleTakeAction(alert.id)} onMarkBenign={() => handleMarkBenign(alert.id)} />
        )) : (
            <Alert severity="success" variant="outlined">No active alerts found.</Alert>
        )}
      </Box>

      {/* PCAP Upload and Analysis Control */}
       <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
         {/* ... (Upload/Analyze buttons remain the same) ... */}
         <Typography variant="h6" gutterBottom component="div"> PCAP File Analysis </Typography>
         <Grid container spacing={2} alignItems="center">
           <Grid item xs={12} sm={file ? 4 : 6} md={file ? 3 : 4}>
             <Button fullWidth variant="outlined" component="label" startIcon={<UploadIcon />}>
               {file ? "Change File" : "Upload PCAP"}
               <input type="file" hidden accept=".pcap,.pcapng" onChange={handleFileUpload} />
             </Button>
           </Grid>
           {file && (
             <>
                <Grid item xs={12} sm={4} md={6}>
                    <Tooltip title={file.name}>
                        <Typography noWrap variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: { xs: 'center', sm: 'left'} }}>
                            Selected: {file.name}
                        </Typography>
                    </Tooltip>
                </Grid>
               <Grid item xs={12} sm={4} md={3}>
                 <Button fullWidth variant="contained" color="primary" onClick={handleAnalyzeFile} disabled={isAnalyzing} startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />}>
                   {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                 </Button>
               </Grid>
             </>
           )}
         </Grid>
         {analysisDetails && showDetailedResults && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportResults} size="small">
                    Export Results (JSON)
                </Button>
            </Box>
         )}
       </Paper>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="network analysis tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="Analysis Summary" icon={<AssessmentIcon />} {...a11yProps(0)} />
          {showDetailedResults && <Tab label="Network Overview" icon={<NetworkCheckIcon />} {...a11yProps(1)} />}
          {showDetailedResults && <Tab label="Endpoint Analysis" icon={<ComputerIcon />} {...a11yProps(2)} />}
          {showDetailedResults && <Tab label="Application Analysis" icon={<AppsIcon />} {...a11yProps(3)} />}
        </Tabs>
      </Box>

      {/* Tab Panels */}

      {/* Panel 0: Analysis Summary (Previously Protocol Analysis) */}
      <TabPanel value={selectedTab} index={0}>
        {!showDetailedResults && !isAnalyzing && (
            <Alert severity="info" variant="outlined">Upload and analyze a PCAP file to see the detailed analysis results.</Alert>
        )}
        {isAnalyzing && (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
                <CircularProgress sx={{ mr: 2 }}/>
                <Typography>Analyzing PCAP file...</Typography>
            </Box>
        )}
        {showDetailedResults && analysisDetails && (
             <Grid container spacing={3}>
                {/* Analysis Summary Info */}
                <Grid item xs={12}>
                    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                        <Typography variant="h6" gutterBottom>Analysis Summary</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6} md={3}> <Typography variant="body2"><strong>File:</strong> {file?.name || 'N/A'}</Typography> </Grid>
                            <Grid item xs={12} sm={6} md={3}> <Typography variant="body2"><strong>Analyzed At:</strong> {new Date(analysisDetails.timestamp).toLocaleString()}</Typography> </Grid>
                            <Grid item xs={6} sm={6} md={2}> <Typography variant="body2"><strong>Duration:</strong> {analysisDetails.duration}</Typography> </Grid>
                            <Grid item xs={6} sm={6} md={2}> <Typography variant="body2"><strong>Total Packets:</strong> {analysisDetails.totalPackets.toLocaleString()}</Typography> </Grid>
                            <Grid item xs={12} sm={6} md={2}> <Typography variant="body2"><strong>Total Bytes:</strong> {(analysisDetails.totalBytes / 1024 / 1024).toFixed(2)} MB</Typography> </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                 {/* Suspicious Activities */}
                {analysisDetails.suspiciousActivities.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Suspicious Activities Detected</Typography>
                            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {analysisDetails.suspiciousActivities.map((activity, index) => (
                                    <ListItem key={index} divider sx={{ alignItems: 'flex-start' }}>
                                        <ListItemText
                                            primary={`${activity.type}`}
                                            secondary={
                                                <>
                                                 <Typography component="span" variant="body2" color="text.primary">{activity.description}</Typography>
                                                 {` - ${new Date(activity.timestamp).toLocaleTimeString()}`}
                                                </>
                                              }
                                        />
                                         <Chip
                                            label={activity.severity}
                                            size="small"
                                            color={activity.severity === 'high' ? 'error' : activity.severity === 'medium' ? 'warning' : 'info'}
                                            sx={{ ml: 1, mt: 0.5, alignSelf: 'center' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                )}

                {/* Top Talkers */}
                {analysisDetails.topTalkers.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Top Talkers (by Outbound Packets)</Typography>
                            <TableContainer sx={{ maxHeight: 300, overflow: 'auto' }}>
                                <Table size="small" stickyHeader>
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
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontWeight: 500 }}>{talker.ip}</TableCell>
                                                <TableCell align="right">{talker.packets.toLocaleString()}</TableCell>
                                                <TableCell align="right">{talker.bytes}</TableCell>
                                                <TableCell>
                                                    {talker.protocols.slice(0, 3).map(p => <Chip key={p} label={p} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}
                                                    {talker.protocols.length > 3 && <Chip label="..." size="small" variant="outlined" />}
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
        )}
      </TabPanel>

      {/* Panel 1: Network Overview (ENHANCED) */}
      {showDetailedResults && analysisDetails && (
        <TabPanel value={selectedTab} index={1}>
           <Grid container spacing={3}>
                {/* Item 1: IP Traffic Distribution (Top N by Bytes) */}
                <Grid item xs={12} md={6} lg={7}>
                    <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                           <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                           <Typography variant="h6" component="div">IP Traffic Distribution</Typography>
                           <Tooltip title="Top 10 IP addresses by total data transferred (In + Out).">
                             <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                           </Tooltip>
                         </Box>
                         <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analysisResults.endpoints
                                            .map(e => ({ ip: e.ip, totalBytes: e.bytesIn + e.bytesOut }))
                                            .sort((a, b) => b.totalBytes - a.totalBytes)
                                            .slice(0, 10)} // Top 10
                                    layout="vertical" // Vertical bars for better IP label readability
                                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }} // Adjust margins
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" tickFormatter={(value) => `${(value / 1024).toFixed(0)} KB`} tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="ip" width={100} interval={0} tick={{ fontSize: 10 }} />
                                    <RechartsTooltip formatter={(value: number) => [`${(value / 1024).toFixed(2)} KB`, 'Total Bytes']} />
                                    <Bar dataKey="totalBytes" name="Total Bytes" fill={COLORS[0]} background={{ fill: '#eee' }} radius={[0, 5, 5, 0]} barSize={20}/>
                                </BarChart>
                            </ResponsiveContainer>
                         </Box>
                    </Paper>
                </Grid>

                {/* Item 2: Protocol Distribution Summary */}
                 <Grid item xs={12} md={6} lg={5}>
                    <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                           <PieChartIcon sx={{ mr: 1, color: 'secondary.main' }} />
                           <Typography variant="h6" component="div">Protocol Summary</Typography>
                           <Tooltip title="Overall distribution of network protocols by packet count.">
                             <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                           </Tooltip>
                         </Box>
                         <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                    <Pie
                                        data={analysisResults.protocols}
                                        dataKey="count"
                                        nameKey="protocol"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        innerRadius={50} // Donut chart
                                        labelLine={false}
                                        label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                                        isAnimationActive={true}
                                        animationDuration={800}
                                    >
                                        {analysisResults.protocols.map((entry, index) => (
                                            <Cell key={`cell-proto-summary-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} packets`, 'Count']} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                         </Box>
                    </Paper>
                </Grid>

                 {/* Item 3: TTL Distribution (CHANGED TO HORIZONTAL BAR) */}
                <Grid item xs={12} md={6} lg={7}>
                    <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                           <TtlIcon sx={{ mr: 1, color: TTL_COLOR }} /> {/* Use TTL color */}
                           <Typography variant="h6" component="div">TTL Distribution</Typography>
                           <Tooltip title="Distribution of Time-To-Live (TTL) values observed in packets. Common values are 64, 128, 255.">
                             <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                           </Tooltip>
                         </Box>
                         <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analysisResults.ttlDistribution.sort((a,b) => b.count - a.count)} // Sort by count
                                    layout="vertical" // Set layout to vertical (horizontal bars)
                                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }} // Adjust margins for labels
                                >
                                    {/* Define gradient */}
                                    <defs>
                                        <linearGradient id="ttlGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor={TTL_COLOR} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={TTL_COLOR} stopOpacity={0.4}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} /> {/* Only vertical grid lines */}
                                    {/* X Axis is now the count */}
                                    <XAxis type="number" tickFormatter={(value) => value.toLocaleString()} tick={{ fontSize: 10 }} />
                                    {/* Y Axis is now the TTL category */}
                                    <YAxis type="category" dataKey="ttl" name="TTL Value" width={40} tick={{ fontSize: 10 }} />
                                    <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} packets`, 'Count']} cursor={{ fill: 'rgba(200,200,200,0.1)' }}/>
                                    <Bar
                                        dataKey="count"
                                        name="Packet Count"
                                        fill="url(#ttlGradient)" // Apply gradient fill
                                        radius={[0, 5, 5, 0]} // Rounded corners on the right
                                        barSize={20} // Adjust bar thickness
                                     />
                                </BarChart>
                            </ResponsiveContainer>
                         </Box>
                    </Paper>
                </Grid>

                 {/* Item 4: Geographic Traffic Summary */}
                <Grid item xs={12} md={6} lg={5}>
                    <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                           <GlobeIcon sx={{ mr: 1, color: 'success.main' }} />
                           <Typography variant="h6" component="div">Geographic Traffic</Typography>
                           <Tooltip title="Simulated geographic locations of endpoints based on IP address.">
                             <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                           </Tooltip>
                         </Box>
                         <TableContainer sx={{ maxHeight: 350 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IP Address</TableCell>
                                        <TableCell>Location</TableCell>
                                        <TableCell align="right">Total Bytes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analysisResults.endpoints
                                        .filter(e => e.location?.countryCode !== 'XX') // Filter out unknowns if desired
                                        .sort((a, b) => (b.bytesIn + b.bytesOut) - (a.bytesIn + a.bytesOut))
                                        .map((endpoint) => (
                                        <TableRow key={endpoint.ip} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{endpoint.ip}</TableCell>
                                            <TableCell>
                                                {endpoint.location ? `${endpoint.location.city}, ${endpoint.location.country}` : 'N/A'}
                                                {endpoint.location && endpoint.location.countryCode !== 'XX' && (
                                                    <Tooltip title={endpoint.location.country}>
                                                        <img
                                                            loading="lazy"
                                                            width="20"
                                                            src={`https://flagcdn.com/w20/${endpoint.location.countryCode.toLowerCase()}.png`}
                                                            srcSet={`https://flagcdn.com/w40/${endpoint.location.countryCode.toLowerCase()}.png 2x`}
                                                            alt={`${endpoint.location.countryCode} flag`}
                                                            style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                                                            onError={(e) => e.currentTarget.style.display='none'} // Hide if flag fails to load
                                                        />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {((endpoint.bytesIn + endpoint.bytesOut) / 1024).toFixed(1)} KB
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
      )}

      {/* Panel 2: Endpoint Analysis */}
      {showDetailedResults && analysisDetails && (
        <TabPanel value={selectedTab} index={2}>
          {/* ... (Endpoint Analysis content remains largely the same) ... */}
           <Grid container spacing={3}>
            {/* Endpoint Traffic Distribution Pie Chart */}
            <Grid item xs={12} md={5}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ComputerIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div">Endpoint Traffic Share</Typography>
                        <Tooltip title="Share of total traffic (In + Out bytes) per endpoint.">
                            <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analysisResults.endpoints.map(endpoint => ({ name: endpoint.ip, value: endpoint.bytesIn + endpoint.bytesOut }))}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value"
                                    labelLine={false} label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                                    isAnimationActive={true} animationDuration={800}
                                >
                                    {analysisResults.endpoints.map((entry, index) => ( <Cell key={`cell-ep-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
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
                   <Tooltip title="Detailed traffic statistics per endpoint. Click the dots for actions.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets In</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets Out</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data In</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data Out</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Traffic</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysisResults.endpoints
                        .sort((a, b) => (b.bytesIn + b.bytesOut) - (a.bytesIn + a.bytesOut))
                        .map((endpoint) => {
                            const totalBytes = endpoint.bytesIn + endpoint.bytesOut;
                            const isHighTraffic = totalBytes > 500000;
                            const isMediumTraffic = totalBytes > 100000 && totalBytes <= 500000;
                            let statusLabel = 'Normal';
                            let statusColor: "success" | "warning" | "error" = 'success';
                            if (isHighTraffic) { statusLabel = 'High Traffic'; statusColor = 'error'; }
                            else if (isMediumTraffic) { statusLabel = 'Medium Traffic'; statusColor = 'warning'; }

                            return (
                                <TableRow key={endpoint.ip} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>{endpoint.ip}</TableCell>
                                    <TableCell align="right">{endpoint.packetsIn.toLocaleString()}</TableCell>
                                    <TableCell align="right">{endpoint.packetsOut.toLocaleString()}</TableCell>
                                    <TableCell align="right">{(endpoint.bytesIn / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell align="right">{(endpoint.bytesOut / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 500 }}>{(totalBytes / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell> <Chip size="small" color={statusColor} label={statusLabel} sx={{ fontWeight: 500, minWidth: 75 }} /> </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Actions">
                                            <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, endpoint.ip)}> <MoreVertIcon fontSize="small" /> </IconButton>
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

      {/* Panel 3: Application Analysis */}
      {showDetailedResults && analysisDetails && (
        <TabPanel value={selectedTab} index={3}>
          {/* ... (Application Analysis content remains largely the same) ... */}
           <Grid container spacing={3}>
            {/* Application Layer Traffic Over Time Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AppsIcon sx={{ mr: 1, color: 'primary.main' }} />
                   <Typography variant="h6" component="div">Application Traffic Over Time</Typography>
                   <Tooltip title="Simulated real-time view of application protocol traffic volume (connections).">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                 </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={applicationTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="time" interval="preserveStartEnd" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Legend iconType="circle" />
                      {Object.keys(applicationTimeData[0] || {}).filter(key => key !== 'time').map((key, index) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} isAnimationActive={true} animationDuration={500} dot={false} />
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
                   <Typography variant="h6" component="div">Application Share (Bytes)</Typography>
                   <Tooltip title="Distribution of application protocols by bytes transferred.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                 </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisResults.applications} dataKey="bytesTransferred" nameKey="application" cx="50%" cy="50%" outerRadius={100}
                        label={({ name, percent }) => percent > 0.03 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                        isAnimationActive={true} animationDuration={800}
                      >
                        {analysisResults.applications.map((entry, index) => ( <Cell key={`cell-app-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
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
                    <Tooltip title="Detailed statistics per application protocol.">
                     <IconButton size="small" sx={{ ml: 1 }}> <InfoIcon fontSize="small" /> </IconButton>
                   </Tooltip>
                 </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
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
                        .sort((a, b) => b.bytesTransferred - a.bytesTransferred)
                        .map((app) => {
                            const totalBytesAllApps = analysisResults.applications.reduce((acc, curr) => acc + curr.bytesTransferred, 0);
                            const percentage = totalBytesAllApps > 0 ? ((app.bytesTransferred / totalBytesAllApps) * 100) : 0;
                            const isHighUsage = app.connections > 300 || percentage > 30;
                            const isMediumUsage = (app.connections > 100 && app.connections <= 300) || (percentage > 10 && percentage <= 30);
                            let statusLabel = 'Normal';
                            let statusColor: "success" | "warning" | "error" = 'success';
                             if (isHighUsage) { statusLabel = 'High Usage'; statusColor = 'error'; }
                            else if (isMediumUsage) { statusLabel = 'Medium Usage'; statusColor = 'warning'; }

                            return (
                                <TableRow key={app.application} hover>
                                    <TableCell component="th" scope="row">{app.application}</TableCell>
                                    <TableCell align="right">{app.connections.toLocaleString()}</TableCell>
                                    <TableCell align="right">{(app.bytesTransferred / 1024).toFixed(1)} KB</TableCell>
                                    <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                                    <TableCell> <Chip size="small" color={statusColor} label={statusLabel} sx={{ fontWeight: 500, minWidth: 75 }} /> </TableCell>
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
        <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
            <MenuItem onClick={handleBlockIP}> <ListItemIcon> <BlockIcon fontSize="small" /> </ListItemIcon> <ListItemText>Block IP</ListItemText> </MenuItem>
            <MenuItem onClick={handleIsolateDevice}> <ListItemIcon> <SecurityIcon fontSize="small" /> </ListItemIcon> <ListItemText>Isolate Device</ListItemText> </MenuItem>
             <MenuItem onClick={handleGenerateReport}> <ListItemIcon> <ReportIcon fontSize="small" /> </ListItemIcon> <ListItemText>Generate Report</ListItemText> </MenuItem>
        </Menu>

      {/* Snackbar for Notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
