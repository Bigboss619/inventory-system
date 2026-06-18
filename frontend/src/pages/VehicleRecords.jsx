import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTruck, FiUser, FiCalendar, FiDownload, FiX, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Mock data
const MOCK_VEHICLES = [
  { id: 1, plateNumber: 'ABC-1234', model: 'Toyota Camry', year: 2022, capacity: '5 Seater', driver: 'John Smith', status: 'Active', insuranceExpiry: '2026-12-31', lastService: '2026-05-10' },
  { id: 2, plateNumber: 'XYZ-5678', model: 'Honda Civic', year: 2021, capacity: '5 Seater', driver: 'Sarah Johnson', status: 'Active', insuranceExpiry: '2026-08-15', lastService: '2026-04-20' },
  { id: 3, plateNumber: 'DEF-9012', model: 'Ford Transit', year: 2020, capacity: '12 Seater', driver: 'Michael Brown', status: 'Maintenance', insuranceExpiry: '2026-06-30', lastService: '2026-06-01' },
  { id: 4, plateNumber: 'GHI-3456', model: 'Toyota Hiace', year: 2023, capacity: '14 Seater', driver: 'Emily Davis', status: 'Active', insuranceExpiry: '2027-01-31', lastService: '2026-05-25' },
  { id: 5, plateNumber: 'JKL-7890', model: 'Mitsubishi L200', year: 2022, capacity: 'Pickup', driver: 'David Wilson', status: 'Active', insuranceExpiry: '2026-09-20', lastService: '2026-03-15' },
  { id: 6, plateNumber: 'MNO-1122', model: 'Nissan Sentra', year: 2021, capacity: '5 Seater', driver: 'Lisa Anderson', status: 'Inactive', insuranceExpiry: '2025-11-30', lastService: '2025-10-10' },
];

const STATUS_OPTIONS = ['All', 'Active', 'Maintenance', 'Inactive'];

const VehicleRecords = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const underMaintenance = vehicles.filter(v => v.status === 'Maintenance').length;

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  };

  const handleViewDocuments = (vehicle) => {
    navigate(`/documents/vehicles/${vehicle.id}/documents`);
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success('Vehicle deleted successfully');
    }
  };

  const handleSaveVehicle = async (formData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingVehicle) {
      setVehicles(vehicles.map(v =>
        v.id === editingVehicle.id ? { ...v, ...formData } : v
      ));
      toast.success('Vehicle updated successfully');
    } else {
      const newVehicle = {
        id: Date.now(),
        ...formData,
        lastService: new Date().toISOString().split('T')[0]
      };
      setVehicles([...vehicles, newVehicle]);
      toast.success('Vehicle added successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingVehicle(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredVehicles.map(v => ({
      'Plate Number': v.plateNumber,
      'Model': v.model,
      'Year': v.year,
      'Capacity': v.capacity,
      'Driver': v.driver,
      'Status': v.status,
      'Insurance Expiry': v.insuranceExpiry,
      'Last Service': v.lastService
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');

    ws['!cols'] = [
      { wch: 15 }, // Plate Number
      { wch: 18 }, // Model
      { wch: 8 },  // Year
      { wch: 12 }, // Capacity
      { wch: 15 }, // Driver
      { wch: 12 }, // Status
      { wch: 16 }, // Insurance Expiry
      { wch: 14 }  // Last Service
    ];

    XLSX.writeFile(wb, `vehicles-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Records</h1>
          <p className="text-gray-500">Manage company vehicles</p>
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
            onClick={handleAddVehicle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalVehicles}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiTruck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeVehicles}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiTruck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Under Maintenance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{underMaintenance}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiTruck className="w-6 h-6 text-yellow-600" />
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
            placeholder="Search plate number, model, or driver"
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

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plate No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Insurance Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No vehicles found</td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{v.plateNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{v.model}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{v.year}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{v.capacity}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{v.driver}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        v.status === 'Active' ? 'bg-green-100 text-green-800' :
                        v.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{v.insuranceExpiry}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocuments(v)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Documents"
                        >
                          <FiFile className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditVehicle(v)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(v.id)}
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

      {/* Add/Edit Vehicle Modal */}
      {modalOpen && (
        <VehicleModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingVehicle(null);
          }}
          onSave={handleSaveVehicle}
          vehicle={editingVehicle}
          loading={loading}
        />
      )}
    </div>
  );
};

// Vehicle Modal Component
const VehicleModal = ({ isOpen, onClose, onSave, vehicle, loading }) => {
  const [formData, setFormData] = useState({
    plateNumber: vehicle?.plateNumber || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    capacity: vehicle?.capacity || '5 Seater',
    driver: vehicle?.driver || '',
    status: vehicle?.status || 'Active',
    insuranceExpiry: vehicle?.insuranceExpiry || ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        plateNumber: vehicle?.plateNumber || '',
        model: vehicle?.model || '',
        year: vehicle?.year || new Date().getFullYear(),
        capacity: vehicle?.capacity || '5 Seater',
        driver: vehicle?.driver || '',
        status: vehicle?.status || 'Active',
        insuranceExpiry: vehicle?.insuranceExpiry || ''
      });
    }
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.plateNumber || !formData.model || !formData.driver) {
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
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
            <input
              type="text"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. ABC-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Toyota Camry"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <select
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5 Seater">5 Seater</option>
              <option value="12 Seater">12 Seater</option>
              <option value="14 Seater">14 Seater</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
            <input
              type="text"
              value={formData.driver}
              onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
              placeholder="Driver name"
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
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
            <input
              type="date"
              value={formData.insuranceExpiry}
              onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
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
              {vehicle ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRecords;