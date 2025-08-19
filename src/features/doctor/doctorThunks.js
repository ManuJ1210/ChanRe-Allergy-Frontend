// src/features/doctor/doctorThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';

// ✅ Create a doctor
export const createDoctor = createAsyncThunk(
  'doctor/createDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post(
        '/doctors',
        doctorData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Doctor added successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Update Doctor
export const updateDoctor = createAsyncThunk(
  'doctor/updateDoctor',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(
        `/doctors/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Doctor updated successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Delete Doctor
export const deleteDoctor = createAsyncThunk(
  'doctor/deleteDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.delete(
        `/doctors/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Doctor deleted successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctor/fetchDoctorById',
  async (doctorId, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/doctors/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

// Fetch all doctors
export const fetchAllDoctors = createAsyncThunk(
  'doctor/fetchAllDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

// ✅ New: Fetch assigned patients for doctor
export const fetchAssignedPatients = createAsyncThunk(
  'doctor/fetchAssignedPatients',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/doctors/assigned-patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned patients');
    }
  }
);

// Fetch patient details
export const fetchPatientDetails = createAsyncThunk(
  'doctor/fetchPatientDetails',
  async (patientId, { rejectWithValue }) => {
    try {
      // Bulletproof patientId conversion - ensure it's always a string
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/doctors/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient details');
    }
  }
);

// Add test request
export const addTestRequest = createAsyncThunk(
  'doctor/addTestRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      // Bulletproof patientId conversion - ensure it's always a string
      const processedData = {
        ...requestData,
        patientId: typeof requestData.patientId === 'object' && requestData.patientId !== null
          ? requestData.patientId._id || requestData.patientId.id || String(requestData.patientId)
          : String(requestData.patientId)
      };
      
      const token = localStorage.getItem('token');
      const response = await API.post('/test-requests', processedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create test request');
    }
  }
);

// ✅ New: Fetch test requests for doctor
export const fetchTestRequests = createAsyncThunk(
  'doctor/fetchTestRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/test-requests/doctor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test requests');
    }
  }
);

// ✅ New: Create test request
export const createTestRequest = createAsyncThunk(
  'doctor/createTestRequest',
  async (testRequestData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post(
        '/test-requests',
        testRequestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create test request');
    }
  }
);

// ✅ New: Fetch test request by ID
export const fetchTestRequestById = createAsyncThunk(
  'doctor/fetchTestRequestById',
  async (testRequestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/test-requests/${testRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test request');
    }
  }
);

// ✅ New: Download test report
export const downloadTestReport = createAsyncThunk(
  'doctor/downloadTestReport',
  async (testRequestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/test-requests/${testRequestId}/download-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download report');
    }
  }
);

// Fetch patient test requests
export const fetchPatientTestRequests = createAsyncThunk(
  'doctor/fetchPatientTestRequests',
  async (patientId, { rejectWithValue }) => {
    try {
      // Bulletproof patientId conversion - ensure it's always a string
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/test-requests/patient/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient test requests');
    }
  }
);

// Notification and Feedback thunks
export const fetchDoctorNotifications = createAsyncThunk(
  'doctor/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/notifications/doctor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'doctor/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.patch(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'doctor/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.patch(
        '/notifications/mark-all-read',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const fetchTestRequestFeedback = createAsyncThunk(
  'doctor/fetchTestRequestFeedback',
  async (testRequestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/notifications/test-request/${testRequestId}/feedback`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback');
    }
  }
);

export const fetchTestRequestsWithFeedback = createAsyncThunk(
  'doctor/fetchTestRequestsWithFeedback',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        '/notifications/doctor/test-requests-with-feedback',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test requests with feedback');
    }
  }
);