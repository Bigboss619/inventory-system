import React from 'react';
import { FiBox } from 'react-icons/fi';
import LoginForm from './LoginForm';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
            <FiBox className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Inventory System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your assets
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 rounded-2xl shadow-lg border border-gray-100">
          <LoginForm onLogin={onLogin} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          &copy; 2026 Inventory System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;