import React, { useState } from 'react';
import { testAPIConnection } from '../services/api';

const ApiTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      const isConnected = await testAPIConnection();
      if (isConnected) {
        setStatus('✅ API is working! Backend is connected.');
      } else {
        setStatus('❌ API is not working. Backend might be down.');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>API Connection Test</h3>
      <p>Current API URL: <strong>https://api.chanreallergyclinic.com/api</strong></p>
      
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: 'white', 
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}>
        <strong>Status:</strong> {status}
      </div>
      
      
    </div>
  );
};

export default ApiTest;
