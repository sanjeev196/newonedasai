import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../data/store';

interface SearchBarProps {
  onSelect: (medicineId: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {
  const { medicines } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter medicines based on search term
  const suggestions = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (medicineId: string) => {
    onSelect(medicineId);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {showSuggestions && searchTerm.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((medicine) => (
              <button
                key={medicine.id}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                onClick={() => handleSelect(medicine.id)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{medicine.name}</span>
                  <span className="text-sm text-gray-600">
                    {medicine.generic_name} • ₹{medicine.unit_price}/unit
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No medicines found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;