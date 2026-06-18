import React, { useState } from 'react';
import { FiUpload, FiFile, FiCheck, FiX, FiDownload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Mock upload history
const MOCK_UPLOADS = [
  { id: 1, fileName: 'inventory_items.xlsx', type: 'Items', records: 150, uploadedBy: 'Admin', date: '2026-06-15', status: 'Success' },
  { id: 2, fileName: 'staff_list.csv', type: 'Staff', records: 45, uploadedBy: 'Admin', date: '2026-06-10', status: 'Success' },
  { id: 3, fileName: 'vehicle_records.xlsx', type: 'Vehicles', records: 25, uploadedBy: 'Admin', date: '2026-06-05', status: 'Success' },
  { id: 4, fileName: 'categories_new.xlsx', type: 'Categories', records: 8, uploadedBy: 'Admin', date: '2026-05-28', status: 'Failed' },
  { id: 5, fileName: 'items_backup.xlsx', type: 'Items', records: 200, uploadedBy: 'Admin', date: '2025-12-20', status: 'Success' },
];

const FILE_TYPES = [
  { value: 'items', label: 'Items', template: 'Item Code, Name, Category, Quantity, Min Stock' },
  { value: 'staff', label: 'Staff', template: 'Full Name, Department, Position, Email, Phone' },
  { value: 'vehicles', label: 'Vehicles', template: 'Plate Number, Model, Year, Capacity, Driver' },
  { value: 'categories', label: 'Categories', template: 'Name, Description' },
];

const BulkUpload = () => {
  const [uploads, setUploads] = useState(MOCK_UPLOADS);
  const [selectedType, setSelectedType] = useState('items');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate random success/failure
    const success = Math.random() > 0.2;

    const newUpload = {
      id: Date.now(),
      fileName: selectedFile.name,
      type: FILE_TYPES.find(t => t.value === selectedType)?.label || selectedType,
      records: Math.floor(Math.random() * 100) + 10,
      uploadedBy: 'Admin',
      date: new Date().toISOString().split('T')[0],
      status: success ? 'Success' : 'Failed'
    };

    setUploads([newUpload, ...uploads]);
    setUploading(false);
    setSelectedFile(null);

    if (success) {
      toast.success('File uploaded successfully');
    } else {
      toast.error('Upload failed. Please check the file format.');
    }
  };

  const handleDeleteUpload = (id) => {
    if (window.confirm('Are you sure you want to delete this upload record?')) {
      setUploads(uploads.filter(u => u.id !== id));
      toast.success('Upload record deleted');
    }
  };

  const downloadTemplate = () => {
    const templateType = FILE_TYPES.find(t => t.value === selectedType);
    const blob = new Blob([templateType?.template || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}_template.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
          <p className="text-gray-500">Upload data in bulk</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {FILE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadTemplate}
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            <FiDownload className="w-4 h-4" />
            Download {FILE_TYPES.find(t => t.value === selectedType)?.label} Template
          </button>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FiFile className="w-8 h-8 text-blue-600" />
                <span className="text-gray-700">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FiX className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <>
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop your file here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls,.csv"
                  />
                </label>
              </>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FiUpload className="w-5 h-5" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload History</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">File</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Records</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uploads.slice(0, 5).map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-700 truncate max-w-[120px]">{upload.fileName}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{upload.type}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{upload.records}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        upload.status === 'Success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {upload.status === 'Success' ? <FiCheck className="w-3 h-3 mr-1" /> : <FiX className="w-3 h-3 mr-1" />}
                        {upload.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDeleteUpload(upload.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {uploads.length === 0 && (
            <p className="text-center text-gray-500 py-8">No upload history</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;