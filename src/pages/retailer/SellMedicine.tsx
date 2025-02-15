import React, { useState, useEffect } from 'react';
import { useStore } from '../../data/store';
import SearchBar from '../../components/SearchBar';
import { supabase } from '../../lib/supabase';

const SellMedicine = () => {
  const { getMedicineStock, updateInventory } = useStore();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [medicine, setMedicine] = useState<any>(null);
  const [currentStock, setCurrentStock] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedMedicineId) {
      fetchMedicineDetails();
      updateCurrentStock();
    }
  }, [selectedMedicineId]);

  const fetchMedicineDetails = async () => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', selectedMedicineId)
      .single();

    if (error) {
      console.error('Error fetching medicine:', error);
      return;
    }

    setMedicine(data);
  };

  const updateCurrentStock = () => {
    const stock = getMedicineStock(selectedMedicineId);
    setCurrentStock(stock);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine || !quantity || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const quantityNum = parseInt(quantity);
      const totalAmount = medicine.unit_price * quantityNum;

      // Create transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'sale',
          medicine_id: selectedMedicineId,
          quantity: quantityNum,
          total_amount: totalAmount,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update inventory
      await updateInventory(selectedMedicineId, -quantityNum, medicine.unit_price);

      // Reset form
      setSelectedMedicineId('');
      setQuantity('');
      setMedicine(null);
      setCurrentStock(0);
      
    } catch (error) {
      console.error('Error selling medicine:', error);
      alert('Failed to process sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sell Medicine</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Medicine
          </label>
          <SearchBar onSelect={setSelectedMedicineId} />
        </div>

        {medicine && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Current Stock: {currentStock} units</p>
              <p className="text-sm text-gray-600">Unit Price: ₹{medicine.unit_price}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={currentStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            {quantity && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Amount: ₹{(parseInt(quantity) * medicine.unit_price).toFixed(2)}
                </p>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={!medicine || !quantity || parseInt(quantity) > currentStock || isSubmitting}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium 
                   hover:bg-blue-700 transition-colors disabled:opacity-50 
                   disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Complete Sale'}
        </button>
      </form>
    </div>
  );
};

export default SellMedicine; 