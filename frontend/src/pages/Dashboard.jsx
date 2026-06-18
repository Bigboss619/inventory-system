import React from 'react';
import {
  FiBox,
  FiAlertTriangle,
  FiFileText,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from 'react-icons/fi';

// Mock data for dashboard stats
const STATS = [
  { label: 'Total Inventory Items', value: '1,234', icon: FiBox, color: 'blue' },
  { label: 'Low Stock Items', value: '12', icon: FiAlertTriangle, color: 'red' },
  { label: 'Expiring Soon', value: '5', icon: FiClock, color: 'orange' },
  { label: 'Renewed Documents', value: '8', icon: FiRefreshCw, color: 'green' },
  { label: 'Expiring Documents', value: '3', icon: FiAlertCircle, color: 'red' },
  { label: 'Stock In Today', value: '45', icon: FiTrendingUp, color: 'green' },
  { label: 'Stock Out Today', value: '32', icon: FiTrendingDown, color: 'blue' },
  { label: 'Total Documents', value: '156', icon: FiFileText, color: 'blue' },
];

const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
};

const RECENT_ACTIVITIES = [
  { type: 'Stock In', item: 'Laptop Dell XPS 15', quantity: '5 units', time: '10 minutes ago', icon: FiTrendingUp },
  { type: 'Document', item: 'Warranty Renewal', quantity: 'Contract #1234', time: '1 hour ago', icon: FiFileText },
  { type: 'Low Stock', item: 'Wireless Mouse', quantity: '2 units left', time: '2 hours ago', icon: FiAlertTriangle },
  { type: 'Stock Out', item: 'USB-C Cable', quantity: '10 units', time: '3 hours ago', icon: FiTrendingDown },
];

const Dashboard = ({ role = 'admin' }) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Admin Badge */}
      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        {role.charAt(0).toUpperCase() + role.slice(1)} View
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {STATS.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${COLOR_CLASSES[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <FiActivity className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="space-y-4">
          {RECENT_ACTIVITIES.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                  <p className="text-xs text-gray-500">{activity.item} - {activity.quantity}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;