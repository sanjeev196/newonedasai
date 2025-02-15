-- Clear existing data
TRUNCATE medicines, inventory CASCADE;

-- Function to generate random dates between two dates
CREATE OR REPLACE FUNCTION random_date(start_date DATE, end_date DATE)
RETURNS DATE AS $$
BEGIN
    RETURN start_date + (random() * (end_date - start_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Common medicine names and their categories
WITH medicine_data AS (
  SELECT * FROM (VALUES
    ('Paracetamol', 'Analgesics', 2.50, 500),
    ('Amoxicillin', 'Antibiotics', 5.00, 250),
    ('Omeprazole', 'Antacids', 3.75, 20),
    ('Metformin', 'Antidiabetics', 4.25, 500),
    ('Amlodipine', 'Antihypertensives', 6.00, 5),
    ('Aspirin', 'Analgesics', 1.75, 325),
    ('Cetirizine', 'Antihistamines', 3.25, 10),
    ('Diclofenac', 'Anti-inflammatory', 4.50, 50),
    ('Lisinopril', 'Antihypertensives', 5.25, 10),
    ('Metoprolol', 'Beta Blockers', 4.75, 25)
  ) AS t(base_name, category, base_price, strength)
)

-- Insert 1000 medicines with variations
INSERT INTO medicines (id, name, generic_name, manufacturer, category, unit_price, dosage_form)
SELECT 
  'MED' || LPAD(ROW_NUMBER() OVER (), 4, '0') as id,
  md.base_name || ' ' || md.strength || 'mg ' || 
    CASE (ROW_NUMBER() OVER () % 3)
      WHEN 0 THEN 'Regular'
      WHEN 1 THEN 'Extended Release'
      WHEN 2 THEN 'Rapid Action'
    END as name,
  md.base_name as generic_name,
  CASE (ROW_NUMBER() OVER () % 5)
    WHEN 0 THEN 'GSK'
    WHEN 1 THEN 'Pfizer'
    WHEN 2 THEN 'Novartis'
    WHEN 3 THEN 'AstraZeneca'
    WHEN 4 THEN 'Sun Pharma'
  END as manufacturer,
  md.category,
  (md.base_price + (random() * 5))::NUMERIC(10,2) as unit_price,
  CASE (ROW_NUMBER() OVER () % 4)
    WHEN 0 THEN 'tablet'
    WHEN 1 THEN 'capsule'
    WHEN 2 THEN 'syrup'
    WHEN 3 THEN 'injection'
  END as dosage_form
FROM medicine_data md
CROSS JOIN generate_series(1, 100);

-- Insert inventory data for each medicine
INSERT INTO inventory (medicine_id, quantity, batch_number, expiry_date, unit_price)
SELECT 
  m.id,
  FLOOR(random() * 1000 + 100)::INT as quantity,
  'BAT' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || LPAD(ROW_NUMBER() OVER (), 4, '0') as batch_number,
  random_date(CURRENT_DATE + INTERVAL '6 months', CURRENT_DATE + INTERVAL '24 months')::DATE as expiry_date,
  m.unit_price
FROM medicines m;

-- Add some nearly expired items for testing
INSERT INTO inventory (medicine_id, quantity, batch_number, expiry_date, unit_price)
SELECT 
  m.id,
  FLOOR(random() * 100 + 50)::INT as quantity,
  'BAT' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || 'EXP' || LPAD(ROW_NUMBER() OVER (), 4, '0') as batch_number,
  random_date(CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days')::DATE as expiry_date,
  m.unit_price
FROM (SELECT id, unit_price FROM medicines ORDER BY random() LIMIT 50) m;

-- Create some transactions
INSERT INTO transactions (type, total_amount, status, created_at)
SELECT
  CASE (random() * 3)::INT
    WHEN 0 THEN 'purchase'
    WHEN 1 THEN 'sale'
    WHEN 2 THEN 'return'
    ELSE 'disposal'
  END as type,
  (random() * 10000)::NUMERIC(10,2) as total_amount,
  'completed' as status,
  CURRENT_TIMESTAMP - (random() * INTERVAL '30 days') as created_at
FROM generate_series(1, 200);

-- Drop the temporary function
DROP FUNCTION random_date; 