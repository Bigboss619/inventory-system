import React from 'react';

const ExpiryStatusChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = {
    active: 'bg-green-500',
    expiring: 'bg-yellow-500',
    expired: 'bg-red-500',
    renewed: 'bg-blue-500',
  };

  const getConicGradient = () => {
    let cumulative = 0;
    return data.map((item) => {
      const percentage = (item.value / total) * 100;
      const start = cumulative;
      cumulative += percentage;
      return `${colors[item.status]} ${start}% ${cumulative}%`;
    }).join(', ');
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      expiring: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Expiring Soon' },
      expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
      renewed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Renewed' },
    };
    return badges[status] || badges.active;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Expiry Status Breakdown</h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${getConicGradient()})`,
            }}
          />
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            const badge = getStatusBadge(item.status);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[item.status]}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpiryStatusChart;