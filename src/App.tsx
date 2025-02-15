import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MedicineProvider } from './contexts/MedicineContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import OrderSimulator from './pages/OrderSimulator';
import InventoryAnalytics from './pages/InventoryAnalytics';
import ExpiryManagement from './pages/ExpiryManagement';
import HealthTrends from './pages/HealthTrends';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SellingPage from './pages/retailer/SellingPage';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <MedicineProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/order-simulator" element={<OrderSimulator />} />
                <Route path="/sell" element={<SellingPage />} />
                <Route path="/inventory-analytics" element={<InventoryAnalytics />} />
                <Route path="/expiry-management" element={<ExpiryManagement />} />
                <Route path="/health-trends" element={<HealthTrends />} />
                <Route path="/supplier/*" element={<SupplierDashboard />} />
                <Route path="/retailer/*" element={<RetailerDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </MedicineProvider>
  );
};

export default App;