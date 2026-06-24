import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getStockIn, createStockIn, updateStockIn, deleteStockIn, getItems } from '../services/api';
import StockInHeader from '../stockIn/StockInHeader';
import StockInStats from '../stockIn/StockInStats';
import StockInFilters from '../stockIn/StockInFilters';
import StockInTable from '../stockIn/StockInTable';
import StockInModal from '../stockIn/StockInModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const StockIn = () => {
  const [stockIn, setStockIn] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchData();
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(storedUser.role || '');
  }, []);

  const fetchData = async () => {
    setFetching(true);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const officerType = storedUser.officer_type || 'both';
    const isSuperAdmin = storedUser.role === 'Super Admin';

    try {
      const [stockInData, itemsData] = await Promise.all([
        getStockIn(),
        getItems(isSuperAdmin ? {} : { officer_type: officerType })
      ]);
      setStockIn(Array.isArray(stockInData) ? stockInData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setStockIn([]);
      setItems([]);
    } finally {
      setFetching(false);
    }
  };

  const filteredStock = stockIn.filter(s =>
    (s.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.supplier || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStock = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEditStock = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDeleteStock = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Stock In',
      message: 'Are you sure you want to delete this stock in record?',
      onConfirm: async () => {
        try {
          await deleteStockIn(id);
          toast.success('Stock in record deleted');
          fetchData();
          setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
        } catch (error) {
          toast.error('Failed to delete stock');
        }
      }
    });
  };

  const handleSaveStock = async (formData) => {
    setLoading(true);
    try {
      if (editingRecord) {
        await updateStockIn(editingRecord.id, formData);
        toast.success('Stock updated successfully');
      } else {
        // receivedBy is now set by backend from header
        await createStockIn(formData);
        toast.success('Stock added successfully');
      }
      fetchData();
      setModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save stock');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredStock.map(record => ({
      'Item': record.item_name || '-',
      'Quantity': record.quantity,
      'Supplier': record.supplier || '-',
      'Received By': record.received_by_name || '-',
      'Date': record.transaction_date ? new Date(record.transaction_date).toLocaleDateString() : '-'
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock In');

    ws['!cols'] = [
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 }
    ];

    XLSX.writeFile(wb, `stock-in-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <StockInHeader onAddStock={handleAddStock} onExport={handleExportExcel} />
      <StockInStats stockIn={stockIn} />
      <StockInFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <StockInTable
        stockIn={filteredStock}
        fetching={fetching}
        userRole={userRole}
        onEdit={handleEditStock}
        onDelete={handleDeleteStock}
      />
      <StockInModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveStock}
        items={items}
        loading={loading}
        record={editingRecord}
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

export default StockIn;