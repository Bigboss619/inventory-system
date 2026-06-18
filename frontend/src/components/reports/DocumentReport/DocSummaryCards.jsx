import React from 'react';
import { FiFileText, FiCheckCircle, FiAlertTriangle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const DocSummaryCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Documents',
      value: summary.totalDocuments,
      icon: FiFileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Documents',
      value: summary.active,
      icon: FiCheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Expiring Soon',
      value: summary.expiringSoon,
      icon: FiAlertTriangle,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Expired Documents',
      value: summary.expired,
      icon: FiXCircle,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Renewed Documents',
      value: summary.renewed,
      icon: FiRefreshCw,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocSummaryCards;