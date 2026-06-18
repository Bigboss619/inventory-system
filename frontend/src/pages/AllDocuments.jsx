import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFileText, FiAlertTriangle, FiCheck, FiX, FiDownload, FiX as FiXIcon, FiEye, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Mock data - aggregating documents from all vehicles
const MOCK_ALL_DOCUMENTS = [
  { id: 1, vehicleId: 1, vehicleName: 'ABC-1234', document: 'Vehicle Insurance', type: 'Insurance', docNumber: 'INS-2026-001', issueDate: '2025-12-31', expiryDate: '2026-12-31', status: 'Active', reminderDays: 30 },
  { id: 2, vehicleId: 1, vehicleName: 'ABC-1234', document: 'Vehicle Registration', type: 'Registration', docNumber: 'REG-2026-001', issueDate: '2025-12-31', expiryDate: '2027-12-31', status: 'Active', reminderDays: 90 },
  { id: 3, vehicleId: 1, vehicleName: 'ABC-1234', document: 'Road Tax', type: 'Tax', docNumber: 'TAX-2026-001', issueDate: '2025-12-31', expiryDate: '2026-12-31', status: 'Active', reminderDays: 60 },
  { id: 4, vehicleId: 2, vehicleName: 'XYZ-5678', document: 'Vehicle Insurance', type: 'Insurance', docNumber: 'INS-2026-002', issueDate: '2025-08-15', expiryDate: '2026-08-15', status: 'Active', reminderDays: 30 },
  { id: 5, vehicleId: 2, vehicleName: 'XYZ-5678', document: 'Vehicle Registration', type: 'Registration', docNumber: 'REG-2026-002', issueDate: '2025-08-15', expiryDate: '2027-08-15', status: 'Active', reminderDays: 90 },
  { id: 6, vehicleId: 3, vehicleName: 'DEF-9012', document: 'Vehicle Insurance', type: 'Insurance', docNumber: 'INS-2026-003', issueDate: '2025-06-30', expiryDate: '2026-06-30', status: 'Expiring Soon', reminderDays: 7 },
  { id: 7, vehicleId: 3, vehicleName: 'DEF-9012', document: 'Vehicle Registration', type: 'Registration', docNumber: 'REG-2026-003', issueDate: '2025-06-30', expiryDate: '2026-06-30', status: 'Expiring Soon', reminderDays: 7 },
  { id: 8, vehicleId: 3, vehicleName: 'DEF-9012', document: 'Road Tax', type: 'Tax', docNumber: 'TAX-2026-003', issueDate: '2025-06-01', expiryDate: '2026-06-01', status: 'Expired', reminderDays: 0 },
  { id: 9, vehicleId: 4, vehicleName: 'GHI-3456', document: 'Vehicle Insurance', type: 'Insurance', docNumber: 'INS-2026-004', issueDate: '2026-01-31', expiryDate: '2027-01-31', status: 'Active', reminderDays: 30 },
  { id: 10, vehicleId: 4, vehicleName: 'GHI-3456', document: 'Vehicle Registration', type: 'Registration', docNumber: 'REG-2026-004', issueDate: '2026-01-31', expiryDate: '2028-01-31', status: 'Active', reminderDays: 90 },
  { id: 11, vehicleId: 5, vehicleName: 'JKL-7890', document: 'Vehicle Insurance', type: 'Insurance', docNumber: 'INS-2026-005', issueDate: '2025-09-20', expiryDate: '2026-09-20', status: 'Active', reminderDays: 30 },
  { id: 12, vehicleId: 6, vehicleName: 'MNO-1122', document: 'Vehicle Insurance', type: 'Insurance', docNumber: 'INS-2025-006', issueDate: '2024-11-30', expiryDate: '2025-11-30', status: 'Expired', reminderDays: 0 },
  { id: 13, vehicleId: 6, vehicleName: 'MNO-1122', document: 'Vehicle Registration', type: 'Registration', docNumber: 'REG-2025-006', issueDate: '2024-11-30', expiryDate: '2025-11-30', status: 'Expired', reminderDays: 0 },
];

const STATUS_OPTIONS = ['All', 'Active', 'Expiring Soon', 'Expired'];
const TYPE_OPTIONS = ['All', 'Insurance', 'Registration', 'Tax', 'Permit', 'Other'];

const AllDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(MOCK_ALL_DOCUMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Stats
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(d => d.status === 'Active').length;
  const expiringSoon = documents.filter(d => d.status === 'Expiring Soon').length;
  const expired = documents.filter(d => d.status === 'Expired').length;

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch = d.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesType = typeFilter === 'All' || d.type === typeFilter;
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

  const handleViewVehicle = (vehicleId) => {
    navigate(`/documents/vehicles/${vehicleId}/documents`);
  };

  const handleDeleteDocument = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id));
      toast.success('Document deleted successfully');
    }
  };

  const handleSaveDocument = async (formData) => {
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

    if (editingDocument) {
      setDocuments(documents.map(d =>
        d.id === editingDocument.id ? { ...d, ...formData, status } : d
      ));
      toast.success('Document updated successfully');
    } else {
      const newDocument = {
        id: Date.now(),
        ...formData,
        status
      };
      setDocuments([...documents, newDocument]);
      toast.success('Document added successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingDocument(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredDocuments.map(d => ({
      'Vehicle': d.vehicleName,
      'Document': d.document,
      'Type': d.type,
      'Doc Number': d.docNumber,
      'Issue Date': d.issueDate,
      'Expiry Date': d.expiryDate,
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
      { wch: 12 }, // Type
      { wch: 15 }, // Doc Number
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doc Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No documents found</td>
                </tr>
              ) : (
                filteredDocuments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleViewVehicle(d.vehicleId)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <FiTruck className="w-4 h-4" />
                        {d.vehicleName}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.document}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.docNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.issueDate}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.expiryDate}</td>
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
                          onClick={() => handleViewVehicle(d.vehicleId)}
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
          loading={loading}
        />
      )}
    </div>
  );
};

// Document Modal Component
const DocumentModal = ({ isOpen, onClose, onSave, document, loading }) => {
  const [formData, setFormData] = useState({
    vehicleId: document?.vehicleId || 1,
    vehicleName: document?.vehicleName || 'ABC-1234',
    document: document?.document || '',
    type: document?.type || 'Insurance',
    docNumber: document?.docNumber || '',
    issueDate: document?.issueDate || '',
    expiryDate: document?.expiryDate || '',
    reminderDays: document?.reminderDays || 30
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: document?.vehicleId || 1,
        vehicleName: document?.vehicleName || 'ABC-1234',
        document: document?.document || '',
        type: document?.type || 'Insurance',
        docNumber: document?.docNumber || '',
        issueDate: document?.issueDate || '',
        expiryDate: document?.expiryDate || '',
        reminderDays: document?.reminderDays || 30
      });
    }
  }, [isOpen, document]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.document || !formData.docNumber || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  const vehicleOptions = [
    { id: 1, name: 'ABC-1234' },
    { id: 2, name: 'XYZ-5678' },
    { id: 3, name: 'DEF-9012' },
    { id: 4, name: 'GHI-3456' },
    { id: 5, name: 'JKL-7890' },
    { id: 6, name: 'MNO-1122' },
  ];

  const typeOptions = ['Insurance', 'Registration', 'Tax', 'Permit', 'Other'];

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => {
                const selected = vehicleOptions.find(v => v.id === parseInt(e.target.value));
                setFormData({ ...formData, vehicleId: parseInt(e.target.value), vehicleName: selected.name });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {vehicleOptions.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
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
              {typeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number *</label>
            <input
              type="text"
              value={formData.docNumber}
              onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
              placeholder="e.g. INS-2026-001"
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