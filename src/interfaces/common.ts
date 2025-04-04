// Common interfaces used across multiple components

export interface User {
  id: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
  roles?: string[];
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
  details?: {
    source?: string;
    affectedSystem?: string;
    recommendedAction?: string;
    [key: string]: any; // For additional custom details
  };
}

// Reusable logging event type
export interface LogEvent {
  userId: string;
  eventType: string;
  message: string;
  context: string;
  timestamp: string;
} 