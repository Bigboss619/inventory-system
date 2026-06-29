import React from 'react';
import { FiX, FiUsers } from 'react-icons/fi';

const ViewStaffModal = ({ isOpen, onClose, staff }) => {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Staff Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center py-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUsers className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{staff.first_name} {staff.last_name}</h3>
          </div>
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Staff ID</span>
              <span className="font-medium text-gray-900">{staff.staff_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="font-medium text-gray-900">{staff.department_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{staff.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date Created</span>
              <span className="font-medium text-gray-900">
                {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewStaffModal;