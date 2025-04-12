import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Clear
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Make sure page is a valid number (1-based for API)
      const currentPage = Math.max(page + 1, 1);
      
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
      
      // Set the data
      setUsers(response.items);
      setTotalUsers(response.totalCount || 0);
      loggingService.logInfo(`Loaded ${response.items.length} users`);
    } catch (error) {
      console.error('Error fetching users:', error);
      loggingService.logError(`Failed to load users: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

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
            Users
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

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>

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
              <TableCell>Groups</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && Array.from(new Array(5)).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            ))}
            
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
            
            {!loading && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.samAccountName}</TableCell>
                <TableCell>{user.email || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.enabled ? "Active" : "Disabled"} 
                    size="small" 
                    color={user.enabled ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  {user.groups && user.groups.length > 0 ? (
                    <Chip 
                      label={`${user.groups.length} groups`} 
                      size="small" 
                      color="default"
                    />
                  ) : (
                    'None'
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
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
    </Box>
  );
};

export default UsersTab; 