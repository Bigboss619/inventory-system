import React from 'react';
import { FiArrowUpCircle } from 'react-icons/fi';

const StockOutStats = ({ stockOut }) => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const todayIssued = stockOut
    .filter(s => s.transaction_date === today)
    .reduce((sum, s) => sum + s.quantity, 0);

  const thisMonthIssued = stockOut
    .filter(s => s.transaction_date && s.transaction_date.startsWith(currentMonth))
    .reduce((sum, s) => sum + s.quantity, 0);

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