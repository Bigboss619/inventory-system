import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTruck, FiDownload, FiX, FiFile, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/api';

const STATUS_OPTIONS = ['All', 'Active', 'Maintenance', 'Inactive'];

// Header Component
const Header = ({ onExport, onAdd }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Vehicle Records</h1>
      <p className="text-gray-500">Manage company vehicles</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FiDownload className="w-5 h-5" />
        <span>Export</span>
      </button>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiPlus className="w-5 h-5" />
        <span>Add Vehicle</span>
      </button>
    </div>
  </div>
);

// StatsCards Component
const StatsCards = ({ total, active, maintenance }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
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
          <p className="text-2xl font-bold text-gray-900 mt-1">{active}</p>
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
          <p className="text-2xl font-bold text-gray-900 mt-1">{maintenance}</p>
        </div>
        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
          <FiTruck className="w-6 h-6 text-yellow-600" />
        </div>
      </div>
    </div>
  </div>
);

// SearchFilter Component
const SearchFilter = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }) => (
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
);

// VehicleTable Component
const VehicleTable = ({ vehicles, onEdit, onDelete, onViewDocuments }) => (
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
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No vehicles found</td>
            </tr>
          ) : (
            vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{v.plate_number}</td>
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
                <td className="px-4 py-4 text-sm text-gray-700">{v.insurance_expiry}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDocuments(v)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Documents"
                    >
                      <FiFile className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(v)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(v.id)}
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
);

// VehicleModal Component
const VehicleModal = ({ isOpen, onClose, onSave, vehicle, loading }) => {
  const [formData, setFormData] = useState({
    plateNumber: vehicle?.plate_number || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    capacity: vehicle?.capacity || '5 Seater',
    driver: vehicle?.driver || '',
    status: vehicle?.status || 'Active',
    insuranceExpiry: vehicle?.insurance_expiry || ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        plateNumber: vehicle?.plate_number || '',
        model: vehicle?.model || '',
        year: vehicle?.year || new Date().getFullYear(),
        capacity: vehicle?.capacity || '5 Seater',
        driver: vehicle?.driver || '',
        status: vehicle?.status || 'Active',
        insuranceExpiry: vehicle?.insurance_expiry || ''
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
    // Convert camelCase to snake_case for API
    const apiData = {
      plateNumber: formData.plateNumber,
      model: formData.model,
      year: formData.year,
      capacity: formData.capacity,
      driver: formData.driver,
      status: formData.status,
      insuranceExpiry: formData.insuranceExpiry
    };
    onSave(apiData);
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

// Main VehicleRecords Component
const VehicleRecords = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data || []);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const totalVehicles = vehicles.length;
  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'Active').length, [vehicles]);
  const underMaintenance = useMemo(() => vehicles.filter(v => v.status === 'Maintenance').length, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        setVehicles(vehicles.filter(v => v.id !== id));
        toast.success('Vehicle deleted successfully');
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleSaveVehicle = async (formData) => {
    setLoading(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await createVehicle(formData);
        toast.success('Vehicle added successfully');
      }
      await fetchVehicles();
      setModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      toast.error('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredVehicles.map(v => ({
      'Plate Number': v.plate_number,
      'Model': v.model,
      'Year': v.year,
      'Capacity': v.capacity,
      'Driver': v.driver,
      'Status': v.status,
      'Insurance Expiry': v.insurance_expiry,
      'Last Service': v.last_service
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');

    ws['!cols'] = [
      { wch: 15 },
      { wch: 18 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 16 },
      { wch: 14 }
    ];

    XLSX.writeFile(wb, `vehicles-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <Header onExport={handleExportExcel} onAdd={handleAddVehicle} />
      <StatsCards total={totalVehicles} active={activeVehicles} maintenance={underMaintenance} />
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <VehicleTable
        vehicles={filteredVehicles}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
        onViewDocuments={handleViewDocuments}
      />

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

export default VehicleRecords;