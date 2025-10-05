import { UserNotification, QueueEntry, LaundrySlot, MachineFeedback, User } from '../types';

export class UserNotificationService {
  private static instance: UserNotificationService;
  private notifications: UserNotification[] = [];
  private queues: Map<number, QueueEntry[]> = new Map();
  private scheduledSlots: LaundrySlot[] = [];
  private feedback: MachineFeedback[] = [];

  static getInstance(): UserNotificationService {
    if (!UserNotificationService.instance) {
      UserNotificationService.instance = new UserNotificationService();
    }
    return UserNotificationService.instance;
  }

  // Queue Management
  addToQueue(machineId: number, user: User): QueueEntry {
    const queue = this.queues.get(machineId) || [];
    const position = queue.length + 1;
    
    const queueEntry: QueueEntry = {
      id: `${machineId}-${user.name}-${Date.now()}`,
      machineId,
      machineType: queue.length > 0 ? queue[0].machineType : 'Washer', // Default, should be passed
      userId: user.name,
      userName: user.name,
      residence: user.residence,
      position,
      estimatedWaitTime: this.calculateWaitTime(machineId, position),
      joinedAt: Date.now(),
      notified: false
    };

    queue.push(queueEntry);
    this.queues.set(machineId, queue);

    // Notify user about queue position
    this.createNotification(user.name, {
      type: 'queue_update',
      title: 'Added to Queue',
      message: `You're #${position} in line for machine ${machineId}. Estimated wait: ${queueEntry.estimatedWaitTime} minutes.`,
      priority: 'medium'
    });

    // Notify other users about queue changes
    this.notifyQueueUpdates(machineId);

    return queueEntry;
  }

  removeFromQueue(machineId: number, userId: string): void {
    const queue = this.queues.get(machineId) || [];
    const updatedQueue = queue.filter(entry => entry.userId !== userId);
    
    // Update positions
    updatedQueue.forEach((entry, index) => {
      entry.position = index + 1;
      entry.estimatedWaitTime = this.calculateWaitTime(machineId, index + 1);
    });

    this.queues.set(machineId, updatedQueue);
    this.notifyQueueUpdates(machineId);
  }

  notifyNextInQueue(machineId: number): void {
    const queue = this.queues.get(machineId) || [];
    if (queue.length === 0) return;

    const nextUser = queue[0];
    
    this.createNotification(nextUser.userId, {
      type: 'machine_available',
      title: 'Machine Available!',
      message: `Machine ${machineId} is now available. You're next in line!`,
      priority: 'high'
    });

    nextUser.notified = true;
  }

  private notifyQueueUpdates(machineId: number): void {
    const queue = this.queues.get(machineId) || [];
    
    queue.forEach(entry => {
      if (!entry.notified) {
        this.createNotification(entry.userId, {
          type: 'queue_update',
          title: 'Queue Update',
          message: `You're now #${entry.position} in line for machine ${machineId}.`,
          priority: 'low'
        });
      }
    });
  }

  private calculateWaitTime(machineId: number, position: number): number {
    // Estimate 60 minutes per cycle
    return position * 60;
  }

  // Slot Scheduling
  scheduleSlot(slot: LaundrySlot): void {
    this.scheduledSlots.push(slot);
    
    // Notify user about scheduled slot
    this.createNotification(slot.userId, {
      type: 'slot_reminder',
      title: 'Slot Scheduled',
      message: `Your laundry slot for ${slot.machineType} ${slot.machineId} is scheduled for ${new Date(slot.startTime).toLocaleString()}.`,
      priority: 'medium'
    });

    // Set reminder notifications
    this.scheduleReminders(slot);
  }

  cancelSlot(slotId: string): void {
    const slot = this.scheduledSlots.find(s => s.id === slotId);
    if (slot) {
      slot.status = 'cancelled';
      
      this.createNotification(slot.userId, {
        type: 'slot_reminder',
        title: 'Slot Cancelled',
        message: `Your laundry slot for ${slot.machineType} ${slot.machineId} has been cancelled.`,
        priority: 'medium'
      });
    }
  }

  private scheduleReminders(slot: LaundrySlot): void {
    const now = Date.now();
    const slotStart = slot.startTime;
    const reminderTimes = [
      slotStart - (24 * 60 * 60 * 1000), // 24 hours before
      slotStart - (60 * 60 * 1000),      // 1 hour before
      slotStart - (15 * 60 * 1000)       // 15 minutes before
    ];

    reminderTimes.forEach(reminderTime => {
      if (reminderTime > now) {
        setTimeout(() => {
          this.createNotification(slot.userId, {
            type: 'slot_reminder',
            title: 'Laundry Reminder',
            message: `Your laundry slot for ${slot.machineType} ${slot.machineId} starts ${this.getTimeUntil(reminderTime)}.`,
            priority: 'medium'
          });
        }, reminderTime - now);
      }
    });
  }

  private getTimeUntil(timestamp: number): string {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff > 24 * 60 * 60 * 1000) {
      return `in ${Math.floor(diff / (24 * 60 * 60 * 1000))} days`;
    } else if (diff > 60 * 60 * 1000) {
      return `in ${Math.floor(diff / (60 * 60 * 1000))} hours`;
    } else {
      return `in ${Math.floor(diff / (60 * 1000))} minutes`;
    }
  }

  // Forgotten Laundry Notifications
  notifyForgottenLaundry(machineId: number, forgottenUser: string, nextUser?: string): void {
    // Notify the user who forgot their laundry
    this.createNotification(forgottenUser, {
      type: 'forgotten_laundry',
      title: 'Laundry Forgotten!',
      message: `You forgot to collect your laundry from machine ${machineId}. Please collect it soon!`,
      priority: 'high'
    });

    // Optionally notify the next user in queue
    if (nextUser) {
      this.createNotification(nextUser, {
        type: 'forgotten_laundry',
        title: 'Machine Delayed',
        message: `Machine ${machineId} is delayed due to forgotten laundry. We'll notify you when it's available.`,
        priority: 'medium'
      });
    }
  }

  // Feedback System
  submitFeedback(feedback: MachineFeedback): void {
    this.feedback.push(feedback);
    
    // Notify admins about poor ratings or broken machines
    if (feedback.rating <= 2 || feedback.condition === 'broken') {
      this.createNotification('admin', {
        type: 'feedback_request',
        title: 'Machine Issue Reported',
        message: `${feedback.machineType} ${feedback.machineId} reported as ${feedback.condition} by ${feedback.userName}.`,
        priority: 'high',
        data: feedback
      });
    }

    // Thank the user for feedback
    this.createNotification(feedback.userId, {
      type: 'feedback_request',
      title: 'Thank You!',
      message: `Thank you for your feedback on ${feedback.machineType} ${feedback.machineId}. We'll look into any issues.`,
      priority: 'low'
    });
  }

  // Notification Management
  createNotification(userId: string, notification: Omit<UserNotification, 'id' | 'timestamp' | 'read'>): UserNotification {
    const newNotification: UserNotification = {
      id: `${userId}-${Date.now()}-${Math.random()}`,
      userId,
      timestamp: Date.now(),
      read: false,
      ...notification
    };

    this.notifications.push(newNotification);
    return newNotification;
  }

  getNotifications(userId: string): UserNotification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  // Getters for data
  getQueue(machineId: number): QueueEntry[] {
    return this.queues.get(machineId) || [];
  }

  getScheduledSlots(): LaundrySlot[] {
    return this.scheduledSlots.filter(slot => slot.status !== 'cancelled');
  }

  getFeedback(): MachineFeedback[] {
    return [...this.feedback];
  }

  getUserScheduledSlots(userId: string): LaundrySlot[] {
    return this.scheduledSlots.filter(slot => 
      slot.userId === userId && 
      slot.status === 'scheduled' &&
      slot.startTime > Date.now()
    );
  }

  // Cleanup old data
  cleanup(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Remove old notifications
    this.notifications = this.notifications.filter(n => n.timestamp > oneWeekAgo);
    
    // Remove old feedback
    this.feedback = this.feedback.filter(f => f.timestamp > oneWeekAgo);
    
    // Remove completed slots
    this.scheduledSlots = this.scheduledSlots.filter(slot => 
      slot.status === 'scheduled' || slot.startTime > oneWeekAgo
    );
  }
}
