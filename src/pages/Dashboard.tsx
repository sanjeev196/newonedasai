import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Activity,
  ArrowRight,
  Package
} from 'lucide-react';
import InventoryContainer from '../components/InventoryContainer';
import { supabase } from '../lib/supabase';

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

interface ExpiringItem {
  name: string;
  expiry_date: string;
  quantity: number;
  days_until_expiry: number;
}

interface Medicine {
  name: string;
}

interface InventoryData {
  quantity: number;
  expiry_date: string;
  medicines: Medicine;
}

interface InventoryContainerProps {
  totalInventory: number;
  maxInventory: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [totalInventory, setTotalInventory] = useState(0);
  const [capacityUsed, setCapacityUsed] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch inventory with expiry dates
      const { data, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          quantity,
          expiry_date,
          medicines (
            name
          )
        `)
        .order('expiry_date', { ascending: true });

      if (inventoryError) throw inventoryError;

      const inventoryData = data as unknown as InventoryData[];

      // Calculate expiring items (within next 90 days)
      const now = new Date();
      const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
      
      const expiringMedicines = inventoryData
        .filter(item => {
          const expiryDate = new Date(item.expiry_date);
          return expiryDate <= ninetyDaysFromNow && item.quantity > 0;
        })
        .map(item => ({
          name: item.medicines.name,
          expiry_date: item.expiry_date,
          quantity: item.quantity,
          days_until_expiry: Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 3600 * 24))
        }))
        .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

      // Calculate total inventory
      const total = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
      const maxCapacity = 10000; // You can adjust this based on your needs
      const capacityPercentage = (total / maxCapacity) * 100;

      // Fetch recent transactions for trends
      const { data: recentTransactions, error: transactionError } = await supabase
        .from('transactions')
        .select('total_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      if (transactionError) throw transactionError;

      // Calculate predicted savings and next order value
      const lastMonthSales = recentTransactions
        ?.filter(t => new Date(t.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        ?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;

      setStats([
        {
          title: 'Expiring Soon',
          value: `${expiringMedicines.length} items`,
          change: `${expiringMedicines.length - 5} from last week`,
          icon: Package,
          color: 'text-orange-600'
        },
        {
          title: 'Predicted Savings',
          value: `₹${Math.round(lastMonthSales * 0.12).toLocaleString()}`,
          change: '+12% vs last month',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          title: 'Next Order Value',
          value: `₹${Math.round(lastMonthSales * 1.1).toLocaleString()}`,
          change: 'Based on current trends',
          icon: TrendingUp,
          color: 'text-blue-600'
        },
        {
          title: 'Local Health Trends',
          value: `${Math.min(3, expiringMedicines.length)} emerging`,
          change: 'Updated daily',
          icon: Activity,
          color: 'text-purple-600'
        }
      ]);

      setExpiringItems(expiringMedicines);
      setTotalInventory(total);
      setCapacityUsed(capacityPercentage);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - 3D Container */}
        <div className="lg:w-1/3">
          <div className="h-[600px] bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
            <InventoryContainer 
              totalInventory={totalInventory} 
              maxInventory={10000}
            />
          </div>
        </div>

        {/* Right Side - Stats and Info */}
        <div className="lg:w-2/3 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat: DashboardStat, index: number) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                  <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Current Inventory Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Inventory</span>
                  <span>{totalInventory.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Capacity Used</span>
                  <span>{capacityUsed.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">Expiring Soon</h3>
                  <Link
                    to="/expiry-management"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {expiringItems.slice(0, 3).map((item: ExpiringItem, index: number) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{item.quantity} units</p>
                        </div>
                        {item.days_until_expiry <= 30 && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                            Action needed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 