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