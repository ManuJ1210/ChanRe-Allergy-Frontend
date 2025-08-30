import axios from 'axios';
import { API_CONFIG } from '../config/environment.js';

const API = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
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
    // Check if response data is HTML when JSON was expected (but not for blob responses)
    if (typeof response.data === 'string' && 
        response.data.trim().toLowerCase().startsWith('<!doctype') &&
        response.config?.responseType !== 'blob') {
      const error = new Error('API endpoint returned HTML page instead of JSON data. The endpoint may not exist on the server.');
      error.response = response;
      error.isHTMLResponse = true;
      throw error;
    }
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    // Check if error response contains HTML (but not for blob responses)
    if (error.response?.data && typeof error.response.data === 'string' && 
        error.response.data.trim().toLowerCase().startsWith('<!doctype') &&
        error.config?.responseType !== 'blob') {
      error.isHTMLResponse = true;
      error.message = 'API endpoint returned HTML page instead of JSON data. The endpoint may not exist on the server.';
    }
    
    return Promise.reject(error);
  }
);

export default API;
