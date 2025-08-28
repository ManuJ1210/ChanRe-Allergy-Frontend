// src/features/doctor/doctorThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api.js';
import { toast } from 'react-toastify';

// ✅ Create doctor (for superadmin)
export const createDoctor = createAsyncThunk(
  'doctor/createDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/doctors', doctorData, {
          headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Doctor created successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Fetch all doctors (for superadmin)
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

// ✅ Fetch doctor by ID (for superadmin)
export const fetchDoctorById = createAsyncThunk(
  'doctor/fetchDoctorById',
  async (doctorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

// ✅ Update doctor (for superadmin)
export const updateDoctor = createAsyncThunk(
  'doctor/updateDoctor',
  async ({ doctorId, doctorData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.put(`/doctors/${doctorId}`, doctorData, {
          headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Doctor updated successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Delete doctor (for superadmin)
export const deleteDoctor = createAsyncThunk(
  'doctor/deleteDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Doctor deleted successfully!');
      return doctorId;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete doctor';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Fetch assigned patients (for doctors)
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

// ✅ Fetch patient details (for doctors)
export const fetchPatientDetails = createAsyncThunk(
  'doctor/fetchPatientDetails',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      // Use doctor-specific endpoint that verifies patient assignment
      const response = await API.get(`/doctors/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient details');
    }
  }
);

// ✅ Create patient (for doctors)
export const createPatient = createAsyncThunk(
  'doctor/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get current user info to set registeredBy
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Add registeredBy field to patient data
      const patientDataWithDoctor = {
        ...patientData,
        registeredBy: user._id,
        assignedDoctor: user._id // Also assign the patient to the doctor who created them
      };
      
      const response = await API.post('/patients', patientDataWithDoctor, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Patient added successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add patient';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Update patient (for doctors)
export const updatePatient = createAsyncThunk(
  'doctor/updatePatient',
  async ({ id, patientData }, { rejectWithValue }) => {
    try {
      // Validate ID first
      if (!id || id === 'undefined' || id === undefined) {
        console.error('❌ updatePatient - Invalid patient ID:', id);
        toast.error('Invalid patient ID provided');
        return rejectWithValue('Invalid patient ID provided');
      }

      // Process the ID if it's an object
      const patientId = typeof id === 'object' && id !== null
        ? id._id || id.id || String(id)
        : String(id);

      // Additional validation for the processed ID
      if (!patientId || patientId === 'undefined' || patientId === 'null') {
        console.error('❌ updatePatient - Invalid processed ID:', patientId);
        toast.error('Invalid patient ID after processing');
        return rejectWithValue('Invalid patient ID after processing');
      }

      console.log('🔍 updatePatient - Using patient ID:', patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.put(`/patients/${patientId}`, patientData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Patient updated successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update patient';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Add patient history (for doctors)
export const addPatientHistory = createAsyncThunk(
  'doctor/addPatientHistory',
  async (historyData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      const formCopy = { ...historyData };
      const file = formCopy.reportFile;
      delete formCopy.reportFile;
      formData.append('formData', JSON.stringify(formCopy));
      if (file) formData.append('reportFile', file);
      const token = localStorage.getItem('token');
      const response = await API.post('/history/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Patient history added successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add patient history';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Add patient medication (for doctors)
export const addPatientMedication = createAsyncThunk(
  'doctor/addPatientMedication',
  async (medicationData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/medications', medicationData, {
          headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Medication added successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add medication';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Submit patient tests (for doctors)
export const submitPatientTests = createAsyncThunk(
  'doctor/submitPatientTests',
  async ({ patientId, testData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Since backend expects one test at a time, create multiple test entries
      const testResults = [];
      const currentDate = new Date().toISOString();
      
      // Convert testData object to individual test submissions
      for (const [testName, result] of Object.entries(testData)) {
        if (result && result.trim() !== '') {
          const testEntry = {
            testType: testName,
            testDate: currentDate,
            results: result,
            status: 'completed'
          };
          
          const response = await API.post(`/patients/${patientId}/tests`, testEntry, {
          headers: { Authorization: `Bearer ${token}` },
          });
          testResults.push(response.data);
        }
      }
      
      toast.success(`${testResults.length} test report(s) submitted successfully!`);
      return testResults;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit test reports';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ Fetch patient history (for doctors)
export const fetchPatientHistory = createAsyncThunk(
  'doctor/fetchPatientHistory',
  async (patientId, { rejectWithValue }) => {
    try {
      console.log('🔍 fetchPatientHistory thunk called with:', patientId);
      
      // Validate patientId first
      if (!patientId || patientId === 'undefined' || patientId === undefined) {
        console.error('❌ fetchPatientHistory - Invalid patient ID:', patientId);
        return rejectWithValue('Invalid patient ID provided');
      }
      
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      // Additional validation for the processed ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ fetchPatientHistory - Invalid processed ID:', id);
        return rejectWithValue('Invalid patient ID after processing');
      }
      
      console.log('🔍 fetchPatientHistory - processed ID:', id);
      const token = localStorage.getItem('token');
      console.log('🔍 fetchPatientHistory - token exists:', !!token);
      
      const response = await API.get(`/patients/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('✅ fetchPatientHistory - response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ fetchPatientHistory - error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient history');
    }
  }
);

// ✅ Fetch patient medications (for doctors)
export const fetchPatientMedications = createAsyncThunk(
  'doctor/fetchPatientMedications',
  async (patientId, { rejectWithValue }) => {
    try {
      console.log('🔍 fetchPatientMedications thunk called with:', patientId);
      
      // Validate patientId first
      if (!patientId || patientId === 'undefined' || patientId === undefined) {
        console.error('❌ fetchPatientMedications - Invalid patient ID:', patientId);
        return rejectWithValue('Invalid patient ID provided');
      }
      
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      // Additional validation for the processed ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ fetchPatientMedications - Invalid processed ID:', id);
        return rejectWithValue('Invalid patient ID after processing');
      }
      
      console.log('🔍 fetchPatientMedications - processed ID:', id);
      const token = localStorage.getItem('token');
      console.log('🔍 fetchPatientMedications - token exists:', !!token);
      
      const response = await API.get(`/patients/${id}/medications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('✅ fetchPatientMedications - response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ fetchPatientMedications - error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient medications');
    }
  }
);

// ✅ Fetch patient follow-ups (for doctors)
export const fetchPatientFollowUps = createAsyncThunk(
  'doctor/fetchPatientFollowUps',
  async (patientId, { rejectWithValue }) => {
    try {
      // Validate patientId first
      if (!patientId || patientId === 'undefined' || patientId === undefined) {
        console.error('❌ fetchPatientFollowUps - Invalid patient ID:', patientId);
        return rejectWithValue('Invalid patient ID provided');
      }
      
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      // Additional validation for the processed ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ fetchPatientFollowUps - Invalid processed ID:', id);
        return rejectWithValue('Invalid patient ID after processing');
      }
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/patients/${id}/follow-ups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('❌ fetchPatientFollowUps - error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient follow-ups');
    }
  }
);

// ✅ Add test request (for doctors)
export const addTestRequest = createAsyncThunk(
  'doctor/addTestRequest',
  async (testRequestData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/test-requests', testRequestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Test request added successfully!');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add test request');
    }
  }
);

// ✅ Fetch test requests (for doctors)
export const fetchTestRequests = createAsyncThunk(
  'doctor/fetchTestRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/doctors/test-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test requests');
    }
  }
);

// ✅ Fetch test requests for a specific patient (for doctors)
export const fetchPatientTestRequests = createAsyncThunk(
  'doctor/fetchPatientTestRequests',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/test-requests/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient test requests');
    }
  }
);

// ✅ Create test request (for doctors)
export const createTestRequest = createAsyncThunk(
  'doctor/createTestRequest',
  async (testRequestData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get current user info to extract doctorId
      const userDataString = localStorage.getItem('user');
      let doctorId = null;
      
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          doctorId = userData._id || userData.id;
          console.log('🔍 createTestRequest: Current user ID:', doctorId);
        } catch (parseError) {
          console.error('❌ createTestRequest: Failed to parse user data:', parseError);
        }
      }
      
      if (!doctorId) {
        console.error('❌ createTestRequest: No doctor ID found in localStorage');
        return rejectWithValue('Doctor authentication failed. Please log in again.');
      }
      
      // Add doctorId to the request data
      const requestDataWithDoctor = {
        ...testRequestData,
        doctorId: doctorId
      };
      
      console.log('📤 createTestRequest: Sending data:', requestDataWithDoctor);
      
      const response = await API.post('/test-requests', requestDataWithDoctor, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Test request created successfully!');
      return response.data;
    } catch (error) {
      console.error('❌ createTestRequest: Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create test request');
    }
  }
);

// ✅ Fetch test request by ID (for doctors)
export const fetchTestRequestById = createAsyncThunk(
  'doctor/fetchTestRequestById',
  async (testRequestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/test-requests/${testRequestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test request');
    }
  }
);

// ✅ Download test report (for doctors)
export const downloadTestReport = createAsyncThunk(
  'doctor/downloadTestReport',
  async (testRequestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/test-requests/download-report/${testRequestId}`,
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

// ✅ Fetch tests (for doctors)
export const fetchTests = createAsyncThunk(
  'doctor/fetchTests',
  async (patientId, { rejectWithValue }) => {
    try {
      // Validate patientId first
      if (!patientId || patientId === 'undefined' || patientId === undefined) {
        console.error('❌ fetchTests - Invalid patient ID:', patientId);
        return rejectWithValue('Invalid patient ID provided');
      }
      
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      // Additional validation for the processed ID
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ fetchTests - Invalid processed ID:', id);
        return rejectWithValue('Invalid patient ID after processing');
      }
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/patients/${id}/show-tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tests');
    }
  }
);

// ✅ Fetch allergic rhinitis (for doctors)
export const fetchAllergicRhinitis = createAsyncThunk(
  'doctor/fetchAllergicRhinitis',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/allergic-rhinitis?patientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch allergic rhinitis');
    }
  }
);

// ✅ Add allergic rhinitis (for doctors)
export const addAllergicRhinitis = createAsyncThunk(
  'doctor/addAllergicRhinitis',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/allergic-rhinitis', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add allergic rhinitis');
    }
  }
);

// ✅ Add allergic conjunctivitis (for doctors)
export const addAllergicConjunctivitis = createAsyncThunk(
  'doctor/addAllergicConjunctivitis',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/allergic-conjunctivitis', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add allergic conjunctivitis');
    }
  }
);

// ✅ Add atopic dermatitis (for doctors)
export const addAtopicDermatitis = createAsyncThunk(
  'doctor/addAtopicDermatitis',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/atopic-dermatitis', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add atopic dermatitis');
    }
  }
);

// ✅ Add allergic bronchitis (for doctors)
export const addAllergicBronchitis = createAsyncThunk(
  'doctor/addAllergicBronchitis',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/allergic-bronchitis', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add allergic bronchitis');
    }
  }
);

// ✅ Add GPE (for doctors)
export const addGPE = createAsyncThunk(
  'doctor/addGPE',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.post('/gpe', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add GPE');
    }
  }
);

// ✅ Fetch allergic conjunctivitis (for doctors)
export const fetchAllergicConjunctivitis = createAsyncThunk(
  'doctor/fetchAllergicConjunctivitis',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/allergic-conjunctivitis?patientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch allergic conjunctivitis');
    }
  }
);

// ✅ Fetch allergic bronchitis (for doctors)
export const fetchAllergicBronchitis = createAsyncThunk(
  'doctor/fetchAllergicBronchitis',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/allergic-bronchitis?patientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch allergic bronchitis');
    }
  }
);

// ✅ Fetch atopic dermatitis (for doctors)
export const fetchAtopicDermatitis = createAsyncThunk(
  'doctor/fetchAtopicDermatitis',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/atopic-dermatitis?patientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch atopic dermatitis');
    }
  }
);

// ✅ Fetch GPE (for doctors)
export const fetchGPE = createAsyncThunk(
  'doctor/fetchGPE',
  async (patientId, { rejectWithValue }) => {
    try {
      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      const token = localStorage.getItem('token');
      const response = await API.get(`/gpe?patientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch GPE');
    }
  }
);

// ✅ Fetch prescriptions (for doctors)
export const fetchPrescriptions = createAsyncThunk(
  'doctor/fetchPrescriptions',
  async (patientId, { rejectWithValue }) => {
    try {
      // Validate patient ID
      if (!patientId || patientId === 'undefined' || patientId === 'null') {
        console.warn('❌ fetchPrescriptions: Invalid patient ID:', patientId);
        return [];
      }

      const id = typeof patientId === 'object' && patientId !== null
        ? patientId._id || patientId.id || String(patientId)
        : String(patientId);
      
      console.log('🔍 fetchPrescriptions: Fetching prescriptions for patient ID:', id);
      
      const token = localStorage.getItem('token');
      
      // Try the new RESTful endpoint first, fallback to query parameter
      let response;
      try {
        console.log('🔍 fetchPrescriptions: Trying RESTful endpoint first');
        response = await API.get(`/prescriptions/patient/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (restError) {
        console.log('🔍 fetchPrescriptions: RESTful endpoint failed, trying query parameter');
        response = await API.get(`/prescriptions?patientId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      console.log('✅ fetchPrescriptions: Success, found', response.data?.length || 0, 'prescriptions');
      return response.data;
    } catch (error) {
      console.error('❌ fetchPrescriptions: Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

// ✅ Fetch single prescription by ID (for doctors)
export const fetchSinglePrescription = createAsyncThunk(
  'doctor/fetchSinglePrescription',
  async (prescriptionId, { rejectWithValue }) => {
    try {
      // Validate prescription ID
      if (!prescriptionId || prescriptionId === 'undefined' || prescriptionId === 'null') {
        console.warn('❌ fetchSinglePrescription: Invalid prescription ID:', prescriptionId);
        return rejectWithValue('Invalid prescription ID');
      }

      console.log('🔍 fetchSinglePrescription: Fetching prescription with ID:', prescriptionId);
      
      const token = localStorage.getItem('token');
      
      // Try the RESTful endpoint first, fallback to patient endpoint if it looks like a patient ID
      let response;
      try {
        response = await API.get(`/prescriptions/${prescriptionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (notFoundError) {
        // If we get a 404, it might be because we're getting a patient ID instead of prescription ID
        // Try to fetch prescriptions by patient ID and return the latest one
        console.log('🔍 fetchSinglePrescription: Prescription not found, trying as patient ID');
        try {
          const patientPrescriptions = await API.get(`/prescriptions/patient/${prescriptionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (patientPrescriptions.data && patientPrescriptions.data.length > 0) {
            // Return the most recent prescription
            const sortedPrescriptions = patientPrescriptions.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return sortedPrescriptions[0];
          } else {
            return rejectWithValue('No prescriptions found for this patient');
          }
        } catch (fallbackError) {
          return rejectWithValue('Prescription not found');
        }
      }
      
      console.log('✅ fetchSinglePrescription: Success');
      return response.data;
    } catch (error) {
      console.error('❌ fetchSinglePrescription: Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescription');
    }
  }
);

// ✅ Notification and Feedback thunks
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
