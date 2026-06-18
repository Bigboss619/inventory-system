import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Components
import DocReportHeader from '../components/reports/DocumentReport/DocReportHeader';
import DocReportFilters from '../components/reports/DocumentReport/DocReportFilters';
import DocSummaryCards from '../components/reports/DocumentReport/DocSummaryCards';
import ExpiryStatusChart from '../components/reports/DocumentReport/ExpiryStatusChart';
import DocReportTable from '../components/reports/DocumentReport/DocReportTable';
import CriticalAlerts from '../components/reports/DocumentReport/CriticalAlerts';
import TopExpiring from '../components/reports/DocumentReport/TopExpiring';
import RenewalTracking from '../components/reports/DocumentReport/RenewalTracking';
import DocCharts from '../components/reports/DocumentReport/DocCharts';
import ExportActions from '../components/reports/InventoryReport/ExportActions';

const DocumentReport = () => {
  const [filters, setFilters] = useState({
    dateType: 'expiry',
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
    vehicle: '',
  });

  // Mock data
  const [categories] = useState([
    { id: 1, name: 'Vehicle Documents' },
    { id: 2, name: 'Land Documents' },
    { id: 3, name: 'Contracts' },
  ]);

  const [vehicles] = useState([
    { id: 1, name: 'Toyota Hilux' },
    { id: 2, name: 'Honda Civic' },
    { id: 3, name: 'Ford Transit' },
  ]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    toast.success('Filters applied');
  };

  const handleReset = () => {
    setFilters({
      dateType: 'expiry',
      dateFrom: '',
      dateTo: '',
      category: '',
      status: '',
      vehicle: '',
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
    { document: 'Insurance', category: 'Vehicle Documents', vehicle: 'Toyota Hilux', staff: 'John Doe', issueDate: '01/01/2026', expiryDate: '01/01/2027', status: 'active', daysLeft: '180 days' },
    { document: 'Road Worthiness', category: 'Vehicle Documents', vehicle: 'Toyota Hilux', staff: 'John Doe', issueDate: '01/01/2025', expiryDate: '01/04/2026', status: 'expired', daysLeft: '-20 days' },
    { document: 'Vehicle License', category: 'Vehicle Documents', vehicle: 'Honda Civic', staff: 'Jane Smith', issueDate: '01/06/2025', expiryDate: '01/06/2026', status: 'expiring', daysLeft: '14 days' },
    { document: 'Insurance', category: 'Vehicle Documents', vehicle: 'Ford Transit', staff: 'Mike Johnson', issueDate: '15/03/2026', expiryDate: '15/03/2027', status: 'active', daysLeft: '270 days' },
    { document: 'Vehicle License', category: 'Vehicle Documents', vehicle: 'Toyota Hilux', staff: 'John Doe', issueDate: '20/06/2025', expiryDate: '20/06/2026', status: 'expiring', daysLeft: '2 days' },
    { document: 'Land Title', category: 'Land Documents', vehicle: '-', staff: 'Admin', issueDate: '01/01/2020', expiryDate: '01/01/2030', status: 'active', daysLeft: '1340 days' },
    { document: 'Service Contract', category: 'Contracts', vehicle: '-', staff: 'Admin', issueDate: '01/01/2025', expiryDate: '01/01/2026', status: 'renewed', daysLeft: '365 days' },
    { document: 'Hackney Permit', category: 'Vehicle Documents', vehicle: 'Ford Transit', staff: 'Mike Johnson', issueDate: '01/04/2025', expiryDate: '01/04/2026', status: 'expired', daysLeft: '-78 days' },
  ];

  // Summary
  const summary = {
    totalDocuments: 120,
    active: 80,
    expiringSoon: 25,
    expired: 10,
    renewed: 5,
  };

  // Expiry status breakdown
  const expiryStatusData = [
    { status: 'active', label: 'Active', value: 80 },
    { status: 'expiring', label: 'Expiring Soon', value: 25 },
    { status: 'expired', label: 'Expired', value: 10 },
    { status: 'renewed', label: 'Renewed', value: 5 },
  ];

  // Critical alerts
  const criticalAlerts = [
    { document: 'Insurance', vehicle: 'Toyota Hilux', expiryDate: '20/06/2026', daysLeft: '2 days', priority: 'high' },
    { document: 'Vehicle License', vehicle: 'Honda Civic', expiryDate: '25/06/2026', daysLeft: '7 days', priority: 'medium' },
    { document: 'Road Worthiness', vehicle: 'Ford Transit', expiryDate: '18/06/2026', daysLeft: '10 days', priority: 'medium' },
  ];

  // Top expiring by vehicle
  const topExpiring = [
    { vehicle: 'Toyota Hilux', count: 5 },
    { vehicle: 'Honda Civic', count: 3 },
    { vehicle: 'Ford Transit', count: 2 },
  ];

  // Renewal tracking
  const renewalTracking = [
    { document: 'Service Contract', previousExpiry: '01/01/2026', newExpiry: '01/01/2027', renewedBy: 'Admin', date: '15/06/2026' },
    { document: 'Insurance', previousExpiry: '01/01/2026', newExpiry: '01/01/2027', renewedBy: 'John Doe', date: '10/06/2026' },
  ];

  // Charts data
  const categoryData = [
    { label: 'Vehicle Documents', value: 85 },
    { label: 'Land Documents', value: 20 },
    { label: 'Contracts', value: 15 },
  ];

  const monthlyRenewals = [
    { month: 'Jan', value: 5 },
    { month: 'Feb', value: 8 },
    { month: 'Mar', value: 12 },
    { month: 'Apr', value: 6 },
    { month: 'May', value: 10 },
    { month: 'Jun', value: 8 },
  ];

  const generatedDate = new Date().toLocaleDateString('en-GB');
  const period = filters.dateFrom && filters.dateTo
    ? `${filters.dateFrom} - ${filters.dateTo}`
    : 'All Time';

  return (
    <div className="space-y-6" id="printable-area">
      {/* Report Header */}
      <DocReportHeader
        generatedBy="Admin"
        generatedDate={generatedDate}
        period={period}
      />

      {/* Filters */}
      <DocReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        vehicles={vehicles}
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
      <DocSummaryCards summary={summary} />

      {/* Expiry Status Breakdown */}
      <ExpiryStatusChart data={expiryStatusData} />

      {/* Report Table */}
      <DocReportTable data={reportData} />

      {/* Critical Alerts */}
      <CriticalAlerts data={criticalAlerts} />

      {/* Top Expiring and Renewal Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopExpiring data={topExpiring} />
        <RenewalTracking data={renewalTracking} />
      </div>

      {/* Charts */}
      <DocCharts
        categoryData={categoryData}
        monthlyRenewals={monthlyRenewals}
      />
    </div>
  );
};

export default DocumentReport;