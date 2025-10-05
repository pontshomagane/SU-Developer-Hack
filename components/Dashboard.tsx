import React, { useState } from 'react';
import { Machine, User, MachineType } from '../types';
import MachineCard from './MachineCard';
import MachineListItem from './MachineListItem';
import DashboardViewToggle from './DashboardViewToggle';

interface DashboardProps {
  washers: Machine[];
  dryers: Machine[];
  currentUser: User;
  onStart: (machine: Machine) => void;
  onCollect: (machineId: number) => void;
  onForgottenLaundry?: (machineId: number, forgottenUser: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ washers, dryers, currentUser, onStart, onCollect, onForgottenLaundry }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<MachineType>(MachineType.Washer);

  const machinesToDisplay = activeTab === MachineType.Washer ? washers : dryers;

  const TabButton: React.FC<{ type: MachineType, label: string }> = ({ type, label }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-6 py-2 text-lg font-semibold rounded-t-lg transition-colors duration-300 focus:outline-none ${
        activeTab === type
          ? 'bg-white text-brand-blue border-b-0'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      aria-pressed={activeTab === type}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center border-b mb-4">
          <div className="flex space-x-2">
            <TabButton type={MachineType.Washer} label="Washers" />
            <TabButton type={MachineType.Dryer} label="Dryers" />
          </div>
          <DashboardViewToggle currentView={view} onViewChange={setView} />
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {machinesToDisplay.map(machine => (
            <MachineCard
              key={machine.id}
              machine={machine}
              currentUser={currentUser}
              onStart={onStart}
              onCollect={onCollect}
              onForgottenLaundry={onForgottenLaundry}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {machinesToDisplay.map(machine => (
            <MachineListItem
              key={machine.id}
              machine={machine}
              currentUser={currentUser}
              onStart={onStart}
              onCollect={onCollect}
              onForgottenLaundry={onForgottenLaundry}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;