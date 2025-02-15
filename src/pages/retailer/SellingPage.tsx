import React, { useState } from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { useStore } from '../../data/store';
import SearchBar from '../../components/SearchBar';

const SellingPage = () => {
  const { medicines, inventory, addTransaction, updateInventory } = useStore();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);
  const medicineInventory = inventory.find(i => i.medicine_id === selectedMedicineId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine || !medicineInventory) return;

    const quantityNum = parseInt(quantity);
    if (quantityNum > medicineInventory.quantity) {
      alert('Not enough stock!');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount = selectedMedicine.unit_price * quantityNum;

      addTransaction({
        type: 'sale',
        medicine_id: selectedMedicine.id,
        quantity: quantityNum,
        total_amount: totalAmount,
        status: 'completed'
      });

      updateInventory(selectedMedicine.id, -quantityNum);

      setSelectedMedicineId('');
      setQuantity('');
      alert('Sale completed successfully!');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Failed to process sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchSelect = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Process Sale</h1>
        <span className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
          <ShoppingCart className="inline-block w-4 h-4 mr-2" />
          Sales Counter
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medicine
              </label>
              <SearchBar onSelect={handleSearchSelect} />
            </div>

            {selectedMedicine && medicineInventory && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedMedicine.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedMedicine.generic_name} • {selectedMedicine.manufacturer}
                    </p>
                    <p className="text-sm text-gray-600">Stock: {medicineInventory.quantity} units</p>
                    <p className="text-sm font-medium text-blue-600">
                      Price: ₹{selectedMedicine.unit_price}/unit
                    </p>
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
                max={medicineInventory?.quantity || 1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {selectedMedicine && quantity && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount:</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{(selectedMedicine.unit_price * parseInt(quantity || '0')).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedMedicine || !quantity || isSubmitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Complete Sale
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellingPage; 