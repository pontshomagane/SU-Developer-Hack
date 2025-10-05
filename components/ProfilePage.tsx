import React from 'react';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  
  const averageDelay = user.delayHistory.length > 0
    ? (user.delayHistory.reduce((a, b) => a + b, 0) / user.delayHistory.length).toFixed(1)
    : 'N/A';

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md animate-fade-in-up">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500">{user.residence}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Cycles Completed</p>
                <p className="text-2xl font-bold text-brand-blue">{user.delayHistory.length}</p>
            </div>
             <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Avg. Collection Delay</p>
                <p className="text-2xl font-bold text-brand-light-blue">{averageDelay} <span className="text-lg">min</span></p>
            </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Laundry History</h2>
          <div className="max-h-60 overflow-y-auto pr-2">
            {user.delayHistory.length > 0 ? (
              <ul className="space-y-3">
                {user.delayHistory.map((delay, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                    <span className="font-medium text-gray-600">Cycle #{user.delayHistory.length - index}</span>
                    <span className={`font-semibold ${delay <= 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {delay} min delay
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">No laundry cycles completed yet.</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto px-6 py-2 text-center bg-brand-blue text-white rounded-md hover:bg-brand-light-blue transition-colors">
            Back to Dashboard
          </Link>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-6 py-2 bg-red-100 text-brand-red font-semibold rounded-md hover:bg-red-200 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
