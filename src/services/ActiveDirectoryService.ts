import axios from 'axios';
import { loggingService } from './LoggingService';
import { API_CONFIG } from '../constants/apiConfig';
import {
  ADUser,
  ADGroup,
  ADComputer,
  ADOrganizationalUnit,
  ADDomainController,
  PaginatedResponse,
  ADOU
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

  // Add a new user to Active Directory
  async addUser(userData: {
    firstName: string;
    lastName: string;
    displayName?: string;
    sAMAccountName: string;
    userPrincipalName: string;
    password: string;
    description?: string;
    enabled?: boolean;
    parentDN?: string;
    groups?: string[]; // Array of group DNs to add user to
  }): Promise<ADUser> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Adding new user ${userData.sAMAccountName} to ${domain}`);

      // Check required fields
      if (!userData.firstName || !userData.lastName || !userData.sAMAccountName || !userData.userPrincipalName || !userData.password) {
        throw new Error('Missing required user fields');
      }

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/user/add';
      const parentDN = userData.parentDN || `DC=${domain.replace(/\./g, ',DC=')}`;
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        user: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
          sAMAccountName: userData.sAMAccountName,
          userPrincipalName: userData.userPrincipalName,
          password: userData.password,
          description: userData.description || '',
          enabled: userData.enabled !== undefined ? userData.enabled : true,
          mustChangePassword: userData.mustChangePassword !== undefined ? userData.mustChangePassword : false,
          parentDN: parentDN
        }
      };

      console.log('Adding user, request:', {
        ...body,
        user: { ...body.user, password: '********' } // Don't log the actual password
      });

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
      console.log('Add user response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Create the new user object to return
      const distinguishedName = `CN=${userData.firstName} ${userData.lastName},${parentDN}`;
      const newUser: ADUser = {
        id: data.objectGUID || `user-${Date.now()}`,
        distinguishedName: distinguishedName,
        samAccountName: userData.username,
        userPrincipalName: `${userData.username}@${domain}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        email: userData.email || `${userData.username}@${domain}`,
        description: userData.description || '',
        created: new Date(),
        modified: new Date(),
        lastLogon: null,
        passwordLastSet: new Date(),
        enabled: userData.enabled !== undefined ? userData.enabled : true,
        locked: false,
        badPasswordCount: 0,
        groups: []
      };

      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      loggingService.logError(`Failed to add user: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Update an existing user in Active Directory
  async updateUser(distinguishedName: string, userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    description?: string;
    enabled?: boolean;
    password?: string;
  }): Promise<ADUser> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Updating user with DN ${distinguishedName} in ${domain}`);

      // First, get the current user data
      const currentUser = await this.getUserByDN(distinguishedName);
      if (!currentUser) {
        throw new Error(`User with DN ${distinguishedName} not found`);
      }

      // Prepare attribute updates
      const updateAttributes: Record<string, any> = {};
      
      // Add attributes to update
      if (userData.firstName !== undefined || userData.lastName !== undefined) {
        const firstName = userData.firstName || currentUser.firstName;
        const lastName = userData.lastName || currentUser.lastName;
        updateAttributes.givenName = firstName;
        updateAttributes.sn = lastName;
        updateAttributes.displayName = `${firstName} ${lastName}`;
        updateAttributes.cn = `${firstName} ${lastName}`;
      }
      
      if (userData.email !== undefined) {
        updateAttributes.mail = userData.email;
      }
      
      if (userData.description !== undefined) {
        updateAttributes.description = userData.description;
      }
      
      if (userData.enabled !== undefined) {
        // In AD, account is disabled by setting the ACCOUNTDISABLE bit (0x2) in the userAccountControl attribute
        // This will be handled by the API
        updateAttributes.enabled = userData.enabled;
      }

      // Prepare the attribute update request if there are attributes to update
      let attributeUpdateResponse = null;
      if (Object.keys(updateAttributes).length > 0) {
        // Prepare the request for attribute updates
        const url = 'http://192.168.1.5:4444/api/v1/ad/object/user/update';
        
        // Build the request body
        const body = {
          address: `ldap://${serverIP}:389`,
          domain_name: domain,
          user: {
            distinguishedName: distinguishedName,
            attributes: updateAttributes
          }
        };

        console.log('Updating user attributes, request:', body);

        // Make the API call for attribute updates
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

        attributeUpdateResponse = await response.json();
        console.log('Update user attributes response:', attributeUpdateResponse);
        
        if (attributeUpdateResponse.status !== 'success') {
          throw new Error(`API responded with error: ${attributeUpdateResponse.message || 'Unknown error'}`);
        }
      }

      // Handle password update separately if provided
      let passwordUpdateResponse = null;
      if (userData.password) {
        const passwordUrl = 'http://192.168.1.5:4444/api/v1/ad/object/user/reset-password';
        
        // Build the password update request body
        const passwordBody = {
          address: `ldap://${serverIP}:389`,
          domain_name: domain,
          user: {
            distinguishedName: distinguishedName,
            password: userData.password,
            mustChangePassword: false // Can make this configurable if needed
          }
        };

        console.log('Updating user password, request:', {
          ...passwordBody,
          user: { ...passwordBody.user, password: '********' } // Don't log the actual password
        });

        // Make the API call for password update
        const passwordResponse = await fetch(passwordUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          },
          body: JSON.stringify(passwordBody)
        });

        if (!passwordResponse.ok) {
          throw new Error(`Password update API request failed with status ${passwordResponse.status}: ${await passwordResponse.text()}`);
        }

        passwordUpdateResponse = await passwordResponse.json();
        console.log('Update user password response:', passwordUpdateResponse);
        
        if (passwordUpdateResponse.status !== 'success') {
          throw new Error(`Password update API responded with error: ${passwordUpdateResponse.message || 'Unknown error'}`);
        }
      }
      
      // Return the updated user
      return {
        ...currentUser,
        firstName: userData.firstName || currentUser.firstName,
        lastName: userData.lastName || currentUser.lastName,
        displayName: userData.firstName || userData.lastName 
          ? `${userData.firstName || currentUser.firstName} ${userData.lastName || currentUser.lastName}`
          : currentUser.displayName,
        email: userData.email || currentUser.email,
        description: userData.description !== undefined ? userData.description : currentUser.description,
        enabled: userData.enabled !== undefined ? userData.enabled : currentUser.enabled,
        passwordLastSet: userData.password ? new Date() : currentUser.passwordLastSet,
        modified: new Date()
      };
    } catch (error) {
      console.error('Error updating user:', error);
      loggingService.logError(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Delete a user from Active Directory
  async deleteUser(distinguishedName: string): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Deleting user with DN ${distinguishedName} from ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/user/delete';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        distinguishedName: distinguishedName
      };

      console.log('Deleting user, request:', body);

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
      console.log('Delete user response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      loggingService.logError(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Get user by Distinguished Name
  async getUserByDN(distinguishedName: string): Promise<ADUser | null> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/user';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        dn: distinguishedName
      };

      console.log('Fetching user by DN, request:', body);

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
      console.log('Get user response:', data);
      
      // Get users from either format
      const usersData = data.users || data.docs || [];
      
      if (!usersData || usersData.length === 0) {
        return null;
      }

      // The first result should be our user
      const user = usersData[0];
      
      // Transform to our ADUser format
      return {
        id: user.objectGUID || user.distinguishedName,
        distinguishedName: user.distinguishedName,
        samAccountName: user.sAMAccountName,
        userPrincipalName: user.userPrincipalName,
        firstName: user.givenName || '',
        lastName: user.sn || '',
        displayName: user.displayName || user.cn || `${user.givenName || ''} ${user.sn || ''}`.trim(),
        email: user.mail || user.email || user.userPrincipalName,
        displayName: user.displayName || user.name || `${user.givenName || ''} ${user.sn || ''}`.trim() || user.sAMAccountName,
        email: user.mail || '',
        description: user.description || '',
        enabled: user.userAccountControl ? !(user.userAccountControl & 2) : true,
        locked: user.lockoutTime ? Number(user.lockoutTime) > 0 : false,
        passwordNeverExpires: user.userAccountControl ? !!(user.userAccountControl & 65536) : false,
        created: user.whenCreated ? new Date(user.whenCreated) : new Date(),
        modified: user.whenChanged ? new Date(user.whenChanged) : new Date(),
        lastLogon: user.lastLogon ? new Date(user.lastLogon) : null,
        groups: (user.memberOf || []).map((group: string) => ({ distinguishedName: group }))
      };
    } catch (error) {
      console.error('Error getting user by DN:', error);
      loggingService.logError(`Failed to get user by DN: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  // Set user's password
  async setUserPassword(distinguishedName: string, password: string): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Setting password for user with DN ${distinguishedName} in ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/users/set-password';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        distinguishedName: distinguishedName,
        password: password
      };

      console.log('Setting user password, request:', {
        ...body,
        password: '[REDACTED]'
      });

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
      console.log('Set password response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error setting user password:', error);
      loggingService.logError(`Failed to set user password: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Helper method to map user data to ADUser format
  private mapUserDataToADUser(user: any): ADUser {
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
  }

  // Add a new Group to Active Directory
  async addGroup(groupData: {
    name: string;
    description?: string;
    groupScope?: string; // Domain Local, Global, Universal
    groupType?: string; // Security, Distribution
    parentDN?: string;
    members?: string[]; // Array of DNs
  }): Promise<ADGroup> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Adding new group ${groupData.name} to ${domain}`);

      // Check required fields
      if (!groupData.name) {
        throw new Error('Group name is required');
      }

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/group/add';
      const parentDN = groupData.parentDN || `DC=${domain.replace(/\./g, ',DC=')}`;
      
      // Default values
      const groupScope = groupData.groupScope || 'Global';
      const groupType = groupData.groupType || 'Security';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        group: {
          name: groupData.name,
          description: groupData.description || '',
          parentDN: parentDN,
          scope: groupScope,
          type: groupType,
          members: groupData.members || []
        }
      };

      console.log('Adding Group, request:', body);

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
      console.log('Add Group response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Create the new Group object to return
      const distinguishedName = `CN=${groupData.name},${parentDN}`;
      const newGroup: ADGroup = {
        id: data.objectGUID || `group-${Date.now()}`,
        distinguishedName: distinguishedName,
        name: groupData.name,
        description: groupData.description || '',
        scope: groupScope,
        type: groupType,
        created: new Date(),
        modified: new Date(),
        memberCount: groupData.members?.length || 0
      };

      return newGroup;
    } catch (error) {
      console.error('Error adding group:', error);
      loggingService.logError(`Failed to add group: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Update an existing group in Active Directory
  async updateGroup(distinguishedName: string, groupData: {
    description?: string;
    scope?: 'Global' | 'Universal' | 'DomainLocal';
    type?: 'Security' | 'Distribution';
    addMembers?: string[];
    removeMembers?: string[];
  }): Promise<ADGroup> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Updating group with DN ${distinguishedName} in ${domain}`);

      // First, get the current group data
      const currentGroup = await this.getGroupByDN(distinguishedName);
      if (!currentGroup) {
        throw new Error(`Group with DN ${distinguishedName} not found`);
      }

      const updateAttributes: Record<string, any> = {};
      let hasAttributeUpdates = false;

      // Check if we need to update description
      if (groupData.description !== undefined) {
        updateAttributes.description = groupData.description;
        hasAttributeUpdates = true;
      }

      // Check if we need to update group scope or type
      if (groupData.scope || groupData.type) {
        // Group scope and type changes require more complex handling as they modify sAMAccountType and groupType attributes
        // Typically requires specific bit flags - this would need to be implemented in the backend API
        hasAttributeUpdates = true;
        if (groupData.scope) {
          updateAttributes.groupScope = groupData.scope;
        }
        if (groupData.type) {
          updateAttributes.groupType = groupData.type;
        }
      }

      if (hasAttributeUpdates) {
        // Prepare the request for attribute updates
        const url = 'http://192.168.1.5:4444/api/v1/ad/object/group/update';
        
        // Build the request body
        const body = {
          address: `ldap://${serverIP}:389`,
          domain_name: domain,
          group: {
            distinguishedName: distinguishedName,
            attributes: updateAttributes
          }
        };

        console.log('Updating group attributes, request:', body);

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
        console.log('Update group attributes response:', data);
        
        if (data.status !== 'success') {
          throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
        }
      }

      // Add members if specified
      if (groupData.addMembers && groupData.addMembers.length > 0) {
        await this.addMembersToGroup(distinguishedName, groupData.addMembers);
      }

      // Remove members if specified
      if (groupData.removeMembers && groupData.removeMembers.length > 0) {
        await this.removeMembersFromGroup(distinguishedName, groupData.removeMembers);
      }
      
      // Return the updated group
      return {
        ...currentGroup,
        description: groupData.description !== undefined ? groupData.description : currentGroup.description,
        groupScope: groupData.scope || currentGroup.groupScope,
        groupType: groupData.type || currentGroup.groupType,
        modified: new Date()
      };
    } catch (error) {
      console.error('Error updating group:', error);
      loggingService.logError(`Failed to update group: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Add members to a group
  async addMembersToGroup(groupDN: string, memberDNs: string[]): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Adding ${memberDNs.length} members to group ${groupDN} in ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/group/add-members';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        group: {
          distinguishedName: groupDN,
          members: memberDNs
        }
      };

      console.log('Adding members to group, request:', body);

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
      console.log('Add members to group response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error adding members to group:', error);
      loggingService.logError(`Failed to add members to group: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Remove members from a group
  async removeMembersFromGroup(groupDN: string, memberDNs: string[]): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Removing ${memberDNs.length} members from group ${groupDN} in ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/group/remove-members';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        group: {
          distinguishedName: groupDN,
          members: memberDNs
        }
      };

      console.log('Removing members from group, request:', body);

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
      console.log('Remove members from group response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing members from group:', error);
      loggingService.logError(`Failed to remove members from group: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Delete a group from Active Directory
  async deleteGroup(distinguishedName: string): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Deleting group with DN ${distinguishedName} from ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/group/delete';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        distinguishedName: distinguishedName
      };

      console.log('Deleting group, request:', body);

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
      console.log('Delete group response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      loggingService.logError(`Failed to delete group: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Get group by Distinguished Name
  async getGroupByDN(distinguishedName: string): Promise<ADGroup | null> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/group';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        dn: distinguishedName
      };

      console.log('Fetching group by DN, request:', body);

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
      console.log('Get group response:', data);
      
      // Get groups from either format
      const groupsData = data.groups || data.docs || [];
      
      if (!groupsData || groupsData.length === 0) {
        return null;
      }

      // The first result should be our group
      const group = groupsData[0];
      
      // Transform to our ADGroup format
      return {
        id: group.objectGUID || group.distinguishedName,
        distinguishedName: group.distinguishedName,
        name: group.cn || group.name || group.distinguishedName.split(',')[0].replace('CN=', ''),
        description: group.description || '',
        created: group.whenCreated ? new Date(group.whenCreated) : new Date(),
        modified: group.whenChanged ? new Date(group.whenChanged) : new Date(),
        members: group.member || [],
        groupScope: group.groupScope || 'Global',
        groupType: group.groupType || 'Security'
      };
    } catch (error) {
      console.error('Error getting group by DN:', error);
      loggingService.logError(`Failed to get group by DN: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  // Add a new Organizational Unit (OU) to Active Directory
  async addOU(ouData: {
    name: string;
    description?: string;
    parentDN?: string;
  }): Promise<ADOU> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Adding new OU ${ouData.name} to ${domain}`);

      // Check required fields
      if (!ouData.name) {
        throw new Error('Missing required OU name');
      }

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou/add';
      const parentDN = ouData.parentDN || `DC=${domain.replace(/\./g, ',DC=')}`;
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        ou: {
          name: ouData.name,
          description: ouData.description || '',
          parentDN: parentDN
        }
      };

      console.log('Adding OU, request:', body);

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
      console.log('Add OU response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Create the new OU object to return
      const distinguishedName = `OU=${ouData.name},${parentDN}`;
      const newOU: ADOU = {
        id: data.objectGUID || `ou-${Date.now()}`,
        distinguishedName: distinguishedName,
        name: ouData.name,
        description: ouData.description || '',
        created: new Date(),
        modified: new Date()
      };

      return newOU;
    } catch (error) {
      console.error('Error adding OU:', error);
      loggingService.logError(`Failed to add OU: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Update an existing Organizational Unit in Active Directory
  async updateOU(distinguishedName: string, ouData: {
    description?: string;
  }): Promise<ADOU> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Updating OU with DN ${distinguishedName} in ${domain}`);

      // First, get the current OU data
      const currentOU = await this.getOUByDN(distinguishedName);
      if (!currentOU) {
        throw new Error(`OU with DN ${distinguishedName} not found`);
      }

      // Prepare the request for attribute updates
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou/update';
      
      // Build the attributes to update
      const attributes: any = {};
      if (ouData.description !== undefined) attributes.description = ouData.description;
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        ou: {
          distinguishedName: distinguishedName,
          attributes: attributes
        }
      };

      console.log('Updating OU, request:', body);

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
      console.log('Update OU response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Return the updated OU
      return {
        ...currentOU,
        description: ouData.description !== undefined ? ouData.description : currentOU.description,
        modified: new Date()
      };
    } catch (error) {
      console.error('Error updating OU:', error);
      loggingService.logError(`Failed to update OU: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Delete an Organizational Unit from Active Directory
  async deleteOU(distinguishedName: string): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Deleting OU with DN ${distinguishedName} from ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou/delete';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        distinguishedName: distinguishedName
      };

      console.log('Deleting OU, request:', body);

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
      console.log('Delete OU response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting OU:', error);
      loggingService.logError(`Failed to delete OU: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Get Organizational Unit by Distinguished Name
  async getOUByDN(distinguishedName: string): Promise<ADOU | null> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        dn: distinguishedName
      };

      console.log('Fetching OU by DN, request:', body);

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
      console.log('Get OU response:', data);
      
      // Get OUs from either format
      const ousData = data.ous || data.docs || [];
      
      if (!ousData || ousData.length === 0) {
        return null;
      }

      // The first result should be our OU
      const ou = ousData[0];
      
      // Transform to our ADOU format
      return {
        id: ou.objectGUID || ou.distinguishedName,
        distinguishedName: ou.distinguishedName,
        name: ou.ou || ou.name || this.extractNameFromDN(ou.distinguishedName),
        description: ou.description || '',
        created: ou.whenCreated ? new Date(ou.whenCreated) : new Date(),
        modified: ou.whenChanged ? new Date(ou.whenChanged) : new Date()
      };
    } catch (error) {
      console.error('Error getting OU by DN:', error);
      loggingService.logError(`Failed to get OU by DN: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  // Helper method to extract the name from a distinguished name
  private extractNameFromDN(distinguishedName: string): string {
    const match = /^(CN|OU)=([^,]+),/.exec(distinguishedName);
    return match ? match[2] : distinguishedName;
  }

  // Add a new computer to Active Directory
  async addComputer(computerData: Partial<ADComputer>): Promise<ADComputer> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Adding new computer to ${domain}`);

      // Check required fields
      if (!computerData.sAMAccountName) {
        throw new Error('Computer sAMAccountName is required');
      }
      
      // Ensure sAMAccountName ends with $
      const samAccountName = computerData.sAMAccountName.endsWith('$') 
        ? computerData.sAMAccountName 
        : `${computerData.sAMAccountName}$`;
        
      const computerName = computerData.cn || computerData.sAMAccountName.replace(/\$$/, '');
      
      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/computers/add';
      
      // Build the computer object for the request
      const computerObject: any = {
        samAccountName: samAccountName,
        name: computerName,
        description: computerData.description || '',
        parentDN: computerData.parentDN || `DC=${domain.replace(/\./g, ',DC=')}`
      };
      
      // Build the full request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        computer: computerObject
      };

      console.log('Adding computer, request:', body);

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
      console.log('Add computer response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Return the newly created computer
      return {
        id: data.objectGUID || samAccountName,
        distinguishedName: `CN=${computerName},${computerObject.parentDN}`,
        sAMAccountName: samAccountName,
        cn: computerName,
        dNSHostName: `${computerName}.${domain}`,
        description: computerData.description || '',
        operatingSystem: computerData.operatingSystem || '',
        operatingSystemVersion: computerData.operatingSystemVersion || '',
        created: new Date(),
        modified: new Date(),
        ...computerData,
        sAMAccountName: samAccountName, // Ensure the returned object has the correct sAMAccountName
        cn: computerName // Ensure the returned object has the correct cn
      };
    } catch (error) {
      console.error('Error adding computer:', error);
      loggingService.logError(`Failed to add computer: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Update an existing computer in Active Directory
  async updateComputer(computerDN: string, computerData: Partial<ADComputer>): Promise<ADComputer> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Updating computer with DN ${computerDN} in ${domain}`);

      // First, get the current computer data
      const currentComputer = await this.getComputerByDN(computerDN);
      if (!currentComputer) {
        throw new Error(`Computer with DN ${computerDN} not found`);
      }

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/computers/update';
      
      // Build the attributes object with only the properties to update
      const attributes: Record<string, any> = {};
      
      // Map computer properties to LDAP attributes
      if (computerData.description !== undefined) attributes.description = computerData.description;
      if (computerData.location !== undefined) attributes.location = computerData.location;
      
      // Build the full request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        computer: {
          distinguishedName: computerDN,
          attributes: attributes
        }
      };

      console.log('Updating computer, request:', body);

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
      console.log('Update computer response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Return the updated computer
      return {
        ...currentComputer,
        ...computerData,
        modified: new Date()
      };
    } catch (error) {
      console.error('Error updating computer:', error);
      loggingService.logError(`Failed to update computer: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Delete a computer from Active Directory
  async deleteComputer(distinguishedName: string): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Deleting computer with DN ${distinguishedName} from ${domain}`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/computers/delete';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        distinguishedName: distinguishedName
      };

      console.log('Deleting computer, request:', body);

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
      console.log('Delete computer response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting computer:', error);
      loggingService.logError(`Failed to delete computer: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Get computer by Distinguished Name
  async getComputerByDN(distinguishedName: string): Promise<ADComputer | null> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/computers';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        dn: distinguishedName
      };

      console.log('Fetching computer by DN, request:', body);

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
      console.log('Get computer response:', data);
      
      // Get computers from either format
      const computersData = data.computers || data.docs || [];
      
      if (!computersData || computersData.length === 0) {
        return null;
      }

      // The first result should be our computer
      const computer = computersData[0];
      
      // Transform to our ADComputer format
      return this.mapComputerDataToADComputer(computer);
    } catch (error) {
      console.error('Error getting computer by DN:', error);
      loggingService.logError(`Failed to get computer by DN: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  // Add a new Organizational Unit to Active Directory
  async addOU(ouData: {
    name: string;
    description?: string;
    parentDN?: string;
  }): Promise<ADOU> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Adding new OU ${ouData.name} to ${domain}`);

      // Check required fields
      if (!ouData.name) {
        throw new Error('Missing required OU name');
      }

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou/add';
      const parentDN = ouData.parentDN || `DC=${domain.replace(/\./g, ',DC=')}`;
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        ou: {
          name: ouData.name,
          description: ouData.description || '',
          parentDN: parentDN
        }
      };

      console.log('Adding OU, request:', body);

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
      console.log('Add OU response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      // Create the new OU object to return
      const distinguishedName = `OU=${ouData.name},${parentDN}`;
      const newOU: ADOU = {
        id: data.objectGUID || `ou-${Date.now()}`,
        distinguishedName: distinguishedName,
        name: ouData.name,
        description: ouData.description || '',
        created: new Date(),
        modified: new Date()
      };

      return newOU;
    } catch (error) {
      console.error('Error adding OU:', error);
      loggingService.logError(`Failed to add OU: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Update an existing Organizational Unit in Active Directory
  async updateOU(distinguishedName: string, ouData: {
    description?: string;
  }): Promise<ADOU> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Updating OU with DN ${distinguishedName} in ${domain}`);

      // First, get the current OU data
      const currentOU = await this.getOUByDN(distinguishedName);
      if (!currentOU) {
        throw new Error(`OU with DN ${distinguishedName} not found`);
      }

      // Prepare the request for attribute updates
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou/update';
      
      // Build the attributes to update
      const attributes: any = {};
      if (ouData.description !== undefined) attributes.description = ouData.description;
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        ou: {
          distinguishedName: distinguishedName,
          attributes: attributes
        }
      };

      console.log('Updating OU, request:', body);

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
      console.log('Update OU response:', data);
      
      if (data.status !== 'success') {
        const data = await response.json();
        console.log('Update OU attributes response:', data);
        
        if (data.status !== 'success') {
          throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
        }
      }
      
      // Return the updated OU
      return {
        ...currentOU,
        description: ouData.description !== undefined ? ouData.description : currentOU.description,
        modified: new Date()
      };
    } catch (error) {
      console.error('Error updating OU:', error);
      loggingService.logError(`Failed to update OU: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Delete an Organizational Unit from Active Directory
  async deleteOU(distinguishedName: string, recursive: boolean = false): Promise<boolean> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      loggingService.logInfo(`Deleting OU with DN ${distinguishedName} from ${domain} (recursive: ${recursive})`);

      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou/delete';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        distinguishedName: distinguishedName,
        recursive: recursive
      };

      console.log('Deleting OU, request:', body);

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
      console.log('Delete OU response:', data);
      
      if (data.status !== 'success') {
        throw new Error(`API responded with error: ${data.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting OU:', error);
      loggingService.logError(`Failed to delete OU: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Get Organizational Unit by Distinguished Name
  async getOUByDN(distinguishedName: string): Promise<ADOU | null> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) {
        throw new Error('Server IP not set');
      }

      const domain = localStorage.getItem('ad_domain_name') || 'adscanner.local';
      
      // Prepare the request
      const url = 'http://192.168.1.5:4444/api/v1/ad/object/ou';
      
      // Build the request body
      const body = {
        address: `ldap://${serverIP}:389`,
        domain_name: domain,
        dn: distinguishedName
      };

      console.log('Fetching OU by DN, request:', body);

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
      console.log('Get OU response:', data);
      
      // Get OUs from either format
      const ousData = data.ous || data.docs || [];
      
      if (!ousData || ousData.length === 0) {
        return null;
      }

      // The first result should be our OU
      const ou = ousData[0];
      
      // Transform to our ADOU format
      return {
        id: ou.objectGUID || ou.distinguishedName,
        distinguishedName: ou.distinguishedName,
        name: ou.ou || ou.name || ou.distinguishedName.split(',')[0].replace('OU=', ''),
        description: ou.description || '',
        created: ou.whenCreated ? new Date(ou.whenCreated) : new Date(),
        modified: ou.whenChanged ? new Date(ou.whenChanged) : new Date(),
        children: [] // We'd need to load children separately
      };
    } catch (error) {
      console.error('Error getting OU by DN:', error);
      loggingService.logError(`Failed to get OU by DN: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}

// Export singleton instance - Use named export instead of default
export const activeDirectoryService = new ActiveDirectoryService(); 