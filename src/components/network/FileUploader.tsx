import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  isAnalyzing,
  accept = '.pcap,.pcapng',
  maxSize = 100 * 1024 * 1024, // 100MB default
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      // Check file size
      if (selectedFile.size > maxSize) {
        setError(`File size exceeds the maximum allowed size (${Math.round(maxSize / (1024 * 1024))}MB)`);
        return;
      }
      
      // Check file type (basic check)
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!accept.includes(fileExt || '')) {
        setError(`Invalid file type. Accepted types: ${accept}`);
        return;
      }
      
      setFile(selectedFile);
      onFileSelected(selectedFile);
    }
    
    // Clear input value to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Upload PCAP File
      </Typography>
      
      <Box>
        <input
          accept={accept}
          style={{ display: 'none' }}
          id="file-upload-button"
          type="file"
          onChange={handleFileChange}
          disabled={isAnalyzing}
        />
        <label htmlFor="file-upload-button">
          <Button
            variant="contained"
            component="span"
            color="primary"
            startIcon={<UploadIcon />}
            disabled={isAnalyzing}
            sx={{ mt: 1 }}
          >
            Select File
          </Button>
        </label>
      </Box>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {file && !error && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`}
            color="success"
            variant="outlined"
            onDelete={() => setFile(null)}
            disabled={isAnalyzing}
          />
        </Box>
      )}
      
      {isAnalyzing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Analyzing file...</Typography>
        </Box>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB. Supported formats: {accept}
      </Typography>
    </Paper>
  );
};

export default FileUploader; 