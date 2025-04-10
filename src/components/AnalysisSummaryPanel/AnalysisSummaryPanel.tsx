import React from 'react';
import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, Chip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { AnalysisDetails } from '../../types/network';

interface AnalysisSummaryPanelProps {
    analysisDetails: AnalysisDetails;
    fileName: string;
}

const AnalysisSummaryPanel: React.FC<AnalysisSummaryPanelProps> = ({
    analysisDetails,
    fileName
}) => {
    return (
        <Grid container spacing={3}>
            {/* Analysis Summary Info */}
            <Grid item xs={12}>
                <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="h6" gutterBottom>Analysis Summary</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2">
                                <strong>File:</strong> {fileName || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2">
                                <strong>Analyzed At:</strong> {new Date(analysisDetails.timestamp).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={6} md={2}>
                            <Typography variant="body2">
                                <strong>Duration:</strong> {analysisDetails.duration}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={6} md={2}>
                            <Typography variant="body2">
                                <strong>Total Packets:</strong> {analysisDetails.totalPackets.toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Typography variant="body2">
                                <strong>Total Bytes:</strong> {(analysisDetails.totalBytes / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Suspicious Activities */}
            {analysisDetails.suspiciousActivities.length > 0 && (
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Suspicious Activities Detected</Typography>
                        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {analysisDetails.suspiciousActivities.map((activity, index) => (
                                <ListItem key={index} divider sx={{ alignItems: 'flex-start' }}>
                                    <ListItemText
                                        primary={activity.type}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {activity.description}
                                                </Typography>
                                                {` - ${new Date(activity.timestamp).toLocaleTimeString()}`}
                                            </>
                                        }
                                    />
                                    <Chip
                                        label={activity.severity}
                                        size="small"
                                        color={activity.severity === 'high' ? 'error' : activity.severity === 'medium' ? 'warning' : 'info'}
                                        sx={{ ml: 1, mt: 0.5, alignSelf: 'center' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            )}

            {/* Top Talkers */}
            {analysisDetails.topTalkers.length > 0 && (
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: { xs: 1, sm: 2 }, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Top Talkers (by Outbound Packets)</Typography>
                        <TableContainer sx={{ maxHeight: 300, overflow: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IP Address</TableCell>
                                        <TableCell align="right">Packets</TableCell>
                                        <TableCell align="right">Bytes</TableCell>
                                        <TableCell>Protocols</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analysisDetails.topTalkers.map((talker, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{talker.ip}</TableCell>
                                            <TableCell align="right">{talker.packets.toLocaleString()}</TableCell>
                                            <TableCell align="right">{talker.bytes}</TableCell>
                                            <TableCell>
                                                {talker.protocols.slice(0, 3).map(p => (
                                                    <Chip 
                                                        key={p} 
                                                        label={p} 
                                                        size="small" 
                                                        variant="outlined" 
                                                        sx={{ mr: 0.5, mb: 0.5 }} 
                                                    />
                                                ))}
                                                {talker.protocols.length > 3 && (
                                                    <Chip 
                                                        label="..." 
                                                        size="small" 
                                                        variant="outlined" 
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
};

export default AnalysisSummaryPanel; 