import { User, Badge, LeaderboardEntry, Notification, NotificationLevel } from '../types';

// Badge definitions
export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  {
    id: 'first_cycle',
    name: 'First Steps',
    description: 'Completed your first laundry cycle',
    icon: '🌱',
    rarity: 'common'
  },
  {
    id: 'on_time_5',
    name: 'Punctual',
    description: 'Collected laundry on time 5 times',
    icon: '⏰',
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: 'Consistent',
    description: '7-day collection streak',
    icon: '🔥',
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    name: 'Dedicated',
    description: '30-day collection streak',
    icon: '💎',
    rarity: 'epic'
  },
  {
    id: 'perfect_week',
    name: 'Perfectionist',
    description: 'Perfect on-time collection for a week',
    icon: '⭐',
    rarity: 'rare'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Collected laundry 5+ minutes early 10 times',
    icon: '🐦',
    rarity: 'rare'
  },
  {
    id: 'laundry_master',
    name: 'Laundry Master',
    description: '100 cycles completed',
    icon: '👑',
    rarity: 'legendary'
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: '95%+ on-time collection rate',
    icon: '🎯',
    rarity: 'epic'
  }
];

export class GamificationService {
  private static instance: GamificationService;
  private users: Map<string, User> = new Map();
  private leaderboard: LeaderboardEntry[] = [];

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Initialize user with gamification data
  initializeUser(user: User): User {
    const enhancedUser: User = {
      ...user,
      points: user.points || 0,
      badges: user.badges || [],
      streak: user.streak || 0,
      totalCycles: user.totalCycles || 0,
      onTimeCollections: user.onTimeCollections || 0
    };
    
    this.users.set(user.name, enhancedUser);
    this.updateLeaderboard();
    return enhancedUser;
  }

  // Award points for various actions
  awardPoints(userName: string, action: string, amount: number): number {
    const user = this.users.get(userName);
    if (!user) return 0;

    let pointsAwarded = amount;
    
    // Bonus multipliers
    switch (action) {
      case 'on_time_collection':
        pointsAwarded = amount * 2; // Double points for on-time collection
        break;
      case 'early_collection':
        pointsAwarded = amount * 3; // Triple points for early collection
        break;
      case 'streak_bonus':
        pointsAwarded = amount * user.streak; // Streak multiplier
        break;
    }

    user.points += pointsAwarded;
    this.updateLeaderboard();
    return pointsAwarded;
  }

  // Check and award badges
  checkBadges(userName: string): Badge[] {
    const user = this.users.get(userName);
    if (!user) return [];

    const newBadges: Badge[] = [];
    const existingBadgeIds = user.badges.map(b => b.id);

    for (const badgeDef of BADGE_DEFINITIONS) {
      if (existingBadgeIds.includes(badgeDef.id)) continue;

      let shouldAward = false;

      switch (badgeDef.id) {
        case 'first_cycle':
          shouldAward = user.totalCycles >= 1;
          break;
        case 'on_time_5':
          shouldAward = user.onTimeCollections >= 5;
          break;
        case 'streak_7':
          shouldAward = user.streak >= 7;
          break;
        case 'streak_30':
          shouldAward = user.streak >= 30;
          break;
        case 'perfect_week':
          shouldAward = user.onTimeCollections >= 7 && user.totalCycles >= 7;
          break;
        case 'early_bird':
          const earlyCollections = user.delayHistory.filter(d => d < 0).length;
          shouldAward = earlyCollections >= 10;
          break;
        case 'laundry_master':
          shouldAward = user.totalCycles >= 100;
          break;
        case 'efficiency_expert':
          const onTimeRate = user.totalCycles > 0 ? (user.onTimeCollections / user.totalCycles) * 100 : 0;
          shouldAward = onTimeRate >= 95;
          break;
      }

      if (shouldAward) {
        const newBadge: Badge = {
          ...badgeDef,
          earnedAt: Date.now()
        };
        user.badges.push(newBadge);
        newBadges.push(newBadge);
      }
    }

    if (newBadges.length > 0) {
      this.updateLeaderboard();
    }

    return newBadges;
  }

  // Update user stats after cycle completion
  updateUserStats(userName: string, wasOnTime: boolean, delayMinutes: number): void {
    const user = this.users.get(userName);
    if (!user) return;

    user.totalCycles++;
    
    if (wasOnTime) {
      user.onTimeCollections++;
      user.streak++;
      this.awardPoints(userName, 'on_time_collection', 10);
    } else {
      user.streak = 0; // Reset streak if late
    }

    // Award points based on delay
    if (delayMinutes < 0) {
      this.awardPoints(userName, 'early_collection', Math.abs(delayMinutes));
    } else if (delayMinutes === 0) {
      this.awardPoints(userName, 'on_time_collection', 15);
    }

    // Check for new badges
    this.checkBadges(userName);
  }

  // Get leaderboard
  getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  // Update leaderboard
  private updateLeaderboard(): void {
    this.leaderboard = Array.from(this.users.values())
      .map(user => ({
        name: user.name,
        residence: user.residence,
        points: user.points,
        badges: user.badges.length,
        streak: user.streak,
        onTimeRate: user.totalCycles > 0 ? (user.onTimeCollections / user.totalCycles) * 100 : 0
      }))
      .sort((a, b) => b.points - a.points);
  }

  // Get user by name
  getUser(userName: string): User | undefined {
    return this.users.get(userName);
  }

  // Get residence stats
  getResidenceStats(residence: string): any {
    const residenceUsers = Array.from(this.users.values())
      .filter(user => user.residence === residence);

    const totalCycles = residenceUsers.reduce((sum, user) => sum + user.totalCycles, 0);
    const totalPoints = residenceUsers.reduce((sum, user) => sum + user.points, 0);
    const averageOnTimeRate = residenceUsers.length > 0 
      ? residenceUsers.reduce((sum, user) => sum + (user.onTimeCollections / Math.max(user.totalCycles, 1)) * 100, 0) / residenceUsers.length
      : 0;

    return {
      totalUsers: residenceUsers.length,
      totalCycles,
      totalPoints,
      averageOnTimeRate: Math.round(averageOnTimeRate),
      topUsers: residenceUsers
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)
        .map(user => ({
          name: user.name,
          residence: user.residence,
          points: user.points,
          badges: user.badges.length,
          streak: user.streak,
          onTimeRate: user.totalCycles > 0 ? (user.onTimeCollections / user.totalCycles) * 100 : 0
        }))
    };
  }
}

// Notification service for escalation levels
export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create notification with escalation logic
  createNotification(
    message: string, 
    level: NotificationLevel, 
    machineId?: number
  ): Notification {
    const notification: Notification = {
      id: Date.now() + Math.random(),
      message,
      type: this.getNotificationType(level),
      level,
      machineId,
      timestamp: Date.now(),
      read: false
    };

    this.notifications.push(notification);
    return notification;
  }

  // Get notification type based on level
  private getNotificationType(level: NotificationLevel): Notification['type'] {
    switch (level) {
      case 'normal': return 'info';
      case 'urgent': return 'warning';
      case 'final': return 'urgent';
      default: return 'info';
    }
  }

  // Get notifications for user
  getNotifications(userName: string): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Clear old notifications
  clearOldNotifications(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => n.timestamp > oneHourAgo);
  }
}
