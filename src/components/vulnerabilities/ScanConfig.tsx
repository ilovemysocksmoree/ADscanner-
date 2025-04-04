import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { PlayArrow as StartIcon, Stop as StopIcon } from '@mui/icons-material';
import { ScanConfig } from '../../interfaces/vulnerabilityScanner';

interface ScanConfigProps {
  config: ScanConfig;
  isScanning: boolean;
  onConfigChange: (field: keyof ScanConfig, value: string) => void;
  onStartScan: () => void;
  onStopScan: () => void;
}

const ScanConfigComponent: React.FC<ScanConfigProps> = ({
  config,
  isScanning,
  onConfigChange,
  onStartScan,
  onStopScan,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Scan Configuration
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Target IP/Hostname"
            value={config.target}
            onChange={(e) => onConfigChange('target', e.target.value)}
            disabled={isScanning}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Port Range (e.g., 1-1024)"
            value={config.portRange}
            onChange={(e) => onConfigChange('portRange', e.target.value)}
            disabled={isScanning}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color={isScanning ? 'error' : 'primary'}
            startIcon={isScanning ? <StopIcon /> : <StartIcon />}
            onClick={isScanning ? onStopScan : onStartScan}
            sx={{ mr: 2 }}
          >
            {isScanning ? 'Stop Scan' : 'Start Scan'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ScanConfigComponent; 