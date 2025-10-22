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

// Get patient appointment data
export const getPatientAppointment = async (patientId) => {
  try {
    const response = await API.get(`/patients/${patientId}/appointment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient appointment:', error);
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
    const response = await API.get('/accountants/bills-transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching billing data:', error);
    throw error;
  }
};

export const getFinancialReports = async (params = {}) => {
  try {
    const response = await API.get('/accountants/reports', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    throw error;
  }
};

export const generateFinancialReport = async (data) => {
  try {
    const response = await API.get('/accountants/reports', { params: data });
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

// Patient Appointment API functions
export const getAllCentersForBooking = async () => {
  try {
    const response = await API.get('/patient-appointments/centers');
    return response.data;
  } catch (error) {
    console.error('Error fetching centers for booking:', error);
    throw error;
  }
};

export const getNearbyCenters = async (latitude, longitude, radius = 50) => {
  try {
    const response = await API.get('/patient-appointments/centers/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby centers:', error);
    throw error;
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
    const response = await API.post('/patient-appointments/book', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const getAppointmentByCode = async (confirmationCode) => {
  try {
    const response = await API.get(`/patient-appointments/confirmation/${confirmationCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (confirmationCode, cancellationReason) => {
  try {
    const response = await API.post(`/patient-appointments/cancel/${confirmationCode}`, {
      cancellationReason
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const approveAppointment = async (confirmationCode) => {
  try {
    const response = await API.post(`/patient-appointments/approve/${confirmationCode}`);
    return response.data;
  } catch (error) {
    console.error('Error approving appointment:', error);
    throw error;
  }
};

export const getCenterAppointments = async (centerId, status, date) => {
  try {
    const params = {};
    if (status) params.status = status;
    if (date) params.date = date;
    
    const response = await API.get(`/patient-appointments/center/${centerId}`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching center appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status, notes) => {
  try {
    const response = await API.put(`/patient-appointments/${appointmentId}/status`, {
      status, notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const updateAppointmentDetails = async (appointmentId, appointmentData) => {
  try {
    const response = await API.put(`/patient-appointments/${appointmentId}/details`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating appointment details:', error);
    throw error;
  }
};

export const searchAppointmentsByPatientName = async (name, centerId) => {
  try {
    const response = await API.get('/patient-appointments/search', {
      params: { name, centerId }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw error;
  }
};

export default API;