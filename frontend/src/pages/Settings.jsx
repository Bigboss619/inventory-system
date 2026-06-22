import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSettings, FiBell, FiDatabase, FiFileText, FiClock, FiSave, FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiAlertTriangle, FiUpload, FiUsers, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus, getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';

// Tab components
const TABS = [
  { id: 'departments', label: 'Departments', icon: FiBriefcase },
  { id: 'users', label: 'User & Roles', icon: FiUser },
  // { id: 'system', label: 'System Config', icon: FiSettings },
  // { id: 'notifications', label: 'Notifications', icon: FiBell },
  // { id: 'email', label: 'Email Settings', icon: FiMail },
  // { id: 'inventory', label: 'Inventory', icon: FiDatabase },
  // { id: 'documents', label: 'Documents', icon: FiFileText },
  // { id: 'audit', label: 'Audit Logs', icon: FiClock },
];

const ROLES = ['Super Admin', 'Inventory Officer', 'Document Officer', 'Staff'];

const MOCK_LOGS = [
  { id: 1, user: 'John Doe', action: 'Updated document settings', module: 'System', date: '2026-06-18 10:30', ip: '192.168.1.100' },
  { id: 2, user: 'Sarah Smith', action: 'Issued 5 laptops', module: 'Inventory', date: '2026-06-18 09:15', ip: '192.168.1.105' },
  { id: 3, user: 'Mike Brown', action: 'Uploaded vehicle file', module: 'Documents', date: '2026-06-17 14:20', ip: '192.168.1.110' },
  { id: 4, user: 'John Doe', action: 'Created new user', module: 'System', date: '2026-06-17 11:00', ip: '192.168.1.100' },
  { id: 5, user: 'Emily Davis', action: 'Updated stock levels', module: 'Inventory', date: '2026-06-16 16:45', ip: '192.168.1.108' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your system configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'departments' && <DepartmentSettings />}
      {activeTab === 'users' && <UserRolesSettings />}
      {/* {activeTab === 'system' && <SystemConfigSettings />} */}
      {/* {activeTab === 'notifications' && <NotificationSettings />} */}
      {/* {activeTab === 'email' && <EmailSettings />} */}
      {/* {activeTab === 'inventory' && <InventorySettings />} */}
      {/* {activeTab === 'documents' && <DocumentSettings />} */}
      {/* {activeTab === 'audit' && <AuditLogsSettings />} */}
    </div>
  );
};

// 1. Department Settings
const DepartmentSettings = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || ''
      });
    } else {
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(formData);
        toast.success('Department created successfully');
      }
      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      toast.error(error.message || 'Failed to save department');
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Department',
      message: 'Are you sure you want to delete this department?',
      onConfirm: async () => {
        try {
          await deleteDepartment(id);
          toast.success('Department deleted successfully');
          fetchDepartments();
          setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
        } catch (error) {
          toast.error(error.message || 'Failed to delete department');
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">Departments</h2>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64" />
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><FiPlus className="w-4 h-4" /> Add Department</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDepartments.map(department => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{department.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{department.description || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${department.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {department.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{department.created_at ? new Date(department.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(department)} className="p-1 text-gray-500 hover:text-blue-600"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(department.id)} className="p-1 text-gray-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDepartments.length === 0 && (
            <div className="text-center p-8 text-gray-500">No departments found</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingDepartment ? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Operations, Finance, IT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Brief description of the department"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingDepartment ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. User & Roles
const UserRolesSettings = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', departmentId: '', role: 'Staff', status: 'Active' });
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return '-';
    const dept = departments.find(d => d.id === departmentId || d.id === parseInt(departmentId));
    return dept ? dept.name : '-';
  };

  const filteredUsers = users.filter(u =>
    (`${u.first_name} ${u.last_name}`).toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        password: '',
        departmentId: user.department_id || user.department_id || '',
        role: user.role,
        status: user.status || 'Active'
      });
    } else {
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', departmentId: '', role: 'Staff', status: 'Active' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', password: '', departmentId: '', role: 'Staff', status: 'Active' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        status: formData.status
      };
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        toast.success('User updated successfully');
      } else {
        await createUser(userData);
        toast.success('User created successfully');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        try {
          await deleteUser(id);
          toast.success('User deleted successfully');
          fetchUsers();
          setConfirmModal({ open: false, title: '', message: '', onConfirm: () => {} });
        } catch (error) {
          toast.error(error.message || 'Failed to delete user');
        }
      }
    });
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateUserStatus(user.id, newStatus);
      toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUser(user.id, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">User & Roles</h2>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64" />
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><FiPlus className="w-4 h-4" /> Add User</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{user.first_name} {user.last_name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">{getDepartmentName(user.department_id)}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleStatusToggle(user)}
                      className={`px-2 py-1 rounded-full text-xs cursor-pointer ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {user.status || 'Active'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(user)} className="p-1 text-gray-500 hover:text-blue-600"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-gray-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. System Configuration
const SystemConfigSettings = () => {
  const [config, setConfig] = useState({ companyName: 'Inventory Co.', address: '123 Main St, Lagos', email: 'info@company.com', currency: 'NGN', dateFormat: 'YYYY-MM-DD', timezone: 'Africa/Lagos' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold">System Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input type="text" value={config.companyName} onChange={(e) => setConfig({...config, companyName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input type="email" value={config.email} onChange={(e) => setConfig({...config, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={config.address} onChange={(e) => setConfig({...config, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
          <select value={config.currency} onChange={(e) => setConfig({...config, currency: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>NGN</option><option>USD</option><option>EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
          <select value={config.dateFormat} onChange={(e) => setConfig({...config, dateFormat: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option>YYYY-MM-DD</option><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option>
          </select>
        </div>
      </div>
      <button onClick={() => toast.success('System config saved')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><FiSave className="w-4 h-4" /> Save</button>
    </div>
  );
};

// 4. Notification Settings
const NotificationSettings = () => {
  const [settings, setSettings] = useState({ lowStockThreshold: 5, outOfStockAlert: true, emailAlerts: true, dailySummary: false, weeklyReport: false });
  const [reminderDays, setReminderDays] = useState({90: true, 60: true, 30: true, 7: true});

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Notification Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Low Stock Alert</p>
            <p className="text-sm text-gray-500">Alert when stock falls below threshold</p>
          </div>
          <div className="flex items-center gap-4">
            <input type="number" value={settings.lowStockThreshold} onChange={(e) => setSettings({...settings, lowStockThreshold: e.target.value})} className="w-20 px-2 py-1 border rounded" />
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.outOfStockAlert} onChange={(e) => setSettings({...settings, outOfStockAlert: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-3">Document Expiry Reminders</p>
          <div className="flex gap-4">
            {[90, 60, 30, 7].map(days => (
              <label key={days} className="flex items-center gap-2">
                <input type="checkbox" checked={reminderDays[days]} onChange={(e) => setReminderDays({...reminderDays, [days]: e.target.checked})} className="rounded border-gray-300" />
                <span>{days} days</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Enable Email Alerts</p></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.emailAlerts} onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Daily Summary Email</p></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.dailySummary} onChange={(e) => setSettings({...settings, dailySummary: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Weekly Report Email</p></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.weeklyReport} onChange={(e) => setSettings({...settings, weeklyReport: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>

      <button onClick={() => toast.success('Notification settings saved')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><FiSave className="w-4 h-4" /> Save</button>
    </div>
  );
};

// 5. Email Settings
const EmailSettings = () => {
  const [smtp, setSmtp] = useState({ host: 'smtp.gmail.com', port: '587', username: '', password: '', senderName: 'Inventory System' });
  const [testing, setTesting] = useState(false);

  const testEmail = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(false);
    toast.success('Test email sent!');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Email Settings (SMTP)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
          <input type="text" value={smtp.host} onChange={(e) => setSmtp({...smtp, host: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
          <input type="text" value={smtp.port} onChange={(e) => setSmtp({...smtp, port: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Username</label>
          <input type="text" value={smtp.username} onChange={(e) => setSmtp({...smtp, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password / App Password</label>
          <input type="password" value={smtp.password} onChange={(e) => setSmtp({...smtp, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
          <input type="text" value={smtp.senderName} onChange={(e) => setSmtp({...smtp, senderName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={testEmail} disabled={testing} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          {testing ? 'Sending...' : 'Send Test Email'}
        </button>
        <button onClick={() => toast.success('Email settings saved')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><FiSave className="w-4 h-4" /> Save</button>
      </div>
    </div>
  );
};

// 6. Inventory Settings
const InventorySettings = () => {
  const [settings, setSettings] = useState({ allowNegative: false, autoDeduct: true, defaultThreshold: 10 });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Inventory Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div><p className="font-medium">Allow Negative Stock</p><p className="text-sm text-gray-500">Allow stock to go below zero</p></div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.allowNegative} onChange={(e) => setSettings({...settings, allowNegative: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div><p className="font-medium">Auto Deduct Stock</p><p className="text-sm text-gray-500">Automatically reduce stock on issue</p></div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.autoDeduct} onChange={(e) => setSettings({...settings, autoDeduct: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-2">Default Low Stock Threshold</p>
          <select value={settings.defaultThreshold} onChange={(e) => setSettings({...settings, defaultThreshold: e.target.value})} className="w-32 px-3 py-2 border border-gray-300 rounded-lg">
            <option value="5">5 items</option>
            <option value="10">10 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
          </select>
        </div>
      </div>

      <button onClick={() => toast.success('Inventory settings saved')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><FiSave className="w-4 h-4" /> Save</button>
    </div>
  );
};

// 7. Document Settings
const DocumentSettings = () => {
  const [settings, setSettings] = useState({ autoExpired: true, maxFileSize: 5 });
  const [reminderDays, setReminderDays] = useState({90: true, 60: true, 30: true, 7: true});
  const [fileTypes, setFileTypes] = useState({PDF: true, JPG: true, PNG: true});

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Document Settings</h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-3">Default Expiry Reminders</p>
          <div className="flex gap-4">
            {[90, 60, 30, 7].map(days => (
              <label key={days} className="flex items-center gap-2">
                <input type="checkbox" checked={reminderDays[days]} onChange={(e) => setReminderDays({...reminderDays, [days]: e.target.checked})} className="rounded border-gray-300" />
                <span>{days} days</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-3">Allowed File Types</p>
          <div className="flex gap-4">
            {['PDF', 'JPG', 'PNG', 'DOC'].map(type => (
              <label key={type} className="flex items-center gap-2">
                <input type="checkbox" checked={fileTypes[type] || false} onChange={(e) => setFileTypes({...fileTypes, [type]: e.target.checked})} className="rounded border-gray-300" />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-2">Max File Size (MB)</p>
          <select value={settings.maxFileSize} onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})} className="w-32 px-3 py-2 border border-gray-300 rounded-lg">
            <option value="2">2 MB</option>
            <option value="5">5 MB</option>
            <option value="10">10 MB</option>
            <option value="20">20 MB</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div><p className="font-medium">Auto Mark Expired</p><p className="text-sm text-gray-500">Automatically mark documents as expired</p></div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.autoExpired} onChange={(e) => setSettings({...settings, autoExpired: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>

      <button onClick={() => toast.success('Document settings saved')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><FiSave className="w-4 h-4" /> Save</button>
    </div>
  );
};

// 8. Audit Logs
const AuditLogsSettings = () => {
  const [filters, setFilters] = useState({ search: '', module: 'All', dateRange: '' });

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(filters.search.toLowerCase()) || log.action.toLowerCase().includes(filters.search.toLowerCase());
    const matchesModule = filters.module === 'All' || log.module === filters.module;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search user or action..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <select value={filters.module} onChange={(e) => setFilters({...filters, module: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
          <option value="All">All Modules</option><option value="Inventory">Inventory</option><option value="Documents">Documents</option><option value="System">System</option>
        </select>
        <input type="date" value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Module</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{log.user}</td>
                <td className="px-4 py-3 text-sm">{log.action}</td>
                <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{log.module}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{log.date}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

export default Settings;