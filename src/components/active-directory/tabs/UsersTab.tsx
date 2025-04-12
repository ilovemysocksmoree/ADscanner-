import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
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
  Chip
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  status: string;
  groups: string[];
  ou: string;
}

interface UsersTabProps {
  users: User[];
  groups: { id: number; name: string; members: number; description: string }[];
  ous: { id: number; name: string; parent: string; objects: number }[];
}

const UsersTab: React.FC<UsersTabProps> = ({ users, groups, ous }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenModal = (action: string, user?: User) => {
    setModalAction(action);
    if (user) {
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getModalContent = () => {
    switch (modalAction) {
      case 'addUser':
        return (
          <>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
              <TextField fullWidth margin="dense" label="Username" variant="outlined" />
              <TextField fullWidth margin="dense" label="Full Name" variant="outlined" />
              <TextField fullWidth margin="dense" label="Email" variant="outlined" />
              <TextField fullWidth margin="dense" label="Password" type="password" variant="outlined" />
              <FormControl fullWidth margin="dense">
                <InputLabel>Organizational Unit</InputLabel>
                <Select label="Organizational Unit">
                  {ous.map(ou => (
                    <MenuItem key={ou.id} value={ou.name}>{ou.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Groups</InputLabel>
                <Select multiple label="Groups">
                  {groups.map(group => (
                    <MenuItem key={group.id} value={group.name}>{group.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" color="primary">Add User</Button>
            </DialogActions>
          </>
        );
      
      case 'modifyUser':
        return (
          <>
            <DialogTitle>Modify User</DialogTitle>
            <DialogContent>
              {selectedUser ? (
                <>
                  <TextField 
                    fullWidth 
                    margin="dense" 
                    label="Username" 
                    variant="outlined" 
                    defaultValue={selectedUser.username}
                    disabled
                  />
                  <TextField 
                    fullWidth 
                    margin="dense" 
                    label="Full Name" 
                    variant="outlined" 
                    defaultValue={selectedUser.fullName}
                  />
                  <TextField 
                    fullWidth 
                    margin="dense" 
                    label="Email" 
                    variant="outlined" 
                    defaultValue={selectedUser.email}
                  />
                  <TextField fullWidth margin="dense" label="Reset Password" type="password" variant="outlined" />
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status"
                      defaultValue={selectedUser.status}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Organizational Unit</InputLabel>
                    <Select 
                      label="Organizational Unit"
                      defaultValue={selectedUser.ou}
                    >
                      {ous.map(ou => (
                        <MenuItem key={ou.id} value={ou.name}>{ou.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl fullWidth margin="dense">
                  <InputLabel>Select User</InputLabel>
                  <Select label="Select User">
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.username}>{user.fullName} ({user.username})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" color="primary">Save Changes</Button>
            </DialogActions>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Users Management</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<PersonAdd />} 
            sx={{ mr: 1 }}
            onClick={() => handleOpenModal('addUser')}
          >
            Add User
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Edit />}
            onClick={() => handleOpenModal('modifyUser')}
          >
            Modify User
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Groups</TableCell>
              <TableCell>OU</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.status === 'Active' ? (
                    <Chip 
                      icon={<CheckCircle fontSize="small" />} 
                      label="Active" 
                      color="success" 
                      size="small" 
                    />
                  ) : (
                    <Chip 
                      icon={<Cancel fontSize="small" />} 
                      label="Disabled" 
                      color="error" 
                      size="small" 
                    />
                  )}
                </TableCell>
                <TableCell>
                  {user.groups.map((group, index) => (
                    <Chip 
                      key={index} 
                      label={group} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </TableCell>
                <TableCell>{user.ou}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenModal('modifyUser', user)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        {getModalContent()}
      </Dialog>
    </>
  );
};

export default UsersTab; 