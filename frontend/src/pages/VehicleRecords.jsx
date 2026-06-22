import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTruck, FiDownload, FiX, FiFile, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicleDocuments, createDocument, updateDocument, deleteDocument, getMaintenanceRecords, createMaintenance, updateMaintenance, deleteMaintenance } from '../services/api';
import ConfirmModal from '../components/ui/ConfirmModal';

const STATUS_OPTIONS = ['All', 'Active', 'Maintenance', 'Inactive'];

// Column mapping for new schema
const COLUMN_CONFIG = {
  assetId: { label: 'Asset ID', key: 'asset_id' },
  chassisNumber: { label: 'Chassis No.', key: 'chassis_number' },
  plateNumber: { label: 'Plate No.', key: 'plate_number' },
  model: { label: 'Model', key: 'model' },
  staffName: { label: 'Staff Name', key: 'staff_name' },
  staffEmail: { label: 'Staff Email', key: 'staff_email' }
};

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
const SearchFilter = ({ searchQuery, setSearchQuery }) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="relative flex-1">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search asset ID, plate number, model, or staff name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
);

// VehicleTable Component
const VehicleTable = ({ vehicles, onEdit, onDelete, onViewDocuments }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chassis No.</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plate No.</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Email</th>
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
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{v.name || '-'}</td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{v.asset_id}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{v.chassis_number}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{v.plate_number || '-'}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{v.model}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{v.staff_name || '-'}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{v.staff_email || '-'}</td>
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
                      onClick={() => onDelete(v.asset_id)}
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
const VehicleModal = ({ isOpen, onClose, onSave, vehicle, loading, fetchDocsAndMaint }) => {
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    chassisNumber: vehicle?.chassis_number || '',
    plateNumber: vehicle?.plate_number || '',
    model: vehicle?.model || '',
    staffName: vehicle?.staff_name || '',
    staffEmail: vehicle?.staff_email || '',
    documents: [],
    maintenance: []
  });

  const [activeTab, setActiveTab] = useState('vehicle');

  React.useEffect(() => {
    const loadData = async () => {
      if (isOpen && vehicle?.asset_id) {
        // Fetch existing documents and maintenance
        if (fetchDocsAndMaint) {
          const { docs, maint } = await fetchDocsAndMaint(vehicle.asset_id);
          setFormData({
            name: vehicle?.name || '',
            chassisNumber: vehicle?.chassis_number || '',
            plateNumber: vehicle?.plate_number || '',
            model: vehicle?.model || '',
            staffName: vehicle?.staff_name || '',
            staffEmail: vehicle?.staff_email || '',
            documents: docs || [],
            maintenance: maint || []
          });
        }
      } else if (isOpen && !vehicle) {
        // New vehicle - reset form
        setFormData({
          name: '',
          chassisNumber: '',
          plateNumber: '',
          model: '',
          staffName: '',
          staffEmail: '',
          documents: [],
          maintenance: []
        });
      }
    };
    loadData();
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.chassisNumber || !formData.model) {
      toast.error('Please fill in all required fields (Chassis Number, Model)');
      return;
    }
    const apiData = {
      name: formData.name || null,
      chassisNumber: formData.chassisNumber,
      plateNumber: formData.plateNumber || null,
      model: formData.model,
      staffName: formData.staffName || null,
      staffEmail: formData.staffEmail || null,
      documents: formData.documents,
      maintenance: formData.maintenance
    };
    onSave(apiData);
  };

  const addDocument = () => {
    setFormData({
      ...formData,
      documents: [...formData.documents, { name: '', issueDate: '', expiryDate: '', status: 'active', reminderDays: 30 }]
    });
  };

  const updateDocument = (index, field, value) => {
    const updated = [...formData.documents];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, documents: updated });
  };

  const removeDocument = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
  };

  const addMaintenance = () => {
    setFormData({
      ...formData,
      maintenance: [...formData.maintenance, { maintenanceType: '', lastService: '', nextDue: '', cost: '', reminderDays: 30, notes: '' }]
    });
  };

  const updateMaintenance = (index, field, value) => {
    const updated = [...formData.maintenance];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, maintenance: updated });
  };

  const removeMaintenance = (index) => {
    setFormData({
      ...formData,
      maintenance: formData.maintenance.filter((_, i) => i !== index)
    });
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
        <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                type="button"
                onClick={() => setActiveTab('vehicle')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'vehicle' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Vehicle
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Documents ({formData.documents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('maintenance')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'maintenance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Maintenance ({formData.maintenance.length})
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {activeTab === 'vehicle' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Company Car 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number *</label>
                  <input
                    type="text"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. JM1BK343551234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                  <input
                    type="text"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                    placeholder="Staff name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Email</label>
                  <input
                    type="email"
                    value={formData.staffEmail}
                    onChange={(e) => setFormData({ ...formData, staffEmail: e.target.value })}
                    placeholder="email@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Document {index + 1}</span>
                      <button type="button" onClick={() => removeDocument(index)} className="text-red-500 text-sm">Remove</button>
                    </div>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocument(index, 'name', e.target.value)}
                      placeholder="Document name (e.g. Insurance)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={doc.issueDate}
                        onChange={(e) => updateDocument(index, 'issueDate', e.target.value)}
                        placeholder="Issue date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={doc.expiryDate}
                        onChange={(e) => updateDocument(index, 'expiryDate', e.target.value)}
                        placeholder="Expiry date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addDocument} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500">
                  + Add Document
                </button>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {formData.maintenance.map((maint, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Maintenance {index + 1}</span>
                      <button type="button" onClick={() => removeMaintenance(index)} className="text-red-500 text-sm">Remove</button>
                    </div>
                    <input
                      type="text"
                      value={maint.maintenanceType}
                      onChange={(e) => updateMaintenance(index, 'maintenanceType', e.target.value)}
                      placeholder="Type (e.g. Oil Change)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={maint.lastService}
                        onChange={(e) => updateMaintenance(index, 'lastService', e.target.value)}
                        placeholder="Last service"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={maint.nextDue}
                        onChange={(e) => updateMaintenance(index, 'nextDue', e.target.value)}
                        placeholder="Next due"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="number"
                      value={maint.cost}
                      onChange={(e) => updateMaintenance(index, 'cost', e.target.value)}
                      placeholder="Cost ($)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button type="button" onClick={addMaintenance} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500">
                  + Add Maintenance
                </button>
              </div>
            )}

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
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

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

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = (v.asset_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.plate_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.staff_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [vehicles, searchQuery]);

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  };

  // Helper to format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    // If string, extract date portion using regex
    if (typeof date === 'string') {
      // Match YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS pattern and extract just the date
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
      return date;
    }
    // If it's a Date object
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  // Fetch documents and maintenance for a vehicle
  const fetchDocsAndMaint = async (assetId) => {
    try {
      const [docsRes, maintRes] = await Promise.all([
        getVehicleDocuments(assetId),
        getMaintenanceRecords(assetId)
      ]);
      // Transform to match form format
      const docs = (docsRes || []).map(d => ({
        name: d.name,
        issueDate: formatDateForInput(d.issue_date),
        expiryDate: formatDateForInput(d.expiry_date),
        status: d.status || 'active',
        reminderDays: d.reminder_days || 30
      }));
      const maint = (maintRes || []).map(m => ({
        maintenanceType: m.maintenance_type,
        lastService: formatDateForInput(m.last_service),
        nextDue: formatDateForInput(m.next_due),
        cost: m.cost || '',
        reminderDays: m.reminder_days || 30,
        notes: m.notes || ''
      }));
      return { docs, maint };
    } catch (error) {
      console.error('Error fetching docs/maintenance:', error);
      return { docs: [], maint: [] };
    }
  };

  const handleViewDocuments = (vehicle) => {
    // Navigate to documents tab or open document modal
    navigate(`/vehicles/${vehicle.asset_id}/documents`);
  };

  const handleDeleteVehicle = async (assetId) => {
    setConfirmModal({
      open: true,
      title: 'Delete Vehicle',
      message: 'Are you sure you want to delete this vehicle?',
      onConfirm: async () => {
        try {
          await deleteVehicle(assetId);
          setVehicles(vehicles.filter(v => v.asset_id !== assetId));
          toast.success('Vehicle deleted successfully');
          setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
        } catch (error) {
          toast.error('Failed to delete vehicle');
        }
      }
    });
  };

  const handleSaveVehicle = async (formData) => {
    setLoading(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.asset_id, formData);
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
      'Asset ID': v.asset_id,
      'Chassis Number': v.chassis_number,
      'Plate Number': v.plate_number,
      'Model': v.model,
      'Staff Name': v.staff_name,
      'Staff Email': v.staff_email
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');

    ws['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 }
    ];

    XLSX.writeFile(wb, `vehicles-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <Header onExport={handleExportExcel} onAdd={handleAddVehicle} />
      <StatsCards total={totalVehicles} active={totalVehicles} maintenance={0} />
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
          fetchDocsAndMaint={fetchDocsAndMaint}
        />
      )}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};

export default VehicleRecords;