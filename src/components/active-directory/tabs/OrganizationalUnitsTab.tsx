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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
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
  FolderOpen
} from '@mui/icons-material';
import { activeDirectoryService } from '../../../services/ActiveDirectoryService';
import { loggingService } from '../../../services/LoggingService';
import { ADOrganizationalUnit, OUTreeNode } from '../../../models/ad-entities';

const OrganizationalUnitsTab: React.FC = () => {
  const [ous, setOUs] = useState<ADOrganizationalUnit[]>([]);
  const [ouTree, setOUTree] = useState<OUTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOUs, setTotalOUs] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchOUs();
  }, [page, rowsPerPage]);

  const fetchOUs = async () => {
    try {
      setLoading(true);
      
      // Make sure page is a valid number (1-based for API)
      const currentPage = Math.max(page + 1, 1);
      
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
      
      // Build OU tree for tree view (simple version)
      buildOUTree(response.items);
      
      loggingService.logInfo(`Loaded ${response.items.length} organizational units`);
    } catch (error) {
      console.error('Error fetching OUs:', error);
      loggingService.logError(`Failed to load OUs: ${error instanceof Error ? error.message : String(error)}`);
      
      // Set empty state on error
      setOUs([]);
      setTotalOUs(0);
    } finally {
      setLoading(false);
    }
  };

  // Build a simple OU tree from flat OU list
  const buildOUTree = (ouList: ADOrganizationalUnit[]) => {
    // Create a map of parent -> children
    const ouMap: Record<string, OUTreeNode> = {};
    const rootNodes: OUTreeNode[] = [];
    
    // First pass: create all nodes
    ouList.forEach(ou => {
      const node: OUTreeNode = {
        id: ou.id,
        name: ou.name,
        distinguishedName: ou.distinguishedName,
        path: ou.path || ou.distinguishedName,
        parentOU: ou.parentOU,
        children: [],
        level: 0,
        expanded: true
      };
      
      ouMap[ou.distinguishedName] = node;
    });
    
    // Second pass: build the tree
    Object.values(ouMap).forEach(node => {
      if (node.parentOU && ouMap[node.parentOU]) {
        // Has a parent in our list
        const parent = ouMap[node.parentOU];
        if (parent.children) {
          parent.children.push(node);
        } else {
          parent.children = [node];
        }
        node.level = parent.level + 1;
      } else {
        // Root node
        rootNodes.push(node);
      }
    });
    
    setOUTree(rootNodes);
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

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
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
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (ouTree.length === 0) {
      return (
        <Typography sx={{ p: 2 }}>
          No organizational units found
        </Typography>
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
                <TableCell>Protected</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ))}
              
              {!loading && ous.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No organizational units found
                  </TableCell>
                </TableRow>
              )}
              
              {!loading && ous.map((ou) => (
                <TableRow key={ou.id}>
                  <TableCell>{ou.name}</TableCell>
                  <TableCell>{ou.path || ou.distinguishedName}</TableCell>
                  <TableCell>{ou.description || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ou.protected ? "Protected" : "Not Protected"} 
                      size="small" 
                      color={ou.protected ? "warning" : "default"}
                    />
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
                          disabled={ou.protected}
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
            Organizational Units
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

          <Tooltip title="Toggle View">
            <Button 
              variant="outlined"
              size="small"
              onClick={() => handleViewModeChange(viewMode === 'list' ? 'tree' : 'list')}
              sx={{ mr: 1 }}
            >
              {viewMode === 'list' ? 'Tree View' : 'List View'}
            </Button>
          </Tooltip>

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
            Add OU
          </Button>
        </Box>
      </Toolbar>

      {viewMode === 'list' ? renderTableView() : renderTreeView()}
    </Box>
  );
};

export default OrganizationalUnitsTab; 