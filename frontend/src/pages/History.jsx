import React, { useState, useMemo, useEffect } from 'react';
import { FiFilter, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getStockIn, getStockOut } from '../services/api';

const MOVEMENT_TYPES = ['All', 'Stock In', 'Stock Out'];

// Header Component
const Header = ({ onExport }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Inventory History</h1>
      <p className="text-gray-500">Track all stock movements</p>
    </div>
    <button
      onClick={onExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <FiDownload className="w-5 h-5" />
      <span>Export</span>
    </button>
  </div>
);

// FilterBar Component
const FilterBar = ({
  itemFilter,
  setItemFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  movementFilter,
  setMovementFilter,
  itemList,
  onClear
}) => {
  const showClear = itemFilter !== 'All Items' || dateFrom || dateTo || movementFilter !== 'All';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {itemList.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {MOVEMENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      {showClear && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

// HistoryTable Component
const HistoryTable = ({ data, loading }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                {loading ? 'Loading...' : 'No history found'}
              </td>
            </tr>
          ) : (
            data.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{h.item}</td>
                <td className="px-4 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    h.type === 'Stock In'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {h.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold">
                  <span className={h.type === 'Stock In' ? 'text-green-600' : 'text-red-600'}>
                    {h.type === 'Stock In' ? '+' : '-'}{h.quantity}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{h.user}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{h.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Main History Component
const History = () => {
  const [itemFilter, setItemFilter] = useState('All Items');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [movementFilter, setMovementFilter] = useState('All');
  const [history, setHistory] = useState([]);
  const [items, setItems] = useState(['All Items']);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setFetching(true);
    try {
      const [stockInData, stockOutData] = await Promise.all([
        getStockIn(),
        getStockOut()
      ]);

      const combinedHistory = [
        ...(stockInData || []).map(s => ({
          id: `in-${s.id}`,
          item: s.item_name || '-',
          type: 'Stock In',
          quantity: s.quantity,
          user: s.received_by_name || '-',
          date: s.transaction_date
        })),
        ...(stockOutData || []).map(s => ({
          id: `out-${s.id}`,
          item: s.item_name || '-',
          type: 'Stock Out',
          quantity: s.quantity,
          user: s.issued_by_name || '-',
          date: s.transaction_date
        }))
      ];

      setHistory(combinedHistory);

      const uniqueItemNames = [...new Set(combinedHistory.map(h => h.item).filter(Boolean))];
      setItems(['All Items', ...uniqueItemNames]);
    } catch (error) {
      toast.error('Failed to fetch history');
      setHistory([]);
    } finally {
      setFetching(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchesItem = itemFilter === 'All Items' || h.item === itemFilter;
      const matchesMovement = movementFilter === 'All' || h.type === movementFilter;
      const matchesDateFrom = !dateFrom || h.date >= dateFrom;
      const matchesDateTo = !dateTo || h.date <= dateTo;
      return matchesItem && matchesMovement && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history, itemFilter, dateFrom, dateTo, movementFilter]);

  const handleExportExcel = () => {
    const exportData = filteredHistory.map(h => ({
      'Item': h.item,
      'Type': h.type,
      'Quantity': h.type === 'Stock In' ? `+${h.quantity}` : `-${h.quantity}`,
      'User': h.user,
      'Date': h.date
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'History');

    ws['!cols'] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 14 }
    ];

    XLSX.writeFile(wb, `history-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  const handleClearFilters = () => {
    setItemFilter('All Items');
    setDateFrom('');
    setDateTo('');
    setMovementFilter('All');
  };

  return (
    <div className="space-y-6">
      <Header onExport={handleExportExcel} />
      <FilterBar
        itemFilter={itemFilter}
        setItemFilter={setItemFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        movementFilter={movementFilter}
        setMovementFilter={setMovementFilter}
        itemList={items}
        onClear={handleClearFilters}
      />
      <HistoryTable data={filteredHistory} loading={fetching} />
    </div>
  );
};

export default History;