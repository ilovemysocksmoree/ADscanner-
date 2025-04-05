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
} from '@mui/material';
import { EndpointData } from '../../interfaces/networkScanner';

interface EndpointTableProps {
  data: EndpointData[];
  title?: string;
}

const EndpointTable: React.FC<EndpointTableProps> = ({
  data,
  title = 'Network Endpoints',
}) => {
  // Calculate total packets and bytes
  const totalPacketsIn = data.reduce((sum, item) => sum + item.packetsIn, 0);
  const totalPacketsOut = data.reduce((sum, item) => sum + item.packetsOut, 0);
  const totalBytesIn = data.reduce((sum, item) => sum + item.bytesIn, 0);
  const totalBytesOut = data.reduce((sum, item) => sum + item.bytesOut, 0);

  // Format bytes to appropriate units
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                <TableCell>IP Address</TableCell>
                <TableCell>Hostname</TableCell>
                <TableCell align="right">Packets In</TableCell>
                <TableCell align="right">Packets Out</TableCell>
                <TableCell align="right">Data In</TableCell>
                <TableCell align="right">Data Out</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((endpoint) => (
                <TableRow key={endpoint.ip}>
                  <TableCell>{endpoint.ip}</TableCell>
                  <TableCell>{endpoint.hostname || 'Unknown'}</TableCell>
                  <TableCell align="right">{endpoint.packetsIn.toLocaleString()}</TableCell>
                  <TableCell align="right">{endpoint.packetsOut.toLocaleString()}</TableCell>
                  <TableCell align="right">{formatBytes(endpoint.bytesIn)}</TableCell>
                  <TableCell align="right">{formatBytes(endpoint.bytesOut)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>Total:</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalPacketsIn.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalPacketsOut.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatBytes(totalBytesIn)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatBytes(totalBytesOut)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No endpoint data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EndpointTable; 