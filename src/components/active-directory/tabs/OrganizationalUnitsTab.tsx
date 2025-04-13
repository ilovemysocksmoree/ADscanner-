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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Clear,
  ExpandMore,
  ChevronRight,
  Folder,
  FolderOpen,
  Info
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';
import { ADOrganizationalUnit, OUTreeNode } from '../../../models/ad-entities';
import { extractParentOUFromDN, getAvatarColor, formatDate, buildOUTree, formatOUData } from '../utils/ouUtils';

const OrganizationalUnitsTab: React.FC = () => {
  const [ous, setOUs] = useState<ADOrganizationalUnit[]>([]);
  const [ouTree, setOUTree] = useState<OUTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading organizational units...');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOUs, setTotalOUs] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedOU, setSelectedOU] = useState<ADOrganizationalUnit | null>(null);
  const [ouDetailOpen, setOUDetailOpen] = useState(false);

  const fetchOUs = useCallback(async () => {
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
        setOUs([]);
        setTotalOUs(0);
        return;
      }
      
      setLoadingMessage(`Fetching organizational units from ${domain} (${serverIP})...`);
      
      const response = await activeDirectoryService.getOrganizationalUnits(
        currentPage, 
        rowsPerPage, 
        searchQuery || ''
      );
      
      // Check if response or items is null or undefined
      if (!response || !response.items) {
        console.error('Received invalid response from API');
        setOUs([]);
        setTotalOUs(0);
        return;
      }
      
      // Set the data
      setOUs(response.items);
      setTotalOUs(response.totalCount || 0);
      
      // Build OU tree for tree view
      const treeNodes = buildOUTree(response.items);
      setOUTree(treeNodes);
      
      loggingService.logInfo(`Loaded ${response.items.length} organizational units from AD server`);
    } catch (error) {
      console.error('Error fetching OUs:', error);
      loggingService.logError(`Failed to load OUs: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setOUs([]);
      setTotalOUs(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchOUs();
  }, [fetchOUs]);

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
    fetchOUs();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    fetchOUs();
  };

  const handleRefresh = () => {
    fetchOUs();
  };

  const handleViewModeChange = (mode: 'list' | 'tree') => {
    setViewMode(mode);
  };

  const handleViewDetails = (ou: ADOrganizationalUnit) => {
    setSelectedOU(ou);
    setOUDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setOUDetailOpen(false);
  };

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Test function to directly call the API
  const testDirectApiCall = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Testing direct API call...');
      
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ous';
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
      
      // Handle response based on whether it has 'ous' or 'docs' property (handling both formats)
      const ousData = data.ous || data.docs || [];
      
      if (ousData && ousData.length > 0) {
        // Use utility function to format OU data
        const formattedOUs = formatOUData(ousData);
        
        setOUs(formattedOUs);
        setTotalOUs(formattedOUs.length);
        const treeNodes = buildOUTree(formattedOUs);
        setOUTree(treeNodes);
      }
    } catch (error) {
      console.error('Direct API test failed:', error);
      alert('Direct API test failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const renderTreeNode = (node: OUTreeNode, level: number = 0) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <React.Fragment key={node.id}>
        <ListItem 
          button 
          onClick={() => toggleNodeExpanded(node.id)}
          sx={{ pl: level * 2 + 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {hasChildren ? (isExpanded ? <FolderOpen color="primary" /> : <Folder color="primary" />) : 
              <Folder color="disabled" />}
          </ListItemIcon>
          <ListItemText primary={node.name} secondary={node.path} />
          {hasChildren && (
            <IconButton edge="end" size="small">
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          )}
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children?.map(childNode => renderTreeNode(childNode, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const renderTreeView = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1">{loadingMessage}</Typography>
        </Box>
      );
    }

    if (ouTree.length === 0) {
      return (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body1">No organizational units found</Typography>
          <Typography variant="caption" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      );
    }

    return (
      <Paper sx={{ maxHeight: 500, overflow: 'auto' }}>
        <List component="nav" aria-label="organizational units">
          {ouTree.map(node => renderTreeNode(node))}
        </List>
      </Paper>
    );
  };

  const renderTableView = () => {
    return (
      <>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Path</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="body1">{loadingMessage}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && ous.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3 }}>
                      <Typography variant="body1">No organizational units found</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Try adjusting your search criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && ous.map((ou) => (
                <TableRow
                  key={ou.id}
                  hover
                  onClick={() => handleViewDetails(ou)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          backgroundColor: getAvatarColor(ou.name)
                        }}
                      >
                        <Folder />
                      </Avatar>
                      <Typography variant="body1">{ou.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{ou.path}</TableCell>
                  <TableCell>{ou.description || 'N/A'}</TableCell>
                  <TableCell>{ou.created ? formatDate(ou.created) : 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(ou);
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
          count={totalOUs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
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
            Active Directory Organizational Units
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {!loading && (
              <Chip 
                label={`${totalOUs} total`} 
                size="small" 
                sx={{ ml: 2 }} 
                color="primary"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <TextField
            placeholder="Search OUs..."
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
          
          <Box sx={{ display: 'flex', mr: 2 }}>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleViewModeChange('list')}
              sx={{ mr: 1 }}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleViewModeChange('tree')}
            >
              Tree
            </Button>
          </Box>

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
            Add OU
          </Button>
        </Box>
      </Toolbar>

      {viewMode === 'tree' ? renderTreeView() : renderTableView()}

      {/* OU Details Dialog */}
      <Dialog 
        open={ouDetailOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOU && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    width: 56, 
                    height: 56,
                    backgroundColor: getAvatarColor(selectedOU.name)
                  }}
                >
                  <Folder />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedOU.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedOU.distinguishedName}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Organizational Unit Information</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '30%' }}>Description</TableCell>
                        <TableCell>{selectedOU.description || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Path</TableCell>
                        <TableCell>{selectedOU.path}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Parent OU</TableCell>
                        <TableCell>{selectedOU.parentOU || 'Root'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Protected</TableCell>
                        <TableCell>{selectedOU.protected ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Managed By</TableCell>
                        <TableCell>{selectedOU.managedBy || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Created</TableCell>
                        <TableCell>{selectedOU.created ? formatDate(selectedOU.created) : 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Modified</TableCell>
                        <TableCell>{selectedOU.modified ? formatDate(selectedOU.modified) : 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
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
                Edit OU
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrganizationalUnitsTab; 