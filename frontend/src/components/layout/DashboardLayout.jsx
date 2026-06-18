import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Desktop sidebar (fixed) */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
        <Sidebar isOpen={true} onClose={closeSidebar} />
      </div>

      {/* Main content with left padding for desktop sidebar */}
      <div className="lg:pl-64">
        <Header onToggleSidebar={toggleSidebar} user={user} onLogout={handleLogout} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;