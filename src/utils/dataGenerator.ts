import { supabase } from '../lib/supabase';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  category: string;
  unit_price: number;
  dosage_form: string;
}

interface InventoryItem {
  medicine_id: string;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  unit_price: number;
}

const MANUFACTURERS = ['GSK', 'Pfizer', 'Novartis', 'AstraZeneca', 'Sun Pharma'];
const CATEGORIES = ['Analgesics', 'Antibiotics', 'Antacids', 'Antidiabetics', 'Antihypertensives', 'Antihistamines', 'Anti-inflammatory', 'Beta Blockers'];
const DOSAGE_FORMS = ['tablet', 'capsule', 'syrup', 'injection'];
const BASE_MEDICINES = [
  { name: 'Paracetamol', category: 'Analgesics', basePrice: 2.50, strength: 500 },
  { name: 'Amoxicillin', category: 'Antibiotics', basePrice: 5.00, strength: 250 },
  { name: 'Omeprazole', category: 'Antacids', basePrice: 3.75, strength: 20 },
  { name: 'Metformin', category: 'Antidiabetics', basePrice: 4.25, strength: 500 },
  { name: 'Amlodipine', category: 'Antihypertensives', basePrice: 6.00, strength: 5 },
  // Add more base medicines as needed
];

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateMedicines = (count: number): Medicine[] => {
  return Array.from({ length: count }, (_, index) => {
    const baseMedicine = BASE_MEDICINES[index % BASE_MEDICINES.length];
    const variants = ['Regular', 'Extended Release', 'Rapid Action'];
    const variant = variants[index % 3];
    
    return {
      id: `MED${String(index + 1).padStart(4, '0')}`,
      name: `${baseMedicine.name} ${baseMedicine.strength}mg ${variant}`,
      generic_name: baseMedicine.name,
      manufacturer: MANUFACTURERS[index % MANUFACTURERS.length],
      category: baseMedicine.category,
      unit_price: Number((baseMedicine.basePrice + Math.random() * 5).toFixed(2)),
      dosage_form: DOSAGE_FORMS[index % DOSAGE_FORMS.length]
    };
  });
};

const generateInventory = (medicines: Medicine[]): InventoryItem[] => {
  const inventory: InventoryItem[] = [];
  const now = new Date();
  
  medicines.forEach(medicine => {
    // Regular inventory
    inventory.push({
      medicine_id: medicine.id,
      quantity: Math.floor(Math.random() * 1000 + 100),
      batch_number: `BAT${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(inventory.length + 1).padStart(4, '0')}`,
      expiry_date: generateRandomDate(
        new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000)  // 2 years from now
      ).toISOString().split('T')[0],
      unit_price: medicine.unit_price
    });

    // Add some nearly expired inventory for some medicines
    if (Math.random() < 0.2) { // 20% chance
      inventory.push({
        medicine_id: medicine.id,
        quantity: Math.floor(Math.random() * 100 + 50),
        batch_number: `BAT${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}EXP${String(inventory.length + 1).padStart(4, '0')}`,
        expiry_date: generateRandomDate(
          now,
          new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)  // 90 days from now
        ).toISOString().split('T')[0],
        unit_price: medicine.unit_price
      });
    }
  });

  return inventory;
};

export const generateMedicineDataset = () => {
  const medicines = generateMedicines(1000);
  const inventory = generateInventory(medicines);
  return { medicines, inventory };
};

export const uploadToSupabase = async (data: { medicines: Medicine[], inventory: InventoryItem[] }) => {
  try {
    console.log('Starting data upload...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    const { error: clearInventoryError } = await supabase
      .from('inventory')
      .delete()
      .neq('id', 0);
    
    if (clearInventoryError) throw clearInventoryError;
    
    const { error: clearMedicinesError } = await supabase
      .from('medicines')
      .delete()
      .neq('id', 0);
    
    if (clearMedicinesError) throw clearMedicinesError;

    // Upload medicines
    console.log('Uploading medicines...');
    const { error: medicinesError } = await supabase
      .from('medicines')
      .insert(data.medicines);

    if (medicinesError) throw medicinesError;

    // Upload inventory
    console.log('Uploading inventory...');
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert(data.inventory);

    if (inventoryError) throw inventoryError;

    console.log('Data upload completed successfully');
    return { success: true, message: 'Data uploaded successfully' };
  } catch (error) {
    console.error('Error uploading data:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error 
    };
  }
};

export const verifyDataExists = async () => {
  const { data: medicineCount, error: medicineError } = await supabase
    .from('medicines')
    .select('count(*)', { count: 'exact', head: true });

  if (medicineError) {
    console.error('Error checking medicines:', medicineError);
    return false;
  }

  return (medicineCount as any).count > 0;
}; 