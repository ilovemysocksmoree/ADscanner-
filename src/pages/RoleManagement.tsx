import React, { useState } from 'react';
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
  name: string;
  description: string;
  applications: string[];
  permissions: string[];
}

const defaultRoles: Role[] = [
  {
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

export default function RoleManagement() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRole, setMenuRole] = useState<Role | null>(null);

  const handleAddRole = () => {
    setSelectedRole(null);
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
    setRoles(roles.filter(r => r.name !== role.name));
    setAnchorEl(null);
    
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

  const handleSaveRole = (event: React.FormEvent) => {
    event.preventDefault();
    // Add role saving logic here
    setOpenDialog(false);
    
    if (selectedRole) {
      loggingService.addLog(
        user,
        'EDIT_ROLE',
        `Updated role: ${selectedRole.name}`,
        '/role-management'
      );
    } else {
      loggingService.addLog(
        user,
        'ADD_ROLE',
        'Created new role',
        '/role-management'
      );
    }
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.name}>
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
                  <TableCell align="right">
                    <IconButton
                      aria-label="more"
                      onClick={(e) => handleMenuOpen(e, role)}
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
              defaultValue={selectedRole?.name}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              defaultValue={selectedRole?.description}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Applications</InputLabel>
              <Select
                multiple
                value={selectedRole?.applications || []}
                label="Applications"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="All Applications">All Applications</MenuItem>
                <MenuItem value="Vulnerability Scanner">Vulnerability Scanner</MenuItem>
                <MenuItem value="Network Scanner">Network Scanner</MenuItem>
                <MenuItem value="Reports">Reports</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={selectedRole?.permissions || []}
                label="Permissions"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="manage_domains">Manage Domains</MenuItem>
                <MenuItem value="manage_users">Manage Users</MenuItem>
                <MenuItem value="view_logs">View Logs</MenuItem>
                <MenuItem value="manage_settings">Manage Settings</MenuItem>
                <MenuItem value="view_dashboard">View Dashboard</MenuItem>
                <MenuItem value="run_scans">Run Scans</MenuItem>
                <MenuItem value="view_reports">View Reports</MenuItem>
                <MenuItem value="view_scans">View Scans</MenuItem>
                <MenuItem value="view_vulnerabilities">View Vulnerabilities</MenuItem>
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
    </Box>
  );
} 