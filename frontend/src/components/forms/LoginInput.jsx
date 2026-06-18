import React from 'react';

const LoginInput = ({ type, name, placeholder, value, onChange, icon: Icon }) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        style={{ paddingLeft: Icon ? '2.75rem' : '1rem' }}
      />
    </div>
  );
};

export default LoginInput;