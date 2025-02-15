import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/types';

type Medicine = Database['public']['Tables']['medicines']['Row'];
type Inventory = Database['public']['Tables']['inventory']['Row'];

const OrderSimulator = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medicines')
        .select(`
          *,
          inventory (
            id,
            quantity,
            batch_number,
            expiry_date,
            unit_price
          )
        `);

      if (error) throw error;
      setMedicines(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.medicine.id === medicine.id);
      if (existingItem) {
        return prev.map(item =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item.medicine.id === medicineId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.medicine.unit_price * item.quantity,
      0
    );
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      // Process each cart item
      for (const item of cart) {
        const { medicine, quantity } = item;
        
        // Create a new inventory entry
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert({
            medicine_id: medicine.id,
            quantity: quantity,
            batch_number: `BAT${Date.now()}`,
            expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            unit_price: medicine.unit_price
          });

        if (inventoryError) throw inventoryError;
      }

      // Clear cart after successful purchase
      setCart([]);
      alert('Purchase completed successfully!');
      fetchMedicines(); // Refresh the medicines list
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to complete purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-4">Loading inventory...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Order Simulator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shopping Cart - Left Side */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <ShoppingCart className="w-5 h-5 text-gray-500" />
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.medicine.id} className="border p-4 rounded">
                    <h3 className="font-semibold">{item.medicine.name}</h3>
                    <p className="text-sm text-gray-600">{item.medicine.generic_name}</p>
                    <div className="flex items-center mt-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.medicine.id, parseInt(e.target.value))}
                        className="w-20 p-1 border rounded"
                        min="1"
                      />
                      <button
                        onClick={() => removeFromCart(item.medicine.id)}
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 text-sm">
                      Subtotal: ₹{(item.medicine.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <p className="text-lg font-bold mb-4">
                    Total: ₹{getTotalPrice().toFixed(2)}
                  </p>
                  <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Purchase'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available Inventory - Right Side */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Available Medicines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="border p-4 rounded hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{medicine.name}</h3>
                      <p className="text-sm text-gray-600">{medicine.generic_name}</p>
                      <p className="text-sm">Category: {medicine.category}</p>
                      <p className="text-sm">Price: ₹{medicine.unit_price}</p>
                    </div>
                    <button
                      onClick={() => addToCart(medicine)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSimulator;