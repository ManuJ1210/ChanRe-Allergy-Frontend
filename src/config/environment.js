// Environment configuration for the application

// Get the current environment
export const isDevelopment = import.meta.env.DEV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

export const isProduction = !isDevelopment;

// Debug current environment
console.log('Environment Debug:', {
  isDevelopment,
  isProduction,
  hostname: window.location.hostname,
  origin: window.location.origin,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  DEV: import.meta.env.DEV
});

// Force correct API base URL logic
const getApiBaseUrl = () => {
  // Check hostname for development first
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  
  // For production, use the full API domain
  return 'https://api.chanreallergyclinic.com/api';
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

// Debug API configuration
console.log('API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  calculatedBaseURL: isDevelopment ? 'http://localhost:5000/api' : 'https://api.chanreallergyclinic.com/api',
  envVariable: import.meta.env.VITE_API_BASE_URL,
  isDevelopment,
  hostname: window.location.hostname
});

// Server Configuration
export const SERVER_CONFIG = {
  // Frontend URL
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || (isDevelopment 
    ? 'http://localhost:5173'
    : window.location.origin),
    
  // Backend URL  
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || (isDevelopment
    ? 'http://localhost:5000'
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
  if (DEBUG_CONFIG.ENABLE_LOGGING) {
    console.log(...args);
  }
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
