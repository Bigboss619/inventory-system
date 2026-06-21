import React, { useState } from 'react';
import { FiUpload, FiFile, FiCheck, FiX, FiDownload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { bulkUploadVehicles } from '../services/api';

// Excel template columns for vehicle documents bulk upload
const VEHICLE_TEMPLATE_HEADERS = [
  'Name of Vehicle',
  'plate Number',
  'Chasis Number',
  'Vehicle Description',
  'Brand',
  'staff_email',
  'SBU',
  'Road Worthiness Expiry',
  'Vehicle Lincense Expiry',
  'Proof of Ownership',
  'Insurance Expiry',
  'Year Acquired',
  'Color',
  'Last Serviced Date',
  'Next Service Date',
];

const VEHICLE_TEMPLATE = VEHICLE_TEMPLATE_HEADERS.join(',');

// Mock upload history
const MOCK_UPLOADS = [
  { id: 1, fileName: 'vehicles_batch_1.csv', type: 'Vehicles', records: 45, uploadedBy: 'Admin', date: '2026-06-18', status: 'Success' },
  { id: 2, fileName: 'vehicles_batch_2.csv', type: 'Vehicles', records: 30, uploadedBy: 'Admin', date: '2026-06-15', status: 'Success' },
  { id: 3, fileName: 'vehicles_batch_3.csv', type: 'Vehicles', records: 25, uploadedBy: 'Admin', date: '2026-06-10', status: 'Success' },
  { id: 4, fileName: 'vehicles_failed.csv', type: 'Vehicles', records: 12, uploadedBy: 'Admin', date: '2026-06-05', status: 'Failed' },
];

const BulkUpload = () => {
  const [uploads, setUploads] = useState(MOCK_UPLOADS);
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

  // Parse CSV/Excel file to array of objects
  const parseFile = async (file) => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel file
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            // Convert keys to lowercase
            const normalized = json.map(row => {
              const newRow = {};
              Object.keys(row).forEach(key => {
                newRow[key.toLowerCase().trim()] = row[key];
              });
              return newRow;
            });
            resolve(normalized);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } else {
      // Parse CSV file
      const text = await file.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }

      return data;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      // Parse file (CSV or Excel)
      const parsedData = await parseFile(selectedFile);

      if (parsedData.length === 0) {
        toast.error('No data found in file');
        setUploading(false);
        return;
      }

      // Call API
      const result = await bulkUploadVehicles(parsedData, 'Admin');

      const newUpload = {
        id: Date.now(),
        fileName: selectedFile.name,
        type: 'Vehicles',
        records: result.success || parsedData.length,
        uploadedBy: 'Admin',
        date: new Date().toISOString().split('T')[0],
        status: result.failed > 0 ? 'Partial' : 'Success'
      };

      setUploads([newUpload, ...uploads]);
      setSelectedFile(null);

      if (result.failed > 0) {
        toast.success(`${result.success} records uploaded, ${result.failed} failed`);
      } else {
        toast.success(`Successfully uploaded ${result.success} records`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = (id) => {
    if (window.confirm('Are you sure you want to delete this upload record?')) {
      setUploads(uploads.filter(u => u.id !== id));
      toast.success('Upload record deleted');
    }
  };

  const downloadTemplate = () => {
    // Create Excel file with template headers
    const worksheet = XLSX.utils.json_to_sheet([{}]);
    // Add headers as first row
    XLSX.utils.sheet_add_json(worksheet, [VEHICLE_TEMPLATE_HEADERS.reduce((acc, h) => ({ ...acc, [h]: h }), {})], { header: 1, skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Template');

    // Generate and download
    XLSX.writeFile(workbook, 'vehicle_template.xlsx');
    toast.success('Vehicle template downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
          <p className="text-gray-500">Upload vehicle and document data in bulk</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Upload vehicle and document data in bulk</p>
            <button
              onClick={downloadTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <FiDownload className="w-4 h-4" />
              Download Vehicle Template
            </button>
          </div>

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
                          : upload.status === 'Partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {upload.status === 'Success' ? <FiCheck className="w-3 h-3 mr-1" /> : upload.status === 'Partial' ? <FiCheck className="w-3 h-3 mr-1" /> : <FiX className="w-3 h-3 mr-1" />}
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