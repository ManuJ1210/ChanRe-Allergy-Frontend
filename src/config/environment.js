// Environment configuration for the application

// Get the current environment
export const isDevelopment = import.meta.env.DEV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

export const isProduction = !isDevelopment;

// API base URL logic - Use local API in development, production API in production
const getApiBaseUrl = () => {
  if (isDevelopment) {
    // Use local API in development
    return 'http://localhost:5000/api';
  } else {
    // Use production API in production
    return 'https://api.chanreallergyclinic.com/api';
  }
};

// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: getApiBaseUrl(),
  
  // Request timeout in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Server Configuration
export const SERVER_CONFIG = {
  // Frontend URL
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || (isDevelopment 
    ? import.meta.env.VITE_DEV_FRONTEND_URL || 'http://localhost:5173'
    : 'https://chanreallergyclinic.com'),
    
  // Backend URL  
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || (isDevelopment
    ? import.meta.env.VITE_DEV_BACKEND_URL || 'http://localhost:5000'
    : 'https://api.chanreallergyclinic.com'),
};

// Debug Configuration
export const DEBUG_CONFIG = {
  // Enable console logging in development
  ENABLE_LOGGING: isDevelopment,
  
  // Enable Redux DevTools
  ENABLE_REDUX_DEVTOOLS: isDevelopment,
  
  // Enable API request/response logging
  ENABLE_API_LOGGING: isDevelopment,
};

// Helper function to log only in development
export const debugLog = (...args) => {
  // Disabled logging for cleaner console
};

// Helper function to get the full API URL
export const getFullApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// API Health Check
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Health Check:', data);
      return { status: 'healthy', data };
    } else {
      console.error('❌ API Health Check Failed:', response.status, response.statusText);
      return { status: 'unhealthy', error: response.statusText };
    }
  } catch (error) {
    console.error('❌ API Health Check Error:', error.message);
    return { status: 'error', error: error.message };
  }
};

// Production API Status Check
export const checkProductionApiStatus = async () => {
  if (isDevelopment) {
    console.log('🔍 Checking production API status...');
    try {
      const response = await fetch('https://api.chanreallergyclinic.com/api/health');
      if (response.ok) {
        console.log('✅ Production API is accessible');
        return true;
      } else {
        console.warn('⚠️ Production API returned:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Production API check failed:', error.message);
      return false;
    }
  }
  return true;
};

export default {
  isDevelopment,
  isProduction,
  API_CONFIG,
  SERVER_CONFIG,
  DEBUG_CONFIG,
  debugLog,
  getFullApiUrl,
  checkApiHealth,
  checkProductionApiStatus,
};
