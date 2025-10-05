export enum MachineStatus {
  Free = 'Free',
  Busy = 'Busy',
  Idle = 'Idle', // Finished but not collected
}

export enum MachineType {
  Washer = 'Washer',
  Dryer = 'Dryer',
}

export interface User {
  name: string;
  residence: string;
  delayHistory: number[]; // in minutes
  role: 'student' | 'admin';
  points: number;
  badges: Badge[];
  streak: number;
  totalCycles: number;
  onTimeCollections: number;
}

export interface Machine {
  id: number;
  type: MachineType;
  status: MachineStatus;
  user: { name: string; residence: string } | null; // User simplified to not carry full history in machine object
  cycleEndTime: number | null; // as timestamp
  predictedEndTime: number | null; // as timestamp
  notifiedAlmostDone: boolean;
  notificationLevel: NotificationLevel;
  lastUsed: number | null;
  totalUsage: number;
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent' | 'final';
  level: NotificationLevel;
  machineId?: number;
  timestamp: number;
  read: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  name: string;
  residence: string;
  points: number;
  badges: number;
  streak: number;
  onTimeRate: number;
}

export interface ResidenceStats {
  name: string;
  totalMachines: number;
  activeUsers: number;
  totalCycles: number;
  averageWaitTime: number;
  utilizationRate: number;
  topUsers: LeaderboardEntry[];
}

export interface MachinePrediction {
  machineId: number;
  type: MachineType;
  estimatedFreeTime: number;
  confidence: number;
  nextUser?: string;
}

export type NotificationLevel = 'normal' | 'urgent' | 'final';

export interface LaundrySlot {
  id: string;
  machineId: number;
  machineType: MachineType;
  startTime: number;
  endTime: number;
  userId: string;
  userName: string;
  residence: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface MachineFeedback {
  id: string;
  machineId: number;
  machineType: MachineType;
  userId: string;
  userName: string;
  residence: string;
  rating: number; // 1-5 stars
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  issues: string[];
  comments: string;
  timestamp: number;
  resolved: boolean;
}

export interface QueueEntry {
  id: string;
  machineId: number;
  machineType: MachineType;
  userId: string;
  userName: string;
  residence: string;
  position: number;
  estimatedWaitTime: number;
  joinedAt: number;
  notified: boolean;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'queue_update' | 'slot_reminder' | 'machine_available' | 'feedback_request' | 'forgotten_laundry';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}
