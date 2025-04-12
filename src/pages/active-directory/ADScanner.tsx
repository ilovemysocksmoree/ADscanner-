import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Paper, 
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  AddCircle,
  GroupAdd,
  GroupRemove,
  CreateNewFolder,
  Computer,
  Refresh,
  Search
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ad-tabpanel-${index}`}
      aria-labelledby={`ad-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ADScanner = () => {
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  
  // Mock data
  const users = [
    { id: 1, username: 'jdoe', fullName: 'John Doe', email: 'jdoe@example.com', status: 'Active', groups: ['IT', 'Admin'], ou: 'Users' },
    { id: 2, username: 'asmith', fullName: 'Alice Smith', email: 'asmith@example.com', status: 'Active', groups: ['HR'], ou: 'Users' },
    { id: 3, username: 'bjohnson', fullName: 'Bob Johnson', email: 'bjohnson@example.com', status: 'Disabled', groups: ['Finance'], ou: 'Finance' },
  ];
  
  const groups = [
    { id: 1, name: 'IT', members: 1, description: 'IT Department' },
    { id: 2, name: 'HR', members: 1, description: 'Human Resources' },
    { id: 3, name: 'Admin', members: 1, description: 'Administrators' },
    { id: 4, name: 'Finance', members: 1, description: 'Finance Department' },
  ];
  
  const ous = [
    { id: 1, name: 'Users', parent: 'Root', objects: 2 },
    { id: 2, name: 'Finance', parent: 'Root', objects: 1 },
    { id: 3, name: 'IT', parent: 'Root', objects: 0 },
  ];
  
  const computers = [
    { id: 1, name: 'DESKTOP-001', ip: '192.168.1.101', os: 'Windows 10', lastLogon: '2023-04-10' },
    { id: 2, name: 'DESKTOP-002', ip: '192.168.1.102', os: 'Windows 11', lastLogon: '2023-04-11' },
    { id: 3, name: 'SERVER-001', ip: '192.168.1.10', os: 'Windows Server 2019', lastLogon: '2023-04-12' },
  ];

  const handleTestConnection = async () => {
    if (!domain || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Connection test successful!');
    } catch (err) {
      setError('Failed to connect to Active Directory');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!domain || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Successfully connected to Active Directory!');
      setConnected(true);
    } catch (err) {
      setError('Failed to connect to Active Directory');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenModal = (action: string) => {
    setModalAction(action);
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
          </>
        );
      
      case 'modifyUser':
        return (
          <>
            <DialogTitle>Modify User</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="dense">
                <InputLabel>Select User</InputLabel>
                <Select label="Select User">
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.username}>{user.fullName} ({user.username})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField fullWidth margin="dense" label="Full Name" variant="outlined" />
              <TextField fullWidth margin="dense" label="Email" variant="outlined" />
              <TextField fullWidth margin="dense" label="Reset Password" type="password" variant="outlined" />
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Organizational Unit</InputLabel>
                <Select label="Organizational Unit">
                  {ous.map(ou => (
                    <MenuItem key={ou.id} value={ou.name}>{ou.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
          </>
        );

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
          </>
        );

      case 'modifyGroup':
        return (
          <>
            <DialogTitle>Modify Group Members</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="dense">
                <InputLabel>Select Group</InputLabel>
                <Select label="Select Group">
                  {groups.map(group => (
                    <MenuItem key={group.id} value={group.name}>{group.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Add Members</Typography>
              <FormControl fullWidth margin="dense">
                <InputLabel>Available Users</InputLabel>
                <Select multiple label="Available Users">
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.username}>{user.fullName} ({user.username})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button startIcon={<GroupAdd />} variant="outlined">Add to Group</Button>
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
                    <TableRow>
                      <TableCell>jdoe</TableCell>
                      <TableCell>John Doe</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error">
                          <GroupRemove />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </>
        );

      case 'addOU':
        return (
          <>
            <DialogTitle>Create Organizational Unit</DialogTitle>
            <DialogContent>
              <TextField fullWidth margin="dense" label="OU Name" variant="outlined" />
              <TextField fullWidth margin="dense" label="Description" variant="outlined" multiline rows={2} />
              <FormControl fullWidth margin="dense">
                <InputLabel>Parent OU</InputLabel>
                <Select label="Parent OU">
                  <MenuItem value="Root">Root</MenuItem>
                  {ous.map(ou => (
                    <MenuItem key={ou.id} value={ou.name}>{ou.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
          </>
        );

      default:
        return (
          <>
            <DialogTitle>Action</DialogTitle>
            <DialogContent>
              <DialogContentText>
                No content for this action.
              </DialogContentText>
            </DialogContent>
          </>
        );
    }
  };

  const ConnectionForm = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Active Directory Connection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect to your Active Directory server to manage users and groups
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        label="Domain URL"
        placeholder="e.g., ad.example.com or 192.168.1.1"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        fullWidth
        margin="normal"
        disabled={loading}
      />

      <TextField
        label="Username"
        placeholder="e.g., administrator or admin@example.com"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        disabled={loading}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        disabled={loading}
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleTestConnection}
          disabled={loading}
        >
          Test Connection
        </Button>
        <Button
          variant="contained"
          onClick={handleConnect}
          disabled={loading}
        >
          Connect
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AD Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect to your Active Directory server to manage users, groups, and monitor your domain.
        </Typography>
        
        {!connected ? (
          <ConnectionForm />
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="AD management tabs">
                <Tab label="Users" />
                <Tab label="Groups" />
                <Tab label="Organizational Units" />
                <Tab label="Computers" />
              </Tabs>
            </Box>

            {/* Users Tab */}
            <TabPanel value={activeTab} index={0}>
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
              
              <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <TextField
                    placeholder="Search users..."
                    size="small"
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                    }}
                    sx={{ mr: 2, width: 300 }}
                  />
                  <Button startIcon={<Refresh />} variant="text">Refresh</Button>
                </Box>
                
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="users table">
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
                            {user.status === 'Active' ? 
                              <CheckCircle color="success" fontSize="small" /> : 
                              <Cancel color="error" fontSize="small" />
                            } {user.status}
                          </TableCell>
                          <TableCell>{user.groups.join(', ')}</TableCell>
                          <TableCell>{user.ou}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </TabPanel>

            {/* Groups Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Groups Management</Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddCircle />} 
                    sx={{ mr: 1 }}
                    onClick={() => handleOpenModal('addGroup')}
                  >
                    Create Group
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<GroupAdd />}
                    onClick={() => handleOpenModal('modifyGroup')}
                  >
                    Manage Members
                  </Button>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                {groups.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {group.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Members: {group.members}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" startIcon={<GroupAdd />}>Manage Members</Button>
                        <Button size="small" color="error" startIcon={<Delete />}>Delete</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Organizational Units Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Organizational Units</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<CreateNewFolder />}
                  onClick={() => handleOpenModal('addOU')}
                >
                  Create OU
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="OU table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Parent</TableCell>
                      <TableCell>Objects</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ous.map((ou) => (
                      <TableRow key={ou.id}>
                        <TableCell>{ou.name}</TableCell>
                        <TableCell>{ou.parent}</TableCell>
                        <TableCell>{ou.objects}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Computers Tab */}
            <TabPanel value={activeTab} index={3}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Computer Accounts</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Computer />}
                >
                  Add Computer
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="computers table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Computer Name</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Operating System</TableCell>
                      <TableCell>Last Logon</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {computers.map((computer) => (
                      <TableRow key={computer.id}>
                        <TableCell>{computer.name}</TableCell>
                        <TableCell>{computer.ip}</TableCell>
                        <TableCell>{computer.os}</TableCell>
                        <TableCell>{computer.lastLogon}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Box>
        )}
      </Box>

      {/* Modals */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        {getModalContent()}
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseModal}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ADScanner; 