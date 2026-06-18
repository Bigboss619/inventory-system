import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Components
import ReportHeader from '../components/reports/InventoryReport/ReportHeader';
import ReportFilters from '../components/reports/InventoryReport/ReportFilters';
import SummaryCards from '../components/reports/InventoryReport/SummaryCards';
import ReportTable from '../components/reports/InventoryReport/ReportTable';
import StockMovementChart from '../components/reports/InventoryReport/StockMovementChart';
import CategoryDistribution from '../components/reports/InventoryReport/CategoryDistribution';
import TopItems from '../components/reports/InventoryReport/TopItems';
import LowStockAlert from '../components/reports/InventoryReport/LowStockAlert';
import ExportActions from '../components/reports/InventoryReport/ExportActions';

const InventoryReport = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    item: '',
    stockType: '',
  });

  // Mock data - in real app, these would come from API based on filters
  const [categories] = useState([
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Office Supplies' },
    { id: 3, name: 'Furniture' },
    { id: 4, name: 'Stationery' },
  ]);

  const [items] = useState([
    { id: 1, name: 'HP Laptop' },
    { id: 2, name: 'Printer Toner' },
    { id: 3, name: 'Keyboard' },
    { id: 4, name: 'Mouse' },
    { id: 5, name: 'Office Chair' },
    { id: 6, name: 'Desk' },
  ]);

  const [staff] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' },
  ]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    toast.success('Filters applied');
  };

  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      category: '',
      item: '',
      stockType: '',
    });
    toast.success('Filters reset');
  };

  const handleExportPDF = () => {
    toast.success('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting to Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  // Report data
  const reportData = [
    { date: '15/06/2026', item: 'HP Laptop', category: 'Electronics', type: 'stock_out', quantity: 2, staff: 'John Doe', issuedBy: 'Admin' },
    { date: '16/06/2026', item: 'Printer Toner', category: 'Office Supplies', type: 'stock_in', quantity: 10, staff: '-', issuedBy: 'Admin' },
    { date: '17/06/2026', item: 'Keyboard', category: 'Electronics', type: 'stock_out', quantity: 5, staff: 'Jane Smith', issuedBy: 'Admin' },
    { date: '18/06/2026', item: 'Office Chair', category: 'Furniture', type: 'stock_in', quantity: 20, staff: '-', issuedBy: 'Admin' },
    { date: '19/06/2026', item: 'Mouse', category: 'Electronics', type: 'stock_out', quantity: 3, staff: 'Mike Johnson', issuedBy: 'Admin' },
    { date: '20/06/2026', item: 'Desk', category: 'Furniture', type: 'stock_out', quantity: 2, staff: 'John Doe', issuedBy: 'Admin' },
    { date: '21/06/2026', item: 'Printer Toner', category: 'Office Supplies', type: 'stock_out', quantity: 4, staff: 'Jane Smith', issuedBy: 'Admin' },
    { date: '22/06/2026', item: 'HP Laptop', category: 'Electronics', type: 'stock_in', quantity: 15, staff: '-', issuedBy: 'Admin' },
  ];

  // Summary data
  const summary = {
    totalItems: 156,
    totalStockIn: 320,
    totalStockOut: 145,
    lowStockItems: 8,
  };

  // Stock movement data for chart
  const stockMovementData = [
    { label: 'Electronics', stockIn: 45, stockOut: 30 },
    { label: 'Office Supplies', stockIn: 80, stockOut: 50 },
    { label: 'Furniture', stockIn: 25, stockOut: 15 },
    { label: 'Stationery', stockIn: 60, stockOut: 40 },
  ];

  // Category distribution data
  const categoryDistribution = [
    { label: 'Electronics', value: 40 },
    { label: 'Office Supplies', value: 35 },
    { label: 'Furniture', value: 15 },
    { label: 'Stationery', value: 10 },
  ];

  // Top items data
  const topItems = [
    { name: 'HP Laptop', totalIssued: 25, remainingStock: 10 },
    { name: 'Printer Toner', totalIssued: 40, remainingStock: 5 },
    { name: 'Keyboard', totalIssued: 18, remainingStock: 12 },
    { name: 'Mouse', totalIssued: 22, remainingStock: 8 },
    { name: 'Office Chair', totalIssued: 15, remainingStock: 5 },
  ];

  // Low stock items
  const lowStockItems = [
    { name: 'Printer Toner', currentStock: 3, minLevel: 10 },
    { name: 'Keyboard', currentStock: 2, minLevel: 5 },
    { name: 'Office Chair', currentStock: 5, minLevel: 10 },
  ];

  const generatedDate = new Date().toLocaleDateString('en-GB');
  const period = filters.dateFrom && filters.dateTo
    ? `${filters.dateFrom} - ${filters.dateTo}`
    : 'All Time';

  return (
    <div className="space-y-6" id="printable-area">
      {/* Report Header */}
      <ReportHeader
        generatedBy="Admin"
        generatedDate={generatedDate}
        period={period}
      />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        items={items}
        staff={staff}
        onReset={handleReset}
      />

      {/* Export Actions */}
      <div className="flex justify-end">
        <ExportActions
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onPrint={handlePrint}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Report Table */}
      <ReportTable data={reportData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockMovementChart data={stockMovementData} />
        <CategoryDistribution data={categoryDistribution} />
      </div>

      {/* Top Items and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItems data={topItems} />
        <LowStockAlert data={lowStockItems} />
      </div>
    </div>
  );
};

export default InventoryReport;