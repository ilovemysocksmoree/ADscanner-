import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  NetworkCheck as NetworkIcon,
  Dns as DnsIcon,
  DataUsage as DataIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { AnalysisDetails } from '../../interfaces/networkScanner';

interface AnalysisSummaryProps {
  data: AnalysisDetails;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ data }) => {
  // Format bytes to appropriate units
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Analysis Summary
      </Typography>

      <Grid container spacing={2}>
        {/* Timestamp */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Timestamp</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatTimestamp(data.timestamp)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Packets */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <NetworkIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Total Packets</Typography>
              </Box>
              <Typography variant="h6" color="text.primary">
                {data.totalPackets.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Bytes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DataIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Data Volume</Typography>
              </Box>
              <Typography variant="h6" color="text.primary">
                {formatBytes(data.totalBytes)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Duration */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TimeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Duration</Typography>
              </Box>
              <Typography variant="h6" color="text.primary">
                {data.duration}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Suspicious Activities */}
      {data.suspiciousActivities.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Suspicious Activities
          </Typography>
          <Stack spacing={1} direction="column">
            {data.suspiciousActivities.map((activity, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {activity.type}
                    </Typography>
                    <Typography variant="body2">{activity.description}</Typography>
                  </Box>
                  <Chip 
                    label={activity.severity}
                    color={
                      activity.severity === 'high' ? 'error' : 
                      activity.severity === 'medium' ? 'warning' : 'info'
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AnalysisSummary; 