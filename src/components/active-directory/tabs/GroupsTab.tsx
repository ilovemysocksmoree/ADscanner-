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
  Divider
} from '@mui/material';
import {
  GroupAdd,
  Edit,
  Delete,
  GroupRemove
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

interface Group {
  id: number;
  name: string;
  members: number;
  description: string;
}

interface GroupsTabProps {
  groups: Group[];
  users: User[];
}

const GroupsTab: React.FC<GroupsTabProps> = ({ groups, users }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleOpenModal = (action: string, group?: Group) => {
    setModalAction(action);
    if (group) {
      setSelectedGroup(group);
    } else {
      setSelectedGroup(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getModalContent = () => {
    switch (modalAction) {
      case 'addGroup':
        return (
          <>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogContent>
              <TextField fullWidth margin="dense" label="Group Name" variant="outlined" />
              <TextField fullWidth margin="dense" label="Description" variant="outlined" multiline rows={2} />
              <FormControl fullWidth margin="dense">
                <InputLabel>Group Type</InputLabel>
                <Select label="Group Type">
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Distribution">Distribution</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Group Scope</InputLabel>
                <Select label="Group Scope">
                  <MenuItem value="Domain Local">Domain Local</MenuItem>
                  <MenuItem value="Global">Global</MenuItem>
                  <MenuItem value="Universal">Universal</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" color="primary">Create Group</Button>
            </DialogActions>
          </>
        );
      
      case 'modifyGroup':
        return (
          <>
            <DialogTitle>
              {selectedGroup ? `Modify Group: ${selectedGroup.name}` : 'Modify Group'}
            </DialogTitle>
            <DialogContent>
              {selectedGroup ? (
                <>
                  <TextField 
                    fullWidth 
                    margin="dense" 
                    label="Group Name" 
                    variant="outlined" 
                    defaultValue={selectedGroup.name}
                  />
                  <TextField 
                    fullWidth 
                    margin="dense" 
                    label="Description" 
                    variant="outlined" 
                    multiline 
                    rows={2}
                    defaultValue={selectedGroup.description}
                  />
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">Add Members</Typography>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Available Users</InputLabel>
                    <Select multiple label="Available Users">
                      {users
                        .filter(user => !user.groups.includes(selectedGroup.name))
                        .map(user => (
                          <MenuItem key={user.id} value={user.username}>
                            {user.fullName} ({user.username})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button startIcon={<GroupAdd />} variant="outlined">
                      Add to Group
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">Current Members</Typography>
                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Full Name</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users
                          .filter(user => user.groups.includes(selectedGroup.name))
                          .map(user => (
                            <TableRow key={user.id}>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.fullName}</TableCell>
                              <TableCell align="right">
                                <IconButton size="small" color="error">
                                  <GroupRemove fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <FormControl fullWidth margin="dense">
                  <InputLabel>Select Group</InputLabel>
                  <Select label="Select Group">
                    {groups.map(group => (
                      <MenuItem key={group.id} value={group.name}>{group.name}</MenuItem>
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
        <Typography variant="h6">Groups Management</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<GroupAdd />} 
            sx={{ mr: 1 }}
            onClick={() => handleOpenModal('addGroup')}
          >
            Create Group
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Edit />}
            onClick={() => handleOpenModal('modifyGroup')}
          >
            Manage Members
          </Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Group Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.members}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenModal('modifyGroup', group)}
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
      
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal} 
        maxWidth="sm" 
        fullWidth
      >
        {getModalContent()}
      </Dialog>
    </>
  );
};

export default GroupsTab; 