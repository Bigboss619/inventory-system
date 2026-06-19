import React from 'react';
import { FiPlus, FiDownload } from 'react-icons/fi';

const StockOutHeader = ({ onAddStock, onExport }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Out</h1>
        <p className="text-gray-500">Issue items to staff</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload className="w-5 h-5" />
          <span>Export</span>
        </button>
        <button
          onClick={onAddStock}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Issue Item</span>
        </button>
      </div>
    </div>
  );
};

export default StockOutHeader;