import React from 'react';
import { Machine, User, MachineStatus, MachineType } from '../types';
import { RESIDENCES } from '../constants';

interface AdminDashboardProps {
  allMachines: Record<string, Machine[]>;
}

const ResidenceStatusCard: React.FC<{ residence: string, machines: Machine[] }> = ({ residence, machines }) => {
  const washers = machines.filter(m => m.type === MachineType.Washer);
  const dryers = machines.filter(m => m.type === MachineType.Dryer);

  const getCounts = (machineList: Machine[]) => ({
    free: machineList.filter(m => m.status === MachineStatus.Free).length,
    busy: machineList.filter(m => m.status === MachineStatus.Busy).length,
    idle: machineList.filter(m => m.status === MachineStatus.Idle).length,
    total: machineList.length,
  });

  const washerCounts = getCounts(washers);
  const dryerCounts = getCounts(dryers);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-blue">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{residence}</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Washers ({washerCounts.total})</h4>
          <div className="space-y-1 text-sm">
             <div className="flex justify-between items-center">
              <span className="text-gray-600">Free:</span>
              <span className="font-semibold text-brand-green">{washerCounts.free}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Busy:</span>
              <span className="font-semibold text-brand-light-blue">{washerCounts.busy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Idle:</span>
              <span className="font-semibold text-brand-red">{washerCounts.idle}</span>
            </div>
          </div>
        </div>
         <div>
          <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Dryers ({dryerCounts.total})</h4>
          <div className="space-y-1 text-sm">
             <div className="flex justify-between items-center">
              <span className="text-gray-600">Free:</span>
              <span className="font-semibold text-brand-green">{dryerCounts.free}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Busy:</span>
              <span className="font-semibold text-brand-light-blue">{dryerCounts.busy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Idle:</span>
              <span className="font-semibold text-brand-red">{dryerCounts.idle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allMachines }) => {
  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Residence Usage Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {RESIDENCES.map(residence => (
          <ResidenceStatusCard 
            key={residence}
            residence={residence}
            machines={allMachines[residence]}
          />
        ))}
      </div>
    </>
  );
};

export default AdminDashboard;