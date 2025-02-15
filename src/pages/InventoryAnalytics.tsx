import React from 'react';
import { BarChart2, TrendingUp, TrendingDown, Package } from 'lucide-react';

const InventoryAnalytics = () => {
  const inventoryStats = [
    {
      label: 'Total Stock Value',
      value: '₹1,24,500',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
    },
    {
      label: 'Stock Turnover Rate',
      value: '3.2x',
      change: '-0.5x',
      trend: 'down',
      icon: BarChart2,
    },
    {
      label: 'Low Stock Items',
      value: '15',
      change: '+3',
      trend: 'up',
      icon: TrendingDown,
    },
    {
      label: 'Overstock Items',
      value: '8',
      change: '-2',
      trend: 'down',
      icon: TrendingUp,
    },
  ];

  const topMedicines = [
    { name: 'Amoxicillin 500mg', stock: 2500, reorderPoint: 1000, status: 'optimal' },
    { name: 'Paracetamol 500mg', stock: 800, reorderPoint: 1000, status: 'low' },
    { name: 'Ibuprofen 400mg', stock: 1500, reorderPoint: 800, status: 'optimal' },
    { name: 'Omeprazole 20mg', stock: 2000, reorderPoint: 600, status: 'high' },
    { name: 'Metformin 850mg', stock: 900, reorderPoint: 1200, status: 'low' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="bg-gray-50 p-3 rounded-lg">
                <stat.icon className="h-6 w-6 text-gray-600" />
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Inventory Status by Medicine
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Reorder Point
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topMedicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {medicine.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {medicine.stock} units
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {medicine.reorderPoint} units
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      medicine.status === 'optimal'
                        ? 'bg-green-100 text-green-800'
                        : medicine.status === 'low'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {medicine.status.charAt(0).toUpperCase() + medicine.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;