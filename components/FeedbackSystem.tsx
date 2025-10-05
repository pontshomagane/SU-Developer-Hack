import React, { useState } from 'react';
import { MachineFeedback, Machine, User } from '../types';

interface FeedbackSystemProps {
  machines: Machine[];
  user: User;
  onSubmitFeedback: (feedback: Omit<MachineFeedback, 'id' | 'timestamp'>) => void;
  existingFeedback: MachineFeedback[];
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  machines,
  user,
  onSubmitFeedback,
  existingFeedback
}) => {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [rating, setRating] = useState(0);
  const [condition, setCondition] = useState<MachineFeedback['condition']>('good');
  const [issues, setIssues] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const issueOptions = [
    'Machine not starting',
    'Water not draining',
    'Door not closing',
    'Unusual noise',
    'Vibration issues',
    'Display not working',
    'Detergent dispenser broken',
    'Timer not accurate',
    'Water temperature issues',
    'Other'
  ];

  const handleIssueToggle = (issue: string) => {
    setIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleSubmit = () => {
    if (!selectedMachine || rating === 0) return;

    onSubmitFeedback({
      machineId: selectedMachine.id,
      machineType: selectedMachine.type,
      userId: user.name,
      userName: user.name,
      residence: user.residence,
      rating,
      condition,
      issues,
      comments,
      resolved: false
    });

    // Reset form
    setSelectedMachine(null);
    setRating(0);
    setCondition('good');
    setIssues([]);
    setComments('');
    setShowFeedbackForm(false);
  };

  const getMachineAverageRating = (machineId: number) => {
    const machineFeedback = existingFeedback.filter(f => f.machineId === machineId);
    if (machineFeedback.length === 0) return 0;
    
    const totalRating = machineFeedback.reduce((sum, f) => sum + f.rating, 0);
    return (totalRating / machineFeedback.length).toFixed(1);
  };

  const getConditionColor = (condition: MachineFeedback['condition']) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'broken': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            className={`text-2xl ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">⭐ Machine Feedback</h3>
        <button
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-light-blue transition-colors"
        >
          {showFeedbackForm ? 'Hide Form' : 'Report Issue'}
        </button>
      </div>

      {/* Machine Status Overview */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Machine Conditions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machines.map(machine => {
            const avgRating = getMachineAverageRating(machine.id);
            const recentFeedback = existingFeedback
              .filter(f => f.machineId === machine.id)
              .sort((a, b) => b.timestamp - a.timestamp)[0];
            
            return (
              <div key={machine.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{machine.type} {machine.id}</div>
                    <div className="text-sm text-gray-600">Status: {machine.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Avg Rating</div>
                    <div className="font-bold">{avgRating}/5</div>
                  </div>
                </div>
                
                {recentFeedback && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(recentFeedback.condition)}`}>
                        {recentFeedback.condition}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(recentFeedback.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {recentFeedback.issues.length > 0 && (
                      <div className="mt-1 text-xs text-red-600">
                        Issues: {recentFeedback.issues.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Submit Feedback</h4>
          
          <div className="space-y-4">
            {/* Machine Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Machine
              </label>
              <select
                value={selectedMachine?.id || ''}
                onChange={(e) => {
                  const machine = machines.find(m => m.id === parseInt(e.target.value));
                  setSelectedMachine(machine || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Choose a machine</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.type} {machine.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              {renderStars(rating, true)}
              <div className="text-sm text-gray-600 mt-1">
                {rating === 0 && 'Click stars to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as MachineFeedback['condition'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="excellent">Excellent - Like new</option>
                <option value="good">Good - Minor wear</option>
                <option value="fair">Fair - Some issues</option>
                <option value="poor">Poor - Multiple problems</option>
                <option value="broken">Broken - Not working</option>
              </select>
            </div>

            {/* Issues */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issues (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {issueOptions.map(issue => (
                  <label key={issue} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={issues.includes(issue)}
                      onChange={() => handleIssueToggle(issue)}
                      className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="text-sm">{issue}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe any issues or suggestions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedMachine || rating === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      <div className="mt-6 border-t pt-6">
        <h4 className="font-semibold mb-3">Recent Feedback</h4>
        {existingFeedback.length === 0 ? (
          <p className="text-gray-500 text-sm">No feedback submitted yet</p>
        ) : (
          <div className="space-y-3">
            {existingFeedback
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map(feedback => (
                <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        {feedback.machineType} {feedback.machineId} - {feedback.userName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(feedback.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(feedback.rating)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(feedback.condition)}`}>
                        {feedback.condition}
                      </span>
                    </div>
                  </div>
                  
                  {feedback.issues.length > 0 && (
                    <div className="text-sm text-red-600 mb-1">
                      Issues: {feedback.issues.join(', ')}
                    </div>
                  )}
                  
                  {feedback.comments && (
                    <div className="text-sm text-gray-700">
                      "{feedback.comments}"
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;
