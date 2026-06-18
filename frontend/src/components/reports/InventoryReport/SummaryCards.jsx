import React from 'react';
import { FiBox, FiTrendingUp, FiTrendingDown, FiAlertTriangle } from 'react-icons/fi';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Items in Inventory',
      value: summary.totalItems,
      icon: FiBox,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Stock In',
      value: summary.totalStockIn,
      icon: FiTrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Stock Out',
      value: summary.totalStockOut,
      icon: FiTrendingDown,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Low Stock Items',
      value: summary.lowStockItems,
      icon: FiAlertTriangle,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

export default SummaryCards;