import React, { useState, useEffect } from 'react';
import {
  FiBox,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiFileText,
  FiRefreshCw,
  FiClock
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getItems, getStockIn, getStockOut, getAllDocuments } from '../services/api';

const COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
};

// Helper to calculate days until expiry
const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'Super Admin';
  const officerType = user?.officer_type || 'both';

  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    stockInToday: 0,
    stockOutToday: 0,
    totalDocuments: 0,
    expiringSoon: 0,
    expired: 0,
    renewed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [itemsData, stockInData, stockOutData, docsData] = await Promise.all([
        getItems(),
        getStockIn(),
        getStockOut(),
        getAllDocuments()
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
      const documents = Array.isArray(docsData) ? docsData : [];

      // Check if user is Inventory Officer
      const isInventoryOfficer = role === 'Inventory Officer';

      // Filter items by officer_type for Inventory Officer
      const filterByOfficerType = (item) => {
        if (officerType === 'both') return true;
        return item.officer_type === officerType || item.officer_type === 'both' || !item.officer_type;
      };

      // Filter items based on officer_type (only for Inventory Officer)
      const filteredItems = isInventoryOfficer ? items.filter(filterByOfficerType) : items;

      // Filter stockIn/stockOut based on officer_type (only for Inventory Officer)
      const filteredStockIn = isInventoryOfficer ? stockIn.filter(filterByOfficerType) : stockIn;
      const filteredStockOut = isInventoryOfficer ? stockOut.filter(filterByOfficerType) : stockOut;

      // Total Inventory Items
      const totalItems = filteredItems.length;

      // Low Stock Items (quantity < min_stock_level)
      const lowStockItems = filteredItems.filter(item =>
        item.quantity < item.min_stock_level
      ).length;

      // Stock In Today
      const stockInToday = filteredStockIn
        .filter(s => getDateStr(s.transaction_date) === today)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);

      // Stock Out Today
      const stockOutToday = filteredStockOut
        .filter(s => getDateStr(s.transaction_date) === today)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);

      // Document Stats
      const totalDocuments = documents.length;
      const expiringSoon = documents.filter(d => {
        const daysLeft = getDaysLeft(d.expiry_date);
        return daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
      }).length;
      const expired = documents.filter(d => {
        const daysLeft = getDaysLeft(d.expiry_date);
        return daysLeft !== null && daysLeft < 0;
      }).length;
      const renewed = documents.filter(d => d.doc_status === 'renewed').length;

      setStats({
        totalItems,
        lowStockItems,
        stockInToday,
        stockOutToday,
        totalDocuments,
        expiringSoon,
        expired,
        renewed
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show different stats based on role
  const inventoryStats = [
    { label: 'Total Inventory Items', value: stats.totalItems, icon: FiBox, color: 'blue' },
    { label: 'Low Stock Items', value: stats.lowStockItems, icon: FiAlertTriangle, color: 'red' },
    { label: 'Stock In Today', value: stats.stockInToday, icon: FiTrendingUp, color: 'green' },
    { label: 'Stock Out Today', value: stats.stockOutToday, icon: FiTrendingDown, color: 'blue' },
  ];

  const documentStats = [
    { label: 'Total Documents', value: stats.totalDocuments, icon: FiFileText, color: 'blue' },
    { label: 'Expiring Soon', value: stats.expiringSoon, icon: FiClock, color: 'yellow' },
    { label: 'Expired', value: stats.expired, icon: FiAlertTriangle, color: 'red' },
    { label: 'Renewed', value: stats.renewed, icon: FiRefreshCw, color: 'purple' },
  ];

  // Role-based display:
  // Super Admin / Admin: all stats
  // Document Officer: document stats only
  // Inventory Officer: inventory stats only
  const isSuperAdmin = role === 'Super Admin' || role === 'Admin';
  const isDocumentOfficer = role === 'Document Officer';
  const isInventoryOfficer = role === 'Inventory Officer';

  let displayStats;
  if (isSuperAdmin) {
    displayStats = [...inventoryStats, ...documentStats];
  } else if (isDocumentOfficer) {
    displayStats = documentStats;
  } else if (isInventoryOfficer) {
    displayStats = inventoryStats;
  } else {
    displayStats = [...inventoryStats, ...documentStats];
  }

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
        {displayStats.map((stat, index) => (
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