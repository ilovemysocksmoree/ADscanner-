/**
 * Active Directory Service
 * Main entry point for Active Directory operations
 */

import { ADOrganizationalUnit, PaginatedResponse } from '../models/ad-entities';

/**
 * Active Directory Service
 */
class ActiveDirectoryService {
  private serverIp: string | null = null;
  private authToken: string | null = null;
  
  /**
   * Get server IP
   */
  getServerIP(): string | null {
    return localStorage.getItem('ad_server_ip');
  }
  
  /**
   * Set server IP
   */
  setServerIP(ip: string): void {
    localStorage.setItem('ad_server_ip', ip);
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    localStorage.setItem('ad_auth_token', token);
  }
  
  /**
   * Extract server IP from string (handles both direct IP and LDAP URLs)
   */
  private extractServerIP(serverInput: string): string {
    // If it's an LDAP URL, extract the host part
    if (serverInput.startsWith('ldap://')) {
      // Extract host:port, then just the host
      const urlParts = serverInput.substring(7).split(':');
      return urlParts[0]; // Return just the host part
    }
    return serverInput;
  }
  
  /**
   * Test server reachable
   */
  async testServerReachable(serverIP: string): Promise<boolean> {
    try {
      const ip = this.extractServerIP(serverIP);
      const response = await fetch(`http://${ip}/api/health`);
      return response.ok;
    } catch (error) {
      console.error("Server connection test failed:", error);
      return false;
    }
  }

  /**
   * Check server health
   */
  async checkHealth(serverIP: string) {
    try {
      const ip = this.extractServerIP(serverIP);
      const ldapAddress = serverIP.startsWith('ldap://') ? serverIP : `ldap://${serverIP}:389`;
      
      // First try the standard health endpoint
      let response;
      try {
        response = await fetch(`http://${ip}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (e) {
        console.log("Standard health check failed, trying alternative endpoint");
        // If that fails, try connecting directly to the LDAP endpoint
        response = await fetch(`http://${ip}/api/v1/ad/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: ldapAddress,
            domain_name: localStorage.getItem('ad_domain_name') || ''
          })
        });
      }
      
      if (!response.ok) {
        console.error("Health check failed with status:", response.status);
        return { 
          status: "error", 
          message: `Server returned status ${response.status}`,
          stats: { healthy: false }
        };
      }
      
      const data = await response.json();
      console.log("Health check response:", data);
      
      // Handle different response formats
      if (data.status === 'success' || data.healthy === true) {
        return { 
          status: "success", 
          message: data.message || "Server is online",
          stats: { healthy: true }
        };
      } else {
        return { 
          status: "error", 
          message: data.message || "Server reported unhealthy status",
          stats: { healthy: false }
        };
      }
    } catch (error) {
      console.error("Health check failed:", error);
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : "Failed to connect to server", 
        stats: { healthy: false }
      };
    }
  }

  /**
   * Connect to Active Directory server
   */
  async connect(serverIP: string, username: string, password: string, domain: string) {
    try {
      const ip = this.extractServerIP(serverIP);
      const ldapAddress = serverIP.startsWith('ldap://') ? serverIP : `ldap://${serverIP}:389`;
      
      // First, try to authenticate via the actual LDAP server
      const response = await fetch(`http://${ip}/api/v1/ad/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: ldapAddress,
          domain_name: domain,
          username: username,
          password: password
        })
      });
      
      const data = await response.json();
      console.log("Authentication response:", data);
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || `Authentication failed (${response.status})` 
        };
      }
      
      // Authentication successful
      // Store connection information
      this.setServerIP(serverIP); // Store the original input format
      this.setAuthToken(data.token || '');
      localStorage.setItem('ad_domain_name', domain);
      
      return { success: true, message: "Connected successfully" };
    } catch (error) {
      console.error("Connection failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server" 
      };
    }
  }
  
  /**
   * Get organizational units with pagination
   */
  async getOrganizationalUnits(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADOrganizationalUnit>> {
    try {
      const serverInput = this.getServerIP();
      if (!serverInput) throw new Error('Server IP not set');
      
      const ip = this.extractServerIP(serverInput);
      // For the address field in the body, use the original format if it's an LDAP URL, otherwise construct it
      const ldapAddress = serverInput.startsWith('ldap://') ? serverInput : `ldap://${serverInput}:389`;
      
      const response = await fetch(`http://${ip}/api/v1/ad/object/ous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: ldapAddress,
          domain_name: localStorage.getItem('ad_domain_name'),
          filter: filter,
          page: page,
          pageSize: pageSize
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch organizational units');

      const data = await response.json();
      const ous = data.ous || data.docs || [];
      
      // Map the data to our format
      const formattedOUs = ous.map((ou: any) => ({
        id: ou.objectGUID || ou.distinguishedName,
        distinguishedName: ou.distinguishedName,
        name: ou.name || ou.ou || '',
        description: ou.description || '',
        path: ou.distinguishedName,
        parentOU: this.extractParentOU(ou.distinguishedName),
        protected: ou.isProtected || false,
        created: ou.whenCreated ? new Date(ou.whenCreated) : undefined,
        modified: ou.whenChanged ? new Date(ou.whenChanged) : undefined
      }));
      
      return {
        items: formattedOUs,
        totalCount: ous.length,
        page,
        pageSize,
        hasMore: false
      };
    } catch (error) {
      console.error("Error fetching OUs:", error);
      return {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        hasMore: false
      };
    }
  }

  /**
   * Get OU by distinguished name
   */
  async getOUByDN(distinguishedName: string): Promise<ADOrganizationalUnit | null> {
    try {
      const serverInput = this.getServerIP();
      if (!serverInput) throw new Error('Server IP not set');
      
      const ip = this.extractServerIP(serverInput);
      const ldapAddress = serverInput.startsWith('ldap://') ? serverInput : `ldap://${serverInput}:389`;
      
      const response = await fetch(`http://${ip}/api/v1/ad/object/ou`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: ldapAddress,
          domain_name: localStorage.getItem('ad_domain_name'),
          dn: distinguishedName
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch OU');

      const data = await response.json();
      const ous = data.ous || data.docs || [];
      
      if (ous.length === 0) return null;

      const ou = ous[0];
        return {
          id: ou.objectGUID || ou.distinguishedName,
          distinguishedName: ou.distinguishedName,
        name: ou.name || ou.ou || '',
        description: ou.description || '',
          path: ou.distinguishedName,
        parentOU: this.extractParentOU(ou.distinguishedName),
        protected: ou.isProtected || false,
        created: ou.whenCreated ? new Date(ou.whenCreated) : undefined,
        modified: ou.whenChanged ? new Date(ou.whenChanged) : undefined
      };
    } catch (error) {
      console.error("Error fetching OU:", error);
      return null;
    }
  }
  
  /**
   * Add a new organizational unit
   */
  async addOU(ouData: {
    name: string;
    description?: string;
    parentDN?: string;
    protected?: boolean;
  }): Promise<ADOrganizationalUnit> {
    try {
      const serverInput = this.getServerIP();
      if (!serverInput) throw new Error('Server IP not set');
      
      const ip = this.extractServerIP(serverInput);
      const ldapAddress = serverInput.startsWith('ldap://') ? serverInput : `ldap://${serverInput}:389`;
      
      const response = await fetch(`http://${ip}/api/v1/ad/object/ou/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: ldapAddress,
          domain_name: localStorage.getItem('ad_domain_name'),
          ou: {
            name: ouData.name,
            description: ouData.description || '',
            parentDN: ouData.parentDN || this.buildDomainDN(),
            protected: ouData.protected || false
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add OU');
      }
      
      // Create the OU object to return
      return {
        id: `ou-${Date.now()}`,
        distinguishedName: `OU=${ouData.name},${ouData.parentDN || this.buildDomainDN()}`,
        name: ouData.name,
        description: ouData.description || '',
        path: `OU=${ouData.name},${ouData.parentDN || this.buildDomainDN()}`,
        parentOU: ouData.parentDN || this.buildDomainDN(),
        protected: ouData.protected || false,
        created: new Date(),
        modified: new Date()
      };
    } catch (error) {
      console.error("Error adding OU:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing organizational unit
   */
  async updateOU(distinguishedName: string, ouData: {
    description?: string;
    protected?: boolean;
  }): Promise<ADOrganizationalUnit> {
    try {
      const serverInput = this.getServerIP();
      if (!serverInput) throw new Error('Server IP not set');
      
      const ip = this.extractServerIP(serverInput);
      const ldapAddress = serverInput.startsWith('ldap://') ? serverInput : `ldap://${serverInput}:389`;
      
      // Get current OU data
      const currentOU = await this.getOUByDN(distinguishedName);
      if (!currentOU) throw new Error('OU not found');
      
      const response = await fetch(`http://${ip}/api/v1/ad/object/ou/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: ldapAddress,
          domain_name: localStorage.getItem('ad_domain_name'),
          ou: {
            distinguishedName,
            attributes: {
              description: ouData.description,
              protected: ouData.protected
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update OU');
      }
      
      // Return updated OU
      return {
        ...currentOU,
        description: ouData.description !== undefined ? ouData.description : currentOU.description,
        protected: ouData.protected !== undefined ? ouData.protected : currentOU.protected,
        modified: new Date()
      };
    } catch (error) {
      console.error("Error updating OU:", error);
      throw error;
    }
  }
  
  /**
   * Delete an organizational unit
   */
  async deleteOU(distinguishedName: string, recursive: boolean = false): Promise<boolean> {
    try {
      const serverInput = this.getServerIP();
      if (!serverInput) throw new Error('Server IP not set');
      
      const ip = this.extractServerIP(serverInput);
      const ldapAddress = serverInput.startsWith('ldap://') ? serverInput : `ldap://${serverInput}:389`;
      
      const response = await fetch(`http://${ip}/api/v1/ad/object/ou/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: ldapAddress,
          domain_name: localStorage.getItem('ad_domain_name'),
          distinguishedName,
          recursive
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete OU');
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting OU:", error);
      throw error;
    }
  }
  
  /**
   * Get computers with pagination
   */
  async getComputers(page = 1, pageSize = 10, filter = '') {
    return { items: [], totalCount: 0, page, pageSize, hasMore: false };
  }
  
  /**
   * Get groups with pagination
   */
  async getGroups(page = 1, pageSize = 10, filter = '') {
    return { items: [], totalCount: 0, page, pageSize, hasMore: false };
  }
  
  /**
   * Get domain controllers with pagination
   */
  async getDomainControllers(page = 1, pageSize = 10, filter = '') {
    return { items: [], totalCount: 0, page, pageSize, hasMore: false };
  }

  /**
   * Extract parent OU from distinguished name
   */
  private extractParentOU(dn: string): string | undefined {
    if (!dn) return undefined;
    const parts = dn.split(',');
    if (parts.length <= 1) return undefined;
    return parts.slice(1).join(',');
  }
  
  /**
   * Build domain DN from domain name
   */
  private buildDomainDN(): string {
    const domain = localStorage.getItem('ad_domain_name') || '';
    return domain.split('.').map(part => `DC=${part}`).join(',');
  }
}

// Export singleton instance
export const activeDirectoryService = new ActiveDirectoryService(); 