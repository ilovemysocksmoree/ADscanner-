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

    const generateExecutiveSummary = (report: ScanReport) => {
      return {
        overview: `Security assessment conducted on ${report.date} revealed ${report.findings} findings of varying severity levels.`,
        riskLevel: report.severity,
        keyFindings: [
          `${report.details.vulnerabilities} vulnerabilities identified`,
          `Network security score: ${report.details.securityScore}/100`,
          `System performance impact: ${report.details.performanceMetrics.responseTime}ms average response time`
        ],
        recommendations: [
          "Implement immediate patching for critical vulnerabilities",
          "Enhance network segmentation",
          "Update security policies and procedures"
        ]
      };
    };

    const generateDetailedAnalysis = (report: ScanReport) => {
      return {
        vulnerabilityBreakdown: {
          critical: report.severity === 'critical' ? report.findings : 0,
          high: report.severity === 'high' ? report.findings : 0,
          medium: report.severity === 'medium' ? report.findings : 0,
          low: report.severity === 'low' ? report.findings : 0
        },
        networkAnalysis: {
          topology: "Detailed network map analysis",
          exposedServices: ["HTTP", "HTTPS", "SSH", "FTP"],
          securityMeasures: {
            firewallStatus: "Active",
            encryptionProtocols: ["TLS 1.3", "TLS 1.2"],
            certificateStatus: "Valid"
          }
        },
        systemHealth: {
          cpuUtilization: "45%",
          memoryUsage: "60%",
          diskSpace: "75% available",
          responseTime: report.details.performanceMetrics.responseTime + "ms",
          uptime: report.details.performanceMetrics.uptime + "%"
        }
      };
    };

    const generateRemediationPlan = (report: ScanReport) => {
      return {
        immediate: [
          {
            issue: "Critical vulnerabilities",
            action: "Apply security patches",
            timeline: "24 hours",
            resources: "System administration team"
          }
        ],
        shortTerm: [
          {
            issue: "Network security gaps",
            action: "Implement network segmentation",
            timeline: "1 week",
            resources: "Network security team"
          }
        ],
        longTerm: [
          {
            issue: "System architecture improvements",
            action: "Migrate to zero-trust architecture",
            timeline: "3 months",
            resources: "Security and DevOps teams"
          }
        ]
      };
    };

    const generateComplianceAssessment = () => {
      return {
        standards: [
          {
            name: "ISO 27001",
            compliance: "85%",
            gaps: ["Access Control", "Cryptography"],
            recommendations: ["Implement MFA", "Upgrade encryption protocols"]
          },
          {
            name: "NIST CSF",
            compliance: "78%",
            gaps: ["Incident Response", "Recovery Planning"],
            recommendations: ["Update IR playbooks", "Conduct recovery drills"]
          },
          {
            name: "GDPR",
            compliance: "92%",
            gaps: ["Data Processing Records"],
            recommendations: ["Update processing documentation"]
          }
        ]
      };
    };

    const exportData = {
      ...mockComprehensiveReport,
      generatedReport: {
        id: selectedReport.id,
        timestamp: new Date().toISOString(),
        type: exportFormat,
        metadata: {
          generatedBy: user?.email || 'System',
          scanTarget: selectedReport.target,
          scanDuration: "2 hours 15 minutes",
          toolVersion: "3.5.0"
        },
        executiveSummary: generateExecutiveSummary(selectedReport),
        detailedAnalysis: generateDetailedAnalysis(selectedReport),
        remediationPlan: generateRemediationPlan(selectedReport),
        complianceAssessment: generateComplianceAssessment(),
        appendices: {
          rawData: selectedReport,
          scanConfigurations: {
            scanType: selectedReport.type,
            targetScope: selectedReport.target,
            excludedHosts: [],
            scanPolicy: "Standard security assessment"
          },
          toolConfiguration: {
            version: "3.5.0",
            modules: ["Vulnerability Scanner", "Network Analyzer", "Compliance Checker"],
            signatures: "Latest (2024-03-20)",
            customRules: []
          }
        }
      }
    };

    // Convert the report to the selected format
    let content: string | Blob;
    let mimeType: string;
    let fileExtension: string;

    const formatReport = (data: any) => {
      switch (exportFormat) {
        case 'pdf':
          // In a real implementation, you would use a PDF generation library
          return JSON.stringify(data, null, 2);
        case 'doc':
          // Structure content for Word document
          return JSON.stringify(data, null, 2);
        case 'json':
          return JSON.stringify(data, null, 2);
        case 'csv':
          // Convert the data to CSV format with detailed sections
          const csvRows = [
            'Section,Category,Finding,Severity,Details'
          ];
          
          // Add vulnerability breakdown
          Object.entries(data.generatedReport.detailedAnalysis.vulnerabilityBreakdown)
            .forEach(([severity, count]) => {
              csvRows.push(`Vulnerabilities,${severity},Count,${count},Impact: ${severity === 'critical' ? 'Immediate action required' : 'Action required'}`);
            });
          
          // Add remediation plans
          data.generatedReport.remediationPlan.immediate
            .forEach(item => {
              csvRows.push(`Remediation,Immediate,${item.issue},Critical,${item.action}, Timeline: ${item.timeline}`);
            });
          
          return csvRows.join('\n');
        default:
          return JSON.stringify(data, null, 2);
      }
    };

    switch (exportFormat) {
      case 'pdf':
        content = formatReport(exportData);
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'doc':
        content = formatReport(exportData);
        mimeType = 'application/msword';
        fileExtension = 'doc';
        break;
      case 'json':
        content = formatReport(exportData);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'csv':
        content = formatReport(exportData);
        mimeType = 'text/csv';
        fileExtension = 'csv';
        break;
      default:
        content = formatReport(exportData);
        mimeType = 'application/json';
        fileExtension = 'json';
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${selectedReport.target}-${new Date().toISOString()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setOpenDialog(false);
    
    loggingService.addLog(
      user,
      'EXPORT_REPORT',
      `Exported comprehensive report ${selectedReport.id} as ${exportFormat}`,
      '/reports'
    );

    // Show success message
    setSnackbarMessage('Report exported successfully');
    setSnackbarOpen(true);
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

  const handlePrintReport = (reportId: string) => {
    window.print();
    setSnackbarMessage('Preparing report for printing...');
    setSnackbarOpen(true);
    
    loggingService.addLog(
      user,
      'PRINT_REPORT',
      `Printing report: ${reportId}`,
      '/reports'
    );
  };

  const handleShareDialog = (reportId: string) => {
    setSnackbarMessage('Sharing options will be available soon');
    setSnackbarOpen(true);
    
    loggingService.addLog(
      user,
      'SHARE_REPORT_DIALOG',
      `Opened share dialog for report: ${reportId}`,
      '/reports'
    );
  };

  const handleShare = (reportId: string) => {
    handleShareDialog(reportId);
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
    <Box 
      sx={{ 
        flexGrow: 1,
        bgcolor: 'background.default',
        minHeight: '100vh',
        p: 3
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
        Reports Dashboard
      </Typography>

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
          <Tab label="Report Dashboard" icon={<AssessmentIcon />} />
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
                      <TableCell align="right">Actions</TableCell>
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
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
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