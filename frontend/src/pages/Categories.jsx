import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiLayers, FiBox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import CategoryModal from '../components/forms/CategoryModal';

// Mock data
const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', description: 'Electronic devices and accessories', items: 45, dateCreated: '2025-01-15' },
  { id: 2, name: 'Furniture', description: 'Office and home furniture', items: 28, dateCreated: '2025-02-10' },
  { id: 3, name: 'Stationery', description: 'Office supplies and stationery', items: 120, dateCreated: '2025-03-05' },
  { id: 4, name: 'IT Equipment', description: 'Computers and IT peripherals', items: 35, dateCreated: '2025-04-20' },
  { id: 5, name: 'Kitchen', description: 'Kitchen appliances and utensils', items: 18, dateCreated: '2025-05-12' },
];

const Categories = () => {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats
  const totalCategories = categories.length;
  const totalItems = categories.reduce((sum, cat) => sum + cat.items, 0);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    }
  };

  const handleSaveCategory = async (categoryData) => {
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingCategory) {
      // Update existing
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
      ));
      toast.success('Category updated successfully');
    } else {
      // Add new
      const newCategory = {
        id: Date.now(),
        ...categoryData,
        items: 0,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
      toast.success('Category added successfully');
    }

    setLoading(false);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Categories</h1>
          <p className="text-gray-500">Manage your inventory categories</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiLayers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiBox className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. of Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.items}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.dateCreated}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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

        {categories.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No categories found. Add your first category to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        loading={loading}
      />
    </div>
  );
};

export default Categories;