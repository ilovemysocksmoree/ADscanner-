import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { AlertItem } from '../../interfaces/common';

interface AlertBarProps extends Omit<AlertItem, 'id'> {
  id: string;
  onTakeAction: (id: string) => void;
  onMarkBenign: (id: string) => void;
  actionButtonText?: string;
  benignButtonText?: string;
}

const AlertBar: React.FC<AlertBarProps> = ({
  id,
  severity = 'warning',
  title = 'Alert',
  message,
  timestamp = new Date().toLocaleString(),
  priority = 'medium',
  details = {},
  onTakeAction,
  onMarkBenign,
  actionButtonText = 'Take Action',
  benignButtonText = 'Mark as Benign',
}) => {
  const [open, setOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'success':
        return <SuccessIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
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

  const handleTakeAction = () => {
    onTakeAction(id);
  };

  const handleMarkBenign = () => {
    onMarkBenign(id);
  };

  return (
    <>
      <Collapse in={open}>
        <Alert
          severity={severity}
          icon={getIcon()}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AlertTitle>{title}</AlertTitle>
            <Chip
              size="small"
              label={`Priority: ${priority}`}
              color={getPriorityColor()}
            />
            <Chip
              size="small"
              icon={<TimelineIcon />}
              label={timestamp}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ mb: 1 }}>{message}</Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleTakeAction}
            >
              {actionButtonText}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={handleMarkBenign}
            >
              {benignButtonText}
            </Button>
            {(details.source || details.affectedSystem || details.recommendedAction) && (
              <Button
                variant="outlined"
                color="info"
                size="small"
                onClick={() => setDetailsOpen(true)}
              >
                View Details
              </Button>
            )}
          </Stack>
        </Alert>
      </Collapse>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {details.source && (
            <Typography variant="body2" gutterBottom>
              <strong>Source:</strong> {details.source}
            </Typography>
          )}
          {details.affectedSystem && (
            <Typography variant="body2" gutterBottom>
              <strong>Affected System:</strong> {details.affectedSystem}
            </Typography>
          )}
          {details.recommendedAction && (
            <Typography variant="body2" gutterBottom>
              <strong>Recommended Action:</strong> {details.recommendedAction}
            </Typography>
          )}
          {/* Render any additional details */}
          {Object.entries(details)
            .filter(([key]) => !['source', 'affectedSystem', 'recommendedAction'].includes(key))
            .map(([key, value]) => (
              <Typography key={key} variant="body2" gutterBottom>
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
              </Typography>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlertBar; 