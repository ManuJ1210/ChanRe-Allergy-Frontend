import axios from 'axios';

// Use production API since local backend is not running
const baseURL = 'https://api.chanreallergyclinic.com/api';

const API = axios.create({
  baseURL,
  timeout: 10000, // 10 second timeout
});

// Test function to check API connectivity
export const testAPIConnection = async () => {
  try {
    const response = await API.get('/auth/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    };
  }
};

// Test backend health endpoint
export const testBackendHealth = async () => {
  try {
    const response = await axios.get('https://api.chanreallergyclinic.com/');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status 
    };
  }
};

// Test login endpoint connectivity
export const testLoginEndpoint = async () => {
  try {
    const response = await API.post('/auth/login', { 
      emailOrUsername: 'test@test.com', 
      password: 'testpassword' 
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    };
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
