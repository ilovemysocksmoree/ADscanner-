export const API_CONFIG = {
  AD_API_BASE_URL: 'http://192.168.1.5:4444/api/v1/ad',
  DIRECT_API_URL: 'http://192.168.1.5:4444/api/v1/ad',
  CORS_PROXY_URL: 'http://localhost:8080',
  REQUEST_TIMEOUT: 15000, // 15 seconds
  ENDPOINTS: {
    HEALTH_CHECK: '/health',
    CONNECT: '/connect',
    USERS: '/users',
    GROUPS: '/groups',
    COMPUTERS: '/computers',
    ORGANIZATIONAL_UNITS: '/ous',
    GROUP_POLICIES: '/gpos'
  },
  DEBUG: true // Enable for verbose logging during development
}; 