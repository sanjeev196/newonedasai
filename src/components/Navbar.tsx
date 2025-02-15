import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BarChart2, 
  AlertTriangle, 
  Activity,
  Pill,
  DollarSign
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/order-simulator', icon: ShoppingCart, label: 'Order Simulator' },
    { path: '/sell', icon: DollarSign, label: 'Sell Medicine' },
    { path: '/inventory-analytics', icon: BarChart2, label: 'Inventory Analytics' },
    { path: '/expiry-management', icon: AlertTriangle, label: 'Expiry Management' },
    { path: '/health-trends', icon: Activity, label: 'Health Trends' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
              <Pill className="h-6 w-6" />
              GuluguluPharmacyTracker
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;