import React from 'react';
import { FiTool, FiClock, FiCheck } from 'react-icons/fi';

const icons = {
  FiTool,
  FiClock,
  FiCheck
};

const StatsCard = ({ title, value, icon: IconKey, color = 'blue' }) => {
  const IconComponent = icons[IconKey] || FiTool;

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600'
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <IconComponent className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;