import React, { useState, useEffect } from 'react';

interface AIStatusIndicatorProps {
  className?: string;
}

const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({ className = "" }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkAIStatus = async () => {
      setStatus('checking');
      try {
        // Check if API key is configured
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
          setStatus('disconnected');
          return;
        }

        // Simple test to verify AI service is working
        const testResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          headers: {
            'X-Goog-Api-Key': apiKey
          }
        });

        if (testResponse.ok) {
          setStatus('connected');
          setLastChecked(new Date());
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        console.error('AI status check failed:', error);
        setStatus('disconnected');
      }
    };

    checkAIStatus();
    // Check every 5 minutes
    const interval = setInterval(checkAIStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'AI Connected';
      case 'disconnected': return 'AI Offline';
      case 'checking': return 'Checking AI...';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '🤖';
      case 'disconnected': return '⚠️';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <span className="text-lg">{getStatusIcon()}</span>
      <span className={`font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastChecked && status === 'connected' && (
        <span className="text-xs text-gray-500">
          ({lastChecked.toLocaleTimeString()})
        </span>
      )}
    </div>
  );
};

export default AIStatusIndicator;
