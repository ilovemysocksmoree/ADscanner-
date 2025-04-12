import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Toolbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Clear,
  VerifiedUser,
  Person,
  Group,
  Email,
  Phone,
  Work,
  BusinessCenter,
  Event,
  Schedule,
  Info,
  Lock,
  LockOpen,
  FilterList
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';
import { ADUser } from '../../../models/ad-entities';

const UsersTab: React.FC = () => {
  // State
  const [users, setUsers] = useState<ADUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading users...');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ADUser | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'active', 'disabled', 'locked'

  // Fetch users when page, rowsPerPage or filters change
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingMessage('Connecting to Active Directory server...');
      
      // Make sure page is a valid number (1-based for API)
      const currentPage = Math.max(page + 1, 1);
      
      // Get server and domain info
      const serverIP = activeDirectoryService.getServerIP();
      const domain = localStorage.getItem('ad_domain_name');
      
      if (!serverIP || !domain) {
        setLoadingMessage('Server connection information not found');
        setUsers([]);
        setTotalUsers(0);
        return;
      }
      
      setLoadingMessage(`Fetching users from ${domain} (${serverIP})...`);
      
      const response = await activeDirectoryService.getUsers(
        currentPage, 
        rowsPerPage, 
        searchQuery || ''
      );
      
      // Check if response or items is null or undefined
      if (!response || !response.items) {
        console.error('Received invalid response from API');
        setUsers([]);
        setTotalUsers(0);
        return;
      }
      
      // Apply status filtering client-side
      let filteredItems = response.items;
      if (statusFilter !== 'all') {
        setLoadingMessage('Applying filters...');
        filteredItems = response.items.filter(user => {
          if (statusFilter === 'active') return user.enabled && !user.locked;
          if (statusFilter === 'disabled') return !user.enabled;
          if (statusFilter === 'locked') return user.locked;
          return true;
        });
      }
      
      // Set the data
      setUsers(filteredItems);
      setTotalUsers(response.totalCount || 0);
      
      loggingService.logInfo(`Loaded ${response.items.length} users from AD server`);
    } catch (error) {
      console.error('Error fetching users:', error);
      loggingService.logError(`Failed to load users: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Event handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    fetchUsers();
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleViewDetails = (user: ADUser) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setUserDetailOpen(false);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setPage(0);
    // Filter will be applied on next fetchUsers call, which happens via useEffect
  };

  // Test function to directly call the API
  const testDirectApiCall = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Testing direct API call...');
      
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/users';
      const serverIP = activeDirectoryService.getServerIP() || '192.168.1.5';
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };
      
      console.log('Direct test - Sending request to:', url);
      console.log('Direct test - Request body:', JSON.stringify(body));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      console.log('Direct test - Response status:', response.status);
      
      const data = await response.json();
      console.log('Direct test - Response data:', data);
      
      if (data.users && data.users.length > 0) {
        // Just show the first 5 users for testing
        setUsers(data.users.slice(0, 5).map((u: any) => ({
          id: u.objectGUID || u.distinguishedName,
          distinguishedName: u.distinguishedName,
          name: u.displayName || u.samAccountName,
          displayName: u.displayName || u.samAccountName,
          samAccountName: u.samAccountName,
          userPrincipalName: u.userPrincipalName || '',
          firstName: u.givenName || '',
          lastName: u.surName || '',
          email: u.mail || '',
          enabled: true,
          locked: false,
          groups: u.memberof || [],
          description: u.description || ''
        })));
        setTotalUsers(data.users.length);
      }
    } catch (error) {
      console.error('Direct API test failed:', error);
      alert('Direct API test failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Format date to be more readable
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  // Format username from distinguished name
  const formatUsername = (user: ADUser) => {
    return user.userPrincipalName || user.samAccountName || 'N/A';
  };

  // Generate avatar background color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2',
      '#0288d1', '#689f38', '#e64a19', '#fbc02d', '#512da8'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate avatar content based on user
  const getAvatarContent = (user: ADUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName[0].toUpperCase();
    }
    return user.samAccountName[0].toUpperCase();
  };

  return (
    <Box>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          bgcolor: 'background.paper',
          borderRadius: 1,
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
          >
            Active Directory Users
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {!loading && (
              <Chip 
                label={`${totalUsers} total`} 
                size="small" 
                sx={{ ml: 2 }} 
                color="primary"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <TextField
            placeholder="Search users..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ mr: 2, width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <FormControl sx={{ minWidth: 150, mr: 2 }} size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e as any)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
              <MenuItem value="locked">Locked</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            color="secondary"
            onClick={testDirectApiCall}
            size="small"
            sx={{ ml: 1 }}
          >
            Test API
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ ml: 2 }}
          >
            Add User
          </Button>
        </Box>
      </Toolbar>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Last Logon</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1">{loadingMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography variant="body1">No users found</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && users.map((user) => (
              <TableRow 
                key={user.id} 
                hover
                onClick={() => handleViewDetails(user)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        backgroundColor: getAvatarColor(user.displayName || user.samAccountName)
                      }}
                    >
                      {getAvatarContent(user)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1">{user.displayName || 'N/A'}</Typography>
                      {user.title && (
                        <Typography variant="caption" color="textSecondary">
                          {user.title}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{formatUsername(user)}</TableCell>
                <TableCell>{user.email || 'N/A'}</TableCell>
                <TableCell>
                  {user.locked ? (
                    <Chip 
                      icon={<Lock fontSize="small" />}
                      label="Locked" 
                      size="small" 
                      color="error"
                    />
                  ) : user.enabled ? (
                    <Chip 
                      icon={<VerifiedUser fontSize="small" />}
                      label="Active" 
                      size="small" 
                      color="success"
                    />
                  ) : (
                    <Chip 
                      label="Disabled" 
                      size="small" 
                      color="default"
                    />
                  )}
                </TableCell>
                <TableCell>{user.department || 'N/A'}</TableCell>
                <TableCell>{user.lastLogon ? formatDate(user.lastLogon) : 'Never'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(user);
                        }}
                      >
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          // Edit logic
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete logic
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* User Details Dialog */}
      <Dialog 
        open={userDetailOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    width: 56, 
                    height: 56,
                    backgroundColor: getAvatarColor(selectedUser.displayName || selectedUser.samAccountName)
                  }}
                >
                  {getAvatarContent(selectedUser)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.displayName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser.distinguishedName}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Basic Information" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      avatar={<Person color="primary" />}
                    />
                    <Divider />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Person fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Full Name" 
                            secondary={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <VerifiedUser fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Username" 
                            secondary={selectedUser.samAccountName} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Email fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Email" 
                            secondary={selectedUser.email || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Phone fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Phone" 
                            secondary={selectedUser.phoneNumber || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Work fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Department" 
                            secondary={selectedUser.department || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BusinessCenter fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Title" 
                            secondary={selectedUser.title || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BusinessCenter fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Company" 
                            secondary={selectedUser.company || 'N/A'} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Account Status" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      avatar={selectedUser.enabled ? <LockOpen color="success" /> : <Lock color="error" />}
                    />
                    <Divider />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            {selectedUser.enabled ? <LockOpen color="success" /> : <Lock color="error" />}
                          </ListItemIcon>
                          <ListItemText 
                            primary="Account Status" 
                            secondary={
                              selectedUser.locked
                                ? 'Locked'
                                : selectedUser.enabled
                                  ? 'Enabled'
                                  : 'Disabled'
                            }
                          />
                        </ListItem>
                        {selectedUser.passwordExpired && (
                          <ListItem>
                            <ListItemIcon>
                              <Lock color="error" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Password Status" 
                              secondary="Password Expired" 
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemIcon>
                            <Event fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Created" 
                            secondary={selectedUser.created ? formatDate(selectedUser.created) : 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Event fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Modified" 
                            secondary={selectedUser.modified ? formatDate(selectedUser.modified) : 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Schedule fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Last Logon" 
                            secondary={selectedUser.lastLogon ? formatDate(selectedUser.lastLogon) : 'Never'} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  <Box sx={{ mt: 2 }}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Group Memberships" 
                        titleTypographyProps={{ variant: 'subtitle1' }}
                        avatar={<Group color="primary" />}
                      />
                      <Divider />
                      <CardContent sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {selectedUser.groups && selectedUser.groups.length > 0 ? (
                          <List dense>
                            {selectedUser.groups.map((group, index) => {
                              // Extract the CN part from the distinguished name
                              const groupName = group.match(/CN=([^,]*)/)?.[1] || group;
                              return (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <Group fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={groupName}
                                    secondary={group}
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No group memberships found
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button 
                color="primary" 
                onClick={() => {
                  // Edit logic
                  handleCloseDetails();
                }}
              >
                Edit User
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default UsersTab; 