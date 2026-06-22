import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getItems, createItem, updateItem, deleteItem, getCategories, checkItemRecords } from '../services/api';
import ItemsHeader from '../items/ItemsHeader';
import ItemsStats from '../items/ItemsStats';
import ItemsFilters from '../items/ItemsFilters';
import ItemsTable from '../items/ItemsTable';
import ItemModal from '../items/ItemModal';

const Items = () => {
  const [items, setItems] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchData();
    // Get user role from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(storedUser.role || '');
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
    try {
      const records = await checkItemRecords(id);

      if (records.hasRecords) {
        const confirmDelete = window.confirm(
          `Warning: Deleting this item will also delete ${records.totalRecords} stock record(s) (${records.stockInCount} stock-in, ${records.stockOutCount} stock-out).\n\nThis action cannot be undone. Are you sure you want to delete?`
        );
        if (!confirmDelete) return;
      } else {
        const confirmDelete = window.confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) return;
      }

      await deleteItem(id);
      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
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
      <ItemsHeader onAddItem={handleAddItem} onExport={handleExportExcel} />
      <ItemsStats items={items} />
      <ItemsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
      />
      <ItemsTable
        items={filteredItems}
        fetching={fetching}
        userRole={userRole}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />
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
        readOnly={userRole !== 'Super Admin' && userRole !== 'Inventory Officer'}
      />
    </div>
  );
};

export default Items;