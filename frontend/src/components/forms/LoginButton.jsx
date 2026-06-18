import React from 'react';

const LoginButton = ({ text, onClick, disabled }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
};

export default LoginButton;