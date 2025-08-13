import React from 'react';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  user: any;
  onSignOut: () => void;
  onShowAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, onShowAuth }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">Cloud Management Platform</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                {user.email || user.name || 'Demo User'}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onShowAuth}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};