import { User } from '../interfaces/common';

/**
 * Checks if the user has the specified permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  if (user.isAdmin) return true; // Admins have all permissions
  return user.roles?.includes(permission) || false;
};

/**
 * Checks if the user is an admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.isAdmin === true;
};

/**
 * Checks if the user has access to a specific resource
 */
export const hasResourceAccess = (user: User | null, resourceId: string | null): boolean => {
  if (!user || !resourceId) return false;
  if (user.isAdmin) return true; // Admins have access to all resources
  
  // Add your specific resource access logic here
  // Example: Check if resource belongs to user's group, or if user is the owner
  return user.id === resourceId;
};

/**
 * Gets role display name
 */
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Administrator',
    'user': 'Regular User',
    'auditor': 'Security Auditor',
    'analyst': 'Security Analyst',
    'manager': 'Security Manager',
  };
  
  return roleMap[role] || role;
}; 