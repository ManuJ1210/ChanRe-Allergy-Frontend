// Environment configuration for the application

// Get the current environment
export const isDevelopment = import.meta.env.DEV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

export const isProduction = !isDevelopment;

// Force correct API base URL logic
const getApiBaseUrl = () => {
  // For development, always use localhost
  if (import.meta.env.DEV) {
    console.log('🔧 Development mode detected, using localhost API');
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  }
  
  // Check hostname for localhost
  const hostname = window.location.hostname;
  console.log('🔧 Current hostname:', hostname);
  console.log('🔧 import.meta.env.DEV:', import.meta.env.DEV);
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🔧 Localhost detected, using localhost API');
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  }
  
  // For production, use the production API URL
  if (hostname === 'chanreallergyclinic.com' || hostname === 'www.chanreallergyclinic.com') {
    console.log('🔧 Production domain detected, using production API');
    return 'https://api.chanreallergyclinic.com/api';
  }
  
  // Fallback for other domains
  console.log('🔧 Other domain detected, using relative API path');
  return '/api';
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

export default {
  isDevelopment,
  isProduction,
  API_CONFIG,
  SERVER_CONFIG,
  DEBUG_CONFIG,
  debugLog,
  getFullApiUrl,
};
