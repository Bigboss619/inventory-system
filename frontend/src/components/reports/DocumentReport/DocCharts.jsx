import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const DocCharts = ({ expiryTrend, categoryData, monthlyRenewals }) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

  // Category Pie Chart
  const total = categoryData.reduce((sum, item) => sum + item.value, 0);
  const getCategoryGradient = () => {
    let cumulative = 0;
    return categoryData.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const start = cumulative;
      cumulative += percentage;
      return `${colors[index % colors.length]} ${start}% ${cumulative}%`;
    }).join(', ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Renewals Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Renewals</h3>
        <div className="flex items-end gap-2 h-40">
          {monthlyRenewals.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(item.value / Math.max(...monthlyRenewals.map(m => m.value))) * 100}%` }}
              />
              <span className="text-xs text-gray-500">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(${getCategoryGradient()})`,
              }}
            />
          </div>
          <div className="flex-1 space-y-2">
            {categoryData.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocCharts;