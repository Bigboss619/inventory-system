import React from 'react';
import { FiSearch } from 'react-icons/fi';

const StaffFilters = ({ searchQuery, setSearchQuery, departmentFilter, setDepartmentFilter, departmentOptions }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search staff name, email, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <select
        value={departmentFilter}
        onChange={(e) => setDepartmentFilter(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {departmentOptions.map(dept => (
          <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
        ))}
      </select>
    </div>
  );
};

export default StaffFilters;