import React, { useState } from 'react';
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
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';

interface ScanReport {
  id: string;
  date: string;
  type: 'vulnerability' | 'network';
  target: string;
  findings: number;
  status: 'completed' | 'failed';
}

interface Report {
  id: string;
  type: string;
  date: string;
  findings: number;
  status: 'critical' | 'warning' | 'stable';
  details: string;
}

const mockReports: ScanReport[] = [
  {
    id: '1',
    date: '2024-03-20 14:30',
    type: 'vulnerability',
    target: '192.168.1.100',
    findings: 3,
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-03-20 15:45',
    type: 'network',
    target: '192.168.1.0/24',
    findings: 5,
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-03-19 09:15',
    type: 'vulnerability',
    target: '192.168.1.200',
    findings: 0,
    status: 'failed',
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
  },
  {
    id: '2',
    type: 'Network Security Audit',
    date: '2024-03-19',
    findings: 5,
    status: 'warning',
    details: 'Potential security misconfigurations found',
  },
  {
    id: '3',
    type: 'System Health Check',
    date: '2024-03-18',
    findings: 2,
    status: 'stable',
    details: 'Minor issues detected, system performing well',
  },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ScanReport | null>(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [openDialog, setOpenDialog] = useState(false);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [reports] = useState<Report[]>(mockReportDetails);

  const handleExportClick = (report: ScanReport) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setExportFormat(event.target.value);
  };

  const handleExport = () => {
    // Implement report generation and download
    console.log(`Exporting report ${selectedReport?.id} as ${exportFormat}`);
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
    // Implement report generation logic
    console.log('Generating report:', { reportType, dateRange });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Report Generation Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Report
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={dateRange}
                    label="Time Range"
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <MenuItem value="7">Last 7 Days</MenuItem>
                    <MenuItem value="30">Last 30 Days</MenuItem>
                    <MenuItem value="90">Last 90 Days</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  startIcon={<DateRangeIcon />}
                  onClick={handleGenerateReport}
                  fullWidth
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Reports List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generated Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.findings}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status.toUpperCase()}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{report.details}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => console.log('Download:', report.id)}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => console.log('Print:', report.id)}
                          >
                            <PrintIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => console.log('Share:', report.id)}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select value={exportFormat} label="Export Format" onChange={handleFormatChange}>
                <MenuItem value="pdf">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon />
                    PDF Document
                  </Box>
                </MenuItem>
                <MenuItem value="doc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DocIcon />
                    Word Document
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
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