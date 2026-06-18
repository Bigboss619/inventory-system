import React from 'react';
import { FiMenu, FiBell, FiSearch, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Header = ({ onToggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();

  // Get user display name
  const getUserName = () => {
    if (!user) return 'Guest';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email?.split('@')[0] || 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'G';
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMenu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Search - hidden on mobile */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiBell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 ml-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {getUserName()}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role || 'User'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {getInitials()}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;