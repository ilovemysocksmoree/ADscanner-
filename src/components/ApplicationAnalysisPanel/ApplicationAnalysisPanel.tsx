import React from 'react';
import { Grid, Paper, Box, Typography, IconButton, Tooltip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';
import {
    Apps as AppsIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { COLORS } from '../../constants/chartColors';
import { ApplicationData } from '../../types/network';

interface ApplicationAnalysisPanelProps {
    applications: ApplicationData[];
    applicationTimeData: { time: string; [key: string]: any }[];
}

const ApplicationAnalysisPanel: React.FC<ApplicationAnalysisPanelProps> = ({
    applications,
    applicationTimeData
}) => {
    return (
        <Grid container spacing={3}>
            {/* Application Layer Traffic Over Time Chart */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AppsIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div">Application Traffic Over Time</Typography>
                        <Tooltip title="Real-time view of application protocol traffic volume (connections).">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={applicationTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="time" interval="preserveStartEnd" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <RechartsTooltip />
                                <Legend iconType="circle" />
                                {Object.keys(applicationTimeData[0] || {})
                                    .filter(key => key !== 'time')
                                    .map((key, index) => (
                                        <Line
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            stroke={COLORS[index % COLORS.length]}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* Application Distribution Pie Chart */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div">Application Share (Bytes)</Typography>
                        <Tooltip title="Distribution of application protocols by bytes transferred.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={applications}
                                    dataKey="bytesTransferred"
                                    nameKey="application"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => percent > 0.03 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                                >
                                    {applications.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number) => [`${(value / 1024).toFixed(2)} KB`, 'Bytes']} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* Application Layer Statistics Table */}
            <Grid item xs={12}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div">Application Layer Statistics</Typography>
                        <Tooltip title="Detailed statistics per application protocol.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Application</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Connections</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bytes Transferred</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>% of Total Traffic</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications
                                    .sort((a, b) => b.bytesTransferred - a.bytesTransferred)
                                    .map((app) => {
                                        const totalBytesAllApps = applications.reduce((acc, curr) => acc + curr.bytesTransferred, 0);
                                        const percentage = totalBytesAllApps > 0 ? ((app.bytesTransferred / totalBytesAllApps) * 100) : 0;
                                        const isHighUsage = app.connections > 300 || percentage > 30;
                                        const isMediumUsage = (app.connections > 100 && app.connections <= 300) || (percentage > 10 && percentage <= 30);
                                        let statusLabel = 'Normal';
                                        let statusColor: "success" | "warning" | "error" = 'success';

                                        if (isHighUsage) {
                                            statusLabel = 'High Usage';
                                            statusColor = 'error';
                                        } else if (isMediumUsage) {
                                            statusLabel = 'Medium Usage';
                                            statusColor = 'warning';
                                        }

                                        return (
                                            <TableRow key={app.application} hover>
                                                <TableCell component="th" scope="row">{app.application}</TableCell>
                                                <TableCell align="right">{app.connections.toLocaleString()}</TableCell>
                                                <TableCell align="right">{(app.bytesTransferred / 1024).toFixed(1)} KB</TableCell>
                                                <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        color={statusColor}
                                                        label={statusLabel}
                                                        sx={{ fontWeight: 500, minWidth: 75 }}
                                                    />
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

export default ApplicationAnalysisPanel; 