import React, { useState } from 'react';
import { Shield, Activity, AlertTriangle, TrendingUp, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../data/store';

const AdminDashboard = () => {
  const { transactions } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filter transactions based on criteria
  const filteredTransactions = transactions.filter(transaction => {
    // Status filter
    if (filter !== 'all' && transaction.status !== filter) return false;

    // Search filter
    if (searchTerm && !transaction.medicine_id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date range filter
    if (dateRange.start && new Date(transaction.date) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(transaction.date) > new Date(dateRange.end)) return false;

    return true;
  });

  const stats = [
    {
      label: 'Total Transactions',
      value: filteredTransactions.length,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending Approvals',
      value: filteredTransactions.filter(t => t.status === 'pending').length,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Today\'s Volume',
      value: `₹${filteredTransactions
        .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <span className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg">
          <Shield className="inline-block w-4 h-4 mr-2" />
          Administrator
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Management
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'purchase'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ₹{transaction.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(transaction.date), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {transaction.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Handle status update here using store
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            // Handle status update here using store
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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

export default AdminDashboard;