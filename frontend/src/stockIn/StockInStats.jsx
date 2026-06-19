import React from 'react';
import { FiArrowDownCircle } from 'react-icons/fi';

const StockInStats = ({ stockIn }) => {
  // Use local date to avoid UTC conversion issues
  const today = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Helper to get date string from DB format
  const getDateStr = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-CA');
  };

  const todayStockIn = stockIn
    .filter(s => getDateStr(s.transaction_date) === today)
    .reduce((sum, s) => sum + (s.quantity || 0), 0);

  const thisMonthStockIn = stockIn
    .filter(s => {
      const dateStr = getDateStr(s.transaction_date);
      return dateStr && dateStr.startsWith(currentMonth);
    })
    .reduce((sum, s) => sum + (s.quantity || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Today's Stock In</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{todayStockIn}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiArrowDownCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">This Month Stock In</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{thisMonthStockIn}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FiArrowDownCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInStats;