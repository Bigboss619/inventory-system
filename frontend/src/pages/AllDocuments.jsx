import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFileText, FiAlertTriangle, FiCheck, FiX, FiDownload, FiX as FiXIcon, FiEye, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { getAllDocuments, getVehicles, updateDocument, deleteDocument, createDocument } from '../services/api';

const STATUS_OPTIONS = ['All', 'Active', 'Expiring Soon', 'Expired'];
const TYPE_OPTIONS = ['All', 'Insurance', 'Registration', 'Tax', 'Permit', 'Other'];

const AllDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Fetch all documents and vehicles on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsData, vehiclesData] = await Promise.all([
          getAllDocuments(),
          getVehicles()
        ]);
        setVehicles(vehiclesData || []);

        // Calculate status for each document based on expiry date
        const today = new Date();
        const docsWithStatus = (docsData || []).map(d => {
          const expiry = d.expiry_date ? new Date(d.expiry_date) : null;
          let status = 'Active';
          let docStatus = 'Active';
          if (expiry) {
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry < 0) {
              status = 'Expired';
              docStatus = 'Expired';
            } else if (daysUntilExpiry <= (d.reminder_days || 30)) {
              status = 'Expiring Soon';
              docStatus = 'Expiring Soon';
            }
          }
          return { ...d, status, docStatus };
        });

        setDocuments(docsWithStatus);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(d => d.status === 'Active').length;
  const expiringSoon = documents.filter(d => d.status === 'Expiring Soon').length;
  const expired = documents.filter(d => d.status === 'Expired').length;

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(d => {
      const vehicleName = d.vehicleName || d.vehicleAssetId || '';
      const docName = d.name || '';
      const matchesSearch = vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesType = typeFilter === 'All' || (d.name || '').includes(typeFilter);
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, searchQuery, statusFilter, typeFilter]);

  const handleAddDocument = () => {
    setEditingDocument(null);
    setModalOpen(true);
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setModalOpen(true);
  };

  const handleViewVehicle = (assetId) => {
    navigate(`/documents/vehicles?vehicle=${assetId}`);
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(d => d.id !== id));
        toast.success('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const handleSaveDocument = async (formData) => {
    setLoading(true);
    try {
      // Calculate status based on expiry date
      const today = new Date();
      const expiry = formData.expiryDate ? new Date(formData.expiryDate) : null;
      let status = 'Active';
      if (expiry) {
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 0) {
          status = 'Expired';
        } else if (daysUntilExpiry <= (formData.reminderDays || 30)) {
          status = 'Expiring Soon';
        }
      }

      if (editingDocument) {
        await updateDocument(editingDocument.id, {
          name: formData.name,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          status: status,
          reminderDays: formData.reminderDays
        });
        setDocuments(documents.map(d =>
          d.id === editingDocument.id ? { ...d, ...formData, status } : d
        ));
        toast.success('Document updated successfully');
      } else {
        await createDocument({
          assetId: formData.vehicleAssetId,
          name: formData.name,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          status: status,
          reminderDays: formData.reminderDays
        });
        toast.success('Document added successfully');
        // Refresh documents
        const docsData = await getAllDocuments();
        const today = new Date();
        const docsWithStatus = (docsData || []).map(d => {
          const exp = d.expiry_date ? new Date(d.expiry_date) : null;
          let docStatus = 'Active';
          if (exp) {
            const daysUntilExpiry = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry < 0) docStatus = 'Expired';
            else if (daysUntilExpiry <= (d.reminder_days || 30)) docStatus = 'Expiring Soon';
          }
          return { ...d, status: docStatus, docStatus };
        });
        setDocuments(docsWithStatus);
      }

      setModalOpen(false);
      setEditingDocument(null);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredDocuments.map(d => ({
      'Vehicle': d.vehicleName || d.vehicleAssetId,
      'Document': d.name,
      'Issue Date': d.issue_date,
      'Expiry Date': d.expiry_date,
      'Status': d.status
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Documents');

    ws['!cols'] = [
      { wch: 12 }, // Vehicle
      { wch: 20 }, // Document
      { wch: 12 }, // Issue Date
      { wch: 12 }, // Expiry Date
      { wch: 12 }  // Status
    ];

    XLSX.writeFile(wb, `all-documents-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Documents</h1>
          <p className="text-gray-500">View all vehicle documents</p>
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
            onClick={handleAddDocument}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalDocuments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeDocuments}</p>
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicle, document or doc number"
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

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doc #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <FiLoader className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No documents found</td>
                </tr>
              ) : (
                filteredDocuments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleViewVehicle(d.vehicleAssetId)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FiTruck className="w-4 h-4" />
                        {d.vehicleName || d.vehicleAssetId}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {d.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">-</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.issue_date}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.expiry_date}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        d.status === 'Active' ? 'bg-green-100 text-green-800' :
                        d.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewVehicle(d.vehicleAssetId)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Vehicle Documents"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDocument(d)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(d.id)}
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

      {/* Add/Edit Document Modal */}
      {modalOpen && (
        <DocumentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingDocument(null);
          }}
          onSave={handleSaveDocument}
          document={editingDocument}
          vehicles={vehicles}
          loading={loading}
        />
      )}
    </div>
  );
};

// Document Modal Component
const DocumentModal = ({ isOpen, onClose, onSave, document, vehicles, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    issueDate: '',
    expiryDate: '',
    reminderDays: 30,
    vehicleAssetId: ''
  });

  React.useEffect(() => {
    if (isOpen && document) {
      setFormData({
        name: document.name || '',
        issueDate: document.issue_date || '',
        expiryDate: document.expiry_date || '',
        reminderDays: document.reminder_days || 30,
        vehicleAssetId: document.vehicleAssetId || ''
      });
    } else if (isOpen && vehicles && vehicles.length > 0) {
      setFormData({
        name: '',
        issueDate: '',
        expiryDate: '',
        reminderDays: 30,
        vehicleAssetId: vehicles[0].asset_id
      });
    }
  }, [isOpen, document, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      toast.error('Please fill in document name and expiry date');
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
            {document ? 'Edit Document' : 'Add Document'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiXIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {!document && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select
                value={formData.vehicleAssetId}
                onChange={(e) => setFormData({ ...formData, vehicleAssetId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {vehicles?.map(v => (
                  <option key={v.asset_id} value={v.asset_id}>{v.name || v.asset_id}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vehicle Insurance"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
              {document ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllDocuments;