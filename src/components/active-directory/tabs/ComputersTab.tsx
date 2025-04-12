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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Refresh,
  Clear,
  Computer as ComputerIcon,
  FilterList,
  Info
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';
import { ADComputer } from '../../../models/ad-entities';

const ComputersTab: React.FC = () => {
  // State
  const [computers, setComputers] = useState<ADComputer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading computers...');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalComputers, setTotalComputers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComputer, setSelectedComputer] = useState<ADComputer | null>(null);
  const [computerDetailOpen, setComputerDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'enabled', 'disabled'

  // Fetch computers when page, rowsPerPage or filters change
  const fetchComputers = useCallback(async () => {
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
        setComputers([]);
        setTotalComputers(0);
        return;
      }
      
      setLoadingMessage(`Fetching computers from ${domain} (${serverIP})...`);
      
      const response = await activeDirectoryService.getComputers(
        currentPage, 
        rowsPerPage, 
        searchQuery || ''
      );
      
      // Check if response or items is null or undefined
      if (!response || !response.items) {
        console.error('Received invalid response from API');
        setComputers([]);
        setTotalComputers(0);
        return;
      }
      
      // Apply status filtering client-side
      let filteredItems = response.items;
      if (statusFilter !== 'all') {
        setLoadingMessage('Applying filters...');
        filteredItems = response.items.filter(computer => {
          if (statusFilter === 'enabled') return computer.enabled;
          if (statusFilter === 'disabled') return !computer.enabled;
          return true;
        });
      }
      
      // Set the data
      setComputers(filteredItems);
      setTotalComputers(response.totalCount || 0);
      
      loggingService.logInfo(`Loaded ${response.items.length} computers from AD server`);
    } catch (error) {
      console.error('Error fetching computers:', error);
      loggingService.logError(`Failed to load computers: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setComputers([]);
      setTotalComputers(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

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
    fetchComputers();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    fetchComputers();
  };

  const handleRefresh = () => {
    fetchComputers();
  };

  const handleViewDetails = (computer: ADComputer) => {
    setSelectedComputer(computer);
    setComputerDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setComputerDetailOpen(false);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setPage(0);
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
            Active Directory Computers
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {!loading && (
              <Chip 
                label={`${totalComputers} total`} 
                size="small" 
                sx={{ ml: 2 }} 
                color="primary"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <TextField
            placeholder="Search computers..."
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
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange as any}
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="enabled">Enabled</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Toolbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            {loadingMessage}
          </Typography>
        </Box>
      ) : computers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ComputerIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No computers found</Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery ? 'Try adjusting your search or filters' : 'No computers exist in the domain or there was an error retrieving them'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Refresh
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>DNS Host Name</TableCell>
                  <TableCell>Operating System</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Logon</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {computers.map((computer) => (
                  <TableRow key={computer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1,
                            bgcolor: computer.enabled ? 'primary.main' : 'text.disabled'
                          }}
                        >
                          <ComputerIcon fontSize="small" />
                        </Avatar>
                        {computer.name}
                      </Box>
                    </TableCell>
                    <TableCell>{computer.dnsHostName || 'N/A'}</TableCell>
                    <TableCell>{`${computer.operatingSystem || 'Unknown'} ${computer.operatingSystemVersion || ''}`}</TableCell>
                    <TableCell>
                      <Chip 
                        label={computer.enabled ? 'Enabled' : 'Disabled'} 
                        color={computer.enabled ? 'success' : 'error'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(computer.lastLogon)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(computer)}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalComputers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}

      {/* Computer Details Dialog */}
      <Dialog 
        open={computerDetailOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedComputer && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: selectedComputer.enabled ? 'primary.main' : 'text.disabled',
                    mr: 2
                  }}
                >
                  <ComputerIcon />
                </Avatar>
                <Typography variant="h6">{selectedComputer.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Computer Name</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.name}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">DNS Host Name</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.dnsHostName || 'N/A'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">SAM Account Name</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.samAccountName}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Description</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.description || 'N/A'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip 
                        label={selectedComputer.enabled ? 'Enabled' : 'Disabled'} 
                        color={selectedComputer.enabled ? 'success' : 'error'} 
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Location</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.location || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>System Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Operating System</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.operatingSystem || 'Unknown'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">OS Version</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.operatingSystemVersion || 'Unknown'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Last Logon</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{formatDate(selectedComputer.lastLogon)}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Managed By</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedComputer.managedBy || 'N/A'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Distinguished Name</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {selectedComputer.distinguishedName}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ComputersTab; 