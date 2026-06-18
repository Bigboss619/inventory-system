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
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-col lg:flex-row">
        {/* Main content area - hidden sidebar on desktop, shown beside sidebar */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onToggleSidebar={toggleSidebar} user={MOCK_USER} />

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;