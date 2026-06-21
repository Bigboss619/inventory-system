import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getStockOut, createStockOut, updateStockOut, deleteStockOut, getItems, getStaff, getDepartments, getUsers } from '../services/api';
import StockOutHeader from '../stockOut/StockOutHeader';
import StockOutStats from '../stockOut/StockOutStats';
import StockOutFilters from '../stockOut/StockOutFilters';
import StockOutTable from '../stockOut/StockOutTable';
import StockOutModal from '../stockOut/StockOutModal';

const StockOut = () => {
  const [stockOut, setStockOut] = useState([]);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchData();
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(storedUser.role || '');
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [stockOutData, itemsData, staffData, departmentsData] = await Promise.all([
        getStockOut(),
        getItems(),
        getStaff(),
        getDepartments()
      ]);
      setStockOut(Array.isArray(stockOutData) ? stockOutData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setStockOut([]);
      setItems([]);
      setStaff([]);
      setDepartments([]);
    } finally {
      setFetching(false);
    }
  };

  const filteredStock = stockOut.filter(s =>
    ((s.requested_by_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.item_name || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!departmentFilter || s.department_name === departmentFilter)
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
    if (window.confirm('Are you sure you want to delete this stock out record?')) {
      try {
        await deleteStockOut(id);
        toast.success('Stock out record deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete stock');
      }
    }
  };

  const handleSaveStock = async (formData) => {
    setLoading(true);
    try {
      // console.log('Saving StockOut:', formData);

      // Rename fields for backend
      const apiData = {
        itemId: parseInt(formData.itemId),
        quantity: parseInt(formData.quantity),
        departmentId: parseInt(formData.departmentId),
        requestedBy: parseInt(formData.staffId),
        note: formData.note,
        transactionDate: formData.transactionDate
      };

      console.log('API Data:', apiData);

      if (editingRecord) {
        await updateStockOut(editingRecord.id, formData);
        toast.success('Stock out record updated');
      } else {
        // issuedBy is now set by backend from header
        await createStockOut(apiData);
        toast.success('Item issued successfully');
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
      'Staff': record.requested_by_name || '-',
      'Department': record.department_name || '-',
      'Item': record.item_name || '-',
      'Item Code': record.item_code || '-',
      'Quantity': record.quantity,
      'Issued By': record.issued_by_name || '-',
      'Date': record.transaction_date ? new Date(record.transaction_date).toLocaleDateString() : '-'
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Out');

    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 }
    ];

    XLSX.writeFile(wb, `stock-out-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  return (
    <div className="space-y-6">
      <StockOutHeader onAddStock={handleAddStock} onExport={handleExportExcel} />
      <StockOutStats stockOut={stockOut} />
      <StockOutFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        departments={departments}
      />
      <StockOutTable
        stockOut={filteredStock}
        fetching={fetching}
        userRole={userRole}
        onEdit={handleEditStock}
        onDelete={handleDeleteStock}
      />
      <StockOutModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveStock}
        items={items}
        staff={staff}
        departments={departments}
        loading={loading}
        record={editingRecord}
        readOnly={userRole !== 'Super Admin' && userRole !== 'Inventory Officer'}
      />
    </div>
  );
};

export default StockOut;