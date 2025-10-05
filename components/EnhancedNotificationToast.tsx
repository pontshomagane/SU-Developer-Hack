import React, { useEffect, useState } from 'react';
import { Notification, NotificationLevel } from '../types';

interface EnhancedNotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

const EnhancedNotificationToast: React.FC<EnhancedNotificationToastProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-dismiss after duration based on level
    const duration = getDurationForLevel(notification.level);
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [notification.level, onDismiss]);

  const getDurationForLevel = (level: NotificationLevel): number => {
    switch (level) {
      case 'normal': return 5000;
      case 'urgent': return 8000;
      case 'final': return 10000;
      default: return 5000;
    }
  };

  const getStylesForLevel = (level: NotificationLevel) => {
    switch (level) {
      case 'normal':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          icon: '🔔',
          animation: 'animate-pulse'
        };
      case 'urgent':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-400',
          icon: '⚠️',
          animation: 'animate-bounce'
        };
      case 'final':
        return {
          bg: 'bg-red-500',
          border: 'border-red-400',
          icon: '🚨',
          animation: 'animate-pulse'
        };
      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          icon: '🔔',
          animation: ''
        };
    }
  };

  const styles = getStylesForLevel(notification.level);

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${styles.bg} ${styles.border} border-2 text-white p-4 rounded-lg shadow-lg max-w-sm ${styles.animation}`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{styles.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {notification.level === 'normal' && 'Notification'}
                {notification.level === 'urgent' && 'Urgent Alert'}
                {notification.level === 'final' && 'Final Alert'}
              </h4>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className="text-white/80 hover:text-white text-lg"
              >
                ×
              </button>
            </div>
            <p className="text-sm mt-1">{notification.message}</p>
            {notification.machineId && (
              <p className="text-xs mt-1 opacity-80">Machine {notification.machineId}</p>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-white/20 rounded-full h-1">
          <div 
            className="bg-white rounded-full h-1 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotificationToast;
