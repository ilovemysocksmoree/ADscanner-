import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios'
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
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';
import { mockNetworkAlerts } from '../mocks/networkData';
import { NetworkAlert, AnalysisDetails, ApiResponseData, ProtocolData, EndpointData, ApplicationData, TtlDistributionData } from '../types/network';
import AlertSection from '../components/AlertSection/AlertSection';
import FileUploadSection from '../components/FileUploadSection/FileUploadSection';
import TabPanel, { a11yProps } from '../components/TabPanel/TabPanel';
import NetworkOverviewPanel from '../components/NetworkOverviewPanel/NetworkOverviewPanel';
import EndpointAnalysisPanel from '../components/EndpointAnalysisPanel/EndpointAnalysisPanel';
import ApplicationAnalysisPanel from '../components/ApplicationAnalysisPanel/ApplicationAnalysisPanel';
import AnalysisSummaryPanel from '../components/AnalysisSummaryPanel/AnalysisSummaryPanel';
import { COLORS, TTL_COLOR } from '../constants/chartColors';

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

  // Derived state for charts/tables
  const [analysisResults, setAnalysisResults] = useState<{
    protocols: ProtocolData[];
    endpoints: EndpointData[];
    applications: ApplicationData[];
    ttlDistribution: TtlDistributionData[];
  }>({
    protocols: [],
    endpoints: [],
    applications: [],
    ttlDistribution: [],
  });

  // State for time-series data
  const [protocolTimeData, setProtocolTimeData] = useState<{ time: string; [key: string]: any }[]>([]);
  const [applicationTimeData, setApplicationTimeData] = useState<{ time: string; [key: string]: any }[]>([]);

  // State for action menu
  const [selectedDeviceIp, setSelectedDeviceIp] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTakeAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Investigating: ${alert?.title || 'alert ' + alertId}`);
    setSnackbarOpen(true);
    if (user) {
      loggingService.addLog(user, 'NETWORK_ALERT_ACTION', `Investigating alert: ${alert?.title}`, '/network-scanner');
    }
  };

  const handleMarkBenign = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    setSnackbarMessage(`Alert marked as benign: ${alert?.title}`);
    setSnackbarOpen(true);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    if (user) {
      loggingService.addLog(user, 'NETWORK_ALERT_BENIGN', `Marked alert as benign: ${alert?.title}`, '/network-scanner');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const uploadedFile = event.target.files[0];
      setFile(uploadedFile);
      setSnackbarMessage(`File "${uploadedFile.name}" selected. Click 'Analyze File'.`);
      setSnackbarOpen(true);
      setShowDetailedResults(false);
      setAnalysisDetails(null);
      setAnalysisResults({ protocols: [], endpoints: [], applications: [], ttlDistribution: [] });
      setProtocolTimeData([]);
      setApplicationTimeData([]);
      setSelectedTab(0);
      if (user) {
        loggingService.addLog(user, 'PCAP_FILE_SELECTED', `Selected file: ${uploadedFile.name}`, '/network-scanner');
      }
    }
    event.target.value = '';
  };

  const handleAnalyzeFile = async () => {
    const backendURL: string = 'localhost';
    const backendPort: number = 4444;

    if (!file) {
      setSnackbarMessage('Please upload a PCAP file first.');
      setSnackbarOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setShowDetailedResults(false);
    setAnalysisDetails(null);
    if (user) {
      loggingService.addLog(user, 'PCAP_ANALYSIS_START', `Started analysis of PCAP file: ${file.name}`, '/network-scanner');
    }

    const formData: FormData = new FormData()
    formData.append("pcap_file", file)

    try {
        const resp: AxiosResponse<any, any> = await axios.post(`http://${backendURL}:${backendPort}/api/v1/scan/pcap`, formData, {
            headers: {
                'Content-Type': "multipart/form-data",
            },
        });

        console.log("API Response:", resp.data);

        if (resp.data) {
            const apiResponse = resp.data as ApiResponseData;

            // Transform data into AnalysisDetails (or your chart-ready format)
            const transformedAnalysisDetails: AnalysisDetails = {
                timestamp: new Date().toISOString(), // You might need to get this from the API if available
                totalPackets: apiResponse.network_layer_metrics.TotalPacket,
                totalBytes: 0,
                duration: "00:00:00", 
                protocols: Object.entries(apiResponse.application_layer_metrics.ProtocolStats).map(([protocol, stats]) => ({
                    protocol: protocol,
                    count: stats.PacketCount,
                })),
                endpoints: Object.entries(apiResponse.network_layer_metrics.IPStats).map(([ip, count]) => ({
                    ip: ip,
                    packetsIn: count, // You might need to calculate these based on your API response
                    packetsOut: 0, // You might need to calculate these based on your API response
                    bytesIn: 0, // You might need to calculate these based on your API response
                    bytesOut: 0, // You might need to calculate these based on your API response
                    // location: {}, // You'll need to add logic for location if needed
                })),
                applications: Object.entries(apiResponse.application_layer_metrics.ProtocolStats).map(([application, stats]) => ({
                    application: application,
                    connections: stats.RequestCount + stats.ResponseCount, // Example calculation
                    bytesTransferred: 0, // You might need to calculate this based on your API response
                })),
                ttlDistribution: Object.entries(apiResponse.network_layer_metrics.TTLStats).map(([ttl, count]) => ({
                    ttl: parseInt(ttl),
                    count: count,
                })),
                topTalkers: [], // You'll need to implement logic to determine top talkers
                suspiciousActivities: [], // You'll need to implement logic to identify suspicious activities
            };

            // Calculate totalBytes (example)
            let totalBytes = 0;
            transformedAnalysisDetails.endpoints.forEach(endpoint => {
                // Example: Sum bytes from StreamData if it exists
                if (apiResponse.transport_layer_metrics.StreamData) {
                    Object.values(apiResponse.transport_layer_metrics.StreamData).forEach(bytes => {
                        totalBytes += bytes;
                    });
                }
            });
            transformedAnalysisDetails.totalBytes = totalBytes;

            setAnalysisDetails(transformedAnalysisDetails);
            setAnalysisResults({
                protocols: transformedAnalysisDetails.protocols,
                endpoints: transformedAnalysisDetails.endpoints,
                applications: transformedAnalysisDetails.applications,
                ttlDistribution: transformedAnalysisDetails.ttlDistribution,
            });

            setIsAnalyzing(false);
            setShowDetailedResults(true);
            setSnackbarMessage(`PCAP file "${file.name}" analysis completed successfully.`);
            setSnackbarOpen(true);
            if (user) {
              loggingService.addLog(user, 'PCAP_ANALYSIS_COMPLETE', `Completed analysis of PCAP file: ${file.name}`, '/network-scanner');
            }

            // Initialize time-series data (example - adjust as needed)
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const initialProtoData = { time: timeStr };
            transformedAnalysisDetails.protocols.forEach(p => initialProtoData[p.protocol] = p.count / 10);
            setProtocolTimeData(Array(6).fill(initialProtoData));

            const initialAppData = { time: timeStr };
            transformedAnalysisDetails.applications.forEach(a => initialAppData[a.application] = a.connections / 10);
            setApplicationTimeData(Array(6).fill(initialAppData));

        } else {
            console.error("API response data is empty.");
            setSnackbarMessage("Analysis failed: No data received from the server.");
            setSnackbarOpen(true);
            setIsAnalyzing(false);
        }
        // --- End Process API Response ---

    } catch (error: any) {
        console.error("Error analyzing PCAP file:", error);
        setSnackbarMessage('Error analyzing PCAP file.');
        setSnackbarOpen(true);
        setIsAnalyzing(false);
    }
};

  const handleExportResults = () => {
    if (!analysisDetails) {
      setSnackbarMessage('No analysis results available to export.');
      setSnackbarOpen(true);
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(analysisDetails, null, 2)], { type: 'application/json' });
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
      if (user) {
        loggingService.addLog(user, 'PCAP_EXPORT_SUCCESS', 'Exported analysis results', '/network-scanner');
      }
    } catch (error) {
      console.error("Export failed:", error);
      setSnackbarMessage('Failed to export results. See console for details.');
      setSnackbarOpen(true);
      if (user) {
        loggingService.addLog(user, 'PCAP_EXPORT_FAIL', `Export failed: ${error}`, '/network-scanner');
      }
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
      if (user) {
        loggingService.addLog(user, 'DEVICE_ACTION_BLOCK', `Blocked IP: ${selectedDeviceIp}`, '/network-scanner');
      }
      handleActionMenuClose();
    }
  };

  const handleIsolateDevice = () => {
    if (selectedDeviceIp) {
      setSnackbarMessage(`Simulating: Isolated device ${selectedDeviceIp}`);
      setSnackbarOpen(true);
      if (user) {
        loggingService.addLog(user, 'DEVICE_ACTION_ISOLATE', `Isolated device: ${selectedDeviceIp}`, '/network-scanner');
      }
      handleActionMenuClose();
    }
  };

  const handleGenerateReport = () => {
    if (selectedDeviceIp) {
      setSnackbarMessage(`Simulating: Generating security report for ${selectedDeviceIp}`);
      setSnackbarOpen(true);
      if (user) {
        loggingService.addLog(user, 'DEVICE_ACTION_REPORT', `Generated report for: ${selectedDeviceIp}`, '/network-scanner');
      }
      handleActionMenuClose();
    }
  };

  // Effect for real-time chart updates (only when analysis is complete and results shown)
  useEffect(() => {
    // ... (Real-time update logic remains the same, maybe adjust interval)
    let protocolInterval: number | null = null;
    let appInterval: number | null = null;

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
      }, 5000);

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

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Alerts Section */}
      <AlertSection
        alerts={alerts}
        onTakeAction={handleTakeAction}
        onMarkBenign={handleMarkBenign}
      />

      {/* File Upload Section */}
      <FileUploadSection
        file={file}
        isAnalyzing={isAnalyzing}
        onFileUpload={handleFileUpload}
        onAnalyzeFile={handleAnalyzeFile}
        showDetailedResults={showDetailedResults}
        onExportResults={handleExportResults}
      />

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          aria-label="network analysis tabs" 
          variant="scrollable" 
          scrollButtons="auto"
        >
          <Tab label="Analysis Summary" {...a11yProps(0)} />
          {showDetailedResults && <Tab label="Network Overview" {...a11yProps(1)} />}
          {showDetailedResults && <Tab label="Endpoint Analysis" {...a11yProps(2)} />}
          {showDetailedResults && <Tab label="Application Analysis" {...a11yProps(3)} />}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {analysisDetails && showDetailedResults && (
          <AnalysisSummaryPanel
            analysisDetails={analysisDetails}
            fileName={file?.name || ''}
          />
        )}
      </TabPanel>

      {showDetailedResults && analysisDetails && (
        <>
          <TabPanel value={selectedTab} index={1}>
            <NetworkOverviewPanel
              endpoints={analysisResults.endpoints}
              protocols={analysisResults.protocols}
              ttlDistribution={analysisResults.ttlDistribution}
            />
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            <EndpointAnalysisPanel
              endpoints={analysisResults.endpoints}
              onActionMenuOpen={handleActionMenuOpen}
            />
          </TabPanel>

          <TabPanel value={selectedTab} index={3}>
            <ApplicationAnalysisPanel
              applications={analysisResults.applications}
              applicationTimeData={applicationTimeData}
            />
          </TabPanel>
        </>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleBlockIP}>
          <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Block IP</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleIsolateDevice}>
          <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Isolate Device</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleGenerateReport}>
          <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Generate Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
