import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { addDays, subDays, format } from 'date-fns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  const { error } = await supabase.from('medicines').insert(medicines);
  if (error) console.error('Error inserting medicines:', error);
  else console.log(`Inserted ${medicines.length} medicines`);
}

async function generatePharmacies() {
  const pharmacies = [
    {
      id: uuidv4(),
      name: 'Central Pharmacy',
      license_number: 'PH001',
      address: '123 Main St',
      phone: '555-0123',
      email: 'central@example.com'
    },
    {
      id: uuidv4(),
      name: 'City Drugs',
      license_number: 'PH002',
      address: '456 Oak Ave',
      phone: '555-0124',
      email: 'city@example.com'
    },
    {
      id: uuidv4(),
      name: 'HealthMart Pharmacy',
      license_number: 'PH003',
      address: '789 Pine St',
      phone: '555-0125',
      email: 'healthmart@example.com'
    }
  ];

  const { error } = await supabase.from('pharmacies').insert(pharmacies);
  if (error) console.error('Error inserting pharmacies:', error);
  else console.log(`Inserted ${pharmacies.length} pharmacies`);
}

async function generateInventory() {
  const { data: medicines } = await supabase.from('medicines').select('id');
  const { data: pharmacies } = await supabase.from('pharmacies').select('id');

  const inventory = [];

  for (const medicine of medicines) {
    for (const pharmacy of pharmacies) {
      const batchNumber = `BAT${format(new Date(), 'yyyyMM')}${Math.floor(Math.random() * 1000)}`;
      const quantity = Math.floor(Math.random() * 1000) + 100;
      const unitPrice = (Math.random() * 50 + 10).toFixed(2);
      
      // Generate multiple batches with different expiry dates
      const batchCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < batchCount; i++) {
        inventory.push({
          id: uuidv4(),
          pharmacy_id: pharmacy.id,
          medicine_id: medicine.id,
          batch_number: `${batchNumber}-${i + 1}`,
          quantity: Math.floor(quantity / batchCount),
          unit_price: unitPrice,
          expiry_date: format(addDays(new Date(), Math.floor(Math.random() * 365) + 30), 'yyyy-MM-dd'),
          manufacturing_date: format(subDays(new Date(), Math.floor(Math.random() * 180) + 30), 'yyyy-MM-dd')
        });
      }
    }
  }

  const { error } = await supabase.from('inventory').insert(inventory);
  if (error) console.error('Error inserting inventory:', error);
  else console.log(`Inserted ${inventory.length} inventory items`);
}

async function generateTransactions() {
  const { data: pharmacies } = await supabase.from('pharmacies').select('id');
  const { data: inventory } = await supabase.from('inventory').select('*');
  
  const transactions = [];
  const transactionItems = [];

  // Generate random transactions for the past 30 days
  for (let i = 0; i < 100; i++) {
    const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
    const type = Math.random() > 0.7 ? 'purchase' : 'sale';
    const status = Math.random() > 0.2 ? 'completed' : 'pending';
    
    const transaction = {
      id: uuidv4(),
      pharmacy_id: pharmacy.id,
      type,
      reference_number: `TRX${Date.now()}${i}`,
      total_amount: 0,
      status,
      created_at: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm:ss')
    };

    // Generate 1-5 items per transaction
    const itemCount = Math.floor(Math.random() * 5) + 1;
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const inventoryItem = inventory[Math.floor(Math.random() * inventory.length)];
      const quantity = Math.floor(Math.random() * 20) + 1;
      const unitPrice = parseFloat(inventoryItem.unit_price);
      
      transactionItems.push({
        id: uuidv4(),
        transaction_id: transaction.id,
        inventory_id: inventoryItem.id,
        quantity,
        unit_price: unitPrice,
        created_at: transaction.created_at
      });

      totalAmount += quantity * unitPrice;
    }

    transaction.total_amount = totalAmount;
    transactions.push(transaction);
  }

  const { error: txError } = await supabase.from('transactions').insert(transactions);
  if (txError) console.error('Error inserting transactions:', txError);
  else console.log(`Inserted ${transactions.length} transactions`);

  const { error: itemError } = await supabase.from('transaction_items').insert(transactionItems);
  if (itemError) console.error('Error inserting transaction items:', itemError);
  else console.log(`Inserted ${transactionItems.length} transaction items`);
}

async function main() {
  console.log('Starting data generation...');
  await generateMedicines();
  await generatePharmacies();
  await generateInventory();
  await generateTransactions();
  console.log('Data generation complete!');
}

main().catch(console.error);