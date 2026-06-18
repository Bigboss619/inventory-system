import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBell, FiCalendar, FiAlertTriangle, FiCheck, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const FiXIcon = FiX;

// Mock data
const MOCK_REMINDERS = [
  { id: 1, document: 'Vehicle Insurance', type: 'Vehicle', expiryDate: '2026-06-30', status: 'Expiring Soon', assignedTo: 'Admin', reminderDays: 7 },
  { id: 2, document: 'Driver License - John Smith', type: 'Staff', expiryDate: '2026-07-15', status: 'Active', assignedTo: 'Admin', reminderDays: 30 },
  { id: 3, document: 'Vehicle License - ABC-1234', type: 'Vehicle', expiryDate: '2026-06-25', status: 'Expiring Soon', assignedTo: 'Admin', reminderDays: 3 },
  { id: 4, document: 'Company Registration', type: 'Business', expiryDate: '2026-12-31', status: 'Active', assignedTo: 'Admin', reminderDays: 90 },
  { id: 5, document: 'Insurance Policy - General', type: 'Business', expiryDate: '2026-08-20', status: 'Active', assignedTo: 'Admin', reminderDays: 60 },
  { id: 6, document: 'Vehicle Insurance - XYZ-5678', type: 'Vehicle', expiryDate: '2026-06-10', status: 'Expired', assignedTo: 'Admin', reminderDays: 0 },
];

const STATUS_OPTIONS = ['All', 'Active', 'Expiring Soon', 'Expired'];

const DocumentReminder = () => {
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Stats
  const totalReminders = reminders.length;
  const activeReminders = reminders.filter(r => r.status === 'Active').length;
  const expiringSoon = reminders.filter(r => r.status === 'Expiring Soon').length;
  const expired = reminders.filter(r => r.status === 'Expired').length;

  // Filtered reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const matchesSearch = r.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reminders, searchQuery, statusFilter]);

  const handleAddReminder = () => {
    setEditingReminder(null);
    setModalOpen(true);
  };

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setModalOpen(true);
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      setReminders(reminders.filter(r => r.id !== id));
      toast.success('Reminder deleted successfully');
    }
  };

  const handleSaveReminder = async (formData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate status based on expiry date
    const today = new Date();
    const expiry = new Date(formData.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    let status = 'Active';
    if (daysUntilExpiry < 0) {
      status = 'Expired';
    } else if (daysUntilExpiry <= formData.reminderDays) {
      status = 'Expiring Soon';
    }

    if (editingReminder) {
      setReminders(reminders.map(r =>
        r.id === editingReminder.id ? { ...r, ...formData, status } : r
      ));
      toast.success('Reminder updated successfully');
    } else {
      const newReminder = {
        id: Date.now(),
        ...formData,
        status
      };
      setReminders([...reminders, newReminder]);
      toast.success('Reminder added successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingReminder(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredReminders.map(r => ({
      'Document': r.document,
      'Type': r.type,
      'Expiry Date': r.expiryDate,
      'Status': r.status,
      'Assigned To': r.assignedTo,
      'Reminder (Days)': r.reminderDays
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reminders');

    ws['!cols'] = [
      { wch: 25 }, // Document
      { wch: 12 }, // Type
      { wch: 14 }, // Expiry Date
      { wch: 14 }, // Status
      { wch: 14 }, // Assigned To
      { wch: 16 }  // Reminder Days
    ];

    XLSX.writeFile(wb, `reminders-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Reminders</h1>
          <p className="text-gray-500">Track document expiry dates</p>
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
            onClick={handleAddReminder}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reminders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalReminders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiBell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeReminders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{expiringSoon}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{expired}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiX className="w-6 h-6 text-red-600" />
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
            placeholder="Search document or type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
          ))}
        </select>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reminder Days</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No reminders found</td>
                </tr>
              ) : (
                filteredReminders.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{r.document}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.expiryDate}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'Active' ? 'bg-green-100 text-green-800' :
                        r.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{r.reminderDays} days</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReminder(r)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(r.id)}
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

      {/* Add/Edit Reminder Modal */}
      {modalOpen && (
        <ReminderModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingReminder(null);
          }}
          onSave={handleSaveReminder}
          reminder={editingReminder}
          loading={loading}
        />
      )}
    </div>
  );
};

// Reminder Modal Component
const ReminderModal = ({ isOpen, onClose, onSave, reminder, loading }) => {
  const [formData, setFormData] = useState({
    document: reminder?.document || '',
    type: reminder?.type || 'Vehicle',
    expiryDate: reminder?.expiryDate || '',
    reminderDays: reminder?.reminderDays || 7,
    assignedTo: reminder?.assignedTo || 'Admin'
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        document: reminder?.document || '',
        type: reminder?.type || 'Vehicle',
        expiryDate: reminder?.expiryDate || '',
        reminderDays: reminder?.reminderDays || 7,
        assignedTo: reminder?.assignedTo || 'Admin'
      });
    }
  }, [isOpen, reminder]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.document || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {reminder ? 'Edit Reminder' : 'Add Reminder'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
            <input
              type="text"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              placeholder="e.g. Vehicle Insurance"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Vehicle">Vehicle</option>
              <option value="Staff">Staff</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remind Before (Days)</label>
            <input
              type="number"
              value={formData.reminderDays}
              onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
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
              {reminder ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentReminder;