import React, { useState, useEffect } from 'react';
import {
  FiBox,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from 'react-icons/fi';
import { getItems, getStockIn, getStockOut } from '../services/api';

const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
};

const Dashboard = ({ role = 'admin' }) => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    stockInToday: 0,
    stockOutToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [itemsData, stockInData, stockOutData] = await Promise.all([
        getItems(),
        getStockIn(),
        getStockOut()
      ]);

      const today = new Date().toLocaleDateString('en-CA');

      // Helper to get date string from DB format
      const getDateStr = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-CA');
      };

      const items = Array.isArray(itemsData) ? itemsData : [];
      const stockIn = Array.isArray(stockInData) ? stockInData : [];
      const stockOut = Array.isArray(stockOutData) ? stockOutData : [];

      // Total Inventory Items
      const totalItems = items.length;

      // Low Stock Items (quantity < min_stock_level)
      const lowStockItems = items.filter(item =>
        item.quantity < item.min_stock_level
      ).length;

      // Stock In Today
      const stockInToday = stockIn
        .filter(s => getDateStr(s.transaction_date) === today)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);

      // Stock Out Today
      const stockOutToday = stockOut
        .filter(s => getDateStr(s.transaction_date) === today)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);

      setStats({
        totalItems,
        lowStockItems,
        stockInToday,
        stockOutToday
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const STATS = [
    { label: 'Total Inventory Items', value: stats.totalItems, icon: FiBox, color: 'blue' },
    { label: 'Low Stock Items', value: stats.lowStockItems, icon: FiAlertTriangle, color: 'red' },
    { label: 'Stock In Today', value: stats.stockInToday, icon: FiTrendingUp, color: 'green' },
    { label: 'Stock Out Today', value: stats.stockOutToday, icon: FiTrendingDown, color: 'blue' },
  ];
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
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '-' : stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${COLOR_CLASSES[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;