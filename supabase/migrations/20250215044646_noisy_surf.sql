/*
  # Initial Schema for Pharmacy Management System

  1. New Tables
    - `pharmacies`
      - Basic pharmacy information and authentication
    - `medicines`
      - Medicine catalog with details
    - `inventory`
      - Current stock levels and batch information
    - `transactions`
      - All medicine transactions (purchases and sales)
    - `expiry_requests`
      - Requests for handling expired medicines
    
  2. Security
    - RLS enabled on all tables
    - Policies for pharmacy access control
    - Transaction verification system
*/

-- Create pharmacy profiles table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text UNIQUE NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medicines catalog
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text NOT NULL,
  manufacturer text NOT NULL,
  category text NOT NULL,
  dosage text NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, manufacturer, dosage)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid REFERENCES pharmacies(id),
  medicine_id uuid REFERENCES medicines(id),
  batch_number text NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 0),
  unit_price decimal(10,2) NOT NULL,
  expiry_date date NOT NULL,
  manufacturing_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pharmacy_id, medicine_id, batch_number)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid REFERENCES pharmacies(id),
  type text NOT NULL CHECK (type IN ('purchase', 'sale', 'return', 'disposal')),
  reference_number text UNIQUE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id),
  inventory_id uuid REFERENCES inventory(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create expiry requests table
CREATE TABLE IF NOT EXISTS expiry_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid REFERENCES pharmacies(id),
  inventory_id uuid REFERENCES inventory(id),
  quantity integer NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pharmacies can view their own data"
  ON pharmacies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Medicines are viewable by all authenticated users"
  ON medicines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pharmacies can view their inventory"
  ON inventory
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = auth.uid());

CREATE POLICY "Pharmacies can view their transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = auth.uid());

CREATE POLICY "Pharmacies can view their transaction items"
  ON transaction_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_items.transaction_id 
      AND transactions.pharmacy_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacies can view their expiry requests"
  ON expiry_requests
  FOR SELECT
  TO authenticated
  USING (pharmacy_id = auth.uid());