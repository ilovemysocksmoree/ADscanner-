import { User } from '../interfaces/common';

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

// Base API URL
const API_BASE_URL = 'http://192.168.1.5:4444/api/v1/ad';

class ActiveDirectoryService {
  // Check health of AD server
  async checkHealth(serverIP: string): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/checkhealth?ip=${serverIP}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return await response.json() as HealthCheckResponse;
    } catch (error) {
      console.error('Error checking AD server health:', error);
      throw error;
    }
  }

  // Connect to AD server with authentication
  async connect(serverIP: string, domain: string, username: string, password: string): Promise<any> {
    try {
      // This is a placeholder. In a real implementation, you'd call your backend API
      // to authenticate with the AD server
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverIP,
          domain,
          username,
          password
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error connecting to AD server:', error);
      throw error;
    }
  }

  // Log AD operation
  logOperation(user: User, operation: string, details: string): void {
    // Here we would log operations to your backend
    console.log(`[AD Operation] ${operation}: ${details} by ${user?.id || 'unknown'}`);
  }
}

export const activeDirectoryService = new ActiveDirectoryService(); 