import React from 'react';
import { FiBox, FiShoppingCart, FiUsers, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

// Mock data for dashboard stats
const STATS = [
  { label: 'Total Products', value: '1,234', icon: FiBox, change: '+12%', color: 'blue' },
  { label: 'Pending Orders', value: '56', icon: FiShoppingCart, change: '+8%', color: 'green' },
  { label: 'Total Users', value: '89', icon: FiUsers, change: '+3%', color: 'blue' },
  { label: 'Revenue', value: '$12,450', icon: FiDollarSign, change: '+24%', color: 'green' },
];

const STATS_COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {STATS.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${STATS_COLOR_CLASSES[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stat.change}</span>
              <span className="text-gray-400 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section - Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiBox className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New product added</p>
                  <p className="text-xs text-gray-500">Product ID #123{item}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;