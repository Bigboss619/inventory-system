import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoginButton = ({ text, onClick, disabled, loading }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {loading ? (
        <FiLoader className="w-5 h-5 animate-spin" />
      ) : (
        text
      )}
    </button>
  );
};

export default LoginButton;