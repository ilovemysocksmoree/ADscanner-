import React, { createContext, useContext, useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { EmailService } from '../services/EmailService';

interface User {
  id: string;
  email: string;
  name?: string;
  companyName?: string;
  phoneNumber?: string;
  region?: string;
  position?: string;
  isAdmin: boolean;
  role?: string;
  groupId?: string;
  permissions: string[];
  status?: 'pending' | 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN = {
  id: 'admin-1',
  email: 'admin@company.com',
  password: 'admin@123',
  isAdmin: true,
  name: 'Admin User',
  companyName: 'Tech Corp',
  phoneNumber: '+1 234 567 8900',
  region: 'North America',
  position: 'System Administrator',
  role: 'admin',
  status: 'active',
  lastLogin: new Date().toISOString(),
  permissions: [
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
  ]
};

const DEFAULT_USER = {
  id: 'user-1',
  email: 'user@company.com',
  password: 'user@123',
  isAdmin: false,
  name: 'Regular User',
  companyName: 'Tech Corp',
  phoneNumber: '+1 234 567 8901',
  region: 'North America',
  position: 'Security Analyst',
  role: 'user',
  status: 'active',
  lastLogin: new Date().toISOString(),
  permissions: [
    'view_dashboard',
    'run_scans',
    'view_reports',
    'manage_profile'
  ]
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default users in localStorage if they don't exist
    const initializeDefaultUsers = () => {
      const savedUsers = localStorage.getItem('domainUsers');
      if (!savedUsers) {
        const defaultUsers = [DEFAULT_ADMIN, DEFAULT_USER];
        localStorage.setItem('domainUsers', JSON.stringify(defaultUsers));
        console.log('Initialized default users:', defaultUsers);
      }
    };

    // Check if user is logged in and initialize default users
    const checkAuth = async () => {
      try {
        initializeDefaultUsers();
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          console.log('Restored user session:', JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // For now, we'll create a mock user with regular permissions
      const mockUser: User = {
        id: '1',
        email: 'google@example.com',
        name: 'Google User',
        companyName: 'Tech Corp',
        phoneNumber: '+1 234 567 8902',
        region: 'North America',
        position: 'Security Analyst',
        isAdmin: false,
        permissions: [
          'view_dashboard',
          'run_scans',
          'view_reports',
          'manage_profile'
        ]
      };
      setUser(mockUser);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string, isAdmin: boolean = false) => {
    try {
      const savedUsers = localStorage.getItem('domainUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      const foundUser = users.find((u: any) => u.email === email);

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      if (foundUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      if (foundUser.status === 'pending') {
        throw new Error('Please confirm your account through the email link first');
      }

      if (foundUser.status === 'inactive') {
        throw new Error('Your account has been deactivated. Please contact an administrator');
      }

      // Update last login
      const updatedUsers = users.map((u: any) =>
        u.email === email ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      localStorage.setItem('domainUsers', JSON.stringify(updatedUsers));

      const userToSave = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        isAdmin: foundUser.role === 'admin',
        groupId: foundUser.groupId,
        permissions: foundUser.role === 'admin' ? [
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
      };

      setUser(userToSave);
      localStorage.setItem('currentUser', JSON.stringify(userToSave));
    } catch (error) {
      console.error('Email sign in failed:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      // Get existing users
      const savedUsers = localStorage.getItem('domainUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      // Check if email already exists and its status
      const existingUser = users.find((u: any) => u.email === userData.email);
      if (existingUser) {
        if (existingUser.status === 'pending') {
          // Resend confirmation email
          try {
            await EmailService.sendConfirmationEmail(
              existingUser.email,
              existingUser.password,
              existingUser.name || 'User'
            );
            console.log('Confirmation email resent successfully');
            throw new Error('Account already exists but not confirmed. A new confirmation email has been sent.');
          } catch (error) {
            console.error('Failed to resend confirmation email:', error);
            throw new Error('Failed to resend confirmation email. Please try again.');
          }
        } else {
          throw new Error('Email already registered and confirmed');
        }
      }

      // Create new user with all required fields
      const newUser: any = {
        id: `user-${Date.now()}`,
        email: userData.email!,
        password: userData.password,
        name: userData.name || '',
        companyName: userData.companyName || '',
        phoneNumber: userData.phoneNumber || '',
        region: userData.region || '',
        position: userData.position || '',
        isAdmin: false,
        role: 'user',
        status: 'pending',
        lastLogin: null,
        permissions: [
          'view_dashboard',
          'run_scans',
          'view_reports',
          'manage_profile'
        ]
      };

      // Add to domainUsers
      users.push(newUser);
      localStorage.setItem('domainUsers', JSON.stringify(users));
      console.log('Added new user to domainUsers:', newUser);

      // Send confirmation email
      try {
        await EmailService.sendConfirmationEmail(
          newUser.email,
          newUser.password,
          newUser.name || 'User'
        );
        console.log('Confirmation email sent successfully');
      } catch (error) {
        // Remove user if email sending fails
        const updatedUsers = users.filter((u: any) => u.id !== newUser.id);
        localStorage.setItem('domainUsers', JSON.stringify(updatedUsers));
        console.error('Failed to send confirmation email:', error);
        throw new Error('Registration failed: Could not send confirmation email. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = {
        ...user,
        ...userData,
      };
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      // Get users from localStorage
      const savedUsers = localStorage.getItem('domainUsers');
      if (!savedUsers) {
        console.error('No users found in localStorage');
        throw new Error('Invalid email or password');
      }

      const users = JSON.parse(savedUsers);
      console.log('Found users in localStorage:', users);

      // Find user by email
      const foundUser = users.find((u: any) => u.email === email);
      if (!foundUser) {
        console.error('User not found:', email);
        throw new Error('Invalid email or password');
      }

      // Check user status first
      if (foundUser.status === 'pending') {
        console.error('User account not confirmed:', email);
        throw new Error('Please confirm your account through the email link first');
      }

      if (foundUser.status === 'inactive') {
        console.error('User account inactive:', email);
        throw new Error('Your account has been deactivated. Please contact an administrator');
      }

      // Verify password
      if (foundUser.password !== password) {
        console.error('Invalid password for user:', email);
        throw new Error('Invalid email or password');
      }

      // Update last login
      const updatedUsers = users.map((u: any) =>
        u.email === email ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      localStorage.setItem('domainUsers', JSON.stringify(updatedUsers));

      // Create session user (without sensitive info)
      const userToSave = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        companyName: foundUser.companyName,
        phoneNumber: foundUser.phoneNumber,
        region: foundUser.region,
        position: foundUser.position,
        role: foundUser.role,
        status: foundUser.status,
        isAdmin: foundUser.role === 'admin',
        groupId: foundUser.groupId,
        permissions: foundUser.permissions
      };

      setUser(userToSave);
      localStorage.setItem('currentUser', JSON.stringify(userToSave));
      console.log('Login successful:', userToSave);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    register,
    signOut,
    updateProfile,
    login
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 