import React, { useState } from 'react';
import { testAPIConnection, testBackendHealth, testLoginEndpoint } from '../services/api';

const BackendTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [portScanResults, setPortScanResults] = useState({});

  const testPort = async (port) => {
    try {
      const response = await fetch(`http://localhost:${port}`);
      return { success: true, port, status: response.status };
    } catch (error) {
      return { success: false, port, error: error.message };
    }
  };

  const scanPorts = async () => {
    const ports = [3000, 5000, 5014, 8000, 8080, 4000, 6000];
    const results = {};
    
    for (const port of ports) {
      results[port] = await testPort(port);
    }
    
    setPortScanResults(results);
  };

  const runTest = async (testName, testFunction) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error.message 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Backend Connection Tests
      </h2>
      
      <div className="space-y-6">
        {/* Port Scanner */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🔍 Port Scanner</h3>
          <p className="text-gray-600 mb-3">
            Find which port your backend is running on
          </p>
          <button
            onClick={scanPorts}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Scan Common Ports
          </button>
          {Object.keys(portScanResults).length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium mb-2">Port Scan Results:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(portScanResults).map(([port, result]) => (
                  <div key={port} className={`p-2 rounded ${getStatusColor(result.success)}`}>
                    <span className="font-medium">Port {port}:</span> {result.success ? '✅ Active' : '❌ Closed'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Backend Health Test */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">1. Backend Health Check</h3>
          <p className="text-gray-600 mb-3">
            Tests if the main backend URL is accessible
          </p>
          <button
            onClick={() => runTest('health', testBackendHealth)}
            disabled={loading.health}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading.health ? 'Testing...' : 'Test Backend Health'}
          </button>
          {results.health && (
            <div className={`mt-3 p-3 rounded ${getStatusColor(results.health.success)}`}>
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(results.health.success)}</span>
                <span className="font-medium">
                  {results.health.success ? 'Success' : 'Failed'}
                </span>
              </div>
              {results.health.success ? (
                <p className="mt-2 text-sm">Response: {JSON.stringify(results.health.data)}</p>
              ) : (
                <div className="mt-2 text-sm">
                  <p>Error: {results.health.error}</p>
                  {results.health.status && <p>Status: {results.health.status}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Connection Test */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">2. API Authentication Test</h3>
          <p className="text-gray-600 mb-3">
            Tests if the API endpoint is accessible (requires authentication)
          </p>
          <button
            onClick={() => runTest('api', testAPIConnection)}
            disabled={loading.api}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading.api ? 'Testing...' : 'Test API Connection'}
          </button>
          {results.api && (
            <div className={`mt-3 p-3 rounded ${getStatusColor(results.api.success)}`}>
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(results.api.success)}</span>
                <span className="font-medium">
                  {results.api.success ? 'Success' : 'Failed'}
                </span>
              </div>
              {results.api.success ? (
                <p className="mt-2 text-sm">Response: {JSON.stringify(results.api.data)}</p>
              ) : (
                <div className="mt-2 text-sm">
                  <p>Error: {results.api.error}</p>
                  {results.api.status && <p>Status: {results.api.status}</p>}
                  {results.api.data && <p>Response: {JSON.stringify(results.api.data)}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Login Endpoint Test */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">3. Login Endpoint Test</h3>
          <p className="text-gray-600 mb-3">
            Tests if the login endpoint is accessible (will fail with invalid credentials)
          </p>
          <button
            onClick={() => runTest('login', testLoginEndpoint)}
            disabled={loading.login}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading.login ? 'Testing...' : 'Test Login Endpoint'}
          </button>
          {results.login && (
            <div className={`mt-3 p-3 rounded ${getStatusColor(results.login.success)}`}>
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(results.login.success)}</span>
                <span className="font-medium">
                  {results.login.success ? 'Success' : 'Failed (Expected)'}
                </span>
              </div>
              {results.login.success ? (
                <p className="mt-2 text-sm">Response: {JSON.stringify(results.login.data)}</p>
              ) : (
                <div className="mt-2 text-sm">
                  <p>Error: {results.login.error}</p>
                  {results.login.status && <p>Status: {results.login.status}</p>}
                  {results.login.data && <p>Response: {JSON.stringify(results.login.data)}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Test Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Backend Health</div>
              <div className={getStatusColor(results.health?.success)}>
                {results.health ? getStatusIcon(results.health.success) : '⏳'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">API Connection</div>
              <div className={getStatusColor(results.api?.success)}>
                {results.api ? getStatusIcon(results.api.success) : '⏳'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Login Endpoint</div>
              <div className={getStatusColor(results.login?.success)}>
                {results.login ? getStatusIcon(results.login.success) : '⏳'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendTest;
