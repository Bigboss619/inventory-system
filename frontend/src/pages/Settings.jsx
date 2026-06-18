import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSettings, FiBell, FiDatabase, FiFileText, FiClock, FiSave, FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Tab components
const TABS = [
  { id: 'profile', label: 'Profile Settings', icon: FiUser },
  { id: 'users', label: 'User & Roles', icon: FiUser },
  { id: 'system', label: 'System Config', icon: FiSettings },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'email', label: 'Email Settings', icon: FiMail },
  { id: 'inventory', label: 'Inventory', icon: FiDatabase },
  { id: 'documents', label: 'Documents', icon: FiFileText },
  { id: 'audit', label: 'Audit Logs', icon: FiClock },
];

const ROLES = ['Super Admin', 'Inventory Officer', 'Document Officer'];

const MOCK_USERS = [
  { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Super Admin', status: 'Active' },
  { id: 2, name: 'Sarah Smith', email: 'sarah@company.com', role: 'Inventory Officer', status: 'Active' },
  { id: 3, name: 'Mike Brown', email: 'mike@company.com', role: 'Document Officer', status: 'Active' },
  { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'Inventory Officer', status: 'Disabled' },
];

const MOCK_LOGS = [
  { id: 1, user: 'John Doe', action: 'Updated document settings', module: 'System', date: '2026-06-18 10:30', ip: '192.168.1.100' },
  { id: 2, user: 'Sarah Smith', action: 'Issued 5 laptops', module: 'Inventory', date: '2026-06-18 09:15', ip: '192.168.1.105' },
  { id: 3, user: 'Mike Brown', action: 'Uploaded vehicle file', module: 'Documents', date: '2026-06-17 14:20', ip: '192.168.1.110' },
  { id: 4, user: 'John Doe', action: 'Created new user', module: 'System', date: '2026-06-17 11:00', ip: '192.168.1.100' },
  { id: 5, user: 'Emily Davis', action: 'Updated stock levels', module: 'Inventory', date: '2026-06-16 16:45', ip: '192.168.1.108' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

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
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'users' && <UserRolesSettings />}
      {activeTab === 'system' && <SystemConfigSettings />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'email' && <EmailSettings />}
      {activeTab === 'inventory' && <InventorySettings />}
      {activeTab === 'documents' && <DocumentSettings />}
      {activeTab === 'audit' && <AuditLogsSettings />}
    </div>
  );
};

// 1. Profile Settings
const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: 'John', lastName: 'Doe', email: 'john@company.com', phone: '+234 801 234 5678' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profile Settings</h2>
        <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
          <FiEdit2 className="w-4 h-4" /> {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50" />
        </div>
      </div>

      {isEditing && <button onClick={() => { setIsEditing(false); toast.success('Profile updated'); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><FiSave className="w-4 h-4" /> Save</button>}

      <div className="border-t pt-6">
        <h3 className="text-md font-semibold mb-4 flex items-center gap-2"><FiLock className="w-5 h-5" /> Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="password" placeholder="Current Password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="Confirm Password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Update Password</button>
      </div>
    </div>
  );
};

// 2. User & Roles
const UserRolesSettings = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">User & Roles</h2>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><FiPlus className="w-4 h-4" /> Add User</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                <td className="px-4 py-3 text-sm">{user.email}</td>
                <td className="px-4 py-3 text-sm">
                  <select defaultValue={user.role} className="text-sm border border-gray-300 rounded px-2 py-1">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-500 hover:text-blue-600"><FiEdit2 className="w-4 h-4" /></button>
                    <button className="p-1 text-gray-500 hover:text-red-600"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    </div>
  );
};

export default Settings;