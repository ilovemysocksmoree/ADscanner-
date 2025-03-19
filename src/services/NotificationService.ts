import { loggingService } from './LoggingService';

interface NotificationConfig {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

class NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    this.requestPermission();
    this.startNotificationCheck();
  }

  private async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  async showBrowserNotification(title: string, options: NotificationOptions = {}) {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    if (this.hasPermission) {
      const notification = new Notification(title, {
        icon: '/logo192.png', // Make sure to have this icon in your public folder
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  scheduleLocalNotification(schedule: any) {
    const schedules = this.getStoredSchedules();
    schedules.push({
      ...schedule,
      notificationShown: false,
      reminderShown: false,
    });
    localStorage.setItem('reportSchedules', JSON.stringify(schedules));
  }

  private getStoredSchedules(): any[] {
    const stored = localStorage.getItem('reportSchedules');
    return stored ? JSON.parse(stored) : [];
  }

  private checkScheduledNotifications() {
    const schedules = this.getStoredSchedules();
    const now = new Date();

    schedules.forEach((schedule, index) => {
      const nextRun = new Date(schedule.nextRun);
      const timeDiff = nextRun.getTime() - now.getTime();
      const minutesUntilRun = Math.floor(timeDiff / (1000 * 60));

      // Show reminder notification if within reminder time and hasn't been shown yet
      if (!schedule.reminderShown && minutesUntilRun <= (schedule.reminderMinutes || 30) && minutesUntilRun > 0) {
        this.showBrowserNotification('Scheduled Report Reminder', {
          body: `Your report "${schedule.name}" will run in ${minutesUntilRun} minutes.`,
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Schedule'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });

        // Mark reminder as shown
        schedules[index].reminderShown = true;
        localStorage.setItem('reportSchedules', JSON.stringify(schedules));

        // Log the notification
        loggingService.addLog(
          null,
          'REMINDER_SENT',
          `Reminder sent for scheduled report: ${schedule.name}`,
          '/reports'
        );
      }

      // Show notification when report is ready
      if (!schedule.notificationShown && timeDiff <= 0) {
        this.showBrowserNotification('Report Ready', {
          body: `Your scheduled report "${schedule.name}" is now ready.`,
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Report'
            }
          ]
        });

        // Mark notification as shown
        schedules[index].notificationShown = true;
        localStorage.setItem('reportSchedules', JSON.stringify(schedules));

        // Calculate next run time based on frequency
        const updatedSchedule = { ...schedule };
        switch (schedule.frequency) {
          case 'daily':
            nextRun.setDate(nextRun.getDate() + 1);
            break;
          case 'weekly':
            nextRun.setDate(nextRun.getDate() + 7);
            break;
          case 'monthly':
            nextRun.setMonth(nextRun.getMonth() + 1);
            break;
        }

        // Update next run time and reset notification flags
        updatedSchedule.nextRun = nextRun.toISOString();
        updatedSchedule.notificationShown = false;
        updatedSchedule.reminderShown = false;
        schedules[index] = updatedSchedule;
        localStorage.setItem('reportSchedules', JSON.stringify(schedules));
      }
    });
  }

  startNotificationCheck() {
    // Check every minute
    setInterval(() => this.checkScheduledNotifications(), 60000);
  }

  clearScheduleNotifications(scheduleId: string) {
    const schedules = this.getStoredSchedules();
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
    localStorage.setItem('reportSchedules', JSON.stringify(updatedSchedules));
  }

  updateScheduleNotifications(scheduleId: string, settings: any) {
    const schedules = this.getStoredSchedules();
    const index = schedules.findIndex(s => s.id === scheduleId);
    
    if (index !== -1) {
      schedules[index] = {
        ...schedules[index],
        ...settings,
        notificationShown: false,
        reminderShown: false,
      };
      localStorage.setItem('reportSchedules', JSON.stringify(schedules));
    }
  }
}

export const notificationService = new NotificationService(); 