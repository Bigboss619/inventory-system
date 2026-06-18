import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBox,
  FiLayers,
  FiShoppingCart,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiSettings,
  FiX
} from 'react-icons/fi';

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/inventory', icon: FiBox, label: 'Inventory' },
  { path: '/stock', icon: FiLayers, label: 'Stock' },
  { path: '/orders', icon: FiShoppingCart, label: 'Orders' },
  { path: '/users', icon: FiUsers, label: 'Users' },
  { path: '/reports', icon: FiFileText, label: 'Reports' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-green-700 text-white
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-green-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <FiBox className="w-6 h-6 text-green-700" />
            </div>
            <span className="text-lg font-bold">Inventory</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-green-600 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-green-700 font-medium'
                    : 'text-green-100 hover:bg-green-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-600">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-green-700 font-medium'
                  : 'text-green-100 hover:bg-green-600'
              }`
            }
          >
            <FiSettings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;