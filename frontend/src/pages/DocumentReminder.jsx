import React, { useState, useMemo, useEffect } from 'react';
import { FiPlus, FiSearch, FiDownload, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getAllDocuments } from '../services/api';
import { StatsCard, MaintenanceTable } from '../components/maintenance';
import { ReminderTable, ReminderModal } from '../components/documents';

const STATUS_OPTIONS = ['All', 'Expiring Soon', 'Expired'];

const DocumentReminder = () => {
  const [documents, setDocuments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await getAllDocuments();
        setDocuments(docs || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const today = new Date();

  // Filter to show only expired or expiring soon
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (!doc.expiry_date) return false;

      const expiry = new Date(doc.expiry_date);
      const reminderDays = doc.reminder_days || 30;
      const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = daysUntil <= reminderDays && daysUntil >= 0;
      const isExpired = daysUntil < 0;

      // Only show documents that are expired or expiring soon
      if (!isExpired && !isExpiringSoon) return false;

      // Apply search filter
      const docName = doc.name || doc.document_name || '';
      const matchesSearch = docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.category || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Apply status filter
      let docStatus = 'Expiring Soon';
      if (daysUntil < 0) docStatus = 'Expired';
      const matchesStatus = statusFilter === 'All' || docStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  // Sort by expiry date (most urgent first)
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      const dateA = new Date(a.expiry_date);
      const dateB = new Date(b.expiry_date);
      return dateA - dateB;
    });
  }, [filteredDocuments]);

  // Stats
  const expired = sortedDocuments.filter(d => {
    const expiry = new Date(d.expiry_date);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) < 0;
  }).length;

  const expiringSoon = sortedDocuments.filter(d => {
    if (!d.expiry_date) return false;
    const expiry = new Date(d.expiry_date);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days >= 0;
  }).length;

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
      setDocuments(documents.filter(d => d.id !== id));
      toast.success('Reminder deleted successfully');
    }
  };

  const handleSaveReminder = async (formData) => {
    setLoading(true);
    try {
      const newDoc = {
        id: Date.now(),
        document_name: formData.document,
        category: formData.type,
        expiry_date: formData.expiryDate,
        reminder_days: formData.reminderDays,
        vehicle_asset_id: null
      };

      if (editingReminder) {
        setDocuments(documents.map(d =>
          d.id === editingReminder.id ? { ...d, ...newDoc } : d
        ));
        toast.success('Reminder updated successfully');
      } else {
        setDocuments([...documents, newDoc]);
        toast.success('Reminder added successfully');
      }

      setModalOpen(false);
      setEditingReminder(null);
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = sortedDocuments.map(d => ({
      'Document': d.name || d.document_name,
      'Type': d.category || 'Vehicle',
      'Expiry Date': d.expiry_date,
      'Days Left': Math.ceil((new Date(d.expiry_date) - today) / (1000 * 60 * 60 * 24))
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reminders');

    ws['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 }
    ];

    XLSX.writeFile(wb, `reminders-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Reminders</h1>
          <p className="text-gray-500">Expired or expiring soon documents</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <StatsCard
          title="Total Attention Needed"
          value={sortedDocuments.length}
          icon="FiTool"
          color="blue"
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringSoon}
          icon="FiAlertTriangle"
          color="yellow"
        />
        <StatsCard
          title="Expired"
          value={expired}
          icon="FiCheck"
          color="red"
        />
      </div>

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

      <ReminderTable
        records={sortedDocuments}
        loading={loading}
        onEdit={handleEditReminder}
        onDelete={handleDeleteReminder}
      />

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

export default DocumentReminder;