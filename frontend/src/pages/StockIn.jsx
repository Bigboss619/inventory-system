import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowDownCircle, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Mock items for dropdown
const MOCK_ITEMS = [
  { id: 1, name: 'Dell XPS 15 Laptop', code: 'LAP-001' },
  { id: 2, name: 'MacBook Pro 14"', code: 'LAP-002' },
  { id: 3, name: 'LG UltraWide Monitor', code: 'MON-001' },
  { id: 4, name: 'Office Desk Chair', code: 'KIT-001' },
  { id: 5, name: 'Standing Desk', code: 'KIT-002' },
  { id: 6, name: 'A4 Paper (Ream)', code: 'STA-001' },
  { id: 7, name: 'Ballpoint Pens (Box)', code: 'STA-002' },
  { id: 8, name: 'HP Printer', code: 'KIT-003' },
];

const MOCK_STOCK_IN = [
  { id: 1, item: 'Dell XPS 15 Laptop', quantity: 5, supplier: 'Tech Supplies Ltd', addedBy: 'Admin', date: '2025-06-18' },
  { id: 2, item: 'Office Desk Chair', quantity: 10, supplier: 'Furniture Co', addedBy: 'Admin', date: '2025-06-17' },
  { id: 3, item: 'A4 Paper (Ream)', quantity: 50, supplier: 'Stationery World', addedBy: 'Admin', date: '2025-06-16' },
  { id: 4, item: 'HP Printer', quantity: 3, supplier: 'IT Solutions', addedBy: 'Admin', date: '2025-06-15' },
  { id: 5, item: 'MacBook Pro 14"', quantity: 2, supplier: 'Tech Supplies Ltd', addedBy: 'Admin', date: '2025-06-14' },
];

const StockIn = () => {
  const [stockIn, setStockIn] = useState(MOCK_STOCK_IN);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayStockIn = stockIn.filter(s => s.date === today).reduce((sum, s) => sum + s.quantity, 0);
  const thisMonthStockIn = stockIn.filter(s => s.date.startsWith('2025-06')).reduce((sum, s) => sum + s.quantity, 0);

  // Filter
  const filteredStock = stockIn.filter(s =>
    s.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this stock in record?')) {
      setStockIn(stockIn.filter(s => s.id !== id));
      toast.success('Stock in record deleted');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleSaveStock = async (formData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingRecord) {
      // Update existing record
      setStockIn(stockIn.map(s =>
        s.id === editingRecord.id
          ? { ...s, quantity: parseInt(formData.quantity), supplier: formData.supplier, date: formData.date }
          : s
      ));
      toast.success('Stock updated successfully');
    } else {
      // Add new record
      const newRecord = {
        id: Date.now(),
        item: MOCK_ITEMS.find(i => i.id === parseInt(formData.item))?.name || formData.item,
        quantity: parseInt(formData.quantity),
        supplier: formData.supplier,
        addedBy: 'Admin',
        date: formData.date || new Date().toISOString().split('T')[0]
      };
      setStockIn([newRecord, ...stockIn]);
      toast.success('Stock added successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleExportExcel = () => {
    const exportData = filteredStock.map(record => ({
      'Item': record.item,
      'Quantity': record.quantity,
      'Supplier': record.supplier,
      'Added By': record.addedBy,
      'Date': record.date
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock In');

    ws['!cols'] = [
      { wch: 25 }, // Item
      { wch: 10 }, // Quantity
      { wch: 20 }, // Supplier
      { wch: 12 }, // Added By
      { wch: 12 }  // Date
    ];

    XLSX.writeFile(wb, `stock-in-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock In</h1>
          <p className="text-gray-500">Track stock entering the inventory</p>
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
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Stock In</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayStockIn}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiArrowDownCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month Stock In</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{thisMonthStockIn}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiArrowDownCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Added By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStock.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.supplier}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.addedBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStock.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No stock in records found.
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      <StockInModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRecord(null); }}
        onSave={handleSaveStock}
        items={MOCK_ITEMS}
        loading={loading}
        record={editingRecord}
      />
    </div>
  );
};

// Add Stock Modal
const StockInModal = ({ isOpen, onClose, onSave, items, loading, record }) => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    supplier: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    if (isOpen) {
      if (record) {
        // Editing mode - pre-fill form
        setFormData({
          item: record.item,
          quantity: record.quantity.toString(),
          supplier: record.supplier,
          note: record.note || '',
          date: record.date
        });
      } else {
        // Add mode - reset form
        setFormData({
          item: '',
          quantity: '',
          supplier: '',
          note: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item || !formData.quantity || !formData.supplier) {
      toast.error('Please fill in required fields');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{record ? 'Edit Stock' : 'Add Stock'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
            <select
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                placeholder="Enter quantity"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Enter supplier name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Optional note"
              rows="2"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <FiLoader className="w-4 h-4 animate-spin" />}
              {record ? 'Update Stock' : 'Save Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockIn;