import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiDownload, FiEye, FiTrash2, FiFile, FiPlus, FiX, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ui/ConfirmModal';

// Mock data - vehicles
const MOCK_VEHICLES = [
  { id: 1, plateNumber: 'ABC-1234', model: 'Toyota Camry', year: 2022 },
  { id: 2, plateNumber: 'XYZ-5678', model: 'Honda Civic', year: 2021 },
  { id: 3, plateNumber: 'DEF-9012', model: 'Ford Transit', year: 2020 },
  { id: 4, plateNumber: 'GHI-3456', model: 'Toyota Hiace', year: 2023 },
  { id: 5, plateNumber: 'JKL-7890', model: 'Mitsubishi L200', year: 2022 },
  { id: 6, plateNumber: 'MNO-1122', model: 'Nissan Sentra', year: 2021 },
];

// Mock data - documents for vehicles
const MOCK_DOCUMENTS = [
  { id: 1, vehicleId: 1, name: 'Vehicle Registration', type: 'Registration', documentNumber: 'VR-2025-001', issueDate: '2025-01-10', expiryDate: '2026-01-10', status: 'Active', file: 'vr_abc1234.pdf' },
  { id: 2, vehicleId: 1, name: 'Insurance Policy', type: 'Insurance', documentNumber: 'INS-2025-001', issueDate: '2025-01-10', expiryDate: '2026-01-10', status: 'Active', file: 'insurance_abc1234.pdf' },
  { id: 3, vehicleId: 1, name: 'Road Worthiness', type: 'Certificate', documentNumber: 'RW-2025-001', issueDate: '2025-06-15', expiryDate: '2025-12-15', status: 'Expired', file: 'rw_abc1234.pdf' },
  { id: 4, vehicleId: 2, name: 'Vehicle Registration', type: 'Registration', documentNumber: 'VR-2024-002', issueDate: '2024-02-15', expiryDate: '2025-02-15', status: 'Expired', file: 'vr_xyz5678.pdf' },
  { id: 5, vehicleId: 2, name: 'Insurance Policy', type: 'Insurance', documentNumber: 'INS-2026-002', issueDate: '2026-02-15', expiryDate: '2027-02-15', status: 'Active', file: 'insurance_xyz5678.pdf' },
  { id: 6, vehicleId: 2, name: 'Road Worthiness', type: 'Certificate', documentNumber: 'RW-2026-002', issueDate: '2026-02-20', expiryDate: '2026-08-20', status: 'Active', file: 'rw_xyz5678.pdf' },
  { id: 7, vehicleId: 3, name: 'Vehicle Registration', type: 'Registration', documentNumber: 'VR-2024-003', issueDate: '2024-03-01', expiryDate: '2025-03-01', status: 'Expired', file: 'vr_def9012.pdf' },
  { id: 8, vehicleId: 3, name: 'Insurance Policy', type: 'Insurance', documentNumber: 'INS-2026-003', issueDate: '2026-03-01', expiryDate: '2027-03-01', status: 'Active', file: 'insurance_def9012.pdf' },
  { id: 9, vehicleId: 4, name: 'Vehicle Registration', type: 'Registration', documentNumber: 'VR-2026-004', issueDate: '2026-04-20', expiryDate: '2027-04-20', status: 'Active', file: 'vr_ghi3456.pdf' },
  { id: 10, vehicleId: 4, name: 'Insurance Policy', type: 'Insurance', documentNumber: 'INS-2026-004', issueDate: '2026-04-20', expiryDate: '2027-04-20', status: 'Active', file: 'insurance_ghi3456.pdf' },
  { id: 11, vehicleId: 4, name: 'Road Worthiness', type: 'Certificate', documentNumber: 'RW-2026-004', issueDate: '2026-04-25', expiryDate: '2026-10-25', status: 'Active', file: 'rw_ghi3456.pdf' },
  { id: 12, vehicleId: 5, name: 'Vehicle Registration', type: 'Registration', documentNumber: 'VR-2025-005', issueDate: '2025-05-12', expiryDate: '2026-05-12', status: 'Active', file: 'vr_jkl7890.pdf' },
  { id: 13, vehicleId: 6, name: 'Vehicle Registration', type: 'Registration', documentNumber: 'VR-2025-006', issueDate: '2025-11-30', expiryDate: '2026-11-30', status: 'Active', file: 'vr_mno1122.pdf' },
];

const DOCUMENT_TYPES = ['All', 'Registration', 'Insurance', 'Certificate', 'Permit', 'Other'];
const STATUS_OPTIONS = ['All', 'Active', 'Expiring Soon', 'Expired'];

const VehicleDocuments = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  // Find vehicle
  const vehicle = MOCK_VEHICLES.find(v => v.id === parseInt(vehicleId)) || MOCK_VEHICLES[0];

  const [documents, setDocuments] = useState(MOCK_DOCUMENTS.filter(d => d.vehicleId === vehicle.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  // Stats
  const totalDocs = documents.length;
  const activeDocs = documents.filter(d => d.status === 'Active').length;
  const expiringSoon = documents.filter(d => {
    const expiry = new Date(d.expiryDate);
    const today = new Date();
    const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  }).length;
  const expiredDocs = documents.filter(d => d.status === 'Expired').length;

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || d.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, typeFilter, statusFilter]);

  const handleDeleteDocument = (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?',
      onConfirm: () => {
        setDocuments(documents.filter(d => d.id !== id));
        toast.success('Document deleted successfully');
        setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleAddDocument = (formData) => {
    const newDoc = {
      id: Date.now(),
      vehicleId: vehicle.id,
      ...formData
    };
    setDocuments([...documents, newDoc]);
    toast.success('Document added successfully');
    setModalOpen(false);
  };

  const handleExportExcel = () => {
    const exportData = filteredDocuments.map(d => ({
      'Document Name': d.name,
      'Type': d.type,
      'Document Number': d.documentNumber || '-',
      'Issue Date': d.issueDate,
      'Expiry Date': d.expiryDate,
      'Status': d.status,
      'File': d.file
    }));

    if (exportData.length === 0) {
      toast.error('No documents to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documents');

    ws['!cols'] = [
      { wch: 25 }, // Name
      { wch: 15 }, // Type
      { wch: 18 }, // Document Number
      { wch: 14 }, // Issue Date
      { wch: 14 }, // Expiry Date
      { wch: 12 }, // Status
      { wch: 25 }  // File
    ];

    XLSX.writeFile(wb, `${vehicle.plateNumber}-documents-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Vehicle not found</p>
          <button
            onClick={() => navigate('/documents/vehicles')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to Vehicle Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/documents/vehicles')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{vehicle.plateNumber}</h1>
              <span className="text-gray-500">- {vehicle.model}</span>
            </div>
            <p className="text-gray-500">Vehicle Documents</p>
          </div>
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
            onClick={() => setModalOpen(true)}
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalDocs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiFile className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeDocs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiFile className="w-6 h-6 text-green-600" />
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
              <FiFile className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{expiredDocs}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiFile className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents"
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
          {DOCUMENT_TYPES.map(type => (
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document Name</th>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No documents found</td>
                </tr>
              ) : (
                filteredDocuments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.documentNumber || '-'}</td>
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
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <FiDownload className="w-4 h-4" />
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

      {/* Add Document Modal */}
      {modalOpen && (
        <AddDocumentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleAddDocument}
        />
      )}
    </div>
  );
};

// Add Document Modal
const AddDocumentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Registration',
    documentNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Active',
    file: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      toast.error('Please fill in required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vehicle Registration"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {DOCUMENT_TYPES.filter(t => t !== 'All').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="e.g. VR-2025-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="text"
              value={formData.file}
              onChange={(e) => setFormData({ ...formData, file: e.target.value })}
              placeholder="filename.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Document
            </button>
          </div>
        </form>
      </div>
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

export default VehicleDocuments;