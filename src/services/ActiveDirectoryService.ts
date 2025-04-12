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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data
      const mockUsers: ADUser[] = [
        {
          id: '1',
          distinguishedName: 'CN=John Smith,OU=IT,DC=example,DC=com',
          name: 'John Smith',
          displayName: 'John Smith',
          samAccountName: 'john.smith',
          email: 'john.smith@example.com',
          enabled: true,
          locked: false,
          firstName: 'John',
          lastName: 'Smith',
          groups: ['Domain Users', 'IT Staff'],
          department: 'IT',
          title: 'System Administrator'
        },
        {
          id: '2',
          distinguishedName: 'CN=Jane Doe,OU=HR,DC=example,DC=com',
          name: 'Jane Doe',
          displayName: 'Jane Doe',
          samAccountName: 'jane.doe',
          email: 'jane.doe@example.com',
          enabled: true,
          locked: false,
          firstName: 'Jane',
          lastName: 'Doe',
          groups: ['Domain Users', 'HR Staff'],
          department: 'Human Resources',
          title: 'HR Manager'
        },
        {
          id: '3',
          distinguishedName: 'CN=Bob Johnson,OU=Sales,DC=example,DC=com',
          name: 'Bob Johnson',
          displayName: 'Bob Johnson',
          samAccountName: 'bob.johnson',
          email: 'bob.johnson@example.com',
          enabled: false,
          locked: true,
          firstName: 'Bob',
          lastName: 'Johnson',
          groups: ['Domain Users'],
          department: 'Sales',
          title: 'Sales Representative'
        }
      ];
      
      // Filter by search query if provided
      const filteredUsers = filter
        ? mockUsers.filter(user => 
            user.displayName.toLowerCase().includes(filter.toLowerCase()) ||
            user.samAccountName.toLowerCase().includes(filter.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(filter.toLowerCase()))
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
    } catch (error) {
      console.error('Error fetching AD users:', error);
      loggingService.logError(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`);
      
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

  // Get groups with pagination and search
  async getGroups(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADGroup>> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data
      const mockGroups: ADGroup[] = [
        {
          id: '1',
          distinguishedName: 'CN=Domain Admins,CN=Users,DC=example,DC=com',
          name: 'Domain Admins',
          samAccountName: 'Domain Admins',
          description: 'Designated administrators of the domain',
          groupType: 'Security',
          groupScope: 'Global',
          memberCount: 5,
          isSecurityGroup: true,
          managedBy: 'CN=Administrator,CN=Users,DC=example,DC=com'
        },
        {
          id: '2',
          distinguishedName: 'CN=Marketing Department,OU=Groups,DC=example,DC=com',
          name: 'Marketing Department',
          samAccountName: 'Marketing',
          description: 'All marketing staff',
          groupType: 'Distribution',
          groupScope: 'Universal',
          memberCount: 12,
          isSecurityGroup: false
        },
        {
          id: '3',
          distinguishedName: 'CN=IT Department,OU=Groups,DC=example,DC=com',
          name: 'IT Department',
          samAccountName: 'IT',
          description: 'IT support staff',
          groupType: 'Security',
          groupScope: 'Global',
          memberCount: 8,
          isSecurityGroup: true
        }
      ];
      
      // Filter by search query if provided
      const filteredGroups = filter
        ? mockGroups.filter(group => 
            group.name.toLowerCase().includes(filter.toLowerCase()) ||
            (group.description && group.description.toLowerCase().includes(filter.toLowerCase()))
          )
        : mockGroups;
      
      // Calculate pagination
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data
      const mockOUs: ADOrganizationalUnit[] = [
        {
          id: '1',
          distinguishedName: 'OU=IT,DC=example,DC=com',
          name: 'IT',
          path: 'example.com/IT',
          description: 'Information Technology department',
          protected: true,
          managedBy: 'CN=IT Manager,CN=Users,DC=example,DC=com'
        },
        {
          id: '2',
          distinguishedName: 'OU=HR,DC=example,DC=com',
          name: 'HR',
          path: 'example.com/HR',
          description: 'Human Resources department',
          protected: false
        },
        {
          id: '3',
          distinguishedName: 'OU=Sales,DC=example,DC=com',
          name: 'Sales',
          path: 'example.com/Sales',
          description: 'Sales department',
          protected: false
        },
        {
          id: '4',
          distinguishedName: 'OU=Development,OU=IT,DC=example,DC=com',
          name: 'Development',
          path: 'example.com/IT/Development',
          parentOU: 'OU=IT,DC=example,DC=com',
          description: 'Software Development team',
          protected: false
        }
      ];
      
      // Filter by search query if provided
      const filteredOUs = filter
        ? mockOUs.filter(ou => 
            ou.name.toLowerCase().includes(filter.toLowerCase()) ||
            ou.distinguishedName.toLowerCase().includes(filter.toLowerCase()) ||
            (ou.description && ou.description.toLowerCase().includes(filter.toLowerCase()))
          )
        : mockOUs;
      
      // Calculate pagination
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

  // Get computers with pagination and search
  async getComputers(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADComputer>> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data
      const mockComputers: ADComputer[] = [
        {
          id: '1',
          distinguishedName: 'CN=DESKTOP-PC01,CN=Computers,DC=example,DC=com',
          name: 'DESKTOP-PC01',
          samAccountName: 'DESKTOP-PC01$',
          dnsHostName: 'desktop-pc01.example.com',
          operatingSystem: 'Windows 10 Pro',
          operatingSystemVersion: '10.0.19045',
          enabled: true,
          lastLogon: new Date('2023-04-15T08:30:00Z'),
          trusted: true,
          location: 'Main Office'
        },
        {
          id: '2',
          distinguishedName: 'CN=LAPTOP-DEV03,CN=Computers,DC=example,DC=com',
          name: 'LAPTOP-DEV03',
          samAccountName: 'LAPTOP-DEV03$',
          dnsHostName: 'laptop-dev03.example.com',
          operatingSystem: 'Windows 11 Enterprise',
          operatingSystemVersion: '11.0.22621',
          enabled: true,
          lastLogon: new Date('2023-04-18T09:15:00Z'),
          trusted: true,
          location: 'Remote'
        },
        {
          id: '3',
          distinguishedName: 'CN=SERVER-DB01,CN=Computers,DC=example,DC=com',
          name: 'SERVER-DB01',
          samAccountName: 'SERVER-DB01$',
          dnsHostName: 'server-db01.example.com',
          operatingSystem: 'Windows Server 2019',
          operatingSystemVersion: '10.0.17763',
          enabled: true,
          lastLogon: new Date('2023-04-19T07:45:00Z'),
          trusted: true,
          managedBy: 'CN=Database Admin,CN=Users,DC=example,DC=com',
          location: 'Server Room'
        }
      ];
      
      // Filter by search query if provided
      const filteredComputers = filter
        ? mockComputers.filter(computer => 
            computer.name.toLowerCase().includes(filter.toLowerCase()) ||
            computer.distinguishedName.toLowerCase().includes(filter.toLowerCase()) ||
            (computer.dnsHostName && computer.dnsHostName.toLowerCase().includes(filter.toLowerCase())) ||
            (computer.operatingSystem && computer.operatingSystem.toLowerCase().includes(filter.toLowerCase()))
          )
        : mockComputers;
      
      // Calculate pagination
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock data
      const mockDCs: ADDomainController[] = [
        {
          id: '1',
          distinguishedName: 'CN=DC01,OU=Domain Controllers,DC=example,DC=com',
          name: 'DC01',
          samAccountName: 'DC01$',
          dnsHostName: 'dc01.example.com',
          operatingSystem: 'Windows Server 2019',
          operatingSystemVersion: '10.0.17763',
          enabled: true,
          trusted: true,
          domain: 'example.com',
          isGlobalCatalog: true,
          roles: ['PDC', 'RID', 'Infrastructure'],
          services: ['DNS', 'LDAP', 'Kerberos'],
          location: 'Main Office',
          lastLogon: new Date('2023-04-19T00:00:00Z')
        },
        {
          id: '2',
          distinguishedName: 'CN=DC02,OU=Domain Controllers,DC=example,DC=com',
          name: 'DC02',
          samAccountName: 'DC02$',
          dnsHostName: 'dc02.example.com',
          operatingSystem: 'Windows Server 2022',
          operatingSystemVersion: '10.0.20348',
          enabled: true,
          trusted: true,
          domain: 'example.com',
          isGlobalCatalog: true,
          roles: ['Schema', 'Naming'],
          services: ['DNS', 'LDAP', 'Kerberos'],
          location: 'Disaster Recovery Site',
          lastLogon: new Date('2023-04-19T00:00:00Z')
        }
      ];
      
      // Filter by search query if provided
      const filteredDCs = filter
        ? mockDCs.filter(dc => 
            dc.name.toLowerCase().includes(filter.toLowerCase()) ||
            dc.distinguishedName.toLowerCase().includes(filter.toLowerCase()) ||
            (dc.dnsHostName && dc.dnsHostName.toLowerCase().includes(filter.toLowerCase())) ||
            dc.domain.toLowerCase().includes(filter.toLowerCase())
          )
        : mockDCs;
      
      // Calculate pagination
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