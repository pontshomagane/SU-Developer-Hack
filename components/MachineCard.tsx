import React, { useState, useEffect } from 'react';
import { Machine, User, MachineStatus, MachineType } from '../types';

interface MachineCardProps {
  machine: Machine;
  currentUser: User;
  onStart: (machine: Machine) => void;
  onCollect: (machineId: number) => void;
}

const CountdownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
  const calculateRemainingTime = () => {
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  };

  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
  const seconds = Math.floor((remainingTime / 1000) % 60);

  return (
    <span className="font-mono text-lg">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
  );
};


const MachineCard: React.FC<MachineCardProps> = ({ machine, currentUser, onStart, onCollect }) => {
  const getStatusStyles = () => {
    switch (machine.status) {
      case MachineStatus.Free:
        return 'border-brand-green bg-green-50';
      case MachineStatus.Busy:
        return 'border-brand-light-blue bg-blue-50';
      case MachineStatus.Idle:
        return 'border-brand-red bg-red-50 animate-pulse';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const isCurrentUserMachine = machine.user?.name === currentUser.name && machine.user?.residence === currentUser.residence;

  const MachineIcon = machine.type === MachineType.Washer ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.636 6.636a.75.75 0 011.06 0l.071.071a.75.75 0 010 1.06L6.06 9.475a.75.75 0 01-1.06-1.06l1.636-1.637zM9 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 019 10zm2.25.75a.75.75 0 000-1.5h.5a.75.75 0 000 1.5h-.5zM10 14a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 01.75.75zm2.364-3.364a.75.75 0 010 1.06l-1.768 1.768a.75.75 0 11-1.06-1.06l1.768-1.768a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 11.458 2.905A3.502 3.502 0 006.5 10H4.25a.75.75 0 000 1.5h2.25a3.5 3.5 0 006.992.095 1.5 1.5 0 112.915-.595A6.503 6.503 0 0010 3.5zM10 7a1 1 0 100-2 1 1 0 000 2z" /></svg>
  );

  return (
    <div className={`p-4 rounded-lg shadow-md border-t-4 transition-all duration-300 ${getStatusStyles()}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
            {MachineIcon}
            <h3 className="text-xl font-bold text-gray-800">Machine {machine.id}</h3>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${
          machine.status === MachineStatus.Free ? 'bg-brand-green' : 
          machine.status === MachineStatus.Busy ? 'bg-brand-light-blue' : 'bg-brand-red'
        }`}>
          {machine.status}
        </span>
      </div>
      <div className="h-24 flex flex-col items-center justify-center">
        {machine.status === MachineStatus.Busy && machine.cycleEndTime && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">Time Remaining</p>
            <CountdownTimer endTime={machine.cycleEndTime} />
            <p className="text-xs text-gray-400 mt-1">
              By: {isCurrentUserMachine ? 'You' : machine.user?.name}
            </p>
          </div>
        )}
        {machine.status === MachineStatus.Idle && (
          <div className="text-center">
            <p className="text-brand-red font-semibold">Finished!</p>
            <p className="text-sm text-gray-600">Please collect your laundry.</p>
             <p className="text-xs text-gray-400 mt-1">
              By: {isCurrentUserMachine ? 'You' : machine.user?.name}
            </p>
          </div>
        )}
        {machine.status === MachineStatus.Free && (
            <p className="text-gray-500">Ready to use</p>
        )}
      </div>
      <div className="mt-4">
        {machine.status === MachineStatus.Free && (
          <button
            onClick={() => onStart(machine)}
            className="w-full bg-brand-green text-white py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Start Cycle
          </button>
        )}
        {machine.status === MachineStatus.Idle && isCurrentUserMachine && (
          <button
            onClick={() => onCollect(machine.id)}
            className="w-full bg-brand-red text-white py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Collect Laundry
          </button>
        )}
      </div>
    </div>
  );
};

export default MachineCard;