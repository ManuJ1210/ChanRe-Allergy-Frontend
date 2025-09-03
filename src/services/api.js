import axios from 'axios';
import { API_CONFIG } from '../config/environment';

const API = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Debug: Log the API configuration
console.log('🔧 API Configuration:', {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  isDevelopment: import.meta.env.DEV,
  hostname: window.location.hostname
});

// Test function to check API connectivity
export const testAPIConnection = async () => {
  try {
    const response = await API.get('/auth/me');
    return true;
  } catch (error) {
    return false;
  }
};

API.interceptors.request.use((config) => {
  // Debug: Log the request URL
  console.log('🔧 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullUrl: `${config.baseURL}/${config.url}`,
    baseURL: config.baseURL
  });
  
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    let token = null;
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      // Check if token is in user object
      if (user?.token) {
        token = user.token;
      }
    }
    
    // If no token in user object, check separate token storage
    if (!token && storedToken) {
      token = storedToken;
    }
    

    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error in request interceptor:', err);
  }
  
  return config;
});

// Add response interceptor to handle errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;
