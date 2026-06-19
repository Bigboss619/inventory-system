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
  const response = await fetch(`${API_URL}/stock-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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