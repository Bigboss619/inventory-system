import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTool, FiCalendar, FiTruck, FiCheck, FiClock, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Mock data
const MOCK_MAINTENANCE = [
  { id: 1, vehicle: 'ABC-1234 (Toyota Camry)', type: 'Oil Change', cost: 150, status: 'Completed', serviceDate: '2026-05-10', nextDue: '2026-08-10', provider: 'AutoCare Service' },
  { id: 2, vehicle: 'XYZ-5678 (Honda Civic)', type: 'Tire Rotation', cost: 80, status: 'Completed', serviceDate: '2026-04-20', nextDue: '2026-07-20', provider: 'QuickFix Garage' },
  { id: 3, vehicle: 'DEF-9012 (Ford Transit)', type: 'Brake Repair', cost: 450, status: 'In Progress', serviceDate: '2026-06-01', nextDue: '2026-06-15', provider: 'AutoCare Service' },
  { id: 4, vehicle: 'GHI-3456 (Toyota Hiace)', type: 'General Service', cost: 200, status: 'Scheduled', serviceDate: '2026-06-20', nextDue: '2026-09-20', provider: 'QuickFix Garage' },
  { id: 5, vehicle: 'ABC-1234 (Toyota Camry)', type: 'Air Filter', cost: 50, status: 'Completed', serviceDate: '2026-05-10', nextDue: '2026-08-10', provider: 'AutoCare Service' },
  { id: 6, vehicle: 'JKL-7890 (Mitsubishi L200)', type: 'Engine Repair', cost: 800, status: 'Pending', serviceDate: '', nextDue: '2026-06-25', provider: 'Truck Masters' },
];

const STATUS_OPTIONS = ['All', 'Pending', 'Scheduled', 'In Progress', 'Completed'];
const TYPE_OPTIONS = ['All', 'Oil Change', 'Tire Rotation', 'Brake Repair', 'General Service', 'Engine Repair', 'Air Filter', 'Wheel Alignment'];

const MaintenanceTracker = () => {
  const [maintenance, setMaintenance] = useState(MOCK_MAINTENANCE);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Stats
  const totalRecords = maintenance.length;
  const pendingRecords = maintenance.filter(m => m.status === 'Pending').length;
  const inProgress = maintenance.filter(m => m.status === 'In Progress').length;
  const completedThisMonth = maintenance.filter(m => m.status === 'Completed').length;

  // Filtered maintenance
  const filteredMaintenance = useMemo(() => {
    return maintenance.filter(m => {
      const matchesSearch = m.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesType = typeFilter === 'All' || m.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [maintenance, searchQuery, statusFilter, typeFilter]);

  const handleAddRecord = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setMaintenance(maintenance.filter(m => m.id !== id));
      toast.success('Record deleted successfully');
    }
  };

  const handleSaveRecord = async (formData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingRecord) {
      setMaintenance(maintenance.map(m =>
        m.id === editingRecord.id ? { ...m, ...formData } : m
      ));
      toast.success('Record updated successfully');
    } else {
      const newRecord = {
        id: Date.now(),
        ...formData
      };
      setMaintenance([...maintenance, newRecord]);
      toast.success('Record added successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredMaintenance.map(m => ({
      'Vehicle': m.vehicle,
      'Type': m.type,
      'Cost ($)': m.cost,
      'Status': m.status,
      'Service Date': m.serviceDate || '-',
      'Next Due': m.nextDue,
      'Provider': m.provider
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');

    ws['!cols'] = [
      { wch: 25 }, // Vehicle
      { wch: 18 }, // Type
      { wch: 10 }, // Cost
      { wch: 14 }, // Status
      { wch: 14 }, // Service Date
      { wch: 12 }, // Next Due
      { wch: 18 }  // Provider
    ];

    XLSX.writeFile(wb, `maintenance-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Tracker</h1>
          <p className="text-gray-500">Track vehicle maintenance records</p>
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
            onClick={handleAddRecord}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiTool className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingRecords}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiTool className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicle or maintenance type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {TYPE_OPTIONS.map(type => (
            <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
          ))}
        </select>
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

      {/* Maintenance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaintenance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No records found</td>
                </tr>
              ) : (
                filteredMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{m.vehicle}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{m.type}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">${m.cost}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        m.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        m.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                        m.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{m.serviceDate || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{m.nextDue}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRecord(m)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(m.id)}
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <MaintenanceModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
          record={editingRecord}
          loading={loading}
        />
      )}
    </div>
  );
};

// Maintenance Modal Component
const MaintenanceModal = ({ isOpen, onClose, onSave, record, loading }) => {
  const [formData, setFormData] = useState({
    vehicle: record?.vehicle || '',
    type: record?.type || 'Oil Change',
    cost: record?.cost || '',
    status: record?.status || 'Pending',
    serviceDate: record?.serviceDate || '',
    nextDue: record?.nextDue || '',
    provider: record?.provider || ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicle: record?.vehicle || '',
        type: record?.type || 'Oil Change',
        cost: record?.cost || '',
        status: record?.status || 'Pending',
        serviceDate: record?.serviceDate || '',
        nextDue: record?.nextDue || '',
        provider: record?.provider || ''
      });
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vehicle || !formData.type || !formData.cost) {
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
            {record ? 'Edit Record' : 'Add Maintenance Record'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
            <input
              type="text"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              placeholder="e.g. ABC-1234 (Toyota Camry)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TYPE_OPTIONS.filter(t => t !== 'All').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
            <input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
            <input
              type="date"
              value={formData.nextDue}
              onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="e.g. AutoCare Service"
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
              {record ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceTracker;