import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  name: string;
  email: string;
  phoneNumber: string;
  region: string;
  company: string;
  position: string;
  role: string;
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || 'John Doe',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '+1 234 567 8900',
    region: user?.region || 'North America',
    company: user?.companyName || 'Tech Corp',
    position: user?.position || 'Security Analyst',
    role: user?.isAdmin ? 'Administrator' : 'User',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: profileData.name,
        phoneNumber: profileData.phoneNumber,
        region: profileData.region,
        companyName: profileData.company,
        position: profileData.position,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <IconButton sx={{ mr: 1, color: 'primary.main' }}>{icon}</IconButton>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Profile Information
          </Typography>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={handleEdit}
            disabled={isEditing}
          >
            Edit Profile
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6">{profileData.name}</Typography>
              <Typography color="text.secondary">{profileData.position}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <InfoRow
              icon={<EmailIcon />}
              label="Email Address"
              value={profileData.email}
            />
            <InfoRow
              icon={<PhoneIcon />}
              label="Phone Number"
              value={profileData.phoneNumber}
            />
            <InfoRow
              icon={<LocationIcon />}
              label="Region"
              value={profileData.region}
            />
            <InfoRow
              icon={<BusinessIcon />}
              label="Company"
              value={profileData.company}
            />
            <InfoRow
              icon={<WorkIcon />}
              label="Position"
              value={profileData.position}
            />
            <InfoRow
              icon={<SecurityIcon />}
              label="Role"
              value={profileData.role}
            />
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={isEditing} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Region"
                value={profileData.region}
                onChange={(e) => setProfileData({ ...profileData, region: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={profileData.company}
                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                value={profileData.position}
                onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 