/**
 * API Configuration 
 * Contains constants for API endpoints and settings
 */

// Active Directory API Base URL - Should be configured from environment variables in production
export const AD_API_BASE_URL = 'http://192.168.1.5:4444/api/v1/ad';

// Alternate direct API endpoints (without '/ad' prefix) - try these if the main endpoints fail
export const DIRECT_API_BASE_URL = 'http://192.168.1.5:4444/api/v1';

// Fallback to a CORS proxy if direct connection fails
export const USE_CORS_PROXY = true;
export const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

// API Request Timeout (in milliseconds)
export const API_REQUEST_TIMEOUT = 15000;

// Define API endpoints for Active Directory
export const AD_API_ENDPOINTS = {
  // Main endpoints
  HEALTH_CHECK: '/checkhealth',
  CONNECT: '/connect',
  DISCONNECT: '/disconnect',
  
  // Resource endpoints
  GET_USERS: '/users',
  GET_GROUPS: '/groups',
  GET_COMPUTERS: '/computers',
  GET_OUS: '/ous'
};

// Enable this for verbose logging during development
export const DEBUG_MODE = true; 