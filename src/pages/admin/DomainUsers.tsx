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
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loggingService } from '../../services/LoggingService';

interface DomainUser {
  id: string;
  email: string;
  name: string;
  groupId: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export default function DomainUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [users, setUsers] = useState<DomainUser[]>(() => {
    const saved = localStorage.getItem('domainUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    new URLSearchParams(location.search).get('group')
  );

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    
    loggingService.addLog(user, 'PAGE_VIEW', 'Viewed domain users page', '/admin/domain-users');
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem('domainUsers', JSON.stringify(users));
  }, [users]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = selectedGroupId ? user.groupId === selectedGroupId : true;
    
    return matchesSearch && matchesGroup;
  });

  const handleExport = () => {
    const csvData = [
      ['Name', 'Email', 'Role', 'Status', 'Last Login'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        new Date(user.lastLogin).toLocaleString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'domain_users.csv';
    link.click();

    loggingService.addLog(
      user,
      'EXPORT_USERS',
      `Exported ${filteredUsers.length} users to CSV`,
      '/admin/domain-users'
    );
  };

  const handleDelete = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userId));
      loggingService.addLog(
        user,
        'DELETE_USER',
        `Deleted user: ${userToDelete.email}`,
        '/admin/domain-users'
      );
    }
  };

  const handleAddUser = () => {
    navigate('/admin/add-domain-user', {
      state: { groupId: selectedGroupId }
    });
  };

  const handleEditUser = (userId: string) => {
    navigate(`/admin/add-domain-user/${userId}`, {
      state: { groupId: selectedGroupId }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Domain Users
          {selectedGroupId && (
            <Chip
              label="Filtered by group"
              color="primary"
              size="small"
              onDelete={() => {
                setSelectedGroupId(null);
                navigate('/admin/domain-users');
              }}
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 2 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.lastLogin).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditUser(user.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 