import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UnauthorizedPage from '../../pages/UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requiredPermissions = []
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Log access attempts for security monitoring
  useEffect(() => {
    if (!isAuthenticated) {
      console.warn(`Unauthorized access attempt to ${location.pathname} - Not authenticated`);
    } else if (requireAdmin && !user?.isAdmin) {
      console.warn(`Unauthorized access attempt to ${location.pathname} - Not admin (User: ${user?.email})`);
    }
  }, [isAuthenticated, requireAdmin, user, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }
  
  // Handle authentication check
  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect after login
    sessionStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // Handle admin route access
  if (requireAdmin && !user?.isAdmin) {
    return <UnauthorizedPage 
      message="You need administrator privileges to access this page." 
      isAuthenticated={true} 
    />;
  }
  
  // Handle permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(
      permission => user?.permissions.includes(permission)
    );
    
    if (!hasRequiredPermissions) {
      return <UnauthorizedPage 
        message="You don't have the required permissions to access this page." 
        isAuthenticated={true}
      />;
    }
  }
  
  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 