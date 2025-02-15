import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '../lib/types';
import { supabase } from '../lib/supabase';

type Medicine = Database['public']['Tables']['medicines']['Row'];
type Inventory = Database['public']['Tables']['inventory']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

interface StoreState {
  medicines: Medicine[];
  inventory: Inventory[];
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInventory: (medicineId: string, quantity: number, price: number) => Promise<void>;
  updateTransactionStatus: (transactionId: string, status: Transaction['status']) => void;
  resetStore: () => void;
  fetchInventory: () => Promise<void>;
  getMedicineStock: (medicineId: string) => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      medicines: [],
      inventory: [],
      transactions: [],

      addTransaction: async (transaction) => {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            ...transaction,
            id: uuidv4(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding transaction:', error);
          return;
        }

        set((state) => ({
          transactions: [data, ...state.transactions]
        }));
      },

      updateInventory: async (medicineId: string, quantity: number, price: number) => {
        if (quantity > 0) {
          const { error } = await supabase
            .from('inventory')
            .insert({
              medicine_id: medicineId,
              quantity,
              unit_price: price,
              batch_number: `BAT${Date.now()}`,
              expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });

          if (error) {
            console.error('Error updating inventory:', error);
            return;
          }
        } else {
          const absQuantity = Math.abs(quantity);
          let remainingQuantity = absQuantity;
          const { data: inventory } = await supabase
            .from('inventory')
            .select('*')
            .eq('medicine_id', medicineId)
            .order('expiry_date', { ascending: true });

          if (!inventory) return;

          for (const item of inventory) {
            if (remainingQuantity <= 0) break;

            const deduction = Math.min(remainingQuantity, item.quantity);
            const { error } = await supabase
              .from('inventory')
              .update({ quantity: item.quantity - deduction })
              .eq('id', item.id);

            if (error) {
              console.error('Error updating inventory:', error);
              return;
            }

            remainingQuantity -= deduction;
          }
        }

        await get().fetchInventory();
      },

      updateTransactionStatus: async (transactionId: string, status: Transaction['status']) => {
        const { error } = await supabase
          .from('transactions')
          .update({ status })
          .eq('id', transactionId);

        if (error) {
          console.error('Error updating transaction status:', error);
          return;
        }

        set((state) => ({
          transactions: state.transactions.map(t =>
            t.id === transactionId ? { ...t, status } : t
          )
        }));
      },

      resetStore: () => set({ medicines: [], inventory: [], transactions: [] }),

      fetchInventory: async () => {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .order('expiry_date', { ascending: true });

        if (error) {
          console.error('Error fetching inventory:', error);
          return;
        }

        set({ inventory: data });
      },

      getMedicineStock: (medicineId: string) => {
        return get().inventory
          .filter(item => item.medicine_id === medicineId)
          .reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'pharmacy-store',
      partialize: (state) => ({
        inventory: state.inventory,
        transactions: state.transactions,
      }),
    }
  )
);

// Initialize inventory on store creation
useStore.getState().fetchInventory();