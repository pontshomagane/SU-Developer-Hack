import React, { useState } from 'react';
import { WASHER_DURATIONS, DRYER_DURATIONS } from '../constants';
import { Machine, MachineType } from '../types';

interface StartCycleModalProps {
  machine: Machine;
  onClose: () => void;
  onStart: (duration: number) => Promise<void>;
}

const StartCycleModal: React.FC<StartCycleModalProps> = ({ machine, onClose, onStart }) => {
  const cycleDurations = machine.type === MachineType.Washer ? WASHER_DURATIONS : DRYER_DURATIONS;
  const [selectedDuration, setSelectedDuration] = useState<number>(cycleDurations[1].value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onStart(selectedDuration);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Start {machine.type} Cycle for Machine {machine.id}</h2>
        <p className="mb-6 text-gray-600">
          Select a cycle duration. Our AI will analyze your habits to predict when you'll collect your laundry and send personalized reminders.
        </p>
        
        <div className="space-y-3">
          {cycleDurations.map(duration => (
            <label
              key={duration.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedDuration === duration.value
                  ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="duration"
                value={duration.value}
                checked={selectedDuration === duration.value}
                onChange={() => setSelectedDuration(duration.value)}
                className="sr-only"
              />
              <span className="font-semibold text-gray-700">{duration.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-light-blue transition-colors disabled:opacity-50 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Predicting...
              </>
            ) : (
              'Start Cycle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartCycleModal;