import React, { useState, useMemo, useEffect } from 'react';
import { FiPlus, FiSearch, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getAllMaintenance, getVehicles, createMaintenance, updateMaintenance, deleteMaintenance } from '../services/api';
import { StatsCard, MaintenanceTable, MaintenanceModal } from '../components/maintenance';
import ConfirmModal from '../components/ui/ConfirmModal';

const STATUS_OPTIONS = ['All', 'Pending', 'Scheduled', 'In Progress', 'Completed'];
const TYPE_OPTIONS = ['All', 'Oil Change', 'Tire Rotation', 'Brake Repair', 'General Service', 'Engine Repair', 'Air Filter', 'Wheel Alignment'];

const MaintenanceTracker = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maintenanceData, vehiclesData] = await Promise.all([
          getAllMaintenance(),
          getVehicles()
        ]);
        setVehicles(vehiclesData || []);
        setMaintenance(maintenanceData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load maintenance records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  const totalRecords = maintenance.length;
  const pendingRecords = maintenance.filter(m => {
    const nextDue = m.next_due ? new Date(m.next_due) : null;
    return !m.last_service && nextDue && nextDue < today;
  }).length;
  const inProgress = maintenance.filter(m => m.last_service && !m.next_due).length;
  const completedThisMonth = maintenance.filter(m => m.last_service).length;

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter(m => {
      const vehicleName = m.vehicle_name || m.asset_id || '';
      const matchesSearch = vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.maintenance_type || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || (m.status || 'Pending') === statusFilter;
      const matchesType = typeFilter === 'All' || m.maintenance_type === typeFilter;
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

  const handleDeleteRecord = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Record',
      message: 'Are you sure you want to delete this record?',
      onConfirm: async () => {
        try {
          await deleteMaintenance(id);
          setMaintenance(maintenance.filter(m => m.id !== id));
          toast.success('Record deleted successfully');
          setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
        } catch (error) {
          console.error('Error deleting record:', error);
          toast.error('Failed to delete record');
        }
      }
    });
  };

  const handleSaveRecord = async (formData) => {
    setLoading(true);
    try {
      if (editingRecord) {
        await updateMaintenance(editingRecord.id, {
          maintenanceType: formData.type,
          lastService: formData.serviceDate,
          nextDue: formData.nextDue,
          cost: formData.cost,
          reminderDays: formData.reminderDays,
          notes: formData.notes
        });
        setMaintenance(maintenance.map(m =>
          m.id === editingRecord.id ? {
            ...m,
            maintenance_type: formData.type,
            last_service: formData.serviceDate,
            next_due: formData.nextDue,
            cost: formData.cost,
            reminder_days: formData.reminderDays,
            notes: formData.notes
          } : m
        ));
        toast.success('Record updated successfully');
      } else {
        await createMaintenance({
          assetId: formData.vehicleAssetId,
          maintenanceType: formData.type,
          lastService: formData.serviceDate,
          nextDue: formData.nextDue,
          cost: formData.cost,
          reminderDays: formData.reminderDays,
          notes: formData.notes
        });
        toast.success('Record added successfully');
        const maintenanceData = await getAllMaintenance();
        setMaintenance(maintenanceData || []);
      }

      setModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredMaintenance.map(m => ({
      'Vehicle': m.vehicle_name || m.asset_id,
      'Type': m.maintenance_type,
      'Cost ($)': m.cost,
      'Status': m.status || 'Pending',
      'Service Date': m.last_service || '-',
      'Next Due': m.next_due,
      'Provider': m.notes || '-'
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance');

    ws['!cols'] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 }
    ];

    XLSX.writeFile(wb, `maintenance-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard title="Total Records" value={totalRecords} icon="FiTool" color="blue" />
        <StatsCard title="Pending" value={pendingRecords} icon="FiClock" color="yellow" />
        <StatsCard title="In Progress" value={inProgress} icon="FiTool" color="orange" />
        <StatsCard title="Completed" value={completedThisMonth} icon="FiCheck" color="green" />
      </div>

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

      <MaintenanceTable
        records={filteredMaintenance}
        loading={loading}
        onEdit={handleEditRecord}
        onDelete={handleDeleteRecord}
      />

      {modalOpen && (
        <MaintenanceModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
          record={editingRecord}
          vehicles={vehicles}
          loading={loading}
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

export default MaintenanceTracker;