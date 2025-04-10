import React from 'react';
import { Grid, Paper, Box, Typography, IconButton, Tooltip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';
import {
    Computer as ComputerIcon,
    Info as InfoIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { COLORS } from '../../constants/chartColors';
import { EndpointData } from '../../types/network';

interface EndpointAnalysisPanelProps {
    endpoints: EndpointData[];
    onActionMenuOpen: (event: React.MouseEvent<HTMLElement>, deviceIp: string) => void;
}

const EndpointAnalysisPanel: React.FC<EndpointAnalysisPanelProps> = ({
    endpoints,
    onActionMenuOpen
}) => {
    return (
        <Grid container spacing={3}>
            {/* Endpoint Traffic Distribution Pie Chart */}
            <Grid item xs={12} md={5}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ComputerIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div">Endpoint Traffic Share</Typography>
                        <Tooltip title="Share of total traffic (In + Out bytes) per endpoint.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={endpoints.map(endpoint => ({ 
                                        name: endpoint.ip, 
                                        value: endpoint.bytesIn + endpoint.bytesOut 
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                                >
                                    {endpoints.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number) => [`${(value / 1024).toFixed(2)} KB`, 'Total Traffic']} />
                                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* Endpoint Statistics Table */}
            <Grid item xs={12} md={7}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div">Endpoint Statistics</Typography>
                        <Tooltip title="Detailed traffic statistics per endpoint. Click the dots for actions.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets In</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Packets Out</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data In</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Data Out</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Traffic</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {endpoints
                                    .sort((a, b) => (b.bytesIn + b.bytesOut) - (a.bytesIn + a.bytesOut))
                                    .map((endpoint) => {
                                        const totalBytes = endpoint.bytesIn + endpoint.bytesOut;
                                        const isHighTraffic = totalBytes > 500000;
                                        const isMediumTraffic = totalBytes > 100000 && totalBytes <= 500000;
                                        let statusLabel = 'Normal';
                                        let statusColor: "success" | "warning" | "error" = 'success';
                                        
                                        if (isHighTraffic) {
                                            statusLabel = 'High Traffic';
                                            statusColor = 'error';
                                        } else if (isMediumTraffic) {
                                            statusLabel = 'Medium Traffic';
                                            statusColor = 'warning';
                                        }

                                        return (
                                            <TableRow key={endpoint.ip} hover>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                                    {endpoint.ip}
                                                </TableCell>
                                                <TableCell align="right">{endpoint.packetsIn.toLocaleString()}</TableCell>
                                                <TableCell align="right">{endpoint.packetsOut.toLocaleString()}</TableCell>
                                                <TableCell align="right">{(endpoint.bytesIn / 1024).toFixed(1)} KB</TableCell>
                                                <TableCell align="right">{(endpoint.bytesOut / 1024).toFixed(1)} KB</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                    {(totalBytes / 1024).toFixed(1)} KB
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        size="small" 
                                                        color={statusColor} 
                                                        label={statusLabel} 
                                                        sx={{ fontWeight: 500, minWidth: 75 }} 
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Actions">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={(e) => onActionMenuOpen(e, endpoint.ip)}
                                                        >
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default EndpointAnalysisPanel; 