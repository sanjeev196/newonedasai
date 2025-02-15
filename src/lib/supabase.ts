import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Test connection on initialization
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .limit(1);

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Database connection successful!'
    };
  } catch (error) {
    console.error('Database test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
};

// Fetch all medicines with their inventory
export const getAllMedicines = async () => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select(`
        *,
        inventory (*)
      `);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching all medicines:', error);
    return { data: null, error };
  }
};

// Get medicine by ID with inventory
export const getMedicineById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select(`
        *,
        inventory (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return { data: null, error };
  }
};

// Get random medicines with inventory
export const getRandomMedicines = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select(`
        *,
        inventory (*)
      `)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching random medicines:', error);
    return { data: null, error };
  }
};