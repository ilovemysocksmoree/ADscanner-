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
import { loggingService } from '../../../services/LoggingService';

// Placeholder until we can import from the models
interface ADGroup {
  id: string;
  name: string;
  description?: string;
  groupType: string;
  groupScope: string;
  memberCount: number;
}

const GroupsTab: React.FC = () => {
  const [groups, setGroups] = useState<ADGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalGroups, setTotalGroups] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // For now, just set loading to false after a delay
    const timer = setTimeout(() => {
      setLoading(false);
      setGroups([
        {
          id: '1',
          name: 'Domain Admins',
          description: 'Designated administrators of the domain',
          groupType: 'Security',
          groupScope: 'Global',
          memberCount: 5
        },
        {
          id: '2',
          name: 'Marketing Department',
          description: 'All marketing staff',
          groupType: 'Distribution',
          groupScope: 'Universal',
          memberCount: 12
        }
      ]);
      setTotalGroups(2);
    }, 1500);
    
    // In production, we would fetch real data
    // fetchGroups();
    
    return () => clearTimeout(timer);
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Make sure page is a valid number (1-based for API)
      const currentPage = Math.max(page + 1, 1);
      
      // Simulated fetch
      // In production this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockGroups = [
        {
          id: '1',
          name: 'Domain Admins',
          description: 'Designated administrators of the domain',
          groupType: 'Security',
          groupScope: 'Global',
          memberCount: 5
        },
        {
          id: '2',
          name: 'Marketing Department',
          description: 'All marketing staff',
          groupType: 'Distribution',
          groupScope: 'Universal',
          memberCount: 12
        }
      ];
      
      // Filter by search query if provided
      const filteredGroups = searchQuery
        ? mockGroups.filter(g => 
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : mockGroups;
      
      setGroups(filteredGroups);
      setTotalGroups(filteredGroups.length);
      loggingService.logInfo(`Loaded ${filteredGroups.length} groups`);
    } catch (error) {
      console.error('Error fetching groups:', error);
      loggingService.logError(`Failed to load groups: ${error}`);
      
      // Set empty state on error
      setGroups([]);
      setTotalGroups(0);
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
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleRefresh = () => {
    fetchGroups();
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
            Groups
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
            {loading && Array.from(new Array(5)).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            ))}
            
            {!loading && groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No groups found
                </TableCell>
              </TableRow>
            )}
            
            {!loading && groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.description || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={group.groupType} 
                    size="small" 
                    color={group.groupType === 'Security' ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell>{group.groupScope}</TableCell>
                <TableCell>{group.memberCount}</TableCell>
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
        count={totalGroups}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default GroupsTab; 