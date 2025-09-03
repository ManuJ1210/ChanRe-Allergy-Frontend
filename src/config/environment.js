// Environment configuration for the application

// Get the current environment
export const isDevelopment = import.meta.env.DEV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

export const isProduction = !isDevelopment;

// Force correct API base URL logic - Always use production API
const getApiBaseUrl = () => {
  // Always use production API URL
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
