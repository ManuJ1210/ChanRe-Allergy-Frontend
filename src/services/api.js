import axios from 'axios';
import { API_CONFIG } from '../config/environment';

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
    // Simplified token extraction - prioritize localStorage token
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback: check user object for token
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
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
      // Clear stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data?.message || 'Forbidden');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data?.message || 'Internal server error');
    } else if (!error.response) {
      console.error('Network error:', error.message || 'Unable to connect to server');
    }
    
    return Promise.reject(error);
  }
);

// Mark patient as viewed by doctor
export const markPatientAsViewed = async (patientId) => {
  try {
    const response = await API.put(`/patients/${patientId}/mark-viewed`);
    return response.data;
  } catch (error) {
    console.error('Error marking patient as viewed:', error);
    throw error;
  }
};

// Accountant API functions
export const getAccountantDashboard = async () => {
  try {
    const response = await API.get('/accountants/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching accountant dashboard:', error);
    throw error;
  }
};

export const getBillingData = async (params = {}) => {
  try {
    const response = await API.get('/billing/center', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching billing data:', error);
    throw error;
  }
};

export const getFinancialReports = async (params = {}) => {
  try {
    const response = await API.get('/billing/center/reports', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    throw error;
  }
};

export const generateFinancialReport = async (data) => {
  try {
    const response = await API.post('/accountants/reports/generate', data);
    return response.data;
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw error;
  }
};

// Center Admin Accountant API functions
export const getAccountantStats = async () => {
  try {
    const response = await API.get('/accountants/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching accountant stats:', error);
    throw error;
  }
};

export default API;
