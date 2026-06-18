import React from 'react';
import { FiCalendar, FiFilter, FiX } from 'react-icons/fi';

const DocReportFilters = ({ filters, onFilterChange, categories, vehicles, onReset }) => {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiFilter className="w-5 h-5" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <FiX className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Type</label>
          <select
            value={filters.dateType}
            onChange={(e) => handleChange('dateType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="issue">Issue Date</option>
            <option value="expiry">Expiry Date</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="renewed">Renewed</option>
          </select>
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
          <select
            value={filters.vehicle}
            onChange={(e) => handleChange('vehicle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DocReportFilters;