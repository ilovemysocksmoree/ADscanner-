import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Tabs, 
  Tab
} from '@mui/material';

// Components
import ConnectionForm from './ConnectionForm';
import TabPanel from './TabPanel';
import UsersTab from './tabs/UsersTab';
import GroupsTab from './tabs/GroupsTab';

const ADScanner: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Mock data
  const users = [
    { id: 1, username: 'jdoe', fullName: 'John Doe', email: 'jdoe@example.com', status: 'Active', groups: ['IT', 'Admin'], ou: 'Users' },
    { id: 2, username: 'asmith', fullName: 'Alice Smith', email: 'asmith@example.com', status: 'Active', groups: ['HR'], ou: 'Users' },
    { id: 3, username: 'bjohnson', fullName: 'Bob Johnson', email: 'bjohnson@example.com', status: 'Disabled', groups: ['Finance'], ou: 'Finance' },
  ];
  
  const groups = [
    { id: 1, name: 'IT', members: 1, description: 'IT Department' },
    { id: 2, name: 'HR', members: 1, description: 'Human Resources' },
    { id: 3, name: 'Admin', members: 1, description: 'Administrators' },
    { id: 4, name: 'Finance', members: 1, description: 'Finance Department' },
  ];
  
  const ous = [
    { id: 1, name: 'Users', parent: 'Root', objects: 2 },
    { id: 2, name: 'Finance', parent: 'Root', objects: 1 },
    { id: 3, name: 'IT', parent: 'Root', objects: 0 },
  ];
  
  const computers = [
    { id: 1, name: 'DESKTOP-001', ip: '192.168.1.101', os: 'Windows 10', lastLogon: '2023-04-10' },
    { id: 2, name: 'DESKTOP-002', ip: '192.168.1.102', os: 'Windows 11', lastLogon: '2023-04-11' },
    { id: 3, name: 'SERVER-001', ip: '192.168.1.10', os: 'Windows Server 2019', lastLogon: '2023-04-12' },
  ];

  const handleConnect = () => {
    setConnected(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Active Directory Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect to your Active Directory server to manage users, groups, and monitor your domain.
        </Typography>
        
        {!connected ? (
          <ConnectionForm onConnect={handleConnect} />
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="AD management tabs">
                <Tab label="Users" />
                <Tab label="Groups" />
                <Tab label="Organizational Units" />
                <Tab label="Computers" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <UsersTab users={users} groups={groups} ous={ous} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <GroupsTab groups={groups} users={users} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6">Organizational Units</Typography>
              {/* Add OUs Tab content here */}
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6">Computers</Typography>
              {/* Add Computers Tab content here */}
            </TabPanel>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ADScanner; 