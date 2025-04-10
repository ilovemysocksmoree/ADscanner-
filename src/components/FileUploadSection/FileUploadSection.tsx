import React from 'react';
import { Paper, Typography, Button, Grid, CircularProgress, Tooltip, Box } from '@mui/material';
import { Upload as UploadIcon, Assessment as AssessmentIcon, Download as DownloadIcon } from '@mui/icons-material';

interface FileUploadSectionProps {
    file: File | null;
    isAnalyzing: boolean;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAnalyzeFile: () => void;
    showDetailedResults: boolean;
    onExportResults: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
    file,
    isAnalyzing,
    onFileUpload,
    onAnalyzeFile,
    showDetailedResults,
    onExportResults
}) => {
    return (
        <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom component="div">PCAP File Analysis</Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={file ? 4 : 6} md={file ? 3 : 4}>
                    <Button 
                        fullWidth 
                        variant="outlined" 
                        component="label" 
                        startIcon={<UploadIcon />}
                    >
                        {file ? "Change File" : "Upload PCAP"}
                        <input 
                            type="file" 
                            hidden 
                            accept=".pcap,.pcapng" 
                            onChange={onFileUpload} 
                        />
                    </Button>
                </Grid>
                {file && (
                    <>
                        <Grid item xs={12} sm={4} md={6}>
                            <Tooltip title={file.name}>
                                <Typography 
                                    noWrap 
                                    variant="body2" 
                                    sx={{ 
                                        fontStyle: 'italic', 
                                        color: 'text.secondary', 
                                        textAlign: { xs: 'center', sm: 'left'} 
                                    }}
                                >
                                    Selected: {file.name}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="primary" 
                                onClick={onAnalyzeFile} 
                                disabled={isAnalyzing} 
                                startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />}
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                            </Button>
                        </Grid>
                    </>
                )}
            </Grid>
            {showDetailedResults && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />} 
                        onClick={onExportResults} 
                        size="small"
                    >
                        Export Results (JSON)
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default FileUploadSection; 