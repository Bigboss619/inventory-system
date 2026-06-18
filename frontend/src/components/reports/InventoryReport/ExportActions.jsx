import React from 'react';
import { FiDownload, FiFileText, FiPrinter } from 'react-icons/fi';

const ExportActions = ({ onExportPDF, onExportExcel, onPrint }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onExportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <FiFileText className="w-4 h-4" />
        Export PDF
      </button>
      <button
        onClick={onExportExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FiDownload className="w-4 h-4" />
        Export Excel
      </button>
      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <FiPrinter className="w-4 h-4" />
        Print
      </button>
    </div>
  );
};

export default ExportActions;