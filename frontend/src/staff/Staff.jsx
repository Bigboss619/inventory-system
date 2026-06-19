import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getStaff, getDepartments, createStaff, updateStaff, deleteStaff } from '../services/api';
import StaffHeader from './StaffHeader';
import StaffStats from './StaffStats';
import StaffFilters from './StaffFilters';
import StaffTable from './StaffTable';
import StaffModal from './StaffModal';
import ViewStaffModal from './ViewStaffModal';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Fetch staff and departments on mount
  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    setFetching(true);
    try {
      const data = await getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch staff');
      setStaff([]);
    } finally {
      setFetching(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch departments');
      setDepartments([]);
    }
  };

  // Stats
  const totalStaff = staff.length;
  const activeDepartments = [...new Set(staff.map(s => s.department_name))].length;

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.staff_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'All' || s.department_name === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [staff, searchQuery, departmentFilter]);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setModalOpen(true);
  };

  const handleViewStaff = (staffMember) => {
    setViewingStaff(staffMember);
    setViewModalOpen(true);
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        toast.success('Staff member deleted successfully');
        fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff');
      }
    }
  };

  const handleSaveStaff = async (formData) => {
    setLoading(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        toast.success('Staff updated successfully');
      } else {
        await createStaff(formData);
        toast.success('Staff added successfully');
      }
      fetchStaff();
      setModalOpen(false);
      setEditingStaff(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredStaff.map(s => ({
      'Staff ID': s.staff_id,
      'Name': `${s.first_name} ${s.last_name}`,
      'Department': s.department_name,
      'Position': s.position,
      'Email': s.email,
      'Phone': s.phone,
      'Date Created': s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'
    }));

    if (exportData.length === 0) {
      toast.error('No records to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff');

    ws['!cols'] = [
      { wch: 12 }, // Staff ID
      { wch: 20 }, // Name
      { wch: 15 }, // Department
      { wch: 20 }, // Position
      { wch: 25 }, // Email
      { wch: 14 }, // Phone
      { wch: 14 }  // Date Created
    ];

    XLSX.writeFile(wb, `staff-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully');
  };

  // Get department options for filter (include 'All')
  const departmentOptions = ['All', ...new Set(departments.map(d => d.name))];

  // Get department options for modal (real departments only)
  const modalDepartments = departments.filter(d => d.status === 'Active');

  return (
    <div className="space-y-6">
      <StaffHeader onAddStaff={handleAddStaff} onExport={handleExportExcel} />
      <StaffStats totalStaff={totalStaff} activeDepartments={activeDepartments} />
      <StaffFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departmentOptions={departmentOptions}
      />
      <StaffTable
        staff={filteredStaff}
        fetching={fetching}
        onView={handleViewStaff}
        onEdit={handleEditStaff}
        onDelete={handleDeleteStaff}
      />
      <StaffModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
        staff={editingStaff}
        loading={loading}
        departments={modalDepartments}
      />
      <ViewStaffModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingStaff(null);
        }}
        staff={viewingStaff}
      />
    </div>
  );
};

export default Staff;