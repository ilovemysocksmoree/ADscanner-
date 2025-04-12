import { User } from '../interfaces/common';
import { AD_API_BASE_URL, API_REQUEST_TIMEOUT, AD_API_ENDPOINTS } from '../constants/apiConfig';

// Health check response interface
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

// Connection response interface
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

class ActiveDirectoryService {
  private authToken: string | null = null;
  private sessionId: string | null = null;
  
  // Set auth token
  setAuthToken(token: string) {
    this.authToken = token;
  }
  
  // Set session ID
  setSessionId(id: string) {
    this.sessionId = id;
  }
  
  // Get auth headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    if (this.sessionId) {
      headers['X-Session-ID'] = this.sessionId;
    }
    
    return headers;
  }
  
  // Add request timeout
  private fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      // Create abort controller for timeout
      const controller = new AbortController();
      const { signal } = controller;
      
      // Set timeout to abort request
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('Request timeout'));
      }, API_REQUEST_TIMEOUT);
      
      fetch(url, { ...options, signal })
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  }

  // Check health of AD server with sanitized input
  async checkHealth(serverIP: string): Promise<HealthCheckResponse> {
    try {
      // Validate IP format (basic validation)
      if (!this.isValidIP(serverIP)) {
        throw new Error('Invalid IP address format');
      }
      
      // Encode query parameter to prevent injection
      const encodedIP = encodeURIComponent(serverIP);
      
      // Use timeout to prevent hanging requests
      const response = await this.fetchWithTimeout(
        `${AD_API_BASE_URL}${AD_API_ENDPOINTS.HEALTH_CHECK}?ip=${encodedIP}`,
        { 
          method: 'GET',
          headers: this.getHeaders()
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      
      return await response.json() as HealthCheckResponse;
    } catch (error) {
      console.error('Error checking AD server health:', error);
      throw error;
    }
  }

  // Connect to AD server with authentication
  async connect(serverIP: string, domain: string, username: string, password: string): Promise<ConnectionResponse> {
    try {
      // Validate inputs
      if (!this.isValidIP(serverIP)) {
        throw new Error('Invalid IP address format');
      }
      
      if (!domain || !username || !password) {
        throw new Error('Missing required authentication parameters');
      }
      
      // Use timeout to prevent hanging requests
      const response = await this.fetchWithTimeout(`${AD_API_BASE_URL}${AD_API_ENDPOINTS.CONNECT}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          serverIP,
          domain,
          username,
          password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      
      const data = await response.json() as ConnectionResponse;
      
      // Store auth token and session ID if provided
      if (data.token) {
        this.setAuthToken(data.token);
      }
      
      if (data.session_id) {
        this.setSessionId(data.session_id);
      }
      
      return data;
    } catch (error) {
      console.error('Error connecting to AD server:', error);
      throw error;
    }
  }

  // Validate IP address format
  private isValidIP(ip: string): boolean {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
  }

  // Log AD operation with enhanced security info
  logOperation(user: User, operation: string, details: string): void {
    // Log the operation with timestamp for audit trail
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AD Operation] ${operation}: ${details} by ${user?.id || 'unknown'}`);
    
    // In a real implementation, you would send this securely to your backend
    // For sensitive operations, you would include additional context like IP address
  }
  
  // Logout/disconnect session
  async disconnect(): Promise<void> {
    if (!this.sessionId) {
      return;
    }
    
    try {
      await this.fetchWithTimeout(`${AD_API_BASE_URL}${AD_API_ENDPOINTS.DISCONNECT}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      
      // Clear credentials
      this.authToken = null;
      this.sessionId = null;
    } catch (error) {
      console.error('Error disconnecting from AD server:', error);
      throw error;
    }
  }
}

export const activeDirectoryService = new ActiveDirectoryService(); 