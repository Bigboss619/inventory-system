import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getItems, createItem, updateItem, deleteItem, getCategories, checkItemRecords } from '../services/api';
import ItemsHeader from '../items/ItemsHeader';
import ItemsStats from '../items/ItemsStats';
import ItemsFilters from '../items/ItemsFilters';
import ItemsTable from '../items/ItemsTable';
import ItemModal from '../items/ItemModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';

const Items = () => {
  const [items, setItems] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [officerTypeFilter, setOfficerTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {} });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
    // Get user role from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(storedUser.role || '');
  }, [officerTypeFilter]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getItems(officerTypeFilter !== 'all' ? { officer_type: officerTypeFilter } : {}),
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

  // Sort order: Out of Stock -> Low Stock -> Available
  const statusOrder = { 'out': 1, 'low': 2, 'available': 3 };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.item_code || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || item.category_id == categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesOfficerType = officerTypeFilter === 'all' ||
                                   item.officer_type === officerTypeFilter ||
                                   item.officer_type === 'both';
      return matchesSearch && matchesCategory && matchesStatus && matchesOfficerType;
    })
    .sort((a, b) => (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4));

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, officerTypeFilter]);

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
        setConfirmModal({
          open: true,
          title: 'Delete Item',
          message: `Warning: Deleting this item will also delete ${records.totalRecords} stock record(s) (${records.stockInCount} stock-in, ${records.stockOutCount} stock-out).\n\nThis action cannot be undone. Are you sure you want to delete?`,
          onConfirm: async () => {
            await deleteItem(id);
            toast.success('Item deleted successfully');
            fetchData();
            setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
          }
        });
      } else {
        setConfirmModal({
          open: true,
          title: 'Delete Item',
          message: 'Are you sure you want to delete this item?',
          onConfirm: async () => {
            await deleteItem(id);
            toast.success('Item deleted successfully');
            fetchData();
            setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
          }
        });
      }
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
        officerTypeFilter={officerTypeFilter}
        onOfficerTypeChange={setOfficerTypeFilter}
        categories={categories}
      />
      <ItemsTable
        items={paginatedItems}
        fetching={fetching}
        userRole={userRole}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredItems.length}
        itemsPerPage={itemsPerPage}
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

export default Items;