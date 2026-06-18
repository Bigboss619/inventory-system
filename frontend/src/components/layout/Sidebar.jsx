import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiBox,
  FiLayers,
  FiFileText,
  FiUsers,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiSettings,
  FiX,
  FiClipboard,
  FiFile,
  FiBell,
  FiTrendingUp,
  FiTrendingDown,
  FiUserCheck,
  FiHome,
  FiTruck,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { MENU_BY_ROLE, ROLES } from '../../config/permissions';

// Menu structure
const MENU_ITEMS = [
  { title: 'Dashboard', icon: FiHome, path: '/dashboard' },
  {
    title: 'Inventory Management',
    icon: FiBox,
    children: [
      { label: 'Categories', path: '/inventory/categories', icon: FiLayers },
      { label: 'Items', path: '/inventory/items', icon: FiBox },
      { label: 'Stock In', path: '/inventory/stock-in', icon: FiTrendingUp },
      { label: 'Stock Out', path: '/inventory/stock-out', icon: FiTrendingDown },
      { label: 'Staff', path: '/inventory/staff', icon: FiUserCheck },
      { label: 'History', path: '/inventory/history', icon: FiFileText },
    ]
  },
  {
    title: 'Document Management',
    icon: FiFileText,
    children: [
      { label: 'Vehicle Records', path: '/documents/vehicles', icon: FiTruck },
      { label: 'All Documents', path: '/documents/all', icon: FiFileText },
      { label: 'Bulk Upload', path: '/documents/upload', icon: FiFile },
      { label: 'Reminders', path: '/documents/reminders', icon: FiBell },
      { label: 'Maintenance', path: '/documents/maintenance', icon: FiClipboard },
    ]
  },
  {
    title: 'Reports',
    icon: FiClipboard,
    children: [
      { label: 'Inventory Reports', path: '/reports/inventory', icon: FiBox },
      { label: 'Document Reports', path: '/reports/documents', icon: FiFileText },
    ]
  },
  { title: 'User Management', icon: FiUsers, path: '/users' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Get allowed menus based on user role
  const getAllowedMenus = () => {
    if (!user) return [];

    const roleConfig = MENU_BY_ROLE[user.role];

    // Super Admin sees all menus
    if (roleConfig === null) {
      return MENU_ITEMS;
    }

    // Filter menus by role configuration
    return MENU_ITEMS.filter(item => {
      // Always allow Dashboard, Profile, Settings, Logout
      if (item.title === 'Dashboard' || item.path === '/profile' || item.path === '/settings') {
        return true;
      }

      // Check if this menu/section is allowed
      if (item.title && roleConfig[item.title]) {
        // For parent menus, filter children
        if (item.children && Array.isArray(roleConfig[item.title])) {
          item.allowedChildren = roleConfig[item.title];
          return true;
        }
        return roleConfig[item.title] !== undefined;
      }

      return false;
    });
  };

  const allowedMenus = getAllowedMenus();

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          fixed top-0 left-0 z-50 h-full w-64 bg-blue-700 text-white
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <FiBox className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-lg font-bold">Inventory</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {allowedMenus.map((item) => (
            <div key={item.title}>
              {item.children ? (
                // Parent menu with children
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    {openMenus[item.title] ? (
                      <FiChevronDown className="w-4 h-4" />
                    ) : (
                      <FiChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Submenu - filter children by role */}
                  {openMenus[item.title] && (
                    <div className="ml-4 pl-4 border-l border-blue-500 space-y-1">
                      {item.children
                        .filter(child => {
                          // If allowedChildren is set, only show those
                          if (item.allowedChildren) {
                            return item.allowedChildren.includes(child.label);
                          }
                          return true;
                        })
                        .map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                              isActive
                                ? 'bg-white text-blue-700 font-medium'
                                : 'text-blue-100 hover:bg-blue-600'
                            }`
                          }
                        >
                          <child.icon className="w-4 h-4" />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Single menu item
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-700 font-medium'
                        : 'text-blue-100 hover:bg-blue-600'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 p-4 border-t border-blue-600 space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-700 font-medium'
                  : 'text-blue-100 hover:bg-blue-600'
              }`
            }
          >
            <FiUser className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-700 font-medium'
                  : 'text-blue-100 hover:bg-blue-600'
              }`
            }
          >
            <FiSettings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-600"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;