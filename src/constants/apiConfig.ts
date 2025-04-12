/**
 * API Configuration 
 * Contains constants for API endpoints and settings
 */

// Active Directory API Base URL
export const AD_API_BASE_URL = 'http://192.168.1.5:4444/api/v1/ad';

// API Request Timeout (in milliseconds)
export const API_REQUEST_TIMEOUT = 15000;

// Define API endpoints for Active Directory
export const AD_API_ENDPOINTS = {
  HEALTH_CHECK: '/checkhealth',
  CONNECT: '/connect',
  DISCONNECT: '/disconnect',
  GET_USERS: '/users',
  GET_GROUPS: '/groups',
  GET_COMPUTERS: '/computers',
  GET_OUS: '/ous'
}; 