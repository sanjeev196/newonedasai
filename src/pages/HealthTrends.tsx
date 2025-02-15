import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, Users, Thermometer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TrendingStat {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  bg: string;
}

interface HealthTrend {
  condition: string;
  affectedAge: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'moderate' | 'low';
  medications: string[];
}

const HealthTrends = () => {
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [trendStats, setTrendStats] = useState<TrendingStat[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            quantity,
            unit_price,
            inventory (
              medicine_id,
              medicines (
                name,
                generic_name
              )
            )
          )
        `)
        .eq('type', 'purchase')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionError) throw transactionError;

      // Calculate statistics
      const totalTransactions = transactions?.length || 0;
      const totalValue = transactions?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;
      const uniqueMedicines = new Set(transactions?.flatMap(t => 
        t.transaction_items.map((item: any) => item.inventory.medicines.name)
      )).size;

      setTrendStats([
        {
          label: 'Recent Purchases',
          value: totalTransactions.toString(),
          change: `Last 24 hours`,
          icon: Activity,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          label: 'Total Purchase Value',
          value: `₹${totalValue.toFixed(2)}`,
          change: 'Recent transactions',
          icon: Users,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
        {
          label: 'Unique Medicines',
          value: uniqueMedicines.toString(),
          change: 'Different items',
          icon: Thermometer,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
        },
        {
          label: 'Trending Items',
          value: Math.min(uniqueMedicines, 8).toString(),
          change: 'High demand items',
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
      ]);

      setRecentTransactions(transactions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading trends data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendStats.map((stat, index) => (
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
              <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Purchases Analysis
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                transaction.transaction_items.map((item: any, itemIndex: number) => (
                  <tr key={`${transaction.id}-${itemIndex}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.inventory.medicines.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthTrends;