import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import GroupsTab from '../../components/active-directory/tabs/GroupsTab';
import OrganizationalUnitsTab from '../../components/active-directory/tabs/OrganizationalUnitsTab';
import UsersTab from '../../components/active-directory/tabs/UsersTab';
import ComputersTab from '../../components/active-directory/tabs/ComputersTab';
import DomainControllersTab from '../../components/active-directory/tabs/DomainControllersTab';
import ConnectionForm from '../../components/active-directory/ConnectionForm';
import { activeDirectoryService } from '../../services/ActiveDirectoryService';

// Tab panel component for accessibility
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
      id={`ad-scanner-tabpanel-${index}`}
      aria-labelledby={`ad-scanner-tab-${index}`}
      style={{ minHeight: '400px' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ad-scanner-tab-${index}`,
    'aria-controls': `ad-scanner-tabpanel-${index}`,
  };
}

const ADScanner: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState<boolean>(
    !!activeDirectoryService.getServerIP()
  );

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConnected = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    // Clear connection info
    activeDirectoryService.setServerIP('');
    activeDirectoryService.setAuthToken('');
    localStorage.removeItem('ad_domain_name');
    setIsConnected(false);
  };

  return (
    <Box sx={{ width: '100%', pt: 2 }}>
      {!isConnected ? (
        <Paper 
          sx={{ 
            p: 4, 
            maxWidth: 600, 
            mx: 'auto',
            mt: 4
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Connect to Active Directory
          </Typography>
          <ConnectionForm onConnect={handleConnected} />
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
            <ComputersTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <DomainControllersTab />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default ADScanner; 