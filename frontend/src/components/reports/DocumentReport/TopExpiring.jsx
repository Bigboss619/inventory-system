import React from 'react';
import { FiTruck } from 'react-icons/fi';

const TopExpiring = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FiTruck className="w-5 h-5" />
        Top Expiring Documents by Vehicle
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Expiring Documents</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}. {item.vehicle}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopExpiring;