import React from 'react';
import { AlertTriangle, Calendar, Archive, Clock } from 'lucide-react';
import { format, differenceInDays, isBefore, addMonths } from 'date-fns';
import { useStore } from '../data/store';

interface ExpiringItem {
  name: string;
  batch: string;
  quantity: number;
  expiryDate: Date;
  status: 'critical' | 'warning' | 'safe';
}

const ExpiryManagement = () => {
  const { inventory, medicines } = useStore();
  const today = new Date();

  const getExpiryStatus = (expiryDate: string): ExpiringItem['status'] => {
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), today);
    if (daysUntilExpiry <= 30) return 'critical';
    if (daysUntilExpiry <= 90) return 'warning';
    return 'safe';
  };

  const expiringItems: ExpiringItem[] = inventory
    .map(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      if (!medicine) return null;

      return {
        name: medicine.name,
        batch: item.batch_number,
        quantity: item.quantity,
        expiryDate: new Date(item.expiry_date),
        status: getExpiryStatus(item.expiry_date)
      };
    })
    .filter((item): item is ExpiringItem => item !== null)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  const expiryGroups = [
    {
      label: 'Expiring This Month',
      count: expiringItems.filter(item => item.status === 'critical').length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Expiring Next Month',
      count: expiringItems.filter(item => 
        item.status === 'warning' && 
        isBefore(item.expiryDate, addMonths(today, 2))
      ).length,
      icon: Calendar,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Expiring in 3 Months',
      count: expiringItems.filter(item => 
        item.status === 'warning' && 
        !isBefore(item.expiryDate, addMonths(today, 2))
      ).length,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Safe Stock',
      count: expiringItems.filter(item => item.status === 'safe').length,
      icon: Archive,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {expiryGroups.map((group, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className={`${group.bg} p-3 rounded-lg`}>
                <group.icon className={`h-6 w-6 ${group.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Items
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{group.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {group.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Expiring Inventory
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
                  Batch Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expiringItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.batch}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.quantity} units
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(item.expiryDate, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : item.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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

export default ExpiryManagement;