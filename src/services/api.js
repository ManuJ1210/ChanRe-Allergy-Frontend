import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.chanreallergyclinic.com/api',
  timeout: 10000, // 10 second timeout
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
    // Silent error handling
  }
  
  return config;
});

// Add response interceptor to handle errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases silently
    if (error.response?.status === 401) {
      // Optionally redirect to login
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Authorization error
    } else if (error.code === 'ECONNREFUSED') {
      // Connection error
    }
    
    return Promise.reject(error);
  }
);

export default API;
