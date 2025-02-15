export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      medicines: {
        Row: {
          id: string
          name: string
          generic_name: string
          manufacturer: string
          category: string
          dosage: string
          unit: string
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          generic_name: string
          manufacturer: string
          category: string
          dosage: string
          unit: string
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          generic_name?: string
          manufacturer?: string
          category?: string
          dosage?: string
          unit?: string
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          medicine_id: string
          quantity: number
          batch_number: string
          expiry_date: string
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          medicine_id: string
          quantity: number
          batch_number: string
          expiry_date: string
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          medicine_id?: string
          quantity?: number
          batch_number?: string
          expiry_date?: string
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'purchase' | 'sale' | 'return' | 'disposal'
          reference_number: string
          total_amount: number
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'purchase' | 'sale' | 'return' | 'disposal'
          reference_number: string
          total_amount: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'purchase' | 'sale' | 'return' | 'disposal'
          reference_number?: string
          total_amount?: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}