import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiUsers, FiBriefcase, FiX, FiDownload, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getStaff, getDepartments, createStaff, updateStaff, deleteStaff } from '../services/api';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Fetch staff and departments on mount
  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    setFetching(true);
    try {
      const data = await getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch staff');
      setStaff([]);
    } finally {
      setFetching(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch departments');
      setDepartments([]);
    }
  };

  // Stats
  const totalStaff = staff.length;
  const activeDepartments = [...new Set(staff.map(s => s.department_name))].length;

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staff_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'All' || s.department_name === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [staff, searchQuery, departmentFilter]);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setModalOpen(true);
  };

  const handleViewStaff = (staffMember) => {
    setViewingStaff(staffMember);
    setViewModalOpen(true);
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        toast.success('Staff member deleted successfully');
        fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff');
      }
    }
  };

  const handleSaveStaff = async (formData) => {
    setLoading(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        toast.success('Staff updated successfully');
      } else {
        await createStaff(formData);
        toast.success('Staff added successfully');
      }
      fetchStaff();
      setModalOpen(false);
      setEditingStaff(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredStaff.map(s => ({
      'Staff ID': s.staff_id,
      'Name': `${s.first_name} ${s.last_name}`,
      'Department': s.department_name,
      'Position': s.position,
      'Email': s.email,
      'Phone': s.phone,
      'Date Created': s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff');

    ws['!cols'] = [
      { wch: 12 }, // Staff ID
      { wch: 20 }, // Name
      { wch: 15 }, // Department
      { wch: 20 }, // Position
      { wch: 25 }, // Email
      { wch: 14 }, // Phone
      { wch: 14 }  // Date Created
    ];

    XLSX.writeFile(wb, `staff-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  // Get department options for filter (include 'All')
  const departmentOptions = ['All', ...new Set(departments.map(d => d.name))];

  // Get department options for modal (real departments only)
  const modalDepartments = departments.filter(d => d.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage your staff records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={handleAddStaff}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalStaff}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeDepartments}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
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

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fetching ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <FiLoader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No staff found</td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{s.staff_id}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.first_name} {s.last_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {s.department_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.position || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.email}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStaff(s)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditStaff(s)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {modalOpen && (
        <StaffModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingStaff(null);
          }}
          onSave={handleSaveStaff}
          staff={editingStaff}
          loading={loading}
          departments={modalDepartments}
        />
      )}

      {/* View Staff Modal */}
      {viewModalOpen && viewingStaff && (
        <ViewStaffModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setViewingStaff(null);
          }}
          staff={viewingStaff}
        />
      )}
    </div>
  );
};

// Staff Modal Component
const StaffModal = ({ isOpen, onClose, onSave, staff, loading, departments }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    departmentId: departments[0]?.id || null
  });

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        // Find department ID by name for editing
        const dept = departments.find(d => d.name === staff.department_name);
        setFormData({
          firstName: staff.first_name || '',
          lastName: staff.last_name || '',
          departmentId: dept?.id || staff.department_id || null
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          departmentId: departments[0]?.id || null
        });
      }
    }
  }, [isOpen, staff, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.departmentId) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {staff ? 'Edit Staff' : 'Add Staff'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {staff && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
              <input
                type="text"
                value={staff.staff_id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter first name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter last name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              value={formData.departmentId || ''}
              onChange={(e) => setFormData({ ...formData, departmentId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading && <FiLoader className="w-4 h-4 animate-spin" />}
              {staff ? 'Update Staff' : 'Save Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Staff Modal Component
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
            <p className="text-gray-500">{staff.position || '-'}</p>
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
              <span className="font-medium text-gray-900">{staff.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-900">{staff.phone || '-'}</span>
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

export default Staff;