import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ onSignOut, navigation }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4">
          <h1 className="text-xl font-bold text-gray-800">OpenCRM</h1>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Link */}
        <div className="px-2 py-2 border-t border-gray-200">
          <Link
            to="/profile"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              location.pathname === '/profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <UserCircleIcon className={`mr-3 h-5 w-5 ${
              location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            Profile
          </Link>
        </div>

        {/* Logout Button */}
        <div className="px-2 py-2 border-t border-gray-200">
          <button
            onClick={onSignOut}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 group"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-500" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 