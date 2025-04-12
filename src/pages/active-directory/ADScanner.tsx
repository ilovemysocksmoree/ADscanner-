import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import UsersTab from '../../components/active-directory/tabs/UsersTab';
import GroupsTab from '../../components/active-directory/tabs/GroupsTab';
import OrganizationalUnitsTab from '../../components/active-directory/tabs/OrganizationalUnitsTab';
import ConnectionForm from '../../components/active-directory/ConnectionForm';
import { activeDirectoryService } from '../../services/ActiveDirectoryService';
import { loggingService } from '../../services/LoggingService';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ad-tab-${index}`,
    'aria-controls': `ad-tabpanel-${index}`,
  };
}

const ADScanner: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [serverIP, setServerIP] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a server IP stored already
    const storedServerIP = activeDirectoryService.getServerIP();
    if (storedServerIP) {
      setServerIP(storedServerIP);
      checkConnection(storedServerIP);
    } else {
      setLoading(false);
    }
  }, []);

  const checkConnection = async (ip: string) => {
    setLoading(true);
    try {
      // Try to send a simple request to check if we're already connected
      const result = await activeDirectoryService.testServerReachable(ip);
      setIsConnected(result);
      if (!result) {
        setConnectionError('Server connection lost. Please reconnect.');
        loggingService.logInfo(`Lost connection to server: ${ip}`);
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError('Unable to verify connection status.');
      loggingService.logError(`Connection check failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (serverIP: string) => {
    setServerIP(serverIP);
    setIsConnected(true);
    setConnectionError(null);
    loggingService.logInfo(`Successfully connected to AD server: ${serverIP}`);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Active Directory Scanner
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : !isConnected ? (
        <Paper elevation={3} sx={{ p: 2, my: 2 }}>
          <Typography variant="h6" gutterBottom>
            Connect to Active Directory
          </Typography>
          {connectionError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {connectionError}
            </Typography>
          )}
          <ConnectionForm onConnect={handleConnect} />
        </Paper>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleChange} 
              aria-label="Active Directory Scanner tabs"
            >
              <Tab label="Users" {...a11yProps(0)} />
              <Tab label="Groups" {...a11yProps(1)} />
              <Tab label="Organizational Units" {...a11yProps(2)} />
              <Tab label="Computers" {...a11yProps(3)} />
              <Tab label="Domain Controllers" {...a11yProps(4)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <UsersTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <GroupsTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <OrganizationalUnitsTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="body1">
              Computers tab content will go here.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <Typography variant="body1">
              Domain Controllers tab content will go here.
            </Typography>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default ADScanner; 