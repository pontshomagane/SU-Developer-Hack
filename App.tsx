import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Machine, User, Notification, MachineStatus, ChatMessage, MachineType, Badge, LeaderboardEntry, ResidenceStats, MachinePrediction, NotificationLevel, LaundrySlot, MachineFeedback, UserNotification } from './types';
import { TOTAL_WASHERS, TOTAL_DRYERS, RESIDENCES } from './constants';
import { predictDelay, getChatbotResponse } from './services/geminiService';
import { GamificationService, NotificationService } from './services/gamificationService';
import { UserNotificationService } from './services/notificationService';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import StartCycleModal from './components/StartCycleModal';
import EnhancedNotificationToast from './components/EnhancedNotificationToast';
import Chatbot from './components/Chatbot';
import ProfilePage from './components/ProfilePage';
import AIStatusIndicator from './components/AIStatusIndicator';
import GamificationPanel from './components/GamificationPanel';
import RealTimeDashboard from './components/RealTimeDashboard';
import LaundryScheduler from './components/LaundryScheduler';
import FeedbackSystem from './components/FeedbackSystem';

const initializeMachines = (): Record<string, Machine[]> => {
  const machineState: Record<string, Machine[]> = {};
  RESIDENCES.forEach(res => {
    const washers = Array.from({ length: TOTAL_WASHERS }, (_, i) => ({
      id: i + 1,
      type: MachineType.Washer,
      status: MachineStatus.Free,
      user: null,
      cycleEndTime: null,
      predictedEndTime: null,
      notifiedAlmostDone: false,
      notificationLevel: 'normal' as NotificationLevel,
      lastUsed: null,
      totalUsage: 0,
    }));
    const dryers = Array.from({ length: TOTAL_DRYERS }, (_, i) => ({
      id: TOTAL_WASHERS + i + 1,
      type: MachineType.Dryer,
      status: MachineStatus.Free,
      user: null,
      cycleEndTime: null,
      predictedEndTime: null,
      notifiedAlmostDone: false,
      notificationLevel: 'normal' as NotificationLevel,
      lastUsed: null,
      totalUsage: 0,
    }));
    machineState[res] = [...washers, ...dryers];
  });
  return machineState;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allMachines, setAllMachines] = useState<Record<string, Machine[]>>(initializeMachines);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showGamification, setShowGamification] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [residenceStats, setResidenceStats] = useState<ResidenceStats | null>(null);
  const [predictions, setPredictions] = useState<MachinePrediction[]>([]);
  const [scheduledSlots, setScheduledSlots] = useState<LaundrySlot[]>([]);
  const [machineFeedback, setMachineFeedback] = useState<MachineFeedback[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const gamificationService = GamificationService.getInstance();
  const notificationService = NotificationService.getInstance();
  const userNotificationService = UserNotificationService.getInstance();

  const addNotification = useCallback((message: string, level: NotificationLevel, machineId?: number) => {
    const notification = notificationService.createNotification(message, level, machineId);
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove based on level
    const duration = level === 'normal' ? 5000 : level === 'urgent' ? 8000 : 10000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, duration);
  }, [notificationService]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setAllMachines(prevAllMachines => {
        const newAllMachines = { ...prevAllMachines };
        for (const residence in newAllMachines) {
          newAllMachines[residence] = newAllMachines[residence].map(machine => {
            if (machine.status === MachineStatus.Busy && machine.cycleEndTime) {
              const timeRemaining = machine.cycleEndTime - now;
              
              // Escalation notifications
              if (!machine.notifiedAlmostDone) {
                if (timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
                  if (machine.user?.name === user?.name && machine.user?.residence === user?.residence) {
                    addNotification(`${machine.type} ${machine.id} is almost done!`, 'normal', machine.id);
                  }
                  return { ...machine, notifiedAlmostDone: true, notificationLevel: 'normal' };
                }
              }
              
              // Urgent notification (2 minutes remaining)
              if (timeRemaining < 2 * 60 * 1000 && timeRemaining > 0 && machine.notificationLevel === 'normal') {
                if (machine.user?.name === user?.name && machine.user?.residence === user?.residence) {
                  addNotification(`URGENT: ${machine.type} ${machine.id} finishing in 2 minutes!`, 'urgent', machine.id);
                }
                return { ...machine, notificationLevel: 'urgent' };
              }
              
              // Final alert (cycle finished)
              if (now >= machine.cycleEndTime) {
                if (machine.user?.name === user?.name && machine.user?.residence === user?.residence) {
                  addNotification(`FINAL ALERT: Your laundry in ${machine.type} ${machine.id} is done!`, 'final', machine.id);
                }
                return { 
                  ...machine, 
                  status: MachineStatus.Idle, 
                  notificationLevel: 'final',
                  lastUsed: now,
                  totalUsage: machine.totalUsage + 1
                };
              }
            }
            
            // Idle too long escalation
            if (machine.status === MachineStatus.Idle && machine.cycleEndTime) {
              const idleTime = now - machine.cycleEndTime;
              if (idleTime > 30 * 60 * 1000 && machine.notificationLevel !== 'final') { // 30 minutes
                if (machine.user?.name === user?.name && machine.user?.residence === user?.residence) {
                  addNotification(`Your laundry in ${machine.type} ${machine.id} has been ready for 30+ minutes!`, 'urgent', machine.id);
                }
                return { ...machine, notificationLevel: 'urgent' };
              }
            }
            
            return machine;
          });
        }
        return newAllMachines;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [user, addNotification]);

  const handleLogin = (name: string, residence: string) => {
    const isAdmin = name.toLowerCase() === 'admin';
    const newUser = { 
      name, 
      residence: isAdmin ? '' : residence, 
      delayHistory: [],
      role: isAdmin ? 'admin' : 'student',
      points: 0,
      badges: [],
      streak: 0,
      totalCycles: 0,
      onTimeCollections: 0
    };
    
    const enhancedUser = gamificationService.initializeUser(newUser);
    setUser(enhancedUser);
    
    // Update leaderboard and stats
    setLeaderboard(gamificationService.getLeaderboard());
    if (!isAdmin && residence) {
      setResidenceStats(gamificationService.getResidenceStats(residence));
    }
    
    addNotification(`Welcome to DYP Aura, ${name}! 🎉`, 'normal');
  };
  
  const handleLogout = () => {
    addNotification(`Goodbye, ${user?.name}!`, 'info');
    setUser(null);
  };

  const handleOpenModal = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleStartCycle = async (duration: number): Promise<void> => {
    if (!selectedMachine || !user || user.role === 'admin') return;
    const residence = user.residence;

    try {
      const { predicted_delay_minutes, reminder_message } = await predictDelay(user.delayHistory, duration);
      
      const now = new Date();
      const cycleEndTime = new Date(now.getTime() + duration * 60 * 1000);
      const predictedEndTime = new Date(cycleEndTime.getTime() + predicted_delay_minutes * 60 * 1000);
      
      setAllMachines(prev => {
        const newMachinesForResidence = prev[residence].map(m =>
          m.id === selectedMachine.id ? {
            ...m, status: MachineStatus.Busy, user: { name: user.name, residence: user.residence },
            cycleEndTime: cycleEndTime.getTime(), predictedEndTime: predictedEndTime.getTime(),
            notifiedAlmostDone: false,
          } : m
        );
        return { ...prev, [residence]: newMachinesForResidence };
      });

      addNotification(`Cycle started for ${selectedMachine.type} ${selectedMachine.id}!`, 'success');
      setTimeout(() => { if(user) addNotification(reminder_message, 'info'); }, 2000);

    } catch (error) {
      console.error("Error predicting delay:", error);
      addNotification("Could not get AI prediction. Using standard timer.", "warning");
      const now = new Date();
      const cycleEndTime = new Date(now.getTime() + duration * 60 * 1000);
       setAllMachines(prev => {
        const newMachinesForResidence = prev[residence].map(m =>
          m.id === selectedMachine.id ? {
            ...m, status: MachineStatus.Busy, user: { name: user.name, residence: user.residence },
            cycleEndTime: cycleEndTime.getTime(), predictedEndTime: cycleEndTime.getTime(),
            notifiedAlmostDone: false,
          } : m
        );
        return { ...prev, [residence]: newMachinesForResidence };
      });
    } finally {
        setIsModalOpen(false);
        setSelectedMachine(null);
    }
  };

  const handleCollectLaundry = (machineId: number) => {
    if (!user || user.role === 'admin') return;
    const residence = user.residence;
    const machine = allMachines[residence].find(m => m.id === machineId);
    if (!machine || !machine.cycleEndTime) return;

    const delay = Math.round((Date.now() - machine.cycleEndTime) / (60 * 1000));
    const positiveDelay = Math.max(0, delay);
    const wasOnTime = delay <= 5; // Consider on-time if within 5 minutes

    // Update gamification
    gamificationService.updateUserStats(user.name, wasOnTime, delay);
    const newBadges = gamificationService.checkBadges(user.name);
    const updatedUser = gamificationService.getUser(user.name);
    
    if (updatedUser) {
      setUser(updatedUser);
      setLeaderboard(gamificationService.getLeaderboard());
      setResidenceStats(gamificationService.getResidenceStats(residence));
    }

    // Show badge notifications
    newBadges.forEach(badge => {
      addNotification(`🏆 New Badge Earned: ${badge.name}! ${badge.icon}`, 'normal');
    });

    setAllMachines(prev => {
      const newMachinesForResidence = prev[residence].map(m =>
        m.id === machineId ? {
          ...m, 
          status: MachineStatus.Free, 
          user: null, 
          cycleEndTime: null,
          predictedEndTime: null, 
          notifiedAlmostDone: false,
          notificationLevel: 'normal' as NotificationLevel,
        } : m
      );
      return { ...prev, [residence]: newMachinesForResidence };
    });

    const message = wasOnTime 
      ? `🎉 Great job! Collected laundry on time from ${machine.type} ${machineId}. +${gamificationService.awardPoints(user.name, 'on_time_collection', 10)} points!`
      : `Collected laundry from ${machine.type} ${machineId}. Keep improving!`;
    
    addNotification(message, 'normal');
  };

  const handleChatSubmit = async (message: string, setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>) => {
      setHistory(prev => [...prev, { sender: 'user', text: message }]);
      if (!user || user.role === 'admin') {
         setHistory(prev => [...prev, { sender: 'bot', text: "Chat is for students. Please log in." }]);
         return;
      }
      try {
        const response = await getChatbotResponse(message, allMachines[user.residence]);
        setHistory(prev => [...prev, { sender: 'bot', text: response }]);
      } catch (error) {
        console.error("Chatbot error:", error);
        setHistory(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting." }]);
      }
  };

  // Scheduler handlers
  const handleScheduleSlot = (slotData: Omit<LaundrySlot, 'id' | 'createdAt'>) => {
    const newSlot: LaundrySlot = {
      ...slotData,
      id: `${slotData.machineId}-${slotData.userId}-${Date.now()}`,
      createdAt: Date.now()
    };
    
    userNotificationService.scheduleSlot(newSlot);
    setScheduledSlots(prev => [...prev, newSlot]);
    addNotification(`Slot scheduled for ${newSlot.machineType} ${newSlot.machineId}!`, 'normal');
  };

  const handleCancelSlot = (slotId: string) => {
    userNotificationService.cancelSlot(slotId);
    setScheduledSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, status: 'cancelled' as const } : slot
    ));
    addNotification('Slot cancelled successfully', 'normal');
  };

  // Feedback handlers
  const handleSubmitFeedback = (feedbackData: Omit<MachineFeedback, 'id' | 'timestamp'>) => {
    const newFeedback: MachineFeedback = {
      ...feedbackData,
      id: `${feedbackData.machineId}-${feedbackData.userId}-${Date.now()}`,
      timestamp: Date.now()
    };
    
    userNotificationService.submitFeedback(newFeedback);
    setMachineFeedback(prev => [...prev, newFeedback]);
    addNotification('Thank you for your feedback!', 'normal');
  };

  // Forgotten laundry notification
  const handleForgottenLaundry = (machineId: number, forgottenUser: string) => {
    const queue = userNotificationService.getQueue(machineId);
    const nextUser = queue.length > 0 ? queue[0].userId : undefined;
    
    userNotificationService.notifyForgottenLaundry(machineId, forgottenUser, nextUser);
    addNotification(`Notified ${forgottenUser} about forgotten laundry`, 'normal');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  
  const residenceMachines = allMachines[user.residence] || [];
  const washers = residenceMachines.filter(m => m.type === MachineType.Washer);
  const dryers = residenceMachines.filter(m => m.type === MachineType.Dryer);


  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 font-sans">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-brand-blue">
                <Link to="/">DYP <span className="text-brand-light-blue">Aura</span></Link>
              </h1>
              <p className="text-sm text-gray-500">An intelligent aura for your laundry space</p>
            </div>
            <div className="flex items-center space-x-4">
              <AIStatusIndicator />
              <div className="text-right">
                <p className="text-gray-700">Welcome, <span className="font-semibold">{user.name}</span></p>
                <p className="text-sm text-gray-500 font-medium">{user.role === 'student' ? user.residence : 'Administrator'}</p>
              </div>
              {user.role === 'student' && (
                <>
                  <button
                    onClick={() => setShowGamification(true)}
                    className="text-gray-600 hover:text-brand-blue p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                    title="Gamification & Leaderboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    {user.badges.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {user.badges.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowScheduler(!showScheduler)}
                    className="text-gray-600 hover:text-brand-blue p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Schedule Laundry"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowFeedback(!showFeedback)}
                    className="text-gray-600 hover:text-brand-blue p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Report Issues"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <Link to="/profile" className="text-gray-600 hover:text-brand-blue p-2 rounded-full hover:bg-gray-100 transition-colors" title="View Profile">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="text-gray-600 hover:text-brand-red p-2 rounded-full hover:bg-gray-100 transition-colors" title="Log Out">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>
        
        <Routes>
          <Route path="/profile" element={
            user.role === 'student' ? <ProfilePage user={user} onLogout={handleLogout} /> : <main><p>Access Denied</p></main>
          }/>
          <Route path="/" element={
            <main className="container mx-auto p-4">
              {user.role === 'admin' ? (
                <AdminDashboard allMachines={allMachines} />
              ) : (
                <div className="space-y-6">
                  {/* User Stats Bar */}
                  <div className="bg-gradient-to-r from-brand-blue to-brand-light-blue text-white p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold">Welcome back, {user.name}!</h2>
                        <p className="text-blue-100">Keep up the great work with your laundry routine</p>
                      </div>
                      <div className="flex space-x-6 text-center">
                        <div>
                          <div className="text-2xl font-bold">{user.points}</div>
                          <div className="text-xs text-blue-100">Points</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{user.badges.length}</div>
                          <div className="text-xs text-blue-100">Badges</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{user.streak}</div>
                          <div className="text-xs text-blue-100">Streak</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Dashboard */}
                  <RealTimeDashboard
                    machines={residenceMachines}
                    residence={user.residence}
                    predictions={predictions}
                    stats={residenceStats || {
                      name: user.residence,
                      totalMachines: residenceMachines.length,
                      activeUsers: 1,
                      totalCycles: user.totalCycles,
                      averageWaitTime: 0,
                      utilizationRate: 0,
                      topUsers: []
                    }}
                  />

                  {/* Traditional Dashboard */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Machine Control</h2>
                    <p className="text-gray-500 text-center mb-6">Start cycles and manage your laundry</p>
                    <Dashboard
                      washers={washers}
                      dryers={dryers}
                      currentUser={user}
                      onStart={handleOpenModal}
                      onCollect={handleCollectLaundry}
                      onForgottenLaundry={handleForgottenLaundry}
                    />
                  </div>

                  {/* Scheduler */}
                  {showScheduler && (
                    <LaundryScheduler
                      machines={residenceMachines}
                      user={user}
                      onScheduleSlot={handleScheduleSlot}
                      onCancelSlot={handleCancelSlot}
                      existingSlots={scheduledSlots}
                    />
                  )}

                  {/* Feedback System */}
                  {showFeedback && (
                    <FeedbackSystem
                      machines={residenceMachines}
                      user={user}
                      onSubmitFeedback={handleSubmitFeedback}
                      existingFeedback={machineFeedback}
                    />
                  )}
                </div>
              )}
            </main>
          }/>
        </Routes>

        {isModalOpen && selectedMachine && (
          <StartCycleModal
            machine={selectedMachine}
            onClose={() => setIsModalOpen(false)}
            onStart={handleStartCycle}
          />
        )}

        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(n => (
            <EnhancedNotificationToast 
              key={n.id} 
              notification={n} 
              onDismiss={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
            />
          ))}
        </div>
        
        {user.role === 'student' && <Chatbot onSubmit={handleChatSubmit} />}
        
        {showGamification && user && (
          <GamificationPanel
            user={user}
            leaderboard={leaderboard}
            onClose={() => setShowGamification(false)}
          />
        )}
      </div>
    </HashRouter>
  );
};

export default App;