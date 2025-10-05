import React, { useState, useEffect } from 'react';
import { LaundrySlot, Machine, MachineType, User } from '../types';

interface LaundrySchedulerProps {
  machines: Machine[];
  user: User;
  onScheduleSlot: (slot: Omit<LaundrySlot, 'id' | 'createdAt'>) => void;
  onCancelSlot: (slotId: string) => void;
  existingSlots: LaundrySlot[];
}

const LaundryScheduler: React.FC<LaundrySchedulerProps> = ({
  machines,
  user,
  onScheduleSlot,
  onCancelSlot,
  existingSlots
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [duration, setDuration] = useState(60);

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if a time slot is available
  const isSlotAvailable = (machineId: number, startTime: string, duration: number) => {
    const slotStart = new Date(selectedDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    return !existingSlots.some(slot => 
      slot.machineId === machineId &&
      slot.status !== 'cancelled' &&
      ((slotStart >= new Date(slot.startTime) && slotStart < new Date(slot.endTime)) ||
       (slotEnd > new Date(slot.startTime) && slotEnd <= new Date(slot.endTime)) ||
       (slotStart <= new Date(slot.startTime) && slotEnd >= new Date(slot.endTime)))
    );
  };

  const handleSchedule = () => {
    if (!selectedMachine || !selectedTimeSlot) return;

    const slotStart = new Date(selectedDate);
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    onScheduleSlot({
      machineId: selectedMachine.id,
      machineType: selectedMachine.type,
      startTime: slotStart.getTime(),
      endTime: slotEnd.getTime(),
      userId: user.name,
      userName: user.name,
      residence: user.residence,
      status: 'scheduled'
    });

    setSelectedMachine(null);
    setSelectedTimeSlot('');
  };

  const getUserSlots = () => {
    return existingSlots.filter(slot => 
      slot.userId === user.name && 
      slot.status === 'scheduled' &&
      new Date(slot.startTime) >= new Date()
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">📅 Laundry Scheduler</h3>
        <div className="text-sm text-gray-500">
          Schedule your laundry in advance
        </div>
      </div>

      {/* User's Scheduled Slots */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Your Scheduled Slots</h4>
        {getUserSlots().length === 0 ? (
          <p className="text-gray-500 text-sm">No scheduled slots</p>
        ) : (
          <div className="space-y-2">
            {getUserSlots().map(slot => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {slot.machineType} {slot.machineId} - {formatDate(new Date(slot.startTime))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                </div>
                <button
                  onClick={() => onCancelSlot(slot.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduler Form */}
      <div>
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Schedule New Slot</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

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
                    {machine.type} {machine.id} - {machine.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time and Duration Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option 
                    key={time} 
                    value={time}
                    disabled={selectedMachine ? !isSlotAvailable(selectedMachine.id, time, duration) : false}
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={75}>75 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          {/* Schedule Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSchedule}
              disabled={!selectedMachine || !selectedTimeSlot}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Schedule Slot
            </button>
          </div>

          {/* Availability Preview */}
          {selectedMachine && selectedTimeSlot && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                ✅ Slot available: {selectedMachine.type} {selectedMachine.id} on {formatDate(selectedDate)} at {selectedTimeSlot}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaundryScheduler;
