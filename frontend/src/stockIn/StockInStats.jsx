import React from 'react';
import { FiArrowDownCircle } from 'react-icons/fi';

const StockInStats = ({ stockIn }) => {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const todayStockIn = stockIn
    .filter(s => s.transaction_date === today)
    .reduce((sum, s) => sum + s.quantity, 0);

  const thisMonthStockIn = stockIn
    .filter(s => s.transaction_date && s.transaction_date.startsWith(thisMonth))
    .reduce((sum, s) => sum + s.quantity, 0);

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