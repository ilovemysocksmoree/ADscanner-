import React, { createContext, useContext, useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';

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
      }
    };

    // Check if user is logged in and initialize default users
    const checkAuth = async () => {
      try {
        initializeDefaultUsers();
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
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
        isAdmin: false
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
      const mockUser: User = {
        id: '3',
        email: userData.email!,
        name: userData.name,
        companyName: userData.companyName,
        phoneNumber: userData.phoneNumber,
        region: userData.region,
        position: userData.position,
        isAdmin: false // New registrations are always regular users
      };
      setUser(mockUser);
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
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
      };

      setUser(userToSave);
      localStorage.setItem('currentUser', JSON.stringify(userToSave));
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