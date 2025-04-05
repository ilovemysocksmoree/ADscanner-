import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { ApplicationData } from '../../interfaces/networkScanner';

interface ApplicationSummaryProps {
  data: ApplicationData[];
  title?: string;
}

const ApplicationSummary: React.FC<ApplicationSummaryProps> = ({
  data,
  title = 'Application Summary',
}) => {
  // Sort by traffic volume (bytes transferred) descending
  const sortedData = [...data].sort((a, b) => b.bytesTransferred - a.bytesTransferred);

  // Format bytes to appropriate units
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getApplicationColor = (application: string): string => {
    // Return appropriate color based on application type
    switch (application.toLowerCase()) {
      case 'http':
      case 'https':
        return 'primary';
      case 'dns':
        return 'secondary';
      case 'ssh':
      case 'ssl':
      case 'tls':
        return 'success';
      case 'smtp':
      case 'imap':
        return 'info';
      case 'ftp':
        return 'warning';
      case 'telnet':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>

      {data.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Application</TableCell>
                <TableCell align="right">Connections</TableCell>
                <TableCell align="right">Data Transferred</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((app) => (
                <TableRow key={app.application}>
                  <TableCell>
                    <Chip 
                      label={app.application}
                      size="small"
                      color={getApplicationColor(app.application) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{app.connections.toLocaleString()}</TableCell>
                  <TableCell align="right">{formatBytes(app.bytesTransferred)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No application data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApplicationSummary; 