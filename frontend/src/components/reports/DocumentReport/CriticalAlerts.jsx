import React from 'react';
import { FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const CriticalAlerts = ({ data }) => {
  const getPriorityBadge = (priority) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Medium' },
      low: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Low' },
    };
    return badges[priority] || badges.low;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FiAlertTriangle className="w-5 h-5 text-red-500" />
        Critical Documents Requiring Action
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg">
          <FiAlertCircle className="w-5 h-5" />
          <span>No critical documents requiring immediate action.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => {
                const badge = getPriorityBadge(item.priority);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.document}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.vehicle}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.expiryDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {item.daysLeft}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CriticalAlerts;