const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const getCurrentUser = async (userId) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'user-id': userId },
  });
  return response.json();
};

export const setupAdmin = async () => {
  const response = await fetch(`${API_URL}/auth/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

// Users API
export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user');
  }
  return response.json();
};

export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  return response.json();
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const updateUserStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// Departments API
export const getDepartments = async () => {
  const response = await fetch(`${API_URL}/departments`);
  return response.json();
};

export const getDepartmentById = async (id) => {
  const response = await fetch(`${API_URL}/departments/${id}`);
  return response.json();
};

export const createDepartment = async (data) => {
  const response = await fetch(`${API_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateDepartment = async (id, data) => {
  const response = await fetch(`${API_URL}/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteDepartment = async (id) => {
  const response = await fetch(`${API_URL}/departments/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

// Staff API
export const getStaff = async () => {
  const response = await fetch(`${API_URL}/staff`);
  return response.json();
};

export const getStaffById = async (id) => {
  const response = await fetch(`${API_URL}/staff/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch staff');
  }
  return response.json();
};

export const createStaff = async (staffData) => {
  const response = await fetch(`${API_URL}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create staff');
  }
  return response.json();
};

export const updateStaff = async (id, staffData) => {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update staff');
  }
  return response.json();
};

export const deleteStaff = async (id) => {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete staff');
  }
  return response.json();
};

// Categories API
export const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  return response.json();
};

export const createCategory = async (data) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateCategory = async (id, data) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const checkCategoryRecords = async (id) => {
  const response = await fetch(`${API_URL}/categories/check/${id}`);
  return response.json();
};

// Items API
export const getItems = async () => {
  const response = await fetch(`${API_URL}/items`);
  return response.json();
};

export const getItemById = async (id) => {
  const response = await fetch(`${API_URL}/items/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch item');
  }
  return response.json();
};

export const createItem = async (data) => {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create item');
  }
  return response.json();
};

export const updateItem = async (id, data) => {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update item');
  }
  return response.json();
};

export const deleteItem = async (id) => {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete item');
  }
  return response.json();
};

export const checkItemRecords = async (id) => {
  const response = await fetch(`${API_URL}/items/check/${id}`);
  return response.json();
};

// Stock In API
export const getStockIn = async () => {
  const response = await fetch(`${API_URL}/stock-in`);
  return response.json();
};

export const getStockInById = async (id) => {
  const response = await fetch(`${API_URL}/stock-in/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stock in record');
  }
  return response.json();
};

export const createStockIn = async (data) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await fetch(`${API_URL}/stock-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': user.id
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add stock');
  }
  return response.json();
};

export const updateStockIn = async (id, data) => {
  const response = await fetch(`${API_URL}/stock-in/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update stock');
  }
  return response.json();
};

export const deleteStockIn = async (id) => {
  const response = await fetch(`${API_URL}/stock-in/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete stock');
  }
  return response.json();
};

// Stock Out API
export const getStockOut = async () => {
  const response = await fetch(`${API_URL}/stock-out`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stock out records');
  }
  return response.json();
};

export const getStockOutById = async (id) => {
  const response = await fetch(`${API_URL}/stock-out/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stock out record');
  }
  return response.json();
};

export const createStockOut = async (data) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const response = await fetch(`${API_URL}/stock-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': user.id
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to issue stock');
  }
  return response.json();
};

export const updateStockOut = async (id, data) => {
  const response = await fetch(`${API_URL}/stock-out/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update stock out record');
  }
  return response.json();
};

export const deleteStockOut = async (id) => {
  const response = await fetch(`${API_URL}/stock-out/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete stock out record');
  }
  return response.json();
};

// Vehicles API
export const getVehicles = async () => {
  const response = await fetch(`${API_URL}/vehicles`);
  return response.json();
};

// Get all documents across all vehicles
export const getAllDocuments = async () => {
  const response = await fetch(`${API_URL}/vehicles/all/documents`);
  return response.json();
};

export const getVehicleById = async (id) => {
  const response = await fetch(`${API_URL}/vehicles/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch vehicle');
  }
  return response.json();
};

export const createVehicle = async (data) => {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create vehicle');
  }
  return response.json();
};

export const updateVehicle = async (id, data) => {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update vehicle');
  }
  return response.json();
};

export const deleteVehicle = async (assetId) => {
  const response = await fetch(`${API_URL}/vehicles/${assetId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete vehicle');
  }
  return response.json();
};

// ==================== BULK UPLOAD ====================

export const bulkUploadVehicles = async (data, uploadedBy = 'Admin') => {
  const response = await fetch(`${API_URL}/vehicles/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, uploadedBy }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to bulk upload');
  }
  return response.json();
};

// ==================== ALL MAINTENANCE ====================

export const getAllMaintenance = async () => {
  const response = await fetch(`${API_URL}/vehicles/all/maintenance`);
  return response.json();
};

// ==================== VEHICLE DOCUMENTS ====================

export const getVehicleDocuments = async (assetId) => {
  const response = await fetch(`${API_URL}/vehicles/${assetId}/documents`);
  return response.json();
};

export const getDocumentById = async (id) => {
  const response = await fetch(`${API_URL}/vehicles/documents/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch document');
  }
  return response.json();
};

export const createDocument = async (data) => {
  const response = await fetch(`${API_URL}/vehicles/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create document');
  }
  return response.json();
};

export const updateDocument = async (id, data) => {
  const response = await fetch(`${API_URL}/vehicles/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update document');
  }
  return response.json();
};

export const deleteDocument = async (id) => {
  const response = await fetch(`${API_URL}/vehicles/documents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete document');
  }
  return response.json();
};

// Document Renewals API
export const getDocumentRenewals = async (documentId) => {
  const response = await fetch(`${API_URL}/vehicles/documents/${documentId}/renewals`);
  return response.json();
};

// ==================== MAINTENANCE ====================

export const getMaintenanceRecords = async (assetId) => {
  const response = await fetch(`${API_URL}/vehicles/${assetId}/maintenance`);
  return response.json();
};

export const getMaintenanceById = async (id) => {
  const response = await fetch(`${API_URL}/vehicles/maintenance/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch maintenance record');
  }
  return response.json();
};

export const createMaintenance = async (data) => {
  const response = await fetch(`${API_URL}/vehicles/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create maintenance record');
  }
  return response.json();
};

export const updateMaintenance = async (id, data) => {
  const response = await fetch(`${API_URL}/vehicles/maintenance/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update maintenance record');
  }
  return response.json();
};

export const deleteMaintenance = async (id) => {
  const response = await fetch(`${API_URL}/vehicles/maintenance/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete maintenance record');
  }
  return response.json();
};