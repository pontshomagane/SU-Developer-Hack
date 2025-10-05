import React from 'react';

type View = 'grid' | 'list';

interface DashboardViewToggleProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const DashboardViewToggle: React.FC<DashboardViewToggleProps> = ({ currentView, onViewChange }) => {
  const baseStyle = "px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none";
  const activeStyle = "bg-brand-blue text-white";
  const inactiveStyle = "bg-white text-gray-600 hover:bg-gray-100";

  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={() => onViewChange('grid')}
          className={`${baseStyle} rounded-l-lg border border-gray-200 ${currentView === 'grid' ? activeStyle : inactiveStyle}`}
          aria-pressed={currentView === 'grid'}
        >
          Grid View
        </button>
        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={`${baseStyle} rounded-r-md border border-gray-200 ${currentView === 'list' ? activeStyle : inactiveStyle}`}
          aria-pressed={currentView === 'list'}
        >
          List View
        </button>
      </div>
    </div>
  );
};

export default DashboardViewToggle;