import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBox, FiAlertTriangle, FiX, FiDownload, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getItems, createItem, updateItem, deleteItem, getCategories } from '../services/api';

const STATUS_COLORS = {
  available: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  low: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  out: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch items and categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getItems(),
        getCategories()
      ]);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setItems([]);
      setCategories([]);
    } finally {
      setFetching(false);
    }
  };

  // Stats
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.status === 'low').length;
  const outOfStockItems = items.filter(item => item.status === 'out').length;

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.item_code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category_id == categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        toast.success('Item deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleSaveItem = async (formData) => {
    setLoading(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toast.success('Item updated successfully');
      } else {
        await createItem(formData);
        toast.success('Item added successfully');
      }
      fetchData();
      setModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      'Code': item.item_code,
      'Name': item.name,
      'Category': item.category_name || '-',
      'Quantity': item.quantity,
      'Min Stock': item.min_stock_level,
      'Status': item.status === 'available' ? 'Available' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'
    }));

    if (exportData.length === 0) {
      toast.error('No items to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');

    ws['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 }
    ];

    XLSX.writeFile(wb, `items-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
          <p className="text-gray-500">Manage your inventory items</p>
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
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiBox className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{lowStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{outOfStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search item name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <FiLoader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No items found. Add your first item to get started.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.item_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.min_stock_level}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[item.status]?.text || 'text-gray-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[item.status]?.dot || 'bg-gray-500'}`} />
                        {item.status === 'available' ? 'Available' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
      <ItemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
        loading={loading}
      />
    </div>
  );
};

// Item Modal Component
const ItemModal = ({ isOpen, onClose, onSave, item, categories, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    unit: 'pcs',
    quantity: 0,
    minStock: 5
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: item?.name || '',
        categoryId: item?.category_id || '',
        description: item?.description || '',
        unit: item?.unit || 'pcs',
        quantity: item?.quantity || 0,
        minStock: item?.min_stock_level || 5
      });
    }
  }, [isOpen, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
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
          <h2 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Add Item'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="2"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pcs">Pieces</option>
                <option value="box">Box</option>
                <option value="ream">Ream</option>
                <option value="set">Set</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              disabled={loading || !formData.name.trim() || !formData.categoryId}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <FiLoader className="w-4 h-4 animate-spin" />}
              {item ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Items;