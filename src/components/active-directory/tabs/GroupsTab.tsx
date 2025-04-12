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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Clear,
  Group,
  Info,
  People
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';
import { ADGroup as BaseADGroup } from '../../../models/ad-entities';

// Extend ADGroup interface to ensure members are strings
interface ADGroup extends Omit<BaseADGroup, 'members'> {
  members?: string[];
}

const GroupsTab: React.FC = () => {
  const [groups, setGroups] = useState<ADGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading groups...');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalGroups, setTotalGroups] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ADGroup | null>(null);
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
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
        setGroups([]);
        setTotalGroups(0);
        return;
      }
      
      setLoadingMessage(`Fetching groups from ${domain} (${serverIP})...`);
      
      const response = await activeDirectoryService.getGroups(
        currentPage, 
        rowsPerPage, 
        searchQuery || ''
      );
      
      // Check if response or items is null or undefined
      if (!response || !response.items) {
        console.error('Received invalid response from API');
        setGroups([]);
        setTotalGroups(0);
        return;
      }
      
      // Set the data
      setGroups(response.items);
      setTotalGroups(response.totalCount || 0);
      
      loggingService.logInfo(`Loaded ${response.items.length} groups from AD server`);
    } catch (error) {
      console.error('Error fetching groups:', error);
      loggingService.logError(`Failed to load groups: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setGroups([]);
      setTotalGroups(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
    fetchGroups();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    fetchGroups();
  };

  const handleRefresh = () => {
    fetchGroups();
  };

  const handleViewDetails = (group: ADGroup) => {
    setSelectedGroup(group);
    setGroupDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setGroupDetailOpen(false);
  };

  // Test function to directly call the API
  const testDirectApiCall = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Testing direct API call...');
      
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/groups';
      const serverIP = '192.168.1.8';
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
      
      // Handle response based on whether it has 'groups' or 'docs' property (handling both formats)
      const groupsData = data.groups || data.docs || [];
      
      if (groupsData && groupsData.length > 0) {
        // Display all groups from the response
        setGroups(groupsData.map((g: any) => {
          // Extract members from the response - could be in 'members' or 'member' property
          const memberArray = g.members || g.member || [];
          // Convert members to string array if they're not already
          const memberStrings = Array.isArray(memberArray) 
            ? memberArray.map((m: any) => typeof m === 'string' ? m : m.distinguishedName || String(m))
            : [];
            
          return {
            id: g.objectGUID || g.distinguishedName,
            distinguishedName: g.distinguishedName || g.dn,
            name: g.name || g.samAccountName,
            samAccountName: g.samAccountName || g.name,
            description: g.description || '',
            groupType: g.groupCategory || (g.type && g.type < 0 ? 'Security' : 'Distribution'),
            groupScope: g.scope || 'Global',
            members: memberStrings,
            memberCount: memberStrings.length,
            isSecurityGroup: g.groupCategory === 'Security' || (g.type && g.type < 0),
            managedBy: g.managedBy || '',
            created: g.whenCreated ? new Date(g.whenCreated) : undefined,
            modified: g.whenChanged ? new Date(g.whenChanged) : undefined
          };
        }));
        setTotalGroups(groupsData.length);
      }
    } catch (error) {
      console.error('Direct API test failed:', error);
      alert('Direct API test failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Generate avatar background color based on group name
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

  // Format date to be more readable
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
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
            Active Directory Groups
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {!loading && (
              <Chip 
                label={`${totalGroups} total`} 
                size="small" 
                sx={{ ml: 2 }} 
                color="primary"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <TextField
            placeholder="Search groups..."
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
            Add Group
          </Button>
        </Box>
      </Toolbar>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1">{loadingMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography variant="body1">No groups found</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Try adjusting your search criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && groups.map((group) => (
              <TableRow 
                key={group.id} 
                hover
                onClick={() => handleViewDetails(group)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        backgroundColor: getAvatarColor(group.name)
                      }}
                    >
                      <Group />
                    </Avatar>
                    <Typography variant="body1">{group.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{group.description || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={group.groupType} 
                    size="small" 
                    color={group.groupType === 'Security' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{group.groupScope}</TableCell>
                <TableCell>{group.memberCount}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(group);
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
        count={totalGroups}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Group Details Dialog */}
      <Dialog 
        open={groupDetailOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedGroup && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    width: 56, 
                    height: 56,
                    backgroundColor: getAvatarColor(selectedGroup.name)
                  }}
                >
                  <Group />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedGroup.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedGroup.distinguishedName}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Group Information</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '30%' }}>Description</TableCell>
                        <TableCell>{selectedGroup.description || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Group Type</TableCell>
                        <TableCell>{selectedGroup.groupType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Scope</TableCell>
                        <TableCell>{selectedGroup.groupScope}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">SAM Account Name</TableCell>
                        <TableCell>{selectedGroup.samAccountName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Managed By</TableCell>
                        <TableCell>{selectedGroup.managedBy || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Created</TableCell>
                        <TableCell>{selectedGroup.created ? formatDate(selectedGroup.created) : 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Modified</TableCell>
                        <TableCell>{selectedGroup.modified ? formatDate(selectedGroup.modified) : 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Typography variant="subtitle1" gutterBottom>Group Members ({selectedGroup.memberCount})</Typography>
              <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                {selectedGroup.members && selectedGroup.members.length > 0 ? (
                  <List dense>
                    {selectedGroup.members.map((member, index) => {
                      // Extract name from distinguished name, assuming member is a string
                      const memberDN = typeof member === 'string' ? member : '';
                      const memberName = memberDN.match(/CN=([^,]*)/)?.[1] || memberDN;
                      
                      return (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <People fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={memberName}
                            secondary={memberDN}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No members found
                    </Typography>
                  </Box>
                )}
              </Paper>
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
                Edit Group
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GroupsTab; 