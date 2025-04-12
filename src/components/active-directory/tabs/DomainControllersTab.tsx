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
  ListItemText
} from '@mui/material';
import {
  Search,
  Refresh,
  Clear,
  Storage as ServerIcon,
  Info,
  CheckCircle
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';
import { ADDomainController } from '../../../models/ad-entities';

const DomainControllersTab: React.FC = () => {
  // State
  const [domainControllers, setDomainControllers] = useState<ADDomainController[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading domain controllers...');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDCs, setTotalDCs] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDC, setSelectedDC] = useState<ADDomainController | null>(null);
  const [dcDetailOpen, setDcDetailOpen] = useState(false);

  // Fetch domain controllers when page, rowsPerPage or filters change
  const fetchDomainControllers = useCallback(async () => {
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
        setDomainControllers([]);
        setTotalDCs(0);
        return;
      }
      
      setLoadingMessage(`Fetching domain controllers from ${domain} (${serverIP})...`);
      
      const response = await activeDirectoryService.getDomainControllers(
        currentPage, 
        rowsPerPage, 
        searchQuery || ''
      );
      
      // Check if response or items is null or undefined
      if (!response || !response.items) {
        console.error('Received invalid response from API');
        setDomainControllers([]);
        setTotalDCs(0);
        return;
      }
      
      // Set the data
      setDomainControllers(response.items);
      setTotalDCs(response.totalCount || 0);
      
      loggingService.logInfo(`Loaded ${response.items.length} domain controllers from AD server`);
    } catch (error) {
      console.error('Error fetching domain controllers:', error);
      loggingService.logError(`Failed to load domain controllers: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setDomainControllers([]);
      setTotalDCs(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchDomainControllers();
  }, [fetchDomainControllers]);

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
    fetchDomainControllers();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    fetchDomainControllers();
  };

  const handleRefresh = () => {
    fetchDomainControllers();
  };

  const handleViewDetails = (dc: ADDomainController) => {
    setSelectedDC(dc);
    setDcDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDcDetailOpen(false);
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
            Domain Controllers
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {!loading && (
              <Chip 
                label={`${totalDCs} total`} 
                size="small" 
                sx={{ ml: 2 }} 
                color="primary"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <TextField
            placeholder="Search domain controllers..."
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
      ) : domainControllers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ServerIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No domain controllers found</Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery ? 'Try adjusting your search' : 'No domain controllers exist in the domain or there was an error retrieving them'}
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
                  <TableCell>Domain</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Last Logon</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domainControllers.map((dc) => (
                  <TableRow key={dc.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1,
                            bgcolor: 'primary.main'
                          }}
                        >
                          <ServerIcon fontSize="small" />
                        </Avatar>
                        {dc.name}
                      </Box>
                    </TableCell>
                    <TableCell>{dc.dnsHostName || 'N/A'}</TableCell>
                    <TableCell>{`${dc.operatingSystem || 'Unknown'} ${dc.operatingSystemVersion || ''}`}</TableCell>
                    <TableCell>{dc.domain}</TableCell>
                    <TableCell>
                      {dc.roles && dc.roles.length > 0 ? (
                        <Tooltip title={dc.roles.join(', ')}>
                          <Typography variant="body2" noWrap>
                            {dc.roles.slice(0, 2).join(', ')}
                            {dc.roles.length > 2 && '...'}
                          </Typography>
                        </Tooltip>
                      ) : (
                        'None'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(dc.lastLogon)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(dc)}
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
            count={totalDCs}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}

      {/* Domain Controller Details Dialog */}
      <Dialog 
        open={dcDetailOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedDC && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    mr: 2
                  }}
                >
                  <ServerIcon />
                </Avatar>
                <Typography variant="h6">{selectedDC.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Server Name</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.name}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">DNS Host Name</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.dnsHostName || 'N/A'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Domain</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.domain}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Description</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.description || 'N/A'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Site</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.site || 'Default-First-Site-Name'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Global Catalog</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      {selectedDC.isGlobalCatalog ? (
                        <Chip 
                          icon={<CheckCircle fontSize="small" />} 
                          label="Yes" 
                          size="small" 
                          color="success" 
                        />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
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
                      <Typography variant="body2">{selectedDC.operatingSystem || 'Unknown'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">OS Version</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.operatingSystemVersion || 'Unknown'}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Last Logon</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{formatDate(selectedDC.lastLogon)}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Location</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">{selectedDC.location || 'N/A'}</Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>FSMO Roles</Typography>
                  <Divider sx={{ mb: 1 }} />
                  
                  {selectedDC.roles && selectedDC.roles.length > 0 ? (
                    <List dense>
                      {selectedDC.roles.map((role, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={role} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No FSMO roles</Typography>
                  )}

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Services</Typography>
                  <Divider sx={{ mb: 1 }} />
                  
                  {selectedDC.services && selectedDC.services.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {selectedDC.services.map((service, index) => (
                        <Chip 
                          key={index} 
                          label={service} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No services information</Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Distinguished Name</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {selectedDC.distinguishedName}
                  </Typography>
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

export default DomainControllersTab; 