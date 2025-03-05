import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorPage from '../pages/ErrorPage';

interface SecureRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  requiredPermissions?: string[];
}

// Extend the User type to include permissions
interface ExtendedUser {
  email: string;
  isAdmin: boolean;
  permissions: string[];
}

// Define strict role requirements for each route
const ROUTE_PERMISSIONS = {
  // Admin routes require admin role
  '/admin/domain-groups': { role: 'admin', permissions: ['manage_domains'] },
  '/admin/domain-users': { role: 'admin', permissions: ['manage_users'] },
  '/admin/add-domain-user': { role: 'admin', permissions: ['manage_users'] },
  '/admin/logs': { role: 'admin', permissions: ['view_logs'] },
  '/admin/settings': { role: 'admin', permissions: ['manage_settings'] },
  '/admin/profile': { role: 'admin', permissions: ['manage_profile'] },
  
  // User routes require specific permissions
  '/dashboard': { role: 'user', permissions: ['view_dashboard'] },
  '/vulnerability-scanner': { role: 'user', permissions: ['run_scans'] },
  '/network-scanner': { role: 'user', permissions: ['run_scans'] },
  '/reports': { role: 'user', permissions: ['view_reports'] },
  '/profile': { role: 'user', permissions: ['manage_profile'] },
  '/settings': { role: 'user', permissions: ['manage_settings'] },
  
  // Resource-specific routes
  '/reports/': { role: 'user', permissions: ['view_reports'], requiresResourceCheck: true },
  '/scans/': { role: 'user', permissions: ['view_scans'], requiresResourceCheck: true },
  '/vulnerabilities/': { role: 'user', permissions: ['view_vulnerabilities'], requiresResourceCheck: true },
  '/admin/domain-users/': { role: 'admin', permissions: ['manage_users'], requiresResourceCheck: true },
  '/admin/domain-groups/': { role: 'admin', permissions: ['manage_domains'], requiresResourceCheck: true },
};

export default function SecureRoute({ 
  children, 
  requiredRole = 'user',
  requiredPermissions = [] 
}: SecureRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Convert User to ExtendedUser with default permissions
  const extendedUser: ExtendedUser | null = user ? {
    ...user,
    permissions: user.isAdmin ? [
      'manage_domains',
      'manage_users',
      'view_logs',
      'manage_settings',
      'manage_profile',
      'view_dashboard',
      'run_scans',
      'view_reports',
      'view_scans',
      'view_vulnerabilities'
    ] : [
      'view_dashboard',
      'run_scans',
      'view_reports',
      'manage_profile'
    ]
  } : null;

  // Function to log security events
  const logSecurityEvent = (
    eventType: string, 
    description: string, 
    path: string,
    additionalInfo: Record<string, any> = {}
  ) => {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      eventType,
      user: extendedUser?.email || 'anonymous',
      userRole: extendedUser?.isAdmin ? 'admin' : 'user',
      description,
      path,
      ipAddress: window.sessionStorage.getItem('userIP') || 'unknown',
      userAgent: navigator.userAgent,
      ...additionalInfo
    });
    localStorage.setItem('securityLogs', JSON.stringify(logs));
  };

  // Check if user is logged in
  if (!extendedUser) {
    logSecurityEvent('AUTH_FAILURE', 'User not authenticated', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Function to check if user has required permissions
  const hasRequiredPermissions = (permissions: string[]): boolean => {
    if (!extendedUser || !extendedUser.permissions) return false;
    return permissions.every(permission => extendedUser.permissions.includes(permission));
  };

  // Function to validate route access
  const validateRouteAccess = (path: string): boolean => {
    // Check for exact route match first
    let routeConfig = ROUTE_PERMISSIONS[path];

    // If no exact match, check for pattern matches
    if (!routeConfig) {
      const matchingPattern = Object.keys(ROUTE_PERMISSIONS).find(pattern => 
        path.startsWith(pattern) && pattern.endsWith('/')
      );
      if (matchingPattern) {
        routeConfig = ROUTE_PERMISSIONS[matchingPattern];
      }
    }

    // If no route config found, default to requiring authentication
    if (!routeConfig) {
      return !!extendedUser;
    }

    // Check role
    if (routeConfig.role === 'admin' && !extendedUser.isAdmin) {
      logSecurityEvent('ACCESS_DENIED', 'Admin privileges required', path, {
        requiredRole: 'admin',
        userRole: extendedUser.isAdmin ? 'admin' : 'user'
      });
      return false;
    }

    // Check permissions
    if (!hasRequiredPermissions(routeConfig.permissions)) {
      logSecurityEvent('PERMISSION_DENIED', 'Missing required permissions', path, {
        requiredPermissions: routeConfig.permissions,
        userPermissions: extendedUser.permissions || []
      });
      return false;
    }

    return true;
  };

  // Function to check resource access
  const validateResourceAccess = (resourceId: string, path: string): boolean => {
    if (!resourceId) return true;
    if (extendedUser.isAdmin) return true;

    const savedUsers = localStorage.getItem('domainUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const targetUser = users.find((u: any) => u.id === resourceId);

    if (!targetUser) {
      logSecurityEvent('RESOURCE_ACCESS_DENIED', 'Resource not found', path, {
        resourceId,
        attemptedAccess: true
      });
      return false;
    }

    // Check resource ownership
    const hasAccess = targetUser.email === extendedUser.email;
    if (!hasAccess) {
      logSecurityEvent('RESOURCE_ACCESS_DENIED', 'Unauthorized resource access attempt', path, {
        resourceId,
        resourceOwner: targetUser.email
      });
    }
    return hasAccess;
  };

  // Extract path and resource ID
  const path = location.pathname;
  const urlParts = path.split('/');
  const resourceId = urlParts[urlParts.length - 1];
  const isResourceRequest = !['domain-groups', 'domain-users', 'add-domain-user', 'logs', 
    'settings', 'profile', 'admin', 'dashboard', 'vulnerability-scanner', 
    'network-scanner', 'reports'].includes(resourceId);

  // Validate route access
  if (!validateRouteAccess(path)) {
    return <ErrorPage 
      code={403} 
      message="Access Forbidden: Insufficient privileges" 
    />;
  }

  // Check resource access if needed
  if (isResourceRequest) {
    const matchingPattern = Object.keys(ROUTE_PERMISSIONS).find(pattern => 
      path.startsWith(pattern) && pattern.endsWith('/')
    );
    
    if (matchingPattern && ROUTE_PERMISSIONS[matchingPattern].requiresResourceCheck) {
      if (!validateResourceAccess(resourceId, path)) {
        return <ErrorPage 
          code={404} 
          message="Resource not found or access denied" 
        />;
      }
    }
  }

  // Special case: redirect /admin to domain-groups
  if (path === '/admin' || path === '/admin/') {
    if (!extendedUser.isAdmin) {
      logSecurityEvent('ADMIN_ACCESS_DENIED', 'Attempted to access admin dashboard', path);
      return <ErrorPage 
        code={403} 
        message="Access Forbidden: Admin privileges required" 
      />;
    }
    return <Navigate to="/admin/domain-groups" replace />;
  }

  // Log successful access
  logSecurityEvent('ACCESS_GRANTED', 'Successfully accessed route', path);
  
  return <>{children}</>;
} 