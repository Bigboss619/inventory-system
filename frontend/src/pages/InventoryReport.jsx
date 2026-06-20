import React, { useState, useMemo, useEffect } from 'react';
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

// API
import { getItems, getCategories, getStockIn, getStockOut } from '../services/api';

const InventoryReport = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    item: '',
    stockType: '',
  });

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, stockInData, stockOutData] = await Promise.all([
        getItems(),
        getCategories(),
        getStockIn(),
        getStockOut()
      ]);

      setItems(itemsData || []);
      setCategories(categoriesData || []);

      // Store raw data for filtering
      window.__reportData = {
        stockIn: stockInData || [],
        stockOut: stockOutData || []
      };
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Computed data based on filters
  const { reportData, summary, stockMovementData, categoryDistribution, topItems, lowStockItems } = useMemo(() => {
    const { stockIn, stockOut } = window.__reportData || { stockIn: [], stockOut: [] };

    // Apply date filters
    const filterByDate = (records) => records.filter(r => {
      const recordDate = r.transaction_date;
      const matchesFrom = !filters.dateFrom || recordDate >= filters.dateFrom;
      const matchesTo = !filters.dateTo || recordDate <= filters.dateTo;
      return matchesFrom && matchesTo;
    });

    const filteredIn = filterByDate(stockIn);
    const filteredOut = filterByDate(stockOut);

    // Build report table data
    const tableData = [
      ...filteredIn.map(s => ({
        date: s.transaction_date,
        item: s.item_name || '-',
        category: s.category_name || '-',
        type: 'stock_in',
        quantity: s.quantity,
        staff: s.received_by_name || '-',
      })),
      ...filteredOut.map(s => ({
        date: s.transaction_date,
        item: s.item_name || '-',
        category: s.category_name || '-',
        type: 'stock_out',
        quantity: s.quantity,
        staff: s.issued_by_name || '-',
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate summary
    const totalStockIn = filteredIn.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const totalStockOut = filteredOut.reduce((sum, s) => sum + (s.quantity || 0), 0);

    // Group by category for charts
    const categoryMap = new Map();
    [...filteredIn, ...filteredOut].forEach(record => {
      const cat = record.category_name || 'Uncategorized';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { stockIn: 0, stockOut: 0, total: 0 });
      }
      const data = categoryMap.get(cat);
      if (record.type === 'stock_in' || record.item_name) {
        // Check if this came from stockIn or stockOut array
        const isStockIn = filteredIn.some(s => s.id === record.id);
        if (isStockIn) {
          data.stockIn += record.quantity || 0;
        } else {
          data.stockOut += record.quantity || 0;
        }
      }
      data.total += record.quantity || 0;
    });

    // Stock movement by category
    const movement = Array.from(categoryMap.entries()).map(([label, data]) => ({
      label,
      stockIn: data.stockIn,
      stockOut: data.stockOut
    }));

    // Category distribution
    const total = movement.reduce((sum, m) => sum + m.stockIn + m.stockOut, 0);
    const distribution = movement.map(m => ({
      label: m.label,
      value: total > 0 ? Math.round(((m.stockIn + m.stockOut) / total) * 100) : 0
    }));

    // Top items by stock out
    const itemMap = new Map();
    filteredOut.forEach(record => {
      const itemName = record.item_name || '-';
      if (!itemMap.has(itemName)) {
        itemMap.set(itemName, { totalIssued: 0, quantity: 0 });
      }
      const data = itemMap.get(itemName);
      data.totalIssued += record.quantity || 0;
      data.quantity += record.quantity || 0;
    });

    const top = Array.from(itemMap.entries())
      .map(([name, data]) => ({ name, totalIssued: data.totalIssued, remainingStock: 0 }))
      .sort((a, b) => b.totalIssued - a.totalIssued)
      .slice(0, 5);

    // Low stock items (items with quantity < 10 in stock in that haven't been issued much)
    const lowStock = Array.from(itemMap.entries())
      .filter(([, data]) => data.totalIssued > 5)
      .map(([name, data]) => ({
        name,
        currentStock: Math.max(0, data.quantity),
        minLevel: 10
      }))
      .slice(0, 5);

    return {
      reportData: tableData,
      summary: {
        totalItems: items.length,
        totalStockIn,
        totalStockOut,
        lowStockItems: lowStock.length
      },
      stockMovementData: movement,
      categoryDistribution: distribution,
      topItems: top,
      lowStockItems: lowStock
    };
  }, [items, categories, filters]);

  const staff = useMemo(() => {
    const { stockIn, stockOut } = window.__reportData || { stockIn: [], stockOut: [] };
    const staffSet = new Set();
    [...stockIn, stockOut].forEach(s => {
      if (s.received_by_name) staffSet.add(s.received_by_name);
      if (s.issued_by_name) staffSet.add(s.issued_by_name);
    });
    return Array.from(staffSet).map(name => ({ id: name, name }));
  }, []);

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

  const generatedDate = new Date().toLocaleDateString('en-GB');
  const period = filters.dateFrom && filters.dateTo
    ? `${filters.dateFrom} - ${filters.dateTo}`
    : 'All Time';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="printable-area">
      <ReportHeader
        generatedBy="Admin"
        generatedDate={generatedDate}
        period={period}
      />

      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        items={items}
        staff={staff}
        onReset={handleReset}
      />

      <div className="flex justify-end">
        <ExportActions
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onPrint={handlePrint}
        />
      </div>

      <SummaryCards summary={summary} />

      <ReportTable data={reportData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockMovementChart data={stockMovementData} />
        <CategoryDistribution data={categoryDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopItems data={topItems} />
        <LowStockAlert data={lowStockItems} />
      </div>
    </div>
  );
};

export default InventoryReport;