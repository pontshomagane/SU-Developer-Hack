import React, { useState, useEffect } from 'react';
import { Machine, MachineType, MachineStatus, MachinePrediction, ResidenceStats } from '../types';

interface RealTimeDashboardProps {
  machines: Machine[];
  residence: string;
  predictions: MachinePrediction[];
  stats: ResidenceStats;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ 
  machines, 
  residence, 
  predictions, 
  stats 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.Free: return 'bg-green-500';
      case MachineStatus.Busy: return 'bg-blue-500';
      case MachineStatus.Idle: return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.Free: return 'Available';
      case MachineStatus.Busy: return 'In Use';
      case MachineStatus.Idle: return 'Ready for Collection';
      default: return 'Unknown';
    }
  };

  const getTimeRemaining = (machine: Machine) => {
    if (!machine.cycleEndTime) return null;
    const remaining = machine.cycleEndTime - Date.now();
    if (remaining <= 0) return 'Done';
    const minutes = Math.ceil(remaining / (1000 * 60));
    return `${minutes}m`;
  };

  const getUtilizationRate = () => {
    const busyMachines = machines.filter(m => m.status === MachineStatus.Busy).length;
    return Math.round((busyMachines / machines.length) * 100);
  };

  const getAverageWaitTime = () => {
    const idleMachines = machines.filter(m => m.status === MachineStatus.Idle);
    if (idleMachines.length === 0) return 0;
    
    const totalWaitTime = idleMachines.reduce((sum, machine) => {
      if (!machine.cycleEndTime) return sum;
      const waitTime = Date.now() - machine.cycleEndTime;
      return sum + Math.max(0, waitTime);
    }, 0);
    
    return Math.round(totalWaitTime / (idleMachines.length * 1000 * 60)); // in minutes
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Info */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Real-Time Dashboard</h2>
            <p className="text-gray-600">{residence} • {currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="text-lg font-semibold text-brand-blue">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {machines.filter(m => m.status === MachineStatus.Free).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {machines.filter(m => m.status === MachineStatus.Busy).length}
            </div>
            <div className="text-sm text-gray-600">In Use</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {machines.filter(m => m.status === MachineStatus.Idle).length}
            </div>
            <div className="text-sm text-gray-600">Ready</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {getUtilizationRate()}%
            </div>
            <div className="text-sm text-gray-600">Utilization</div>
          </div>
        </div>
      </div>

      {/* Machine Status Grid */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Machine Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className={`p-4 rounded-lg text-white relative ${
                machine.status === MachineStatus.Free ? 'bg-green-500' :
                machine.status === MachineStatus.Busy ? 'bg-blue-500' :
                'bg-orange-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-lg">{machine.type} {machine.id}</div>
                  <div className="text-sm opacity-90">{getStatusText(machine.status)}</div>
                </div>
                <div className="text-xs opacity-75">
                  {machine.status === MachineStatus.Busy && getTimeRemaining(machine)}
                </div>
              </div>
              
              {machine.user && (
                <div className="text-xs opacity-90 mt-2">
                  👤 {machine.user.name}
                </div>
              )}
              
              {machine.status === MachineStatus.Idle && (
                <div className="text-xs opacity-90 mt-1">
                  ⏰ {getAverageWaitTime()}m wait
                </div>
              )}

              {/* Status indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full ${
                  machine.status === MachineStatus.Free ? 'bg-green-300' :
                  machine.status === MachineStatus.Busy ? 'bg-blue-300' :
                  'bg-orange-300'
                } animate-pulse`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Upcoming Availability</h3>
          <div className="space-y-3">
            {predictions.map((prediction) => (
              <div key={prediction.machineId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold">
                    {prediction.machineId}
                  </div>
                  <div>
                    <div className="font-semibold">{prediction.type} {prediction.machineId}</div>
                    <div className="text-sm text-gray-600">
                      {prediction.nextUser ? `Next: ${prediction.nextUser}` : 'Available soon'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-blue">
                    ~{Math.round(prediction.estimatedFreeTime)}m
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Residence Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Residence Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-blue">{stats.totalCycles}</div>
            <div className="text-sm text-gray-600">Total Cycles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.averageWaitTime}m</div>
            <div className="text-sm text-gray-600">Avg Wait Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.utilizationRate}%</div>
            <div className="text-sm text-gray-600">Utilization</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
