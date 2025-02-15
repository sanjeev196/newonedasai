import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, format } from 'date-fns';
import { supabase } from '../lib/supabase';

const MANUFACTURERS = [
  'PharmaCorp',
  'MediLife',
  'HealthCare Solutions',
  'BioPharm',
  'GlobalMed'
];

const MEDICINE_CATEGORIES = [
  'Antibiotics',
  'Analgesics',
  'Antidiabetics',
  'Antihypertensives',
  'Antihistamines'
];

const MEDICINE_NAMES = [
  ['Amoxicillin', 'Amoxicillin Trihydrate', '500mg'],
  ['Paracetamol', 'Acetaminophen', '500mg'],
  ['Metformin', 'Metformin Hydrochloride', '850mg'],
  ['Amlodipine', 'Amlodipine Besylate', '5mg'],
  ['Cetirizine', 'Cetirizine Hydrochloride', '10mg'],
  ['Omeprazole', 'Omeprazole Magnesium', '20mg'],
  ['Losartan', 'Losartan Potassium', '50mg'],
  ['Aspirin', 'Acetylsalicylic Acid', '81mg'],
  ['Metoprolol', 'Metoprolol Tartrate', '25mg'],
  ['Lisinopril', 'Lisinopril Dihydrate', '10mg']
];

async function generateMedicines() {
  const medicines = [];

  for (const [name, genericName, dosage] of MEDICINE_NAMES) {
    for (const manufacturer of MANUFACTURERS) {
      medicines.push({
        id: uuidv4(),
        name,
        generic_name: genericName,
        manufacturer,
        category: MEDICINE_CATEGORIES[Math.floor(Math.random() * MEDICINE_CATEGORIES.length)],
        dosage,
        unit: 'tablet',
        unit_price: Math.floor(Math.random() * 100) + 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  const { error } = await supabase.from('medicines').insert(medicines);
  if (error) console.error('Error inserting medicines:', error);
  else console.log(`Inserted ${medicines.length} medicines`);
}

async function generateInventory() {
  const { data: medicines } = await supabase.from('medicines').select('id');
  if (!medicines) return;

  const inventory = [];

  for (const medicine of medicines) {
    const batchNumber = `BAT${format(new Date(), 'yyyyMM')}${Math.floor(Math.random() * 1000)}`;
    const quantity = Math.floor(Math.random() * 1000) + 100;
    const unitPrice = (Math.random() * 50 + 10).toFixed(2);
    
    // Generate multiple batches with different expiry dates
    const batchCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < batchCount; i++) {
      inventory.push({
        id: uuidv4(),
        medicine_id: medicine.id,
        batch_number: `${batchNumber}-${i + 1}`,
        quantity: Math.floor(quantity / batchCount),
        unit_price: unitPrice,
        expiry_date: format(addDays(new Date(), Math.floor(Math.random() * 365) + 30), 'yyyy-MM-dd'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  const { error } = await supabase.from('inventory').insert(inventory);
  if (error) console.error('Error inserting inventory:', error);
  else console.log(`Inserted ${inventory.length} inventory items`);
}

async function generateTransactions() {
  const { data: medicines } = await supabase.from('medicines').select('id');
  if (!medicines) return;

  const transactions = [];
  
  // Generate random transactions for the past 30 days
  for (let i = 0; i < 100; i++) {
    const type = Math.random() > 0.7 ? 'purchase' : 'sale';
    const status = Math.random() > 0.2 ? 'completed' : 'pending';
    
    transactions.push({
      id: uuidv4(),
      type,
      reference_number: `TRX${Date.now()}${i}`,
      total_amount: Math.floor(Math.random() * 10000) + 100,
      status,
      created_at: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm:ss')
    });
  }

  const { error } = await supabase.from('transactions').insert(transactions);
  if (error) console.error('Error inserting transactions:', error);
  else console.log(`Inserted ${transactions.length} transactions`);
}

export async function generateData() {
  console.log('Starting data generation...');
  await generateMedicines();
  await generateInventory();
  await generateTransactions();
  console.log('Data generation complete!');
}