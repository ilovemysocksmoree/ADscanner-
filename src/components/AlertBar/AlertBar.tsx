import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';

interface AlertBarProps {
    severity: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    onTakeAction: () => void;
    onMarkBenign: () => void;
}

const AlertBar: React.FC<AlertBarProps> = ({ severity, title, message, onTakeAction, onMarkBenign }) => {
    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 2, 
                mb: 1, 
                borderLeft: 5, 
                borderColor: `${severity}.main`, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap' 
            }}
        >
            <Box sx={{ flexGrow: 1, mr: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
                <Typography variant="body2">{message}</Typography>
            </Box>
            <Box sx={{ mt: { xs: 1, sm: 0 } }}>
                <Button 
                    size="small" 
                    onClick={onTakeAction} 
                    sx={{ mr: 1 }} 
                    variant="outlined" 
                    color={severity}
                >
                    Investigate
                </Button>
                <Button 
                    size="small" 
                    onClick={onMarkBenign} 
                    color="secondary"
                >
                    Mark Benign
                </Button>
            </Box>
        </Paper>
    );
};

export default AlertBar; 