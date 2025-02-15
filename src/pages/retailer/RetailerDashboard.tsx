import React, { useState, useEffect } from 'react';
import { ShoppingCart, Bell, Package } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import { supabase } from '../../lib/supabase';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  dosage: string;
}

interface Notification {
  id: string;
  medicine: Medicine;
  timestamp: string;
}

const RetailerDashboard = () => {
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Subscribe to realtime updates for new inventory items
    const subscription = supabase
      .channel('inventory_changes')
      .on('INSERT', { event: '*', schema: 'public', table: 'inventory' }, 
        async (payload) => {
          const { data: medicine } = await supabase
            .from('medicines')
            .select('*')
            .eq('id', payload.new.medicine_id)
            .single();

          if (medicine) {
            setNotifications(prev => [{
              id: payload.new.id,
              medicine,
              timestamp: payload.new.created_at
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        type: 'purchase',
        reference_number: `ORD${Date.now()}`,
        total_amount: 0, // Calculate based on inventory price
        status: 'pending'
      });

      if (error) throw error;

      setSelectedMedicine(null);
      setQuantity('');
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
          <span className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
            <ShoppingCart className="inline-block w-4 h-4 mr-2" />
            Retailer
          </span>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Medicines Available</h2>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">{notification.medicine.name}</h3>
                  <p className="text-sm text-gray-600">
                    {notification.medicine.generic_name} • {notification.medicine.manufacturer}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Added {new Date(notification.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Place New Order</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medicine
              </label>
              <SearchBar onSelect={setSelectedMedicine} />
            </div>

            {selectedMedicine && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedMedicine.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedMedicine.generic_name} • {selectedMedicine.manufacturer}
                    </p>
                    <p className="text-sm text-gray-600">Dosage: {selectedMedicine.dosage}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedMedicine || isSubmitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Place Order
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RetailerDashboard;