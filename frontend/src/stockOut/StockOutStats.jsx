import React from 'react';
import { FiArrowUpCircle } from 'react-icons/fi';

const StockOutStats = ({ stockOut }) => {
  // Use local date to avoid UTC conversion issues
  const today = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Helper to get date string from DB format
  const getDateStr = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-CA');
  };

  // Debug logging
  // console.log('Today:', today);
  // console.log('StockOut dates:', stockOut.map(s => ({ id: s.id, date: s.transaction_date, dateStr: getDateStr(s.transaction_date) })));

  const todayIssued = stockOut
    .filter(s => getDateStr(s.transaction_date) === today)
    .reduce((sum, s) => sum + (s.quantity || 0), 0);

  const thisMonthIssued = stockOut
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
            <p className="text-sm text-gray-500">Today's Issued Items</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{todayIssued}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiArrowUpCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">This Month Issued Items</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{thisMonthIssued}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FiArrowUpCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockOutStats;