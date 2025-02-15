import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestConnection = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Test the connection by making a simple query
        const { data, error } = await supabase
          .from('medicines')
          .select('name')
          .limit(1);

        if (error) {
          throw error;
        }

        console.log('Test Data:', data); // This will help us see the response in console
        setStatus('success');
        setMessage(`Connection successful! Found ${data.length} medicines.`);

      } catch (err) {
        console.error('Connection Error:', err); // This will show the detailed error
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <div className={`p-4 rounded-lg ${
        status === 'loading' ? 'bg-gray-100' :
        status === 'success' ? 'bg-green-100' :
        'bg-red-100'
      }`}>
        <h2 className="text-xl font-bold mb-2">Supabase Connection Test</h2>
        <p className={`${
          status === 'loading' ? 'text-gray-600' :
          status === 'success' ? 'text-green-600' :
          'text-red-600'
        }`}>
          Status: {status.toUpperCase()}
        </p>
        <p className="mt-2">{message}</p>
      </div>

      {status === 'error' && (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <h3 className="font-bold text-yellow-800">Troubleshooting Tips:</h3>
          <ul className="list-disc ml-5 mt-2 text-yellow-700">
            <li>Check if your .env file exists in the project root</li>
            <li>Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct</li>
            <li>Make sure your Supabase project is active</li>
            <li>Check if the 'medicines' table exists in your database</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestConnection; 