import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', danger = true }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center gap-3 ${danger ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`p-2 rounded-full ${danger ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            <FiAlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 whitespace-pre-line">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium flex items-center gap-2 ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading && <FiAlertTriangle className="w-4 h-4 animate-pulse" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;