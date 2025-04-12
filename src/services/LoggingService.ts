import { User, LogEvent } from '../interfaces/common';

class LoggingService {
  addLog(
    user: User,
    eventType: string,
    message: string,
    context: string
  ): void {
    const logEvent: LogEvent = {
      userId: user?.id || 'unknown',
      eventType,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Log] ${logEvent.timestamp}: ${logEvent.eventType} - ${logEvent.message}`);
    
    // Store log in localStorage for demo purposes
    // In a real application, you would send this to a server
    const existingLogs = localStorage.getItem('applicationLogs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logEvent);
    localStorage.setItem('applicationLogs', JSON.stringify(logs));
  }

  // Convenience methods
  logInfo(message: string, context: string = '{}'): void {
    const systemUser = { id: 'system' } as User;
    this.addLog(systemUser, 'INFO', message, context);
  }

  logWarning(message: string, context: string = '{}'): void {
    const systemUser = { id: 'system' } as User;
    this.addLog(systemUser, 'WARNING', message, context);
  }

  logError(message: string, context: string = '{}'): void {
    const systemUser = { id: 'system' } as User;
    this.addLog(systemUser, 'ERROR', message, context);
  }

  getLogs(): LogEvent[] {
    const existingLogs = localStorage.getItem('applicationLogs');
    return existingLogs ? JSON.parse(existingLogs) : [];
  }

  clearLogs(): void {
    localStorage.removeItem('applicationLogs');
  }
}

export const loggingService = new LoggingService(); 