import React from 'react';
import { FiRefreshCw, FiCalendar } from 'react-icons/fi';

const RenewalTracking = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FiRefreshCw className="w-5 h-5 text-blue-600" />
        Renewal Tracking
      </h3>

      {data.length === 0 ? (
        <div className="text-gray-500 p-4 text-center">No renewal records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.document}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 line-through">
                    {item.previousExpiry}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {item.newExpiry}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.renewedBy}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RenewalTracking;