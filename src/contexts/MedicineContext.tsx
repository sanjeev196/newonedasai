import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllMedicines } from '../lib/supabase';
import type { Database } from '../lib/types';

type Medicine = Database['public']['Tables']['medicines']['Row'] & {
  inventory: Database['public']['Tables']['inventory']['Row'][];
};

interface MedicineContextType {
  medicines: Medicine[];
  loading: boolean;
  error: any;
  refreshMedicines: () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllMedicines();
      
      if (error) {
        throw error;
      }
      
      setMedicines(data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const refreshMedicines = async () => {
    await fetchMedicines();
  };

  return (
    <MedicineContext.Provider value={{ medicines, loading, error, refreshMedicines }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicines = () => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicines must be used within a MedicineProvider');
  }
  return context;
};