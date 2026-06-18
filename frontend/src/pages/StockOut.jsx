import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowUpCircle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';

// Mock staff data
const MOCK_STAFF = [
  { id: 1, name: 'John Smith', department: 'IT' },
  { id: 2, name: 'Sarah Johnson', department: 'HR' },
  { id: 3, name: 'Mike Brown', department: 'Finance' },
  { id: 4, name: 'Emily Davis', department: 'Marketing' },
  { id: 5, name: 'David Wilson', department: 'Operations' },
];

// Mock items with quantities
const MOCK_ITEMS = [
  { id: 1, name: 'Dell XPS 15 Laptop', code: 'LAP-001', quantity: 5 },
  { id: 2, name: 'MacBook Pro 14"', code: 'LAP-002', quantity: 2 },
  { id: 3, name: 'LG UltraWide Monitor', code: 'MON-001', quantity: 3 },
  { id: 4, name: 'Office Desk Chair', code: 'KIT-001', quantity: 8 },
  { id: 5, name: 'Standing Desk', code: 'KIT-002', quantity: 4 },
  { id: 6, name: 'A4 Paper (Ream)', code: 'STA-001', quantity: 15 },
  { id: 7, name: 'Ballpoint Pens (Box)', code: 'STA-002', quantity: 20 },
  { id: 8, name: 'HP Printer', code: 'KIT-003', quantity: 6 },
];

const MOCK_STOCK_OUT = [
  { id: 1, staff: 'John Smith', department: 'IT', item: 'Dell XPS 15 Laptop', quantity: 1, issuedBy: 'Admin', date: '2025-06-18' },
  { id: 2, staff: 'Sarah Johnson', department: 'HR', item: 'A4 Paper (Ream)', quantity: 5, issuedBy: 'Admin', date: '2025-06-17' },
  { id: 3, staff: 'Mike Brown', department: 'Finance', item: 'HP Printer', quantity: 1, issuedBy: 'Admin', date: '2025-06-16' },
  { id: 4, staff: 'Emily Davis', department: 'Marketing', item: 'Ballpoint Pens (Box)', quantity: 2, issuedBy: 'Admin', date: '2025-06-15' },
  { id: 5, staff: 'David Wilson', department: 'Operations', item: 'Office Desk Chair', quantity: 2, issuedBy: 'Admin', date: '2025-06-14' },
];

const StockOut = () => {
  const [stockOut, setStockOut] = useState(MOCK_STOCK_OUT);
  const [items, setItems] = useState(MOCK_ITEMS);
  const [searchStaff, setSearchStaff] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayIssued = stockOut.filter(s => s.date === today).reduce((sum, s) => sum + s.quantity, 0);
  const thisMonthIssued = stockOut.filter(s => s.date.startsWith('2025-06')).reduce((sum, s) => sum + s.quantity, 0);

  // Filter
  const filteredStock = stockOut.filter(s => {
    const matchesStaff = s.staff.toLowerCase().includes(searchStaff.toLowerCase());
    const matchesItem = s.item.toLowerCase().includes(searchItem.toLowerCase());
    const matchesDate = !dateFilter || s.date === dateFilter;
    const matchesDept = !departmentFilter || s.department === departmentFilter;
    return matchesStaff && matchesItem && matchesDate && matchesDept;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this stock out record?')) {
      setStockOut(stockOut.filter(s => s.id !== id));
      toast.success('Stock out record deleted');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleIssueStock = async (formData) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingRecord) {
      setStockOut(stockOut.map(s =>
        s.id === editingRecord.id
          ? { ...s, quantity: parseInt(formData.quantity), date: formData.date }
          : s
      ));
      toast.success('Stock out record updated');
    } else {
      const staff = MOCK_STAFF.find(s => s.id === parseInt(formData.staff));
      const item = MOCK_ITEMS.find(i => i.id === parseInt(formData.item));

      const newRecord = {
        id: Date.now(),
        staff: staff?.name || formData.staff,
        department: staff?.department || formData.department,
        item: item?.name || formData.item,
        quantity: parseInt(formData.quantity),
        issuedBy: 'Admin',
        date: formData.date || new Date().toISOString().split('T')[0]
      };

      // Deduct from inventory
      setItems(items.map(i =>
        i.id === parseInt(formData.item)
          ? { ...i, quantity: i.quantity - parseInt(formData.quantity) }
          : i
      ));

      setStockOut([newRecord, ...stockOut]);
      toast.success('Item issued successfully');
    }

    setLoading(false);
    setModalOpen(false);
    setEditingRecord(null);
  };

  const departments = [...new Set(MOCK_STAFF.map(s => s.department))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Out</h1>
          <p className="text-gray-500">Issue items to staff</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Issue Item</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Issued Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayIssued}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiArrowUpCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month Issued Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{thisMonthIssued}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchStaff}
              onChange={(e) => setSearchStaff(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search item..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Issued By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStock.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.staff}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.item}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.issuedBy}</td>
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
            No stock out records found.
          </div>
        )}
      </div>

      {/* Issue Item Modal */}
      <StockOutModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRecord(null); }}
        onSave={handleIssueStock}
        staff={MOCK_STAFF}
        items={items}
        loading={loading}
        record={editingRecord}
      />
    </div>
  );
};

// Issue Item Modal
const StockOutModal = ({ isOpen, onClose, onSave, staff, items, loading, record }) => {
  const [formData, setFormData] = useState({
    staff: '',
    department: '',
    item: '',
    quantity: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          staff: record.staff,
          department: record.department,
          item: record.item,
          quantity: record.quantity.toString(),
          purpose: record.purpose || '',
          date: record.date
        });
      } else {
        setFormData({
          staff: '',
          department: '',
          item: '',
          quantity: '',
          purpose: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
      setError('');
    }
  }, [isOpen, record]);

  const handleStaffChange = (e) => {
    const selectedStaff = staff.find(s => s.id === parseInt(e.target.value));
    setFormData(prev => ({
      ...prev,
      staff: e.target.value,
      department: selectedStaff?.department || ''
    }));
  };

  const getAvailableQuantity = () => {
    const selectedItem = items.find(i => i.name === formData.item);
    return selectedItem?.quantity || 0;
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value);
    const available = getAvailableQuantity();

    if (qty > available && !record) {
      setError(`Insufficient stock available. Maximum: ${available}`);
    } else {
      setError('');
    }

    setFormData(prev => ({ ...prev, quantity: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const available = getAvailableQuantity();
    const qty = parseInt(formData.quantity);

    if (!record && qty > available) {
      setError(`Insufficient stock available. Maximum: ${available}`);
      return;
    }

    if (!formData.staff || !formData.item || !formData.quantity) {
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
          <h2 className="text-lg font-semibold text-gray-900">{record ? 'Edit Issue' : 'Issue Item'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff *</label>
              <select
                name="staff"
                value={formData.staff}
                onChange={handleStaffChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!record}
              >
                <option value="">Select Staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
            <select
              name="item"
              value={formData.item}
              onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value, quantity: '' }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!record}
            >
              <option value="">Select Item</option>
              {items.map(item => (
                <option key={item.id} value={item.name}>{item.name} (Available: {item.quantity})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity</label>
              <input
                type="text"
                value={getAvailableQuantity()}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity To Issue *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleQuantityChange}
                min="1"
                placeholder="Enter quantity"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Enter purpose"
              rows="2"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
              disabled={loading || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <FiLoader className="w-4 h-4 animate-spin" />}
              {record ? 'Update' : 'Issue Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOut;