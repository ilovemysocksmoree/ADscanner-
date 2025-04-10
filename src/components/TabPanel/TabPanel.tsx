import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../../types/network';

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`network-tabpanel-${index}`}
            aria-labelledby={`network-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

export const a11yProps = (index: number) => {
    return {
        id: `network-tab-${index}`,
        'aria-controls': `network-tabpanel-${index}`,
    };
};

export default TabPanel; 