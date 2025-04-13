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
   * Test server reachable
   */
  async testServerReachable(serverIP: string): Promise<boolean> {
    try {
      const response = await fetch(`http://${serverIP}/api/health`);
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
      const response = await fetch(`http://${serverIP}/api/health`);
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "error", message: "Failed to connect to server" };
    }
  }

  /**
   * Connect to Active Directory server
   */
  async connect(serverIP: string, username: string, password: string, domain: string) {
    try {
      const response = await fetch(`http://${serverIP}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, domain })
      });
      
      if (!response.ok) throw new Error('Authentication failed');
      
      const data = await response.json();
      this.setServerIP(serverIP);
      this.setAuthToken(data.token || '');
      localStorage.setItem('ad_domain_name', domain);
      
      return { success: true, message: "Connected successfully" };
    } catch (error) {
      console.error("Connection failed:", error);
      return { success: false, message: String(error) };
    }
  }
  
  /**
   * Get organizational units with pagination
   */
  async getOrganizationalUnits(page = 1, pageSize = 10, filter = ''): Promise<PaginatedResponse<ADOrganizationalUnit>> {
    try {
      const serverIP = this.getServerIP();
      if (!serverIP) throw new Error('Server IP not set');
      
      const response = await fetch(`http://${serverIP}/api/v1/ad/object/ous`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: `ldap://${serverIP}:389`,
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
      const serverIP = this.getServerIP();
      if (!serverIP) throw new Error('Server IP not set');
      
      const response = await fetch(`http://${serverIP}/api/v1/ad/object/ou`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: `ldap://${serverIP}:389`,
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
      const serverIP = this.getServerIP();
      if (!serverIP) throw new Error('Server IP not set');
      
      const response = await fetch(`http://${serverIP}/api/v1/ad/object/ou/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: `ldap://${serverIP}:389`,
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
      const serverIP = this.getServerIP();
      if (!serverIP) throw new Error('Server IP not set');
      
      // Get current OU data
      const currentOU = await this.getOUByDN(distinguishedName);
      if (!currentOU) throw new Error('OU not found');
      
      const response = await fetch(`http://${serverIP}/api/v1/ad/object/ou/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: `ldap://${serverIP}:389`,
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
      const serverIP = this.getServerIP();
      if (!serverIP) throw new Error('Server IP not set');
      
      const response = await fetch(`http://${serverIP}/api/v1/ad/object/ou/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ad_auth_token')}`
        },
        body: JSON.stringify({
          address: `ldap://${serverIP}:389`,
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