import React, { useState } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import LoginInput from './LoginInput';
import LoginButton from './LoginButton';

// Mock user data
const MOCK_USER = {
  email: 'admin@inventory.com',
  password: 'admin123'
};

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate against mock data
    if (formData.email === MOCK_USER.email && formData.password === MOCK_USER.password) {
      onLogin?.(formData);
      alert('Login successful!');
    } else {
      alert('Invalid email or password. Try: admin@inventory.com / admin123');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <LoginInput
        type="email"
        name="email"
        placeholder="Email address"
        value={formData.email}
        onChange={handleChange}
        icon={FiMail}
      />

      <LoginInput
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        icon={FiLock}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>

        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
          Forgot password?
        </a>
      </div>

      <LoginButton text="Sign In" />
    </form>
  );
};

export default LoginForm;