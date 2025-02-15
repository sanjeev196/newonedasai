import { useState } from 'react';
import { testDatabaseConnection } from '../lib/supabase';

const SupabaseTest = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const runTest = async () => {
    try {
      setStatus('Testing...');
      console.log('Starting test...');
      
      const testResult = await testDatabaseConnection();
      console.log('Test completed:', testResult);
      
      if (testResult.success) {
        setStatus('Connection successful!');
        setError(null);
      } else {
        setStatus('Test failed');
        setError(testResult.error);
      }
      
      setResult(testResult);
    } catch (e) {
      console.error('Test component error:', e);
      setStatus('Test failed');
      setError(e);
      setResult(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Supabase Database Test</h2>
      
      <div className="mb-4">
        <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        <p>Key present: {import.meta.env.VITE_SUPABASE_KEY ? 'Yes' : 'No'}</p>
      </div>

      <button 
        onClick={runTest}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Database
      </button>

      <div className="mt-4">
        <p className="font-semibold">{status}</p>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 rounded">
            <p className="font-bold text-red-700">Error:</p>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
        
        {result && (
          <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default SupabaseTest; 