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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormHelperText,
  Snackbar,
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
  Close as CloseIcon,
  List as ListIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  CloudUpload as CloudUploadIcon,
  DeveloperMode as DeveloperModeIcon,
  BugReport as BugReportIcon,
  Upgrade as UpgradeIcon,
  Help as HelpIcon,
  MenuBook as MenuBookIcon,
  Attachment as AttachmentIcon,
  People as PeopleIcon,
  Architecture as ArchitectureIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { notificationService } from '../services/NotificationService';
import { reportGenerationService, ReportData } from '../services/ReportGenerationService';

interface ScanReport {
  id: string;
  date: string;
  type: 'vulnerability' | 'network' | 'performance' | 'security';
  target: string;
  findings: number;
  status: 'completed' | 'failed' | 'in_progress';
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: {
    vulnerabilities: {
      [key: string]: number;
    };
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
  target: string;
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused';
  description?: string;
  reminderMinutes: number;
  notificationEnabled: boolean;
}

interface ComprehensiveReport {
  coverPage: {
    title: string;
    authors: string[];
    date: string;
    organization: string;
  };
  executiveSummary: {
    overview: string;
    businessBenefits: string[];
    technicalHighlights: string[];
  };
  introduction: {
    problemStatement: string;
    importance: string;
    architecture: string;
  };
  stakeholders: {
    users: string[];
    requirements: {
      business: string[];
      technical: string[];
    };
  };
  features: {
    list: Array<{
      name: string;
      businessValue: string;
    }>;
    outcomes: string[];
  };
  riskManagement: {
    risks: Array<{
      type: string;
      description: string;
      mitigation: string;
    }>;
  };
  technicalArchitecture: {
    systemDiagram: string;
    stack: string[];
    dataFlow: string;
    security: string[];
  };
  deployment: {
    steps: string[];
    requirements: {
      server: string[];
      other: string[];
    };
    integration: string[];
  };
  development: {
    methodology: string;
    sprints: Array<{
      number: number;
      goals: string[];
      achievements: string[];
    }>;
  };
  testing: {
    security: string[];
    functional: string[];
    results: string[];
  };
  enhancements: {
    scalability: string[];
    aiIntegration: string[];
  };
  userGuide: {
    interpretation: string[];
    troubleshooting: Array<{
      issue: string;
      solution: string;
    }>;
  };
  references: {
    technical: string[];
    research: string[];
  };
  appendices: {
    data: any[];
    configurations: Array<{
      name: string;
      example: string;
    }>;
  };
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
      vulnerabilities: {
        'High Risk': 3,
        'Medium Risk': 6,
        'Low Risk': 3,
      },
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
      vulnerabilities: {
        'High Risk': 2,
        'Medium Risk': 3,
      },
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
      vulnerabilities: {
        'High Risk': 0,
        'Medium Risk': 2,
      },
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

const mockComprehensiveReport: ComprehensiveReport = {
  coverPage: {
    title: "Enterprise Security Scanner and Network Analysis Tool",
    authors: ["Security Team", "Development Team"],
    date: new Date().toISOString(),
    organization: "Enterprise Security Solutions"
  },
  executiveSummary: {
    overview: "Comprehensive security scanning and network analysis solution for enterprise environments",
    businessBenefits: [
      "Reduced security incidents by 60%",
      "Automated compliance reporting",
      "Real-time threat detection and response"
    ],
    technicalHighlights: [
      "Advanced network topology mapping",
      "ML-powered threat detection",
      "Real-time packet analysis"
    ]
  },
  introduction: {
    problemStatement: "Modern enterprises face increasingly sophisticated cyber threats requiring real-time monitoring and response",
    importance: "Proactive security measures are essential for protecting business assets and maintaining compliance",
    architecture: "Microservices-based architecture with distributed scanning agents"
  },
  stakeholders: {
    users: ["Security Teams", "Network Administrators", "C-Level Executives", "Compliance Officers"],
    requirements: {
      business: [
        "Compliance with industry standards",
        "Cost-effective security monitoring",
        "Minimal impact on business operations"
      ],
      technical: [
        "Real-time threat detection",
        "Scalable architecture",
        "Integration with existing security tools"
      ]
    }
  },
  features: {
    list: [
      {
        name: "Network Scanning",
        businessValue: "Identifies vulnerabilities before they can be exploited"
      },
      {
        name: "Real-time Monitoring",
        businessValue: "Immediate detection of security incidents"
      },
      {
        name: "Automated Reporting",
        businessValue: "Saves time and ensures consistent compliance documentation"
      }
    ],
    outcomes: [
      "Enhanced security posture",
      "Reduced incident response time",
      "Improved compliance management"
    ]
  },
  riskManagement: {
    risks: [
      {
        type: "Security",
        description: "Unauthorized access attempts",
        mitigation: "Multi-factor authentication and role-based access control"
      },
      {
        type: "Performance",
        description: "Network scanning impact on operations",
        mitigation: "Intelligent scheduling and throttling of scans"
      }
    ]
  },
  technicalArchitecture: {
    systemDiagram: "Base64 encoded system diagram",
    stack: [
      "React with TypeScript",
      "Material-UI",
      "Node.js backend",
      "MongoDB database"
    ],
    dataFlow: "Encrypted communication between components using TLS 1.3",
    security: [
      "End-to-end encryption",
      "Regular security audits",
      "Automated vulnerability scanning"
    ]
  },
  deployment: {
    steps: [
      "Configure environment variables",
      "Set up database connections",
      "Deploy scanning agents",
      "Configure monitoring rules"
    ],
    requirements: {
      server: [
        "Node.js 16+",
        "MongoDB 4.4+",
        "Redis for caching"
      ],
      other: [
        "SSL certificates",
        "Network access permissions"
      ]
    },
    integration: [
      "API documentation",
      "Authentication setup",
      "Data migration guide"
    ]
  },
  development: {
    methodology: "Agile/Scrum with 2-week sprints",
    sprints: [
      {
        number: 1,
        goals: ["Basic scanning functionality", "User interface setup"],
        achievements: ["Completed core scanning engine", "Implemented dashboard"]
      }
    ]
  },
  testing: {
    security: [
      "Penetration testing",
      "Vulnerability scanning",
      "Code security review"
    ],
    functional: [
      "Unit tests",
      "Integration tests",
      "End-to-end tests"
    ],
    results: [
      "100% critical vulnerability patches",
      "95% test coverage",
      "Zero high-severity issues"
    ]
  },
  enhancements: {
    scalability: [
      "Kubernetes deployment support",
      "Distributed scanning capabilities",
      "Multi-region support"
    ],
    aiIntegration: [
      "ML-based threat detection",
      "Automated incident response",
      "Predictive analytics"
    ]
  },
  userGuide: {
    interpretation: [
      "Understanding security scores",
      "Reading network maps",
      "Interpreting alerts"
    ],
    troubleshooting: [
      {
        issue: "Scan failures",
        solution: "Check network connectivity and permissions"
      },
      {
        issue: "High CPU usage",
        solution: "Adjust scan scheduling and throttling"
      }
    ]
  },
  references: {
    technical: [
      "NIST Cybersecurity Framework",
      "OWASP Top 10",
      "CIS Controls"
    ],
    research: [
      "Industry threat reports",
      "Academic security papers",
      "Vendor security advisories"
    ]
  },
  appendices: {
    data: [],
    configurations: [
      {
        name: "Scanner Configuration",
        example: `{
  "scanFrequency": "daily",
  "portRanges": ["1-1024", "3389", "8080"],
  "timeout": 30000,
  "retries": 3,
  "alertThresholds": {
    "critical": 90,
    "warning": 70,
    "info": 50
  }
}`
      },
      {
        name: "Monitoring Rules",
        example: `{
  "rules": [
    {
      "name": "Suspicious Activity Detection",
      "type": "traffic_analysis",
      "conditions": {
        "threshold": 1000,
        "timeWindow": "5m",
        "pattern": "repeated_failed_auth"
      },
      "actions": ["alert", "log", "block"]
    }
  ]
}`
      }
    ]
  }
};

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
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'vulnerability',
    target: '',
    frequency: 'weekly',
    description: '',
    status: 'active' as 'active' | 'paused',
    reminderMinutes: 30,
    notificationEnabled: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const [scheduleFormErrors, setScheduleFormErrors] = useState<{[key: string]: string}>({});

  const handleExportClick = (report: ScanReport) => {
    setSelectedReport(report);
    setOpenDialog(true);
    
    if (user) {
    loggingService.addLog(
      user,
      'OPEN_REPORT_EXPORT',
      `Opened export dialog for report: ${report.id}`,
      '/reports'
    );
    }
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setExportFormat(event.target.value);
  };

  const handleExport = async () => {
    if (!selectedReport) return;

    // Convert the selected report to the ReportData format
    const reportData: ReportData = {
      id: selectedReport.id,
      date: selectedReport.date,
      type: selectedReport.type,
      target: selectedReport.target,
      findings: [
        {
          id: '1',
          severity: selectedReport.severity,
          title: `${selectedReport.type} Assessment Finding`,
          description: `Found ${selectedReport.findings} issues during the ${selectedReport.type} scan.`,
          solution: 'Review and address identified issues according to severity.',
          cvss: selectedReport.details.securityScore,
        },
        // Add more findings based on the details
        ...Object.entries(selectedReport.details.vulnerabilities || {}).map(([type, count], index) => ({
          id: `${index + 2}`,
          severity: (type.toLowerCase().includes('critical') ? 'critical' as const :
                    type.toLowerCase().includes('high') ? 'high' as const : 
                    type.toLowerCase().includes('medium') ? 'medium' as const : 'low' as const),
          title: `${type} Finding`,
          description: `Detected ${count} ${type.toLowerCase()} issues.`,
          solution: `Address ${type.toLowerCase()} vulnerabilities according to security policy.`,
          cvss: selectedReport.details.securityScore * (
            type.toLowerCase().includes('critical') ? 0.9 :
            type.toLowerCase().includes('high') ? 0.8 : 
            type.toLowerCase().includes('medium') ? 0.5 : 0.3
          ),
        })),
      ],
      summary: {
        criticalCount: selectedReport.severity === 'critical' ? selectedReport.findings : 0,
        highCount: selectedReport.severity === 'high' ? selectedReport.findings : 0,
        mediumCount: selectedReport.severity === 'medium' ? selectedReport.findings : 0,
        lowCount: selectedReport.severity === 'low' ? selectedReport.findings : 0,
        totalCount: selectedReport.findings,
      },
      scanInfo: {
        startTime: selectedReport.date,
        endTime: new Date(new Date(selectedReport.date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        scannerVersion: '3.5.0',
        targetHost: selectedReport.target,
            scanType: selectedReport.type,
      },
    };

    try {
      await reportGenerationService.exportReport(reportData, exportFormat as 'pdf' | 'doc' | 'csv' | 'json');
    setOpenDialog(false);
    
      if (user) {
    loggingService.addLog(
      user,
      'EXPORT_REPORT',
      `Exported comprehensive report ${selectedReport.id} as ${exportFormat}`,
      '/reports'
    );
      }

    setSnackbarMessage('Report exported successfully');
    setSnackbarOpen(true);
    } catch (error) {
      console.error('Error exporting report:', error);
      setSnackbarMessage('Failed to export report. Please try again.');
      setSnackbarOpen(true);
    }
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
    if (user) {
    loggingService.addLog(
      user,
      'GENERATE_REPORT',
      `Generated ${reportType} report for last ${dateRange} days`,
      '/reports'
    );
    }
  };

  const handleDownload = (reportId: string) => {
    if (user) {
    loggingService.addLog(
      user,
      'DOWNLOAD_REPORT',
      `Downloaded report: ${reportId}`,
      '/reports'
    );
    }
  };

  const handlePrintReport = (reportId: string) => {
    window.print();
    setSnackbarMessage('Preparing report for printing...');
    setSnackbarOpen(true);
    
    if (user) {
    loggingService.addLog(
      user,
      'PRINT_REPORT',
      `Printing report: ${reportId}`,
      '/reports'
    );
    }
  };

  const handleShareDialog = (reportId: string) => {
    setSnackbarMessage('Sharing options will be available soon');
    setSnackbarOpen(true);
    
    if (user) {
    loggingService.addLog(
      user,
      'SHARE_REPORT_DIALOG',
      `Opened share dialog for report: ${reportId}`,
      '/reports'
    );
    }
  };

  const handleShare = (reportId: string) => {
    handleShareDialog(reportId);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleScheduleReport = () => {
    setScheduleForm({
      name: '',
      type: 'vulnerability',
      target: '',
      frequency: 'weekly',
      description: '',
      status: 'active' as 'active' | 'paused',
      reminderMinutes: 30,
      notificationEnabled: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    setEditingSchedule(null);
    setScheduleDialogOpen(true);
  };

  const handleEditSchedule = (report: ScheduledReport) => {
    setScheduleForm({
      name: report.name,
      type: report.type,
      target: report.target,
      frequency: report.frequency,
      description: report.description || '',
      status: report.status,
      reminderMinutes: report.reminderMinutes,
      notificationEnabled: report.notificationEnabled,
      startDate: new Date(report.lastRun),
      endDate: new Date(report.nextRun),
    });
    setEditingSchedule(report);
    setScheduleDialogOpen(true);
  };

  const handleDeleteSchedule = (reportId: string) => {
    setScheduledReports(scheduledReports.filter(report => report.id !== reportId));
    setSnackbarMessage('Schedule deleted successfully');
    setSnackbarOpen(true);
  };

  const validateScheduleForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!scheduleForm.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!scheduleForm.target.trim()) {
      errors.target = 'Target is required';
    }
    if (scheduleForm.startDate >= scheduleForm.endDate) {
      errors.dates = 'End date must be after start date';
    }

    setScheduleFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleSubmit = () => {
    if (!validateScheduleForm()) {
      return;
    }

    const newSchedule: ScheduledReport = {
      id: editingSchedule ? editingSchedule.id : `sr-${Date.now()}`,
      name: scheduleForm.name,
      type: scheduleForm.type,
      target: scheduleForm.target,
      frequency: scheduleForm.frequency as 'daily' | 'weekly' | 'monthly',
      lastRun: scheduleForm.startDate.toISOString(),
      nextRun: scheduleForm.endDate.toISOString(),
      status: scheduleForm.status,
      description: scheduleForm.description,
      reminderMinutes: scheduleForm.reminderMinutes,
      notificationEnabled: scheduleForm.notificationEnabled,
    };

    if (scheduleForm.notificationEnabled) {
      notificationService.scheduleLocalNotification(newSchedule);
      
      // Show immediate confirmation
      notificationService.showBrowserNotification('Report Scheduled', {
        body: `Your report "${newSchedule.name}" has been scheduled successfully.`,
        requireInteraction: false,
      });
    }

    if (editingSchedule) {
      setScheduledReports(scheduledReports.map(report => 
        report.id === editingSchedule.id ? newSchedule : report
      ));
      notificationService.updateScheduleNotifications(editingSchedule.id, newSchedule);
      setSnackbarMessage('Schedule updated successfully');
    } else {
      setScheduledReports([...scheduledReports, newSchedule]);
      setSnackbarMessage('New schedule created successfully');
    }

    setScheduleDialogOpen(false);
    setSnackbarOpen(true);
    setEditingSchedule(null);
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
    <Box 
      sx={{ 
        flexGrow: 1,
        bgcolor: 'background.default',
        minHeight: '100vh',
        p: 3
      }}
    >
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tab label="Reports" icon={<AssessmentIcon />} />
          <Tab label="Scheduled Reports" icon={<ScheduleIcon />} />
          <Tab label="Analytics" icon={<SecurityIcon />} />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Report Generation Controls */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generate Report
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
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                      value={dateRange}
                      label="Time Range"
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <MenuItem value="1">Last 24 Hours</MenuItem>
                      <MenuItem value="7">Last 7 Days</MenuItem>
                      <MenuItem value="30">Last 30 Days</MenuItem>
                      <MenuItem value="90">Last 90 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={generateReport}
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <AssessmentIcon />}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Reports Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Reports
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Findings</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.findings}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={getStatusColor(report.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Export Report">
                            <IconButton 
                              onClick={() => handleExportClick(report)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print Report">
                            <IconButton 
                              onClick={() => handlePrintReport(report.id)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share Report">
                            <IconButton 
                              onClick={() => handleShare(report.id)}
                              size="small"
                            >
                              <ShareIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Analytics Charts */}
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
                Findings Trend
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

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Scheduled Reports
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ScheduleIcon />}
                  onClick={handleScheduleReport}
                >
                  Schedule New Report
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduledReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.target}</TableCell>
                        <TableCell>{report.frequency}</TableCell>
                        <TableCell>{new Date(report.nextRun).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={report.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Schedule">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditSchedule(report)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Schedule">
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteSchedule(report.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Schedule Form Dialog */}
          <Dialog 
            open={scheduleDialogOpen} 
            onClose={() => setScheduleDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingSchedule ? 'Edit Scheduled Report' : 'Schedule New Report'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Schedule Name"
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm({...scheduleForm, name: e.target.value})}
                    error={!!scheduleFormErrors.name}
                    helperText={scheduleFormErrors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={scheduleForm.type}
                      label="Report Type"
                      onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
                    >
                      <MenuItem value="vulnerability">Vulnerability Assessment</MenuItem>
                      <MenuItem value="network">Network Security</MenuItem>
                      <MenuItem value="system">System Health</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target System/Network"
                    value={scheduleForm.target}
                    onChange={(e) => setScheduleForm({...scheduleForm, target: e.target.value})}
                    error={!!scheduleFormErrors.target}
                    helperText={scheduleFormErrors.target}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={scheduleForm.frequency}
                      label="Frequency"
                      onChange={(e) => setScheduleForm({...scheduleForm, frequency: e.target.value})}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scheduleForm.notificationEnabled}
                          onChange={(e) => setScheduleForm({
                            ...scheduleForm,
                            notificationEnabled: e.target.checked
                          })}
                        />
                      }
                      label="Enable Browser Notifications"
                    />
                  </FormControl>
                </Grid>
                {scheduleForm.notificationEnabled && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Reminder Time</InputLabel>
                      <Select
                        value={scheduleForm.reminderMinutes}
                        label="Reminder Time"
                        onChange={(e) => setScheduleForm({
                          ...scheduleForm,
                          reminderMinutes: Number(e.target.value)
                        })}
                      >
                        <MenuItem value={5}>5 minutes before</MenuItem>
                        <MenuItem value={15}>15 minutes before</MenuItem>
                        <MenuItem value={30}>30 minutes before</MenuItem>
                        <MenuItem value={60}>1 hour before</MenuItem>
                        <MenuItem value={1440}>1 day before</MenuItem>
                      </Select>
                      <FormHelperText>
                        When to show the notification before the report runs
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Start Date"
                      value={scheduleForm.startDate}
                      onChange={(newValue) => newValue && setScheduleForm({...scheduleForm, startDate: newValue})}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Date"
                      value={scheduleForm.endDate}
                      onChange={(newValue) => newValue && setScheduleForm({...scheduleForm, endDate: newValue})}
                    />
                  </LocalizationProvider>
                </Grid>
                {scheduleFormErrors.dates && (
                  <Grid item xs={12}>
                    <Alert severity="error">{scheduleFormErrors.dates}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleScheduleSubmit} variant="contained">
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      )}

      {/* Export Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export Comprehensive Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Report Structure Preview
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="1. Cover Page" 
                  secondary="Title, Author(s), Date, Organization"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DocIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="2. Executive Summary" 
                  secondary="High-level overview, Benefits, Technical highlights"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ListIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="3. Table of Contents" 
                  secondary="Interactive navigation links"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="4. Introduction" 
                  secondary="Problem Statement, Solution Importance, Architecture Overview"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="5. Clients & Stakeholders" 
                  secondary="User Groups, Business & Technical Requirements"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="6. Features & Outcomes" 
                  secondary="Feature List, Business Value, Expected Outcomes"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="7. Risk Management" 
                  secondary="Security Risks, Mitigation Strategies"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArchitectureIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="8. Technical Architecture" 
                  secondary="System Design, Stack, Data Flow, Security"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CloudUploadIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="9. Deployment Guide" 
                  secondary="Setup Steps, Requirements, Integration Guide"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DeveloperModeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="10. Development Process" 
                  secondary="Methodology, Sprint Breakdown"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="11. Testing & QA" 
                  secondary="Security Testing, Functional Testing"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <UpgradeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="12. Future Enhancements" 
                  secondary="Scalability, AI/ML Integration Plans"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="13. User Guide & FAQs" 
                  secondary="Usage Instructions, Troubleshooting"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MenuBookIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="14. References" 
                  secondary="Technical References, Research Links"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachmentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="15. Appendices" 
                  secondary="Raw Data, Configuration Examples"
                />
              </ListItem>
            </List>
          </Box>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select value={exportFormat} onChange={handleFormatChange}>
              <MenuItem value="pdf">PDF Document</MenuItem>
              <MenuItem value="doc">Word Document</MenuItem>
              <MenuItem value="csv">CSV Spreadsheet</MenuItem>
              <MenuItem value="json">JSON Format</MenuItem>
            </Select>
            <FormHelperText>
              Choose the format that best suits your needs. PDF recommended for comprehensive reports.
            </FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
} 