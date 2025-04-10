import React from 'react';
import { Box, Alert } from '@mui/material';
import { NetworkAlert } from '../../types/network';
import AlertBar from '../AlertBar/AlertBar';

interface AlertSectionProps {
    alerts: NetworkAlert[];
    onTakeAction: (alertId: string) => void;
    onMarkBenign: (alertId: string) => void;
}

export const AlertSection: React.FC<AlertSectionProps> = ({ alerts, onTakeAction, onMarkBenign }) => {
    return (
        <Box sx={{ mb: 3 }}>
            {alerts.length > 0 ? alerts.map((alert) => (
                <AlertBar 
                    key={alert.id} 
                    severity={alert.severity} 
                    title={alert.title} 
                    message={alert.message} 
                    onTakeAction={() => onTakeAction(alert.id)} 
                    onMarkBenign={() => onMarkBenign(alert.id)} 
                />
            )) : (
                <Alert severity="success" variant="outlined">No active alerts found.</Alert>
            )}
        </Box>
    );
};

export default AlertSection; 