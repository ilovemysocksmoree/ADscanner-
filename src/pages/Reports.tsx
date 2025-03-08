import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  DateRange as DateRangeIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Speed as PerformanceIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';

interface ScanReport {
  id: string;
  date: string;
  type: 'vulnerability' | 'network' | 'performance' | 'security';
  target: string;
  findings: number;
  status: 'completed' | 'failed' | 'in_progress';
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: {
    vulnerabilities: number;
    networkIssues: number;
    performanceMetrics: {
      responseTime: number;
      uptime: number;
      throughput: number;
    };
    securityScore: number;
  };
}

interface Report {
  id: string;
  type: string;
  date: string;
  findings: number;
  status: 'critical' | 'warning' | 'stable';
  details: string;
  metrics: {
    vulnerabilitiesByType: { [key: string]: number };
    networkPerformance: {
      timestamp: string;
      value: number;
    }[];
    securityScore: number;
    complianceScore: number;
  };
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  type: string;
  recipients: string[];
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused';
}

const mockReports: ScanReport[] = [
  {
    id: '1',
    date: '2024-03-20 14:30',
    type: 'vulnerability',
    target: '192.168.1.100',
    findings: 3,
    status: 'completed',
    severity: 'critical',
    details: {
      vulnerabilities: 3,
      networkIssues: 0,
      performanceMetrics: {
        responseTime: 100,
        uptime: 99.9,
        throughput: 1000,
      },
      securityScore: 95,
    },
  },
  {
    id: '2',
    date: '2024-03-20 15:45',
    type: 'network',
    target: '192.168.1.0/24',
    findings: 5,
    status: 'completed',
    severity: 'high',
    details: {
      vulnerabilities: 0,
      networkIssues: 5,
      performanceMetrics: {
        responseTime: 150,
        uptime: 99.5,
        throughput: 500,
      },
      securityScore: 85,
    },
  },
  {
    id: '3',
    date: '2024-03-19 09:15',
    type: 'vulnerability',
    target: '192.168.1.200',
    findings: 0,
    status: 'failed',
    severity: 'low',
    details: {
      vulnerabilities: 0,
      networkIssues: 0,
      performanceMetrics: {
        responseTime: 0,
        uptime: 0,
        throughput: 0,
      },
      securityScore: 100,
    },
  },
];

const mockReportDetails: Report[] = [
  {
    id: '1',
    type: 'Vulnerability Assessment',
    date: '2024-03-20',
    findings: 12,
    status: 'critical',
    details: 'Multiple high-risk vulnerabilities detected',
    metrics: {
      vulnerabilitiesByType: {
        'High Risk': 3,
        'Medium Risk': 6,
        'Low Risk': 3,
      },
      networkPerformance: [],
      securityScore: 90,
      complianceScore: 85,
    },
  },
  {
    id: '2',
    type: 'Network Security Audit',
    date: '2024-03-19',
    findings: 5,
    status: 'warning',
    details: 'Potential security misconfigurations found',
    metrics: {
      vulnerabilitiesByType: {
        'High Risk': 2,
        'Medium Risk': 3,
      },
      networkPerformance: [],
      securityScore: 80,
      complianceScore: 75,
    },
  },
  {
    id: '3',
    type: 'System Health Check',
    date: '2024-03-18',
    findings: 2,
    status: 'stable',
    details: 'Minor issues detected, system performing well',
    metrics: {
      vulnerabilitiesByType: {
        'High Risk': 0,
        'Medium Risk': 2,
      },
      networkPerformance: [],
      securityScore: 100,
      complianceScore: 100,
    },
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Reports() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ScanReport | null>(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [openDialog, setOpenDialog] = useState(false);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [reports] = useState<Report[]>(mockReportDetails);
  const [currentTab, setCurrentTab] = useState(0);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    target: '',
  });

  const handleExportClick = (report: ScanReport) => {
    setSelectedReport(report);
    setOpenDialog(true);
    
    loggingService.addLog(
      user,
      'OPEN_REPORT_EXPORT',
      `Opened export dialog for report: ${report.id}`,
      '/reports'
    );
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setExportFormat(event.target.value);
  };

  const handleExport = () => {
    if (!selectedReport) return;
    
    loggingService.addLog(
      user,
      'EXPORT_REPORT',
      `Exported report ${selectedReport.id} as ${exportFormat}`,
      '/reports'
    );
    
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleGenerateReport = () => {
    loggingService.addLog(
      user,
      'GENERATE_REPORT',
      `Generated ${reportType} report for last ${dateRange} days`,
      '/reports'
    );
  };

  const handleDownload = (reportId: string) => {
    loggingService.addLog(
      user,
      'DOWNLOAD_REPORT',
      `Downloaded report: ${reportId}`,
      '/reports'
    );
  };

  const handlePrint = (reportId: string) => {
    loggingService.addLog(
      user,
      'PRINT_REPORT',
      `Printed report: ${reportId}`,
      '/reports'
    );
  };

  const handleShare = (reportId: string) => {
    loggingService.addLog(
      user,
      'SHARE_REPORT',
      `Shared report: ${reportId}`,
      '/reports'
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleScheduleReport = () => {
    // Implementation for scheduling reports
    const newScheduledReport: ScheduledReport = {
      id: `sr-${scheduledReports.length + 1}`,
      name: `${reportType} Report`,
      frequency: 'weekly',
      type: reportType,
      recipients: [user?.email || ''],
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    };
    setScheduledReports([...scheduledReports, newScheduledReport]);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulated report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      handleGenerateReport();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Report Dashboard" icon={<AssessmentIcon />} />
        <Tab label="Scheduled Reports" icon={<ScheduleIcon />} />
        <Tab label="Analytics" icon={<SecurityIcon />} />
      </Tabs>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Report Generation Controls */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generate Report
                <IconButton
                  size="small"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  sx={{ ml: 1 }}
                >
                  <Tooltip title="Advanced Options">
                    <RefreshIcon />
                  </Tooltip>
                </IconButton>
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      label="Report Type"
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <MenuItem value="all">All Security Metrics</MenuItem>
                      <MenuItem value="vulnerability">Vulnerability Assessment</MenuItem>
                      <MenuItem value="network">Network Security</MenuItem>
                      <MenuItem value="system">System Health</MenuItem>
                      <MenuItem value="compliance">Compliance Report</MenuItem>
                      <MenuItem value="incident">Incident Analysis</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <DateRangeIcon />}
                    onClick={generateReport}
                    fullWidth
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Grid>
                
                {showAdvancedOptions && (
                  <>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Severity Filter</InputLabel>
                        <Select
                          value={filters.severity}
                          label="Severity Filter"
                          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                        >
                          <MenuItem value="all">All Severities</MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                          value={filters.status}
                          label="Status Filter"
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                          <MenuItem value="all">All Statuses</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="failed">Failed</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Target Filter"
                        value={filters.target}
                        onChange={(e) => setFilters({ ...filters, target: e.target.value })}
                        placeholder="IP or hostname"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Switch />}
                        label="Include Historical Data"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Reports List with Enhanced Visualization */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Reports
              </Typography>
              <Box sx={{ height: 300, mb: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockReportDetails}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="findings" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Findings</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.findings}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={
                              report.status === 'critical'
                                ? 'error'
                                : report.status === 'warning'
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDownload(report.id)}>
                            <DownloadIcon />
                          </IconButton>
                          <IconButton onClick={() => handlePrint(report.id)}>
                            <PrintIcon />
                          </IconButton>
                          <IconButton onClick={() => handleShare(report.id)}>
                            <ShareIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scheduled Reports
              </Typography>
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={handleScheduleReport}
                sx={{ mb: 3 }}
              >
                Schedule New Report
              </Button>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduledReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.frequency}</TableCell>
                        <TableCell>{new Date(report.lastRun).toLocaleString()}</TableCell>
                        <TableCell>{new Date(report.nextRun).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={report.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton>
                            <EditIcon />
                          </IconButton>
                          <IconButton>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security Metrics Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critical', value: 4 },
                        { name: 'High', value: 8 },
                        { name: 'Medium', value: 15 },
                        { name: 'Low', value: 23 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockReportDetails.map((entry, index) => (
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
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Trend Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockReportDetails}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="findings"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Export Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select value={exportFormat} onChange={handleFormatChange}>
              <MenuItem value="pdf">PDF Document</MenuItem>
              <MenuItem value="doc">Word Document</MenuItem>
              <MenuItem value="csv">CSV Spreadsheet</MenuItem>
              <MenuItem value="json">JSON Format</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 