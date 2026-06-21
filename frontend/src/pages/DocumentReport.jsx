import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllDocuments, getVehicles } from '../services/api';

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

// Helper to calculate days until expiry
const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// Helper to get document status
const getDocumentStatus = (daysLeft) => {
  if (daysLeft === null) return 'unknown';
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring';
  return 'active';
};

const DocumentReport = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState({
    dateType: 'expiry',
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
    vehicle: '',
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docs, vehicles] = await Promise.all([
          getAllDocuments(),
          getVehicles()
        ]);
        setDocuments(docs || []);
        setVehiclesList(vehicles || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [vehiclesList, setVehiclesList] = useState([]);

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

  // Transform API data to report format
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  // Process documents into report format
  const reportData = documents.map(doc => {
    const daysLeft = getDaysLeft(doc.expiry_date);
    const status = getDocumentStatus(daysLeft);
    return {
      document: doc.document_name,
      category: 'Vehicle Documents',
      vehicle: doc.vehicle_name || doc.asset_id,
      staff: doc.staff_name || doc.staff_email || '-',
      issueDate: formatDate(doc.issue_date),
      expiryDate: formatDate(doc.expiry_date),
      status: status,
      daysLeft: daysLeft !== null ? `${daysLeft} days` : '-',
      assetId: doc.asset_id,
      docId: doc.id
    };
  });

  // Calculate summary from real data
  const totalDocs = documents.length;
  const activeCount = documents.filter(d => getDocumentStatus(getDaysLeft(d.expiry_date)) === 'active').length;
  const expiringCount = documents.filter(d => getDocumentStatus(getDaysLeft(d.expiry_date)) === 'expiring').length;
  const expiredCount = documents.filter(d => getDocumentStatus(getDaysLeft(d.expiry_date)) === 'expired').length;
  const renewedCount = documents.filter(d => d.doc_status === 'renewed').length;

  const summary = {
    totalDocuments: totalDocs,
    active: activeCount,
    expiringSoon: expiringCount,
    expired: expiredCount,
    renewed: renewedCount,
  };

  // Expiry status breakdown
  const expiryStatusData = [
    { status: 'active', label: 'Active', value: activeCount },
    { status: 'expiring', label: 'Expiring Soon', value: expiringCount },
    { status: 'expired', label: 'Expired', value: expiredCount },
    { status: 'renewed', label: 'Renewed', value: renewedCount },
  ];

  // Critical alerts (documents expiring within 30 days)
  const criticalAlerts = documents
    .filter(doc => {
      const daysLeft = getDaysLeft(doc.expiry_date);
      return daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
    })
    .sort((a, b) => getDaysLeft(a.expiry_date) - getDaysLeft(b.expiry_date))
    .slice(0, 10)
    .map(doc => {
      const daysLeft = getDaysLeft(doc.expiry_date);
      return {
        document: doc.document_name,
        vehicle: doc.vehicle_name || doc.asset_id,
        expiryDate: formatDate(doc.expiry_date),
        daysLeft: `${daysLeft} days`,
        priority: daysLeft <= 7 ? 'high' : daysLeft <= 14 ? 'medium' : 'low'
      };
    });

  // Top expiring by vehicle
  const vehicleCounts = {};
  documents.forEach(doc => {
    const daysLeft = getDaysLeft(doc.expiry_date);
    if (daysLeft !== null && daysLeft <= 30) {
      const vName = doc.vehicle_name || doc.asset_id;
      vehicleCounts[vName] = (vehicleCounts[vName] || 0) + 1;
    }
  });
  const topExpiring = Object.entries(vehicleCounts)
    .map(([vehicle, count]) => ({ vehicle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Renewal tracking (from API) - placeholder for now
  const renewalTracking = [];

  // Charts data - count by document type
  const docTypeCounts = {};
  documents.forEach(doc => {
    const type = doc.document_name || 'Other';
    docTypeCounts[type] = (docTypeCounts[type] || 0) + 1;
  });
  const categoryData = Object.entries(docTypeCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const monthlyRenewals = []; // Empty for now

  // Categories for filter dropdown
  const categories = [
    { id: 1, name: 'Vehicle Documents' },
  ];

  // Vehicles for filter dropdown
  const vehicles = vehiclesList.map(v => ({
    id: v.id,
    name: v.name || v.asset_id
  }));

  const generatedDate = new Date().toLocaleDateString('en-GB');
  const period = filters.dateFrom && filters.dateTo
    ? `${filters.dateFrom} - ${filters.dateTo}`
    : 'All Time';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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