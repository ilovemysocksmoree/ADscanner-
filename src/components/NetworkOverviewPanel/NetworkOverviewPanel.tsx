import React from 'react';
import { Grid, Paper, Box, Typography, IconButton, Tooltip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import {
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Timer as TtlIcon,
    Public as GlobeIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
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
import { COLORS, TTL_COLOR } from '../../constants/chartColors';
import { EndpointData, ProtocolData, TtlDistributionData } from '../../types/network';

interface NetworkOverviewPanelProps {
    endpoints: EndpointData[];
    protocols: ProtocolData[];
    ttlDistribution: TtlDistributionData[];
}

const NetworkOverviewPanel: React.FC<NetworkOverviewPanelProps> = ({
    endpoints,
    protocols,
    ttlDistribution
}) => {
    return (
        <Grid container spacing={3}>
            {/* IP Traffic Distribution */}
            <Grid item xs={12} md={6} lg={7}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div">IP Traffic Distribution</Typography>
                        <Tooltip title="Top 10 IP addresses by total data transferred (In + Out).">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={endpoints
                                    .map(e => ({ ip: e.ip, totalBytes: e.bytesIn + e.bytesOut }))
                                    .sort((a, b) => b.totalBytes - a.totalBytes)
                                    .slice(0, 10)}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(value) => `${(value / 1024).toFixed(0)} KB`} tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="ip" width={100} interval={0} tick={{ fontSize: 10 }} />
                                <RechartsTooltip formatter={(value: number) => [`${(value / 1024).toFixed(2)} KB`, 'Total Bytes']} />
                                <Bar dataKey="totalBytes" name="Total Bytes" fill={COLORS[0]} background={{ fill: '#eee' }} radius={[0, 5, 5, 0]} barSize={20}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* Protocol Distribution */}
            <Grid item xs={12} md={6} lg={5}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PieChartIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" component="div">Protocol Summary</Typography>
                        <Tooltip title="Overall distribution of network protocols by packet count.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={protocols}
                                    dataKey="count"
                                    nameKey="protocol"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    innerRadius={50}
                                    labelLine={false}
                                    label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                                >
                                    {protocols.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} packets`, 'Count']} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* TTL Distribution */}
            <Grid item xs={12} md={6} lg={7}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TtlIcon sx={{ mr: 1, color: TTL_COLOR }} />
                        <Typography variant="h6" component="div">TTL Distribution</Typography>
                        <Tooltip title="Distribution of Time-To-Live (TTL) values observed in packets.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={ttlDistribution.sort((a,b) => b.count - a.count)}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="ttlGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor={TTL_COLOR} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={TTL_COLOR} stopOpacity={0.4}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(value) => value.toLocaleString()} tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="ttl" width={40} tick={{ fontSize: 10 }} />
                                <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} packets`, 'Count']} />
                                <Bar
                                    dataKey="count"
                                    name="Packet Count"
                                    fill="url(#ttlGradient)"
                                    radius={[0, 5, 5, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>

            {/* Geographic Traffic */}
            <Grid item xs={12} md={6} lg={5}>
                <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <GlobeIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="h6" component="div">Geographic Traffic</Typography>
                        <Tooltip title="Geographic locations of endpoints based on IP address.">
                            <IconButton size="small" sx={{ ml: 1 }}><InfoIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    </Box>
                    <TableContainer sx={{ maxHeight: 350 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>IP Address</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell align="right">Total Bytes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {endpoints
                                    .filter(e => e.location?.countryCode !== 'XX')
                                    .sort((a, b) => (b.bytesIn + b.bytesOut) - (a.bytesIn + a.bytesOut))
                                    .map((endpoint) => (
                                        <TableRow key={endpoint.ip} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{endpoint.ip}</TableCell>
                                            <TableCell>
                                                {endpoint.location ? `${endpoint.location.city}, ${endpoint.location.country}` : 'N/A'}
                                                {endpoint.location && endpoint.location.countryCode !== 'XX' && (
                                                    <Tooltip title={endpoint.location.country}>
                                                        <img
                                                            loading="lazy"
                                                            width="20"
                                                            src={`https://flagcdn.com/w20/${endpoint.location.countryCode.toLowerCase()}.png`}
                                                            srcSet={`https://flagcdn.com/w40/${endpoint.location.countryCode.toLowerCase()}.png 2x`}
                                                            alt={`${endpoint.location.countryCode} flag`}
                                                            style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                                                            onError={(e) => e.currentTarget.style.display='none'}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                {((endpoint.bytesIn + endpoint.bytesOut) / 1024).toFixed(1)} KB
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default NetworkOverviewPanel; 