import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Mock user data
const MOCK_USER = {
  name: 'Admin User',
  role: 'Administrator',
  email: 'admin@inventory.com'
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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
        <Header onToggleSidebar={toggleSidebar} user={MOCK_USER} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;