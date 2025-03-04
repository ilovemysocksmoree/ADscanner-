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
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loggingService } from '../../services/LoggingService';

interface DomainGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  userCount: number;
}

export default function DomainGroups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<DomainGroup[]>(() => {
    const saved = localStorage.getItem('domainGroups');
    return saved ? JSON.parse(saved) : [];
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DomainGroup | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    
    loggingService.addLog(user, 'PAGE_VIEW', 'Viewed domain groups page', '/admin/domain-groups');
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem('domainGroups', JSON.stringify(groups));
  }, [groups]);

  const handleOpenDialog = (group?: DomainGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({ name: group.name, description: group.description });
    } else {
      setEditingGroup(null);
      setFormData({ name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGroup(null);
    setFormData({ name: '', description: '' });
    setError(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (editingGroup) {
      setGroups(groups.map(g => 
        g.id === editingGroup.id 
          ? { ...g, ...formData }
          : g
      ));
      loggingService.addLog(
        user,
        'EDIT_DOMAIN_GROUP',
        `Edited domain group: ${formData.name}`,
        '/admin/domain-groups'
      );
    } else {
      const newGroup: DomainGroup = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        description: formData.description,
        createdAt: new Date().toISOString(),
        userCount: 0,
      };
      setGroups([...groups, newGroup]);
      loggingService.addLog(
        user,
        'CREATE_DOMAIN_GROUP',
        `Created new domain group: ${formData.name}`,
        '/admin/domain-groups'
      );
    }

    handleCloseDialog();
  };

  const handleDelete = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setGroups(groups.filter(g => g.id !== groupId));
      loggingService.addLog(
        user,
        'DELETE_DOMAIN_GROUP',
        `Deleted domain group: ${group.name}`,
        '/admin/domain-groups'
      );
    }
  };

  const handleViewUsers = (groupId: string) => {
    navigate(`/admin/domain-users?group=${groupId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Domain Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Domain Group
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Users</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>
                  {new Date(group.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{group.userCount}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View Users">
                    <IconButton onClick={() => handleViewUsers(group.id)}>
                      <PeopleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(group)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(group.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No domain groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGroup ? 'Edit Domain Group' : 'Add Domain Group'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGroup ? 'Save Changes' : 'Add Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 