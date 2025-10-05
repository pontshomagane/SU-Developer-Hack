
import React from 'react';
import { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const getStyles = () => {
    switch (notification.type) {
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '🔔';
    }
  };


  return (
    <div className={`flex items-center text-white p-3 rounded-lg shadow-lg animate-fade-in-right ${getStyles()}`}>
      <span className="mr-3 text-xl">{getIcon()}</span>
      <span>{notification.message}</span>
    </div>
  );
};

export default NotificationToast;
