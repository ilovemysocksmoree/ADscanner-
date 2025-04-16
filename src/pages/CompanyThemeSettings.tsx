import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import { useCompanyTheme } from '../contexts/CompanyThemeContext';
import { ChromePicker } from 'react-color';

const CompanyThemeSettings: React.FC = () => {
  const { companyTheme, updateCompanyTheme } = useCompanyTheme();
  const [showPrimaryColorPicker, setShowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [formValues, setFormValues] = useState({
    name: companyTheme.name,
    companyName: companyTheme.companyName,
    primaryColor: companyTheme.primaryColor,
    secondaryColor: companyTheme.secondaryColor,
    email: companyTheme.email,
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handlePrimaryColorChange = (color: any) => {
    setFormValues({
      ...formValues,
      primaryColor: color.hex,
    });
  };

  const handleSecondaryColorChange = (color: any) => {
    setFormValues({
      ...formValues,
      secondaryColor: color.hex,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyTheme(formValues);
    setSuccessMessage('Company theme settings updated successfully!');
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Company Theme Settings
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Customize your company profile and theme colors
        </Typography>

        <Box component="form" onSubmit={handleSubmit} mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Application Name"
                value={formValues.name}
                onChange={handleChange}
                variant="outlined"
                helperText="This is the name displayed in browser tabs"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="companyName"
                label="Company Name"
                value={formValues.companyName}
                onChange={handleChange}
                variant="outlined"
                helperText="This will appear in the top navigation bar"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Primary Color
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box
                  onClick={() => setShowPrimaryColorPicker(!showPrimaryColorPicker)}
                  sx={{
                    backgroundColor: formValues.primaryColor,
                    width: 100,
                    height: 40,
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                  }}
                />
                <TextField
                  name="primaryColor"
                  value={formValues.primaryColor}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Box>
              {showPrimaryColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                  <Box 
                    sx={{ 
                      position: 'fixed', 
                      top: 0, 
                      right: 0, 
                      bottom: 0, 
                      left: 0 
                    }} 
                    onClick={() => setShowPrimaryColorPicker(false)} 
                  />
                  <ChromePicker 
                    color={formValues.primaryColor} 
                    onChange={handlePrimaryColorChange} 
                  />
                </Box>
              )}
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Used for top navigation bar
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Secondary Color
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box
                  onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                  sx={{
                    backgroundColor: formValues.secondaryColor,
                    width: 100,
                    height: 40,
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    borderRadius: 1,
                  }}
                />
                <TextField
                  name="secondaryColor"
                  value={formValues.secondaryColor}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Box>
              {showSecondaryColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                  <Box 
                    sx={{ 
                      position: 'fixed', 
                      top: 0, 
                      right: 0, 
                      bottom: 0, 
                      left: 0 
                    }} 
                    onClick={() => setShowSecondaryColorPicker(false)} 
                  />
                  <ChromePicker 
                    color={formValues.secondaryColor} 
                    onChange={handleSecondaryColorChange} 
                  />
                </Box>
              )}
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Used for sidebar navigation
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Company Email"
                value={formValues.email}
                onChange={handleChange}
                variant="outlined"
                type="email"
                helperText="Contact email for your company"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  sx={{ minWidth: 150 }}
                  variant="outlined" 
                  onClick={() => setFormValues({
                    name: companyTheme.name,
                    companyName: companyTheme.companyName,
                    primaryColor: companyTheme.primaryColor,
                    secondaryColor: companyTheme.secondaryColor,
                    email: companyTheme.email,
                  })}
                >
                  Reset
                </Button>
                <Button 
                  sx={{ minWidth: 150 }}
                  variant="contained" 
                  color="primary" 
                  type="submit"
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Preview section */}
      <Paper sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Preview
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
          <Box 
            sx={{ 
              height: 64, 
              backgroundColor: formValues.primaryColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              px: 3,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <Typography variant="h6">
              {formValues.companyName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Box 
              sx={{ 
                width: 240, 
                minHeight: 200, 
                backgroundColor: formValues.secondaryColor,
                color: '#fff',
                p: 2
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Sidebar Navigation
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>Dashboard</Box>
                <Box component="li" sx={{ mb: 1 }}>Vulnerability Scanner</Box>
                <Box component="li" sx={{ mb: 1 }}>Network Scanner</Box>
                <Box component="li" sx={{ mb: 1 }}>Reports</Box>
              </Box>
            </Box>
            <Box 
              sx={{ 
                flexGrow: 1, 
                p: 3, 
                backgroundColor: '#f5f5f5',
                minHeight: 200,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Main Content Area
              </Typography>
              <Typography variant="body2">
                This is a preview of how your themed application will look.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanyThemeSettings; 