import { User } from '../contexts/AuthContext';

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress?: string;
  path?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];

  addLog(user: User | null, action: string, details: string, path?: string) {
    if (!user) return;

    const logEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      action,
      details,
      path,
      ipAddress: window.location.hostname,
    };

    this.logs.push(logEntry);
    // In a real application, you would send this to your backend
    console.log('New Log Entry:', logEntry);
    
    // Store in localStorage for demo purposes
    const storedLogs = localStorage.getItem('auditLogs');
    const existingLogs = storedLogs ? JSON.parse(storedLogs) : [];
    existingLogs.push(logEntry);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs));
  }

  getLogs(): LogEntry[] {
    // In a real application, you would fetch this from your backend
    const storedLogs = localStorage.getItem('auditLogs');
    return storedLogs ? JSON.parse(storedLogs) : [];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('auditLogs');
  }
}

export const loggingService = new LoggingService(); 