import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiUsers, FiBriefcase, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Mock data
const MOCK_STAFF = [
  { id: 1, staffId: 'STF001', name: 'John Smith', department: 'IT', position: 'Developer', email: 'john.smith@company.com', phone: '555-0101', dateCreated: '2025-01-10' },
  { id: 2, staffId: 'STF002', name: 'Sarah Johnson', department: 'HR', position: 'HR Manager', email: 'sarah.j@company.com', phone: '555-0102', dateCreated: '2025-01-15' },
  { id: 3, staffId: 'STF003', name: 'Michael Brown', department: 'Finance', position: 'Accountant', email: 'm.brown@company.com', phone: '555-0103', dateCreated: '2025-02-01' },
  { id: 4, staffId: 'STF004', name: 'Emily Davis', department: 'IT', position: 'System Admin', email: 'emily.d@company.com', phone: '555-0104', dateCreated: '2025-02-10' },
  { id: 5, staffId: 'STF005', name: 'David Wilson', department: 'Operations', position: 'Operations Manager', email: 'd.wilson@company.com', phone: '555-0105', dateCreated: '2025-02-20' },
  { id: 6, staffId: 'STF006', name: 'Lisa Anderson', department: 'Marketing', position: 'Marketing Specialist', email: 'lisa.a@company.com', phone: '555-0106', dateCreated: '2025-03-05' },
  { id: 7, staffId: 'STF007', name: 'James Taylor', department: 'IT', position: 'Developer', email: 'james.t@company.com', phone: '555-0107', dateCreated: '2025-03-15' },
  { id: 8, staffId: 'STF008', name: 'Jennifer Martinez', department: 'Finance', position: 'Financial Analyst', email: 'j.martinez@company.com', phone: '555-0108', dateCreated: '2025-04-01' },
];

const DEPARTMENTS = ['All', 'IT', 'HR', 'Finance', 'Operations', 'Marketing'];

const Staff = () => {
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Stats
  const totalStaff = staff.length;
  const departments = [...new Set(staff.map(s => s.department))].length;

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'All' || s.department === departmentFilter;
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

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
      toast.success('Staff member deleted successfully');
    }
  };

  const handleSaveStaff = async (formData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingStaff) {
      setStaff(staff.map(s =>
        s.id === editingStaff.id ? { ...s, ...formData } : s
      ));
      toast.success('Staff updated successfully');
    } else {
      const newStaffMember = {
        id: Date.now(),
        staffId: `STF${String(staff.length + 1).padStart(3, '0')}`,
        ...formData,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      setStaff([...staff, newStaffMember]);
      toast.success('Staff added successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingStaff(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredStaff.map(s => ({
      'Staff ID': s.staffId,
      'Name': s.name,
      'Department': s.department,
      'Position': s.position,
      'Email': s.email,
      'Phone': s.phone,
      'Date Created': s.dateCreated
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{departments}</p>
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
          {DEPARTMENTS.map(dept => (
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
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No staff found</td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{s.staffId}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {s.department}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{s.position}</td>
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
          departments={DEPARTMENTS.filter(d => d !== 'All')}
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
    name: staff?.name || '',
    department: staff?.department || departments[0] || '',
    position: staff?.position || '',
    email: staff?.email || '',
    phone: staff?.phone || ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: staff?.name || '',
        department: staff?.department || departments[0] || '',
        position: staff?.position || '',
        email: staff?.email || '',
        phone: staff?.phone || ''
      });
    }
  }, [isOpen, staff, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.department || !formData.position || !formData.email) {
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
                value={staff.staffId}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Enter position"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
            <h3 className="text-xl font-semibold text-gray-900">{staff.name}</h3>
            <p className="text-gray-500">{staff.position}</p>
          </div>
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Staff ID</span>
              <span className="font-medium text-gray-900">{staff.staffId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="font-medium text-gray-900">{staff.department}</span>
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
              <span className="font-medium text-gray-900">{staff.dateCreated}</span>
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