import React from 'react';
import { FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';

const StockOutTable = ({ stockOut, fetching, userRole, onEdit, onDelete }) => {
  const canEdit = userRole === 'Super Admin';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
              {canEdit && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Issued By</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              {canEdit && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fetching ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <FiLoader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                </td>
              </tr>
            ) : stockOut.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No stock out records found.
                </td>
              </tr>
            ) : (
              stockOut.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {record.requested_by_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.department_name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.item_name || '-'} ({record.item_code || '-'})
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.quantity}</td>
                  {canEdit && (
                    <td className="px-6 py-4 text-sm text-gray-500">{record.issued_by_name || '-'}</td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.transaction_date ? new Date(record.transaction_date).toLocaleDateString() : '-'}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockOutTable;