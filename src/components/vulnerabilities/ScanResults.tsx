import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import { ScanResult } from '../../interfaces/vulnerabilityScanner';

interface ScanResultsProps {
  isScanning: boolean;
  results: ScanResult[];
}

const ScanResults: React.FC<ScanResultsProps> = ({ isScanning, results }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {isScanning ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : results.length >= 1 ? (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Port</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Vulnerabilities</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => (
                <React.Fragment key={`${result.address}:${result.port}`}>
                  <TableRow>
                    <TableCell>{result.port}</TableCell>
                    <TableCell>{result.address}</TableCell>
                    <TableCell>{result.service}</TableCell>
                    <TableCell>{result.version}</TableCell>
                    <TableCell>
                      <Chip
                        label={result.status}
                        color={result.status === 'open' ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                        <Chip
                          label={`${result.vulnerabilities.length} found`}
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                  {result.vulnerabilities && result.vulnerabilities.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box sx={{ pl: 2 }}>
                          {result.vulnerabilities.map((vuln) => (
                            <Box key={vuln.id} sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="error">
                                {vuln.id} - CVSS Score: {vuln.cvssV3Score} ({vuln.cvssV3Severity})
                              </Typography>
                              <Typography variant="body2">{vuln.description}</Typography>
                              {vuln.references.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption">References:</Typography>
                                  {vuln.references.map((ref, idx) => (
                                    <MuiLink
                                      key={idx}
                                      href={ref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      display="block"
                                      sx={{ ml: 2 }}
                                    >
                                      {ref}
                                    </MuiLink>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          Please provide an IP address and port range to start the scan.
        </Alert>
      )}
    </Paper>
  );
};

export default ScanResults; 