import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiLoader, FiSearch } from 'react-icons/fi';

const StockOutModal = ({ isOpen, onClose, onSave, items: allItems, staff, departments, loading, record, readOnly = false, categories = [] }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    departmentId: '',
    itemId: '',
    quantity: '',
    note: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);

  // Filter items by search query and category
  const filteredItems = useMemo(() => {
    let result = allItems || [];

    if (categoryFilter) {
      result = result.filter(item => item.category_name === categoryFilter);
    }

    if (itemSearchQuery.trim()) {
      const query = itemSearchQuery.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.item_code?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allItems, itemSearchQuery, categoryFilter]);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          staffId: record.requested_by || '',
          departmentId: record.department_id || '',
          itemId: record.item_id || '',
          quantity: record.quantity?.toString() || '',
          note: record.note || '',
          transactionDate: record.transaction_date || new Date().toISOString().split('T')[0]
        });
        // Set display text for selected item
        const item = allItems?.find(i => i.id === record.item_id);
        if (item) {
          setItemSearchQuery(`${item.name} (${item.item_code}) - Available: ${item.quantity}`);
        }
      } else {
        setFormData({
          staffId: '',
          departmentId: '',
          itemId: '',
          quantity: '',
          note: '',
          transactionDate: new Date().toISOString().split('T')[0]
        });
        setItemSearchQuery('');
        setCategoryFilter('');
      }
      setError('');
      setItemDropdownOpen(false);
    }
  }, [isOpen, record, allItems]);

  const handleStaffChange = (e) => {
    const selectedStaff = staff.find(s => s.id === parseInt(e.target.value));
    setFormData(prev => ({
      ...prev,
      staffId: e.target.value,
      departmentId: selectedStaff?.department_id || ''
    }));
  };

  const getAvailableQuantity = () => {
    const selectedItem = allItems.find(i => i.id === parseInt(formData.itemId));
    return selectedItem?.quantity || 0;
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value);
    const available = getAvailableQuantity();

    if (qty > available && !record) {
      setError(`Insufficient stock. Maximum: ${available}`);
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
      setError(`Insufficient stock. Maximum: ${available}`);
      return;
    }

    if (!formData.staffId || !formData.itemId || !formData.quantity) {
      toast.error('Please fill in required fields');
      return;
    }

    onSave({
      ...formData,
      quantity: parseInt(formData.quantity)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {record ? 'Edit Issue' : 'Issue Item'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff *</label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleStaffChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={readOnly || !!record}
              >
                <option value="">Select Staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.departmentId}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              >
                <option value="">Auto-filled from staff</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setItemSearchQuery('');
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readOnly || !!record}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
            <div className="relative">
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => {
                  setItemSearchQuery(e.target.value);
                  setFormData(prev => ({ ...prev, itemId: '', quantity: '' }));
                  setItemDropdownOpen(true);
                }}
                onFocus={() => setItemDropdownOpen(true)}
                placeholder="Search items by name or code..."
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={readOnly || !!record}
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Dropdown */}
            {itemDropdownOpen && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredItems.slice(0, 20).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        itemId: item.id.toString(),
                        quantity: ''
                      }));
                      setItemSearchQuery(`${item.name} (${item.item_code}) - Available: ${item.quantity}`);
                      setItemDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex justify-between items-center"
                  >
                    <span>{item.name} ({item.item_code})</span>
                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                  </button>
                ))}
                {filteredItems.length > 20 && (
                  <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                    Showing 20 of {filteredItems.length} items
                  </div>
                )}
              </div>
            )}

            {/* Hidden select for form submission */}
            <select
              name="itemId"
              value={formData.itemId}
              onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value, quantity: '' }))}
              className="hidden"
              required
            >
              <option value="">Select Item</option>
              {allItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.item_code})
                </option>
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
                required
                disabled={readOnly}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Optional note"
              rows="2"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readOnly}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={loading || !!error}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <FiLoader className="w-4 h-4 animate-spin" />}
                {record ? 'Update' : 'Issue Item'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOutModal;