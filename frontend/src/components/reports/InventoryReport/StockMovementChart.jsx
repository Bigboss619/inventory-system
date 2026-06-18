import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StockMovementChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.stockIn + d.stockOut), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Movement Overview</h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm text-gray-500">
                In: {item.stockIn} | Out: {item.stockOut}
              </span>
            </div>
            <div className="flex h-6 rounded-lg overflow-hidden">
              <div
                className="bg-green-500 flex items-center justify-center"
                style={{ width: `${(item.stockIn / maxValue) * 100}%` }}
              >
                {item.stockIn > 0 && (
                  <FiTrendingUp className="w-3 h-3 text-white" />
                )}
              </div>
              <div
                className="bg-red-500 flex items-center justify-center"
                style={{ width: `${(item.stockOut / maxValue) * 100}%` }}
              >
                {item.stockOut > 0 && (
                  <FiTrendingDown className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockMovementChart;