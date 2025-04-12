import { loggingService } from './LoggingService';
import { 
  ADEntity, 
  ADUser, 
  ADGroup, 
  ADOrganizationalUnit,
  ADComputer,
  ADDomainController,
  ADGroupPolicy,
  PaginatedResponse,
  ADSearchParams
} from '../models/ad-entities';
import { mockFetchAdUsers } from '../utils/mockAdApiService';

// Define interfaces for API responses
export interface HealthCheckResponse {
  description: string;
  message: string;
  stats: {
    health_check_success: number;
    healthy: boolean;
    last_ping: string;
  };
  status: string;
}

export interface ConnectionResponse {
  message: string;
  token?: string;
  status: string;
  session_id?: string;
  user_info?: {
    username: string;
    domain: string;
    permissions: string[];
  };
}

// Remove the internal interface definitions that are now imported from models

class ActiveDirectoryService {
  private userId: string;
  private authToken: string | null = null;
  private sessionId: string | null = null;
  private serverIP: string | null = null;
  
  constructor(userId: string = 'system') {
    this.userId = userId;
  }

  // Set server IP
  setServerIP(ip: string) {
    this.serverIP = ip;
    localStorage.setItem('ad_server_ip', ip);
  }
  
  // Get server IP
  getServerIP(): string | null {
    if (!this.serverIP) {
      // Try to get from localStorage
      this.serverIP = localStorage.getItem('ad_server_ip');
    }
    return this.serverIP;
  }
  
  // Set auth token
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('ad_auth_token', token);
  }
  
  // Set session ID
  setSessionId(id: string) {
    this.sessionId = id;
    localStorage.setItem('ad_session_id', id);
  }

  // Simple test to check if server is reachable (fallback method)
  async testServerReachable(serverIP: string): Promise<boolean> {
    try {
      // In a real implementation, we would try to reach the server
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Server unreachable:', error);
      return false;
    }
  }

  // Create a mock health check response
  private createMockHealthCheckResponse(serverIP: string): HealthCheckResponse {
    return {
      description: `health check for active directory server at: ldap://${serverIP}:389`,
      message: "successfully health-checked",
      stats: {
        health_check_success: 1,
        healthy: true,
        last_ping: new Date().toISOString()
      },
      status: "success"
    };
  }

  // Check health of AD server
  async checkHealth(serverIP: string): Promise<HealthCheckResponse> {
    try {
      // Validate IP format (basic validation)
      if (!this.isValidServerAddress(serverIP)) {
        throw new Error('Invalid server address format');
      }

      loggingService.logInfo(`Checking health for server IP: ${serverIP}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For development, return a mock successful response
      return this.createMockHealthCheckResponse(serverIP);
    } catch (error) {
      console.error('Error checking AD server health:', error);
      loggingService.logError(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Connect to AD server with authentication
  async connect(serverIP: string, domain: string, username: string, password: string): Promise<ConnectionResponse> {
    try {
      // Validate inputs
      if (!this.isValidServerAddress(serverIP)) {
        throw new Error('Invalid server address format');
      }
      
      if (!domain || !username || !password) {
        throw new Error('Missing required authentication parameters');
      }
      
      loggingService.logInfo(`Connecting to AD server: ${serverIP}`);
      
      // Store domain name for later API requests
      localStorage.setItem('ad_domain_name', domain);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For development, create a mock successful response
      const mockResponse: ConnectionResponse = {
        message: "Successfully connected to Active Directory",
        token: "mock-auth-token-" + Math.random().toString(36).substring(2, 15),
        status: "success",
        session_id: "mock-session-" + Math.random().toString(36).substring(2, 15),
        user_info: {
          username,
          domain,
          permissions: ["read", "write", "admin"]
        }
      };
      
      // Store connection info
      this.setServerIP(serverIP);
      
      if (mockResponse.token) {
        this.setAuthToken(mockResponse.token);
      }
      
      if (mockResponse.session_id) {
        this.setSessionId(mockResponse.session_id);
      }
      
      return mockResponse;
    } catch (error) {
      console.error('Error connecting to AD server:', error);
      loggingService.logError(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Validate server address format
  private isValidServerAddress(address: string): boolean {
    // Standard IP pattern
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // LDAP URL pattern
    const ldapPattern = /^ldap:\/\/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d+)?$/;
    
    return ipPattern.test(address) || ldapPattern.test(address);
  }

  // Get users with pagination and search
  async getUsers(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADUser>> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      // Log the request
      loggingService.logInfo(`Fetching AD users from ${serverIP}, page ${page}, size ${pageSize}`);

      // Use a direct API call without the service layer for testing
      const directUrl = 'http://192.168.1.5:4444/api/v1/ad/object/users';
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };

      console.log('Sending request to:', directUrl);
      console.log('Request body:', JSON.stringify(body));

      let data: any;
      try {
        // Make a simple API call
        const response = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        console.log('Response status:', response.status);
        data = await response.json();
        console.log('API response:', data);
      } catch (error) {
        console.error('Error calling API directly:', error);
        // Return mock data as fallback
        console.log('Using mock data as fallback');
        return this.getMockUsers(page, pageSize, filter);
      }

      console.log('API response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Transform the API response to our ADUser format
      const users: ADUser[] = data.users.map((user: any) => {
        // Convert Windows file time to JavaScript Date
        // Windows file time is 100-nanosecond intervals since January 1, 1601 UTC
        // Need to convert to milliseconds since Unix epoch (January 1, 1970)
        const convertWindowsTime = (windowsTime: number): Date | undefined => {
          if (!windowsTime) return undefined;
          // Calculate milliseconds from Windows file time
          const milliseconds = Number(windowsTime) / 10000 - 11644473600000;
          if (isNaN(milliseconds) || milliseconds < 0) return undefined;
          return new Date(milliseconds);
        };

        // Check if the account is disabled
        const isDisabled = user.userAccountControl && (user.userAccountControl & 2) !== 0;
        // Check if the account is locked
        const isLocked = user.userAccountControl && (user.userAccountControl & 16) !== 0;
        // Check if password expired
        const isPwdExpired = user.userAccountControl && (user.userAccountControl & 8388608) !== 0;

        return {
          id: user.objectGUID || user.distinguishedName, // Use GUID or DN as fallback
          distinguishedName: user.distinguishedName,
          name: user.displayName || user.samAccountName,
          displayName: user.displayName || user.samAccountName,
          samAccountName: user.samAccountName,
          userPrincipalName: user.userPrincipalName || '',
          firstName: user.givenName || '',
          lastName: user.surName || '',
          email: user.mail || '',
          enabled: !isDisabled,
          locked: isLocked,
          passwordExpired: isPwdExpired,
          lastLogon: convertWindowsTime(user.lastLogon),
          groups: user.memberof || [],
          description: user.description || '',
          created: user.whenCreated ? new Date(user.whenCreated) : undefined,
          modified: user.whenChanged ? new Date(user.whenChanged) : undefined,
          manager: user.manager || '',
          phoneNumber: user.telephoneNumber || user.mobile || '',
          department: user.department || '',
          title: user.title || '',
          company: user.company || ''
        };
      });

      // Apply client-side filtering if filter is provided
      const filteredUsers = filter
        ? users.filter(user => 
            (user.displayName && user.displayName.toLowerCase().includes(filter.toLowerCase())) ||
            (user.samAccountName && user.samAccountName.toLowerCase().includes(filter.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(filter.toLowerCase())) ||
            (user.department && user.department.toLowerCase().includes(filter.toLowerCase())) ||
            (user.title && user.title.toLowerCase().includes(filter.toLowerCase()))
          )
        : users;
      
      // Apply client-side pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        items: paginatedUsers,
        totalCount: filteredUsers.length,
        page,
        pageSize,
        hasMore: endIndex < filteredUsers.length
      };
    } catch (error) {
      console.error('Error fetching AD users:', error);
      loggingService.logError(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`);
      
      // For development, return mock data if API call fails
      return this.getMockUsers(page, pageSize, filter);
    }
  }

  // Get mock users for development/fallback
  private getMockUsers(page = 1, pageSize = 10, filter = ''): PaginatedResponse<ADUser> {
    // Create mock data
    const mockUsers: ADUser[] = [
      {
        id: '1',
        distinguishedName: 'CN=Administrator,CN=Users,DC=adscanner,DC=local',
        name: 'Administrator',
        displayName: 'Administrator',
        samAccountName: 'Administrator',
        userPrincipalName: 'administrator@adscanner.local',
        firstName: '',
        lastName: '',
        email: 'admin@adscanner.local',
        enabled: true,
        locked: false,
        description: 'Built-in account for administering the computer/domain',
        groups: [
          'CN=Group Policy Creator Owners,CN=Users,DC=adscanner,DC=local',
          'CN=Domain Admins,CN=Users,DC=adscanner,DC=local',
          'CN=Enterprise Admins,CN=Users,DC=adscanner,DC=local'
        ],
        created: new Date('2023-04-05T13:31:03Z'),
        modified: new Date('2023-04-05T13:49:57Z'),
        lastLogon: new Date('2023-04-18T12:23:51Z')
      },
      {
        id: '2',
        distinguishedName: 'CN=Guest,CN=Users,DC=adscanner,DC=local',
        name: 'Guest',
        displayName: 'Guest Account',
        samAccountName: 'Guest',
        userPrincipalName: '',
        firstName: '',
        lastName: '',
        email: '',
        enabled: false,
        locked: false,
        description: 'Built-in account for guest access to the computer/domain',
        groups: ['CN=Guests,CN=Builtin,DC=adscanner,DC=local'],
        created: new Date('2023-04-05T13:31:03Z'),
        modified: new Date('2023-04-05T13:31:03Z')
      },
      {
        id: '3',
        distinguishedName: 'CN=John Smith,OU=IT,DC=adscanner,DC=local',
        name: 'John Smith',
        displayName: 'John Smith',
        samAccountName: 'john.smith',
        userPrincipalName: 'john.smith@adscanner.local',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@adscanner.local',
        enabled: true,
        locked: false,
        title: 'System Administrator',
        department: 'IT',
        phoneNumber: '555-1234',
        company: 'ACME Corp',
        groups: [
          'CN=Domain Users,CN=Users,DC=adscanner,DC=local',
          'CN=IT Staff,OU=Groups,DC=adscanner,DC=local'
        ],
        created: new Date('2023-04-10T08:15:00Z'),
        modified: new Date('2023-04-15T09:30:00Z'),
        lastLogon: new Date('2023-04-18T07:45:00Z')
      }
    ];
    
    // Filter by search query if provided
    const filteredUsers = filter
      ? mockUsers.filter(user => 
          (user.displayName && user.displayName.toLowerCase().includes(filter.toLowerCase())) ||
          (user.samAccountName && user.samAccountName.toLowerCase().includes(filter.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(filter.toLowerCase())) ||
          (user.department && user.department.toLowerCase().includes(filter.toLowerCase()))
        )
      : mockUsers;
    
    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      items: paginatedUsers,
      totalCount: filteredUsers.length,
      page,
      pageSize,
      hasMore: endIndex < filteredUsers.length
    };
  }

  // Get groups with pagination and search
  async getGroups(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADGroup>> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      // Log the request
      loggingService.logInfo(`Fetching AD groups from ${serverIP}, page ${page}, size ${pageSize}`);

      // Use the specific API endpoint
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/groups';
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };

      console.log('Sending request to:', url);
      console.log('Request body:', JSON.stringify(body));

      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Transform the API response to our ADGroup format
      const groups: ADGroup[] = (data.groups || []).map((group: any) => {
        return {
          id: group.objectGUID || group.distinguishedName,
          distinguishedName: group.distinguishedName,
          name: group.name || group.samAccountName,
          samAccountName: group.samAccountName,
          description: group.description || '',
          groupType: group.groupType || 'Security',
          groupScope: group.groupScope || 'Global',
          memberCount: group.members ? group.members.length : 0,
          isSecurityGroup: group.isSecurityGroup !== false,
          managedBy: group.managedBy || ''
        };
      });
      
      // Apply client-side filtering if filter is provided
      const filteredGroups = filter
        ? groups.filter(group => 
            group.name.toLowerCase().includes(filter.toLowerCase()) ||
            (group.description && group.description.toLowerCase().includes(filter.toLowerCase()))
          )
        : groups;
      
      // Apply client-side pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedGroups = filteredGroups.slice(startIndex, endIndex);
      
      return {
        items: paginatedGroups,
        totalCount: filteredGroups.length,
        page,
        pageSize,
        hasMore: endIndex < filteredGroups.length
      };
      
    } catch (error) {
      console.error('Error fetching AD groups:', error);
      loggingService.logError(`Failed to fetch groups: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return empty response on error
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false
      };
    }
  }

  // Get organizational units with pagination and search
  async getOrganizationalUnits(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADOrganizationalUnit>> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      // Log the request
      loggingService.logInfo(`Fetching AD OUs from ${serverIP}, page ${page}, size ${pageSize}`);

      // Use the specific API endpoint
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ous';
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };

      console.log('Sending request to:', url);
      console.log('Request body:', JSON.stringify(body));

      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Transform the API response to our ADOrganizationalUnit format
      const ous: ADOrganizationalUnit[] = (data.ous || []).map((ou: any) => {
        return {
          id: ou.objectGUID || ou.distinguishedName,
          distinguishedName: ou.distinguishedName,
          name: ou.name || (ou.distinguishedName.split(',')[0] || '').replace('OU=', ''),
          path: ou.distinguishedName,
          description: ou.description || '',
          parentOU: this.extractParentOUFromDN(ou.distinguishedName),
          protected: ou.protected || false,
          managedBy: ou.managedBy || ''
        };
      });
      
      // Apply client-side filtering if filter is provided
      const filteredOUs = filter
        ? ous.filter(ou => 
            ou.name.toLowerCase().includes(filter.toLowerCase()) ||
            ou.distinguishedName.toLowerCase().includes(filter.toLowerCase()) ||
            (ou.description && ou.description.toLowerCase().includes(filter.toLowerCase()))
          )
        : ous;
      
      // Apply client-side pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedOUs = filteredOUs.slice(startIndex, endIndex);
      
      return {
        items: paginatedOUs,
        totalCount: filteredOUs.length,
        page,
        pageSize,
        hasMore: endIndex < filteredOUs.length
      };
    } catch (error) {
      console.error('Error fetching AD organizational units:', error);
      loggingService.logError(`Failed to fetch OUs: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return empty response on error
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false
      };
    }
  }
  
  // Helper method to extract parent OU from distinguished name
  private extractParentOUFromDN(dn: string): string | undefined {
    // Example DN: OU=Development,OU=IT,DC=example,DC=com
    // We want to extract the parent OU part: OU=IT,DC=example,DC=com
    const parts = dn.split(',');
    if (parts.length <= 1) return undefined;
    
    return parts.slice(1).join(',');
  }

  // Get computers with pagination and search
  async getComputers(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADComputer>> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      // Log the request
      loggingService.logInfo(`Fetching AD computers from ${serverIP}, page ${page}, size ${pageSize}`);

      // Use the specific API endpoint
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/computers';
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };

      console.log('Sending request to:', url);
      console.log('Request body:', JSON.stringify(body));

      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Convert Windows file time to JavaScript Date
      const convertWindowsTime = (windowsTime: number): Date | undefined => {
        if (!windowsTime) return undefined;
        // Calculate milliseconds from Windows file time
        const milliseconds = Number(windowsTime) / 10000 - 11644473600000;
        if (isNaN(milliseconds) || milliseconds < 0) return undefined;
        return new Date(milliseconds);
      };

      // Transform the API response to our ADComputer format
      const computers: ADComputer[] = (data.computers || []).map((computer: any) => {
        return {
          id: computer.objectGUID || computer.distinguishedName,
          distinguishedName: computer.distinguishedName,
          name: computer.name || computer.samAccountName.replace('$', ''),
          samAccountName: computer.samAccountName,
          description: computer.description || '',
          dnsHostName: computer.dnsHostName,
          operatingSystem: computer.operatingSystem,
          operatingSystemVersion: computer.operatingSystemVersion,
          enabled: computer.userAccountControl ? (computer.userAccountControl & 2) === 0 : true,
          lastLogon: convertWindowsTime(computer.lastLogon),
          managedBy: computer.managedBy || '',
          location: computer.location || '',
          trusted: true // Default to trusted
        };
      });
      
      // Apply client-side filtering if filter is provided
      const filteredComputers = filter
        ? computers.filter(computer => 
            computer.name.toLowerCase().includes(filter.toLowerCase()) ||
            computer.distinguishedName.toLowerCase().includes(filter.toLowerCase()) ||
            (computer.dnsHostName && computer.dnsHostName.toLowerCase().includes(filter.toLowerCase())) ||
            (computer.operatingSystem && computer.operatingSystem.toLowerCase().includes(filter.toLowerCase()))
          )
        : computers;
      
      // Apply client-side pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedComputers = filteredComputers.slice(startIndex, endIndex);
      
      return {
        items: paginatedComputers,
        totalCount: filteredComputers.length,
        page,
        pageSize,
        hasMore: endIndex < filteredComputers.length
      };
    } catch (error) {
      console.error('Error fetching AD computers:', error);
      loggingService.logError(`Failed to fetch computers: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return empty response on error
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false
      };
    }
  }

  // Get domain controllers with pagination and search
  async getDomainControllers(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADDomainController>> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      // Log the request
      loggingService.logInfo(`Fetching AD domain controllers from ${serverIP}, page ${page}, size ${pageSize}`);

      // Use the specific API endpoint
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/domain-controllers';
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };

      console.log('Sending request to:', url);
      console.log('Request body:', JSON.stringify(body));

      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Convert Windows file time to JavaScript Date
      const convertWindowsTime = (windowsTime: number): Date | undefined => {
        if (!windowsTime) return undefined;
        // Calculate milliseconds from Windows file time
        const milliseconds = Number(windowsTime) / 10000 - 11644473600000;
        if (isNaN(milliseconds) || milliseconds < 0) return undefined;
        return new Date(milliseconds);
      };

      // Transform the API response to our ADDomainController format
      const domainControllers: ADDomainController[] = (data.domainControllers || []).map((dc: any) => {
        return {
          id: dc.objectGUID || dc.distinguishedName,
          distinguishedName: dc.distinguishedName,
          name: dc.name || dc.samAccountName.replace('$', ''),
          samAccountName: dc.samAccountName,
          description: dc.description || '',
          dnsHostName: dc.dnsHostName,
          operatingSystem: dc.operatingSystem,
          operatingSystemVersion: dc.operatingSystemVersion,
          enabled: dc.userAccountControl ? (dc.userAccountControl & 2) === 0 : true,
          lastLogon: convertWindowsTime(dc.lastLogon),
          trusted: true,
          domain: domain,
          isGlobalCatalog: dc.isGlobalCatalog || true,
          roles: dc.roles || [],
          services: dc.services || ['DNS', 'LDAP', 'Kerberos'],
          location: dc.location || '',
          site: dc.site
        };
      });
      
      // Apply client-side filtering if filter is provided
      const filteredDCs = filter
        ? domainControllers.filter(dc => 
            dc.name.toLowerCase().includes(filter.toLowerCase()) ||
            dc.distinguishedName.toLowerCase().includes(filter.toLowerCase()) ||
            (dc.dnsHostName && dc.dnsHostName.toLowerCase().includes(filter.toLowerCase())) ||
            dc.domain.toLowerCase().includes(filter.toLowerCase())
          )
        : domainControllers;
      
      // Apply client-side pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDCs = filteredDCs.slice(startIndex, endIndex);
      
      return {
        items: paginatedDCs,
        totalCount: filteredDCs.length,
        page,
        pageSize,
        hasMore: endIndex < filteredDCs.length
      };
    } catch (error) {
      console.error('Error fetching AD domain controllers:', error);
      loggingService.logError(`Failed to fetch domain controllers: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return empty response on error
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false
      };
    }
  }
}

// Export singleton instance
export const activeDirectoryService = new ActiveDirectoryService(); 