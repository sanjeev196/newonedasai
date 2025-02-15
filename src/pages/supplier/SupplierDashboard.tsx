import React, { useState } from 'react';
import { Plus, Package, Truck } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import { useStore } from '../../data/store';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  dosage: string;
  unit_price: number;
}

const SupplierDashboard = () => {
  const { medicines, addTransaction } = useStore();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    setIsSubmitting(true);
    try {
      const quantityNum = parseInt(quantity);
      const priceNum = parseFloat(price);

      addTransaction({
        type: 'purchase',
        medicine_id: selectedMedicine.id,
        quantity: quantityNum,
        total_amount: quantityNum * priceNum,
        status: 'pending'
      });

      setSelectedMedicineId('');
      setQuantity('');
      setPrice('');
      alert('Medicine added to supply chain successfully!');
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine to supply chain');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
            <Truck className="inline-block w-4 h-4 mr-2" />
            Supplier
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Add Medicine to Supply Chain</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medicine
              </label>
              <SearchBar onSelect={setSelectedMedicineId} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Unit (₹)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedMedicine || !quantity || !price || isSubmitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add to Supply Chain
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierDashboard;