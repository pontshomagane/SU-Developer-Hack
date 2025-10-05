import React, { useState } from 'react';
import { User, Badge, LeaderboardEntry } from '../types';

interface GamificationPanelProps {
  user: User;
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({ user, leaderboard, onClose }) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard' | 'stats'>('badges');

  const getBadgeRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-400';
      case 'rare': return 'bg-blue-400';
      case 'epic': return 'bg-purple-400';
      case 'legendary': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  const getBadgeRarityGlow = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-400/50';
      case 'rare': return 'shadow-blue-400/50';
      case 'epic': return 'shadow-purple-400/50';
      case 'legendary': return 'shadow-yellow-400/50';
      default: return 'shadow-gray-400/50';
    }
  };

  const onTimeRate = user.totalCycles > 0 ? (user.onTimeCollections / user.totalCycles) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-light-blue p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🏆 DYP Aura Gamification</h2>
              <p className="text-blue-100">Level up your laundry game!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* User Stats Summary */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{user.points}</div>
              <div className="text-xs text-blue-100">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user.badges.length}</div>
              <div className="text-xs text-blue-100">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user.streak}</div>
              <div className="text-xs text-blue-100">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(onTimeRate)}%</div>
              <div className="text-xs text-blue-100">On-Time</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'badges' 
                ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏅 Badges
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'leaderboard' 
                ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'stats' 
                ? 'text-brand-blue border-b-2 border-brand-blue bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Stats
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'badges' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
              {user.badges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏅</div>
                  <p>No badges yet! Start using DYP Aura to earn your first badge.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg border-2 ${getBadgeRarityColor(badge.rarity)} text-white shadow-lg ${getBadgeRarityGlow(badge.rarity)}`}
                    >
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs opacity-90 mt-1">{badge.description}</div>
                      <div className="text-xs opacity-75 mt-2">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Residence Leaderboard</h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.name}
                    className={`flex items-center p-3 rounded-lg ${
                      entry.name === user.name 
                        ? 'bg-brand-blue text-white' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{entry.name}</div>
                      <div className="text-sm opacity-75">{entry.residence}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.points} pts</div>
                      <div className="text-xs opacity-75">{entry.badges} badges</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-brand-blue">{user.totalCycles}</div>
                    <div className="text-sm text-gray-600">Total Cycles</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user.onTimeCollections}</div>
                    <div className="text-sm text-gray-600">On-Time Collections</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{user.streak}</div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(onTimeRate)}%</div>
                    <div className="text-sm text-gray-600">On-Time Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;
