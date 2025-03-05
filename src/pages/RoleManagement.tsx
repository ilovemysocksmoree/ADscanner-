import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { loggingService } from '../services/LoggingService';

interface Role {
  id: string;
  name: string;
  description: string;
  applications: string[];
  permissions: string[];
}

const availableApplications = [
  'All Applications',
  'Vulnerability Scanner',
  'Network Scanner',
  'Reports',
  'Dashboard',
  'User Management',
  'Role Management',
  'Logs',
];

const availablePermissions = [
  { value: 'manage_domains', label: 'Manage Domains' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'view_logs', label: 'View Logs' },
  { value: 'manage_settings', label: 'Manage Settings' },
  { value: 'view_dashboard', label: 'View Dashboard' },
  { value: 'run_scans', label: 'Run Scans' },
  { value: 'view_reports', label: 'View Reports' },
  { value: 'view_scans', label: 'View Scans' },
  { value: 'view_vulnerabilities', label: 'View Vulnerabilities' },
  { value: 'manage_profile', label: 'Manage Profile' },
];

export default function RoleManagement() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>(() => {
    const savedRoles = localStorage.getItem('roles');
    return savedRoles ? JSON.parse(savedRoles) : [];
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRole, setMenuRole] = useState<Role | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    applications: [] as string[],
    permissions: [] as string[],
  });

  // Load initial roles if none exist
  useEffect(() => {
    if (roles.length === 0) {
      const defaultRoles: Role[] = [
        {
          id: 'admin-role',
          name: 'Administrator',
          description: 'Full access to all applications, functionality and administrator management',
          applications: ['All Applications'],
          permissions: [
            'manage_domains',
            'manage_users',
            'view_logs',
            'manage_settings',
            'manage_profile',
            'view_dashboard',
            'run_scans',
            'view_reports',
            'view_scans',
            'view_vulnerabilities'
          ]
        },
        {
          id: 'exec-role',
          name: 'Executive',
          description: 'Can schedule reports for all applications, but cannot view or configure administrators or roles',
          applications: ['All Applications'],
          permissions: [
            'view_dashboard',
            'view_reports',
            'manage_profile'
          ]
        },
        {
          id: 'manager-role',
          name: 'Manager',
          description: 'Full access to all applications, functionality, but cannot view or configure administrators or roles',
          applications: ['All Applications'],
          permissions: [
            'view_dashboard',
            'run_scans',
            'view_reports',
            'view_scans',
            'view_vulnerabilities',
            'manage_profile'
          ]
        },
        {
          id: 'readonly-role',
          name: 'Read Only',
          description: 'Can view configurations and logs, but can not make changes',
          applications: ['All Applications'],
          permissions: [
            'view_dashboard',
            'view_reports',
            'view_scans',
            'view_vulnerabilities'
          ]
        }
      ];
      setRoles(defaultRoles);
      localStorage.setItem('roles', JSON.stringify(defaultRoles));
    }
  }, []);

  // Save roles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);

  const handleAddRole = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      applications: [],
      permissions: [],
    });
    setOpenDialog(true);
    
    loggingService.addLog(
      user,
      'OPEN_ADD_ROLE',
      'Opened dialog to add new role',
      '/role-management'
    );
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      applications: role.applications,
      permissions: role.permissions,
    });
    setOpenDialog(true);
    setAnchorEl(null);
    
    loggingService.addLog(
      user,
      'OPEN_EDIT_ROLE',
      `Opened dialog to edit role: ${role.name}`,
      '/role-management'
    );
  };

  const handleDeleteRole = (role: Role) => {
    if (role.name === 'Administrator') {
      setSnackbar({
        open: true,
        message: 'Cannot delete the Administrator role',
        severity: 'error',
      });
      return;
    }

    setRoles(roles.filter(r => r.id !== role.id));
    setAnchorEl(null);
    
    setSnackbar({
      open: true,
      message: `Role "${role.name}" deleted successfully`,
      severity: 'success',
    });
    
    loggingService.addLog(
      user,
      'DELETE_ROLE',
      `Deleted role: ${role.name}`,
      '/role-management'
    );
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget);
    setMenuRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRole(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Role name is required',
        severity: 'error',
      });
      return false;
    }
    if (!formData.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Role description is required',
        severity: 'error',
      });
      return false;
    }
    if (formData.applications.length === 0) {
      setSnackbar({
        open: true,
        message: 'At least one application must be selected',
        severity: 'error',
      });
      return false;
    }
    if (formData.permissions.length === 0) {
      setSnackbar({
        open: true,
        message: 'At least one permission must be selected',
        severity: 'error',
      });
      return false;
    }
    return true;
  };

  const handleSaveRole = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    if (selectedRole) {
      // Update existing role
      setRoles(roles.map(role => 
        role.id === selectedRole.id 
          ? { ...selectedRole, ...formData }
          : role
      ));
      
      setSnackbar({
        open: true,
        message: `Role "${formData.name}" updated successfully`,
        severity: 'success',
      });
      
      loggingService.addLog(
        user,
        'EDIT_ROLE',
        `Updated role: ${formData.name}`,
        '/role-management'
      );
    } else {
      // Create new role
      const newRole: Role = {
        id: `role-${Date.now()}`,
        ...formData,
      };
      setRoles([...roles, newRole]);
      
      setSnackbar({
        open: true,
        message: `Role "${formData.name}" created successfully`,
        severity: 'success',
      });
      
      loggingService.addLog(
        user,
        'ADD_ROLE',
        `Created new role: ${formData.name}`,
        '/role-management'
      );
    }
    
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Role Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRole}
          startIcon={<SecurityIcon />}
        >
          Add Role
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Applications</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell component="th" scope="row">
                    <Typography variant="subtitle1">{role.name}</Typography>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {role.applications.map((app) => (
                        <Chip
                          key={app}
                          label={app}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {role.permissions.map((permission) => (
                        <Chip
                          key={permission}
                          label={availablePermissions.find(p => p.value === permission)?.label || permission}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="more"
                      onClick={(e) => handleMenuOpen(e, role)}
                      disabled={role.name === 'Administrator'}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Role Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuRole && handleEditRole(menuRole)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuRole && handleDeleteRole(menuRole)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Add New Role'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSaveRole} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Applications</InputLabel>
              <Select
                multiple
                value={formData.applications}
                onChange={(e) => handleInputChange('applications', e.target.value)}
                label="Applications"
                required
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableApplications.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={formData.permissions}
                onChange={(e) => handleInputChange('permissions', e.target.value)}
                label="Permissions"
                required
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={availablePermissions.find(p => p.value === value)?.label || value}
                        size="small" 
                      />
                    ))}
                  </Box>
                )}
              >
                {availablePermissions.map((permission) => (
                  <MenuItem key={permission.value} value={permission.value}>
                    {permission.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" color="primary">
            {selectedRole ? 'Save Changes' : 'Add Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 