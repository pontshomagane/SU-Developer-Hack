import React, { useState, useEffect } from 'react';
import { RESIDENCES } from '../constants';

interface LoginProps {
  onLogin: (name: string, residence: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [residence, setResidence] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Show particles after initial load
    const timer = setTimeout(() => setShowParticles(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (newName.toLowerCase() === 'admin') {
      setIsAdmin(true);
      setResidence('Admin');
    } else {
      setIsAdmin(false);
      if (residence === 'Admin') setResidence('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && (residence.trim() || isAdmin)) {
      onLogin(name.trim(), residence.trim());
    }
  };

  const isButtonDisabled = !name.trim() || (!residence.trim() && !isAdmin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-gradient p-4 font-sans relative overflow-hidden">
      {/* Animated Background Particles */}
      {showParticles && (
        <>
          <div className="absolute top-20 left-10 w-4 h-4 bg-brand-light-blue/20 rounded-full animate-particle" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-brand-blue/20 rounded-full animate-particle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-purple-400/20 rounded-full animate-particle" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-indigo-400/20 rounded-full animate-particle" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-60 left-1/3 w-4 h-4 bg-blue-400/20 rounded-full animate-particle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-60 right-1/3 w-3 h-3 bg-cyan-400/20 rounded-full animate-particle" style={{ animationDelay: '1.5s' }}></div>
        </>
      )}

      <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/20 animate-bounce-in relative">
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 rounded-3xl animate-shimmer pointer-events-none"></div>
        
        {/* Logo with floating animation */}
        <div style={{ animationDelay: '0.2s' }} className="flex justify-center mb-6 opacity-0 animate-rotate-in">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-blue to-brand-light-blue rounded-full flex items-center justify-center animate-float animate-pulse-glow">
              <svg className="w-12 h-12 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h3"/>
                <path d="M17 6h.01"/>
                <rect width="18" height="20" x="3" y="2" rx="2"/>
                <circle cx="12" cy="13" r="5"/>
                <path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5"/>
              </svg>
            </div>
            {/* Rotating ring around logo */}
            <div className="absolute inset-0 w-24 h-24 border-2 border-brand-light-blue/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
          </div>
        </div>

        {/* Title with staggered animation */}
        <h1 style={{ animationDelay: '0.4s' }} className="text-5xl sm:text-6xl font-bold mb-3 opacity-0 animate-scale-in">
          <span className="bg-gradient-to-r from-brand-blue to-brand-light-blue bg-clip-text text-transparent">
            DYP
          </span>
          <span className="bg-gradient-to-r from-brand-light-blue to-purple-500 bg-clip-text text-transparent">
            Aura
          </span>
        </h1>
        
        <p style={{ animationDelay: '0.6s' }} className="text-gray-600 mb-2 opacity-0 animate-fade-in-up font-medium">
          An intelligent aura for your laundry space
        </p>
        <p style={{ animationDelay: '0.8s' }} className="text-gray-500 text-sm mb-8 opacity-0 animate-fade-in-up">
          ✨ Smart living • 🧠 AI-powered • 🌟 Clean management
        </p>
        
        {/* Form with slide-in animation */}
        <form onSubmit={handleSubmit} style={{ animationDelay: '1s' }} className="space-y-5 opacity-0 animate-slide-in-bottom">
          <div className="relative">
            <label htmlFor="name-input" className="sr-only">Enter your name or student number</label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name or 'admin'"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-light-blue transition-all duration-300 shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm"
              aria-label="Name or student number"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          {!isAdmin && (
            <div className="relative">
              <label htmlFor="residence-select" className="sr-only">Select your residence</label>
              <select
                id="residence-select"
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-light-blue/20 focus:border-brand-light-blue transition-all duration-300 shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm appearance-none"
              >
                <option value="" disabled>Select your residence</option>
                {RESIDENCES.map(res => <option key={res} value={res}>{res}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full bg-gradient-to-r from-brand-blue to-brand-light-blue text-white py-4 rounded-xl text-lg font-semibold hover:from-brand-light-blue hover:to-purple-500 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </form>

        {/* Feature highlights */}
        <div style={{ animationDelay: '1.2s' }} className="mt-8 opacity-0 animate-fade-in-up">
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              AI Predictions
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
              Real-time Status
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse" style={{ animationDelay: '1s' }}></span>
              Smart Notifications
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;