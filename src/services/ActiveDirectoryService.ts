import axios from 'axios';
import { loggingService } from './LoggingService';
import { API_CONFIG } from '../constants/apiConfig';
import {
  ADUser,
  ADGroup,
  ADComputer,
  ADOrganizationalUnit,
  ADDomainController,
  PaginatedResponse
} from '../models/ad-entities';
import { mockFetchAdUsers } from '../utils/mockAdApiService';

// Define interfaces for API responses
interface HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  serverTime?: string;
  version?: string;
}

interface ConnectionResponse {
  success: boolean;
  message: string;
  token?: string;
  sessionId?: string;
  domain?: string;
  serverDetails?: any; // Keep this for backward compatibility
  error?: string;      // Keep this for backward compatibility
}

export class ActiveDirectoryService {
  private serverIP: string = localStorage.getItem('adServerIP') || '';
  private authToken: string = '';
  private sessionId: string = '';
  private userId: string = '';
  private domain: string = '';
  private username: string = '';
  private password: string = '';
  private mockApiService: any; // We'll use 'any' for now to fix the linter error
  
  constructor(userId: string = '') {
    this.userId = userId;
    this.mockApiService = {
      getUsers: this.getMockUsers.bind(this)
    };
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
      this.serverIP = localStorage.getItem('ad_server_ip') || '';
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

  // Fix the method that had issues with arguments
  private mockHealthCheckResponse(serverAddress: string = "unknown"): HealthCheckResponse {
    return {
      status: 'ok',
      message: `Mock health check for ${serverAddress} is successful`,
      serverTime: new Date().toISOString(),
      version: '1.0.0-mock'
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
      return this.mockHealthCheckResponse(serverIP);
    } catch (error) {
      console.error('Error checking AD server health:', error);
      loggingService.logError(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Connect to AD server with authentication
  async connect(serverIP: string, username: string, password: string, domain: string): Promise<ConnectionResponse> {
    loggingService.logInfo(`Attempting to connect to AD server: ${serverIP}`);
    
    try {
      if (!this.isValidServerAddress(serverIP)) {
        throw new Error('Invalid server IP address format');
      }

      // Store the server details in local storage
      this.setServerIP(serverIP);
      localStorage.setItem('ad_domain_name', domain);
      localStorage.setItem('ad_username', username);
      // Don't store password in local storage for security
      
      // Test the API connection directly
      const apiUrl = 'http://192.168.1.5:4444/api/v1/ad/checkhealth';
      const body = {
        address: `ldap://${serverIP}:389`
      };
      
      console.log('Testing connection to:', apiUrl);
      console.log('With credentials for domain:', domain);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Connection test failed:', errorText);
        throw new Error(`API connection failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Connection test response:', data);
      
      if (!data || data.status !== 'success') {
        throw new Error(`Connection test failed: ${data?.message || 'Unknown error'}`);
      }
      
      // Generate a session ID for this connection
      this.setSessionId(this.generateSessionId());
      
      loggingService.logInfo(`Successfully connected to AD server: ${serverIP}`);
      
      return {
        success: true,
        message: 'Connected successfully to Active Directory server',
        serverDetails: {
          serverIP,
          domain,
          username,
          connectTime: new Date()
        }
      };
    } catch (error) {
      console.error('Connection failed:', error);
      loggingService.logError(`Failed to connect to AD server: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        success: false,
        message: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
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
  async getUsers(
    page = 1,
    pageSize = 10,
    searchQuery = '',
    showDisabled = true
  ): Promise<PaginatedResponse<ADUser>> {
    try {
      loggingService.logInfo(
        `Fetching users: page ${page}, limit ${pageSize}, search "${searchQuery}"`
      );

      if (!this.serverIP) {
        throw new Error('Server not configured');
      }

      // Use the specific API endpoint
      const url = `${API_CONFIG.AD_API_BASE_URL}/object/users`;
      const serverIP = this.getServerIP();
      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain
      };

      console.log('Fetching users from:', url);
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

      // Transform the API response to our ADUser format
      const users: ADUser[] = (data.users || []).map((user: any) => {
        return {
          id: user.objectGUID || user.distinguishedName,
          distinguishedName: user.distinguishedName,
          name: user.displayName || user.samAccountName,
          displayName: user.displayName || user.samAccountName,
          samAccountName: user.samAccountName,
          userPrincipalName: user.userPrincipalName || '',
          firstName: user.givenName || '',
          lastName: user.surName || '',
          email: user.mail || '',
          enabled: !(user.userAccountControl & 2), // Check disabled bit
          locked: !!(user.userAccountControl & 16), // Check locked bit
          description: user.description || '',
          title: user.title || '',
          department: user.department || '',
          phoneNumber: user.telephoneNumber || user.mobile || '',
          groups: user.memberof || [],
          created: user.whenCreated ? new Date(user.whenCreated) : undefined,
          modified: user.whenChanged ? new Date(user.whenChanged) : undefined,
          lastLogon: user.lastLogon ? this.windowsTimeToDate(user.lastLogon) : undefined
        };
      });
      
      // Apply client-side filtering
      let filteredUsers = users;
      
      // Filter by search query if provided
      if (searchQuery) {
        filteredUsers = filteredUsers.filter(user => 
          (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.samAccountName && user.samAccountName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply show/hide disabled filter
      if (!showDisabled) {
        filteredUsers = filteredUsers.filter(user => user.enabled);
      }
      
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
      console.error('Error fetching users:', error);
      loggingService.logError(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`);
      
      if (API_CONFIG.DEBUG) {
        // Fall back to mock data for development
        return this.mockApiService.getUsers(page, pageSize, searchQuery, showDisabled);
      }
      
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

  // Helper method to convert Windows file time to JavaScript Date
  public windowsTimeToDate(windowsTime: string | number): Date | undefined {
    try {
      // Windows file time is in 100-nanosecond intervals since January 1, 1601 UTC
      // JavaScript time is in milliseconds since January 1, 1970 UTC
      const windowsTimeNumber = typeof windowsTime === 'string' ? parseInt(windowsTime, 10) : windowsTime;
      if (!windowsTimeNumber || windowsTimeNumber === 0) return undefined;
      
      // Convert by dividing by 10000 (to get milliseconds) and subtracting difference between epochs
      const jsTime = windowsTimeNumber / 10000 - 11644473600000;
      return new Date(jsTime);
    } catch (error) {
      console.error('Error converting Windows time:', error);
      return undefined;
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
      
      // Handle different API response formats
      const groupsData = data.groups || data.docs || [];
      
      if (!groupsData || !Array.isArray(groupsData)) {
        throw new Error(`API responded with invalid groups data: ${data.message || 'Unknown error'}`);
      }

      // Transform the API response to our ADGroup format
      const groups: ADGroup[] = groupsData.map((group: any) => {
        // Extract members from the response - could be in 'members' or 'member' property
        const memberArray = group.members || group.member || [];
        // Convert members to string array if they're not already
        const memberStrings = Array.isArray(memberArray) 
          ? memberArray.map((m: any) => typeof m === 'string' ? m : m.distinguishedName || String(m))
          : [];
          
        return {
          id: group.objectGUID || group.distinguishedName,
          distinguishedName: group.distinguishedName || group.dn,
          name: group.name || group.samAccountName,
          samAccountName: group.samAccountName || group.name,
          description: group.description || '',
          groupType: group.groupCategory || (group.type && parseInt(group.type) < 0 ? 'Security' : 'Distribution'),
          groupScope: group.scope || 'Global',
          memberCount: memberStrings.length,
          members: memberStrings,
          isSecurityGroup: group.groupCategory === 'Security' || (group.type && parseInt(group.type) < 0),
          managedBy: group.managedBy || '',
          created: group.whenCreated ? new Date(group.whenCreated) : undefined,
          modified: group.whenChanged ? new Date(group.whenChanged) : undefined
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
      
      // Handle different API response formats
      const ousData = data.ous || data.docs || [];
      
      if (!ousData || !Array.isArray(ousData)) {
        throw new Error(`API responded with invalid OUs data: ${data.message || 'Unknown error'}`);
      }

      // Transform the API response to our ADOrganizationalUnit format
      const ous: ADOrganizationalUnit[] = ousData.map((ou: any) => {
        return {
          id: ou.objectGUID || ou.distinguishedName,
          distinguishedName: ou.distinguishedName,
          name: ou.name || (ou.distinguishedName.split(',')[0] || '').replace('OU=', ''),
          path: ou.distinguishedName,
          description: ou.description || '',
          parentOU: this.extractParentOUFromDN(ou.distinguishedName),
          protected: ou.protected || false,
          managedBy: ou.managedBy || '',
          created: ou.whenCreated ? new Date(ou.whenCreated) : undefined,
          modified: ou.whenChanged ? new Date(ou.whenChanged) : undefined
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

  private generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
  }

  // Fix reference to LoggingService variable
  private log(level: 'info' | 'warning' | 'error', message: string, context: string = '{}') {
    if (level === 'info') {
      loggingService.logInfo(message, context);
    } else if (level === 'warning') {
      loggingService.logWarning(message, context);
    } else if (level === 'error') {
      loggingService.logError(message, context);
    }
  }
}

// Export singleton instance - Use named export instead of default
export const activeDirectoryService = new ActiveDirectoryService(); 