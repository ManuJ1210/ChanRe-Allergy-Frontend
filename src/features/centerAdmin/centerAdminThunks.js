import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';
import {
  setLoading,
  setError,
  setCenter,
  setCenterLoading,
  setCenterError,
  setReceptionists,
  setDoctors,
  setFollowUps,
  setPrescriptions,
  setMedications,
  setHistory,
  setTests,
  setAddSuccess,
  setAddHistorySuccess,
  setAddMedicationSuccess,
  setAddAllergicRhinitisSuccess,
  setAddAtopicDermatitisSuccess,
  setAddAllergicBronchitisSuccess,
  setAddGPESuccess,
  setAddPrescriptionSuccess,
  setUpdateSuccess,
  setDeleteSuccess,
  setMedLoading,
  setMedError,
  setHistoryLoading,
  setHistoryError,
  resetCenterAdminState,
  addReceptionist,
  updateReceptionist,
  deleteReceptionist,
  addDoctor,
  updateDoctorAction,
  deleteDoctor,
  addPrescription,
  addMedication,
  addTest,
  setAddFollowUpSuccess
} from './centerAdminSlice';

// Fetch center stats
export const fetchCenterStats = createAsyncThunk(
  'centerAdmin/fetchCenterStats',
  async (centerId, { dispatch }) => {
    try {
      dispatch(setCenterLoading(true));
      const res = await API.get(`/centers/${centerId}/stats`);
      dispatch(setCenter(res.data));
      return res.data;
    } catch (error) {
      dispatch(setCenterError(error.response?.data?.message || 'Failed to fetch center stats'));
      throw error;
    }
  }
);

// Fetch receptionists
export const fetchReceptionists = createAsyncThunk(
  'centerAdmin/fetchReceptionists',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const res = await API.get('/receptionists');
      dispatch(setReceptionists(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch receptionists'));
      throw error;
    }
  }
);

// Add receptionist
export const createReceptionist = createAsyncThunk(
  'centerAdmin/createReceptionist',
  async (receptionistData, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const res = await API.post('/receptionists', receptionistData);
      dispatch(addReceptionist(res.data));
      dispatch(setAddSuccess(true));
      toast.success('Receptionist added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add receptionist';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Update receptionist
export const updateReceptionistThunk = createAsyncThunk(
  'centerAdmin/updateReceptionist',
  async ({ id, receptionistData }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const res = await API.put(`/receptionists/${id}`, receptionistData);
      dispatch(updateReceptionist(res.data));
      dispatch(setUpdateSuccess(true));
      toast.success('Receptionist updated successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update receptionist';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Delete receptionist
export const deleteReceptionistThunk = createAsyncThunk(
  'centerAdmin/deleteReceptionist',
  async (id, { dispatch }) => {
    try {
      await API.delete(`/receptionists/${id}`);
      dispatch(deleteReceptionist(id));
      dispatch(setDeleteSuccess(true));
      toast.success('Receptionist deleted successfully!');
      return id;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete receptionist';
      toast.error(errorMsg);
      dispatch(setError(error.response?.data?.message || 'Failed to delete receptionist'));
      throw error;
    }
  }
);

// Fetch doctors
export const fetchDoctors = createAsyncThunk(
  'centerAdmin/fetchDoctors',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const res = await API.get('/doctors');
      dispatch(setDoctors(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch doctors'));
      throw error;
    }
  }
);

// Create doctor
export const createDoctor = createAsyncThunk(
  'centerAdmin/createDoctor',
  async (doctorData, { dispatch }) => {
    try {
      const res = await API.post('/doctors', doctorData);
      dispatch(addDoctor(res.data));
      dispatch(setAddSuccess(true));
      toast.success('Doctor added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create doctor';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Update doctor
export const updateDoctor = createAsyncThunk(
  'centerAdmin/updateDoctor',
  async ({ id, doctorData }, { dispatch }) => {
    try {
      const res = await API.put(`/doctors/${id}`, doctorData);
      dispatch(updateDoctorAction(res.data));
      dispatch(setUpdateSuccess(true));
      toast.success('Doctor updated successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update doctor';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Delete doctor
export const deleteDoctorThunk = createAsyncThunk(
  'centerAdmin/deleteDoctor',
  async (id, { dispatch }) => {
    try {
      await API.delete(`/doctors/${id}`);
      dispatch(deleteDoctor(id));
      dispatch(setDeleteSuccess(true));
      toast.success('Doctor deleted successfully!');
      return id;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete doctor';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Fetch follow-ups
export const fetchFollowUps = createAsyncThunk(
  'centerAdmin/fetchFollowUps',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/followups?patientId=${patientId}`);
      dispatch(setFollowUps(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch follow-ups'));
      throw error;
    }
  }
);

// Fetch all follow-ups (alias for fetchFollowUps)
export const fetchAllFollowUps = createAsyncThunk(
  'centerAdmin/fetchAllFollowUps',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/followups?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch follow-ups');
    }
  }
);

// Fetch all follow-ups for center admin's center
export const fetchCenterFollowUps = createAsyncThunk(
  'centerAdmin/fetchCenterFollowUps',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/followups/center');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center follow-ups');
    }
  }
);

// Fetch patient details
export const fetchPatientDetails = createAsyncThunk(
  'centerAdmin/fetchPatientDetails',
  async (patientId, { rejectWithValue }) => {
    try {
      if (!patientId) {
        return rejectWithValue('Patient ID is required');
      }
      
      const res = await API.get(`/patients/${patientId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient details');
    }
  }
);

// Add follow-up
export const createFollowUp = createAsyncThunk(
  'centerAdmin/createFollowUp',
  async (followUpData, { dispatch }) => {
    try {
      const res = await API.post('/followups', followUpData);
      dispatch(setAddFollowUpSuccess(true));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add follow-up'));
      throw error;
    }
  }
);

// Add follow up (alias for createFollowUp)
export const addFollowUp = createAsyncThunk(
  'centerAdmin/addFollowUp',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/followups', data);
      dispatch(setAddFollowUpSuccess(true));
      toast.success('Follow-up scheduled successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add follow up';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Fetch prescriptions
export const fetchPrescriptions = createAsyncThunk(
  'centerAdmin/fetchPrescriptions',
  async (patientId, { dispatch }) => {
    try {
      const res = await API.get(`/prescriptions?patientId=${patientId}`);
      dispatch(setPrescriptions(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch prescriptions'));
      throw error;
    }
  }
);

// Fetch patient prescriptions (alias for fetchPrescriptions)
export const fetchPatientPrescriptions = createAsyncThunk(
  'centerAdmin/fetchPatientPrescriptions',
  async (patientId, { dispatch }) => {
    try {
      const res = await API.get(`/prescriptions?patientId=${patientId}`);
      dispatch(setPrescriptions(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch patient prescriptions'));
      throw error;
    }
  }
);

// Add prescription
export const createPrescription = createAsyncThunk(
  'centerAdmin/createPrescription',
  async (prescriptionData, { dispatch }) => {
    try {
      const res = await API.post('/prescriptions', prescriptionData);
      dispatch(addPrescription(res.data));
      toast.success('Prescription added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add prescription';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Fetch medications
export const fetchMedications = createAsyncThunk(
  'centerAdmin/fetchMedications',
  async (patientId, { dispatch }) => {
    try {
      const res = await API.get(`/medications?patientId=${patientId}`);
      dispatch(setMedications(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch medications'));
      throw error;
    }
  }
);

// Add medication
export const createMedication = createAsyncThunk(
  'centerAdmin/createMedication',
  async (medicationData, { dispatch }) => {
    try {
      const res = await API.post('/medications', medicationData);
      dispatch(addMedication(res.data));
      toast.success('Medication added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add medication';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Add patient medication (alias for createMedication)
export const addPatientMedication = createAsyncThunk(
  'centerAdmin/addPatientMedication',
  async (medicationData, { dispatch }) => {
    try {
      const res = await API.post('/medications', medicationData);
      dispatch(addMedication(res.data));
      dispatch(setAddMedicationSuccess(true));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add patient medication'));
      throw error;
    }
  }
);

// Fetch history
export const fetchHistory = createAsyncThunk(
  'centerAdmin/fetchHistory',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        dispatch(setHistory([]));
        return [];
      }
      dispatch(setHistoryLoading(true));
      const res = await API.get(`/history/${patientId}`);
      dispatch(setHistory(res.data));
      dispatch(setHistoryLoading(false));
      return res.data;
    } catch (error) {
      dispatch(setHistoryError(error.response?.data?.message || 'Failed to fetch history'));
      dispatch(setHistoryLoading(false));
      throw error;
    }
  }
);

// Fetch patient history (alias for fetchHistory)
export const fetchPatientHistory = createAsyncThunk(
  'centerAdmin/fetchPatientHistory',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      dispatch(setHistoryLoading(true));
      const res = await API.get(`/history/${patientId}`);
      dispatch(setHistory(res.data));
      dispatch(setHistoryLoading(false));
      return res.data;
    } catch (error) {
      dispatch(setHistoryError(error.response?.data?.message || 'Failed to fetch patient history'));
      dispatch(setHistoryLoading(false));
      throw error;
    }
  }
);

// Fetch patient medications
export const fetchPatientMedications = createAsyncThunk(
  'centerAdmin/fetchPatientMedications',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      dispatch(setMedLoading(true));
      const res = await API.get(`/medications?patientId=${patientId}`);
      dispatch(setMedications(res.data));
      dispatch(setMedLoading(false));
      return res.data;
    } catch (error) {
      dispatch(setMedError(error.response?.data?.message || 'Failed to fetch patient medications'));
      dispatch(setMedLoading(false));
      throw error;
    }
  }
);

// Add history
export const createHistory = createAsyncThunk(
  'centerAdmin/createHistory',
  async (historyData, { dispatch }) => {
    try {
      const formData = new FormData();
      const formCopy = { ...historyData };
      const file = formCopy.reportFile;
      delete formCopy.reportFile;

      formData.append('formData', JSON.stringify(formCopy));
      if (file) formData.append('reportFile', file);

      const res = await API.post('/history/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Medical history added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add history';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Add patient history (alias for createHistory)
export const addPatientHistory = createAsyncThunk(
  'centerAdmin/addPatientHistory',
  async (historyData, { dispatch }) => {
    try {
      const formData = new FormData();
      const formCopy = { ...historyData };
      const file = formCopy.reportFile;
      delete formCopy.reportFile;

      formData.append('formData', JSON.stringify(formCopy));
      if (file) formData.append('reportFile', file);

      const res = await API.post('/history/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(setAddHistorySuccess(true));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add patient history'));
      throw error;
    }
  }
);

// Update patient history (for center admin)
export const updatePatientHistory = createAsyncThunk(
  'centerAdmin/updatePatientHistory',
  async ({ historyId, historyData }, { dispatch }) => {
    try {
      const formData = new FormData();
      const formCopy = { ...historyData };
      const file = formCopy.reportFile;
      delete formCopy.reportFile;

      formData.append('formData', JSON.stringify(formCopy));
      if (file) formData.append('reportFile', file);

      const res = await API.put(`/history/${historyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(setAddHistorySuccess(true));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to update patient history'));
      throw error;
    }
  }
);

// Fetch tests
export const fetchTests = createAsyncThunk(
  'centerAdmin/fetchTests',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/patients/${patientId}/show-tests`);
      dispatch(setTests(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch tests'));
      throw error;
    }
  }
);

// ✅ Submit patient tests (for center admin)
export const submitPatientTests = createAsyncThunk(
  'centerAdmin/submitPatientTests',
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

// Add tests
export const createTests = createAsyncThunk(
  'centerAdmin/createTests',
  async ({ patientId, testData }, { dispatch }) => {
    try {
      const res = await API.post(`/patients/${patientId}/tests`, testData);
      dispatch(addTest(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add tests'));
      throw error;
    }
  }
);

// Specific follow-up type thunks
export const createAllergicRhinitis = createAsyncThunk(
  'centerAdmin/createAllergicRhinitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/allergic-rhinitis', data);
      dispatch(setAddAllergicRhinitisSuccess(true));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add allergic rhinitis'));
      throw error;
    }
  }
);

// Add allergic rhinitis (alias for createAllergicRhinitis)
export const addAllergicRhinitis = createAsyncThunk(
  'centerAdmin/addAllergicRhinitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/allergic-rhinitis', data);
      dispatch(setAddAllergicRhinitisSuccess(true));
      toast.success('Allergic Rhinitis record added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add allergic rhinitis';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Fetch allergic rhinitis
export const fetchAllergicRhinitis = createAsyncThunk(
  'centerAdmin/fetchAllergicRhinitis',
  async (patientId, { dispatch }) => {
    try {
      
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/allergic-rhinitis?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch allergic rhinitis'));
      throw error;
    }
  }
);

// Fetch single allergic rhinitis by ID
export const fetchSingleAllergicRhinitis = createAsyncThunk(
  'centerAdmin/fetchSingleAllergicRhinitis',
  async (id, { dispatch }) => {
    try {
      if (!id) {
        return null;
      }
      
      const res = await API.get(`/allergic-rhinitis/${id}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch allergic rhinitis record'));
      throw error;
    }
  }
);

// Fetch allergic conjunctivitis
export const fetchAllergicConjunctivitis = createAsyncThunk(
  'centerAdmin/fetchAllergicConjunctivitis',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/allergic-conjunctivitis?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch allergic conjunctivitis'));
      throw error;
    }
  }
);

export const createAllergicConjunctivitis = createAsyncThunk(
  'centerAdmin/createAllergicConjunctivitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/allergic-conjunctivitis', data);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add allergic conjunctivitis'));
      throw error;
    }
  }
);

// Add allergic conjunctivitis (alias for createAllergicConjunctivitis)
export const addAllergicConjunctivitis = createAsyncThunk(
  'centerAdmin/addAllergicConjunctivitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/allergic-conjunctivitis', data);
      dispatch(setAddAllergicConjunctivitisSuccess(true));
      toast.success('Allergic Conjunctivitis record added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add allergic conjunctivitis';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Add atopic dermatitis
export const addAtopicDermatitis = createAsyncThunk(
  'centerAdmin/addAtopicDermatitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/atopic-dermatitis', data);
      dispatch(setAddAtopicDermatitisSuccess(true));
      toast.success('Atopic Dermatitis record added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add atopic dermatitis';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Add allergic bronchitis
export const addAllergicBronchitis = createAsyncThunk(
  'centerAdmin/addAllergicBronchitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/allergic-bronchitis', data);
      dispatch(setAddAllergicBronchitisSuccess(true));
      toast.success('Allergic Bronchitis record added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add allergic bronchitis';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Fetch allergic bronchitis
export const fetchAllergicBronchitis = createAsyncThunk(
  'centerAdmin/fetchAllergicBronchitis',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/allergic-bronchitis?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch allergic bronchitis'));
      throw error;
    }
  }
);

export const createAllergicBronchitis = createAsyncThunk(
  'centerAdmin/createAllergicBronchitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/allergic-bronchitis', data);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add allergic bronchitis'));
      throw error;
    }
  }
);

// Add GPE
export const addGPE = createAsyncThunk(
  'centerAdmin/addGPE',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/gpe', data);
      dispatch(setAddGPESuccess(true));
      toast.success('GPE record added successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add GPE';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      throw error;
    }
  }
);

// Fetch GPE
export const fetchGPE = createAsyncThunk(
  'centerAdmin/fetchGPE',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/gpe?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch GPE'));
      throw error;
    }
  }
);

// Add patient prescription
export const addPatientPrescription = createAsyncThunk(
  'centerAdmin/addPatientPrescription',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/prescriptions', data);
      dispatch(setAddPrescriptionSuccess(true));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add prescription'));
      throw error;
    }
  }
);

// Fetch prescription
export const fetchPrescription = createAsyncThunk(
  'centerAdmin/fetchPrescription',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/prescriptions?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch prescription'));
      throw error;
    }
  }
);

// Fetch single prescription by ID
export const fetchSinglePrescription = createAsyncThunk(
  'centerAdmin/fetchSinglePrescription',
  async (prescriptionId, { rejectWithValue }) => {
    try {
      // Validate prescription ID
      if (!prescriptionId || prescriptionId === 'undefined' || prescriptionId === 'null') {
        return rejectWithValue('Invalid prescription ID');
      }

      // Try the RESTful endpoint first, fallback to patient endpoint if it looks like a patient ID
      let response;
      try {
        response = await API.get(`/prescriptions/${prescriptionId}`);
      } catch (notFoundError) {
        // If we get a 404, it might be because we're getting a patient ID instead of prescription ID
        // Try to fetch prescriptions by patient ID and return the latest one
        try {
          const patientPrescriptions = await API.get(`/prescriptions/patient/${prescriptionId}`);
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescription');
    }
  }
);

// Delete prescription
export const deletePrescription = createAsyncThunk(
  'centerAdmin/deletePrescription',
  async (prescriptionId, { rejectWithValue }) => {
    try {
      const res = await API.delete(`/prescriptions/${prescriptionId}`);
      return prescriptionId; // Return the ID so we can remove it from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete prescription');
    }
  }
);

// Fetch atopic dermatitis
export const fetchAtopicDermatitis = createAsyncThunk(
  'centerAdmin/fetchAtopicDermatitis',
  async (patientId, { dispatch }) => {
    try {
      if (!patientId) {
        return [];
      }
      
      const res = await API.get(`/atopic-dermatitis?patientId=${patientId}`);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch atopic dermatitis'));
      throw error;
    }
  }
);

export const createAtopicDermatitis = createAsyncThunk(
  'centerAdmin/createAtopicDermatitis',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/atopic-dermatitis', data);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add atopic dermatitis'));
      throw error;
    }
  }
);

export const createGPE = createAsyncThunk(
  'centerAdmin/createGPE',
  async (data, { dispatch }) => {
    try {
      const res = await API.post('/gpe', data);
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add GPE'));
      throw error;
    }
  }
);

// Update patient
export const updatePatient = createAsyncThunk(
  'centerAdmin/updatePatient',
  async ({ patientId, patientData }, { rejectWithValue }) => {
    try {
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

// Delete patient
export const deletePatient = createAsyncThunk(
  'centerAdmin/deletePatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.delete(`/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Patient deleted successfully!');
      return patientId; // Return the ID so we can remove it from state
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete patient';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ===============================
// BILLING VERIFICATION APIS (Center Admin)
// ===============================

// Fetch billing requests that need verification (Center Admin receives them from Receptionist)
export const fetchCenterAdminBillingRequests = createAsyncThunk(
  'centerAdmin/fetchBillingRequests',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch test requests with billing that need center admin verification
      const res = await API.get('/test-requests/billing/pending-verification');
      return res.data;
    } catch (error) {
      console.error('Center admin billing requests fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing requests for verification');
    }
  }
);

// Fetch all billing data for center
export const fetchCenterBillingData = createAsyncThunk(
  'centerAdmin/fetchCenterBillingData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/billing/center');
      return res.data;
    } catch (error) {
      console.error('Center billing data fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing data');
    }
  }
);

// Fetch billing data by status
export const fetchCenterBillingDataByStatus = createAsyncThunk(
  'centerAdmin/fetchCenterBillingDataByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/center/status/${status}`);
      return res.data;
    } catch (error) {
      console.error('Center billing data by status fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing data by status');
    }
  }
);

// Fetch billing data by date range
export const fetchCenterBillingDataByDateRange = createAsyncThunk(
  'centerAdmin/fetchCenterBillingDataByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/center/date-range?startDate=${startDate}&endDate=${endDate}`);
      return res.data;
    } catch (error) {
      console.error('Center billing data by date range fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing data by date range');
    }
  }
);

// Fetch billing statistics for center
export const fetchCenterBillingStats = createAsyncThunk(
  'centerAdmin/fetchCenterBillingStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/billing/center/stats');
      return res.data;
    } catch (error) {
      console.error('Center billing stats fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing statistics');
    }
  }
);

// Update billing status
export const updateCenterBillingStatus = createAsyncThunk(
  'centerAdmin/updateCenterBillingStatus',
  async ({ billingId, status, notes }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/billing/${billingId}/status`, { status, notes });
      return res.data;
    } catch (error) {
      console.error('Center billing status update error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update billing status');
    }
  }
);

// Generate invoice
export const generateCenterInvoice = createAsyncThunk(
  'centerAdmin/generateCenterInvoice',
  async (billingId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/billing/${billingId}/generate-invoice`);
      return res.data;
    } catch (error) {
      console.error('Center invoice generation error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice');
    }
  }
);

// Download invoice
export const downloadCenterInvoice = createAsyncThunk(
  'centerAdmin/downloadCenterInvoice',
  async (billingId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/${billingId}/download-invoice`, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error('Center invoice download error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice');
    }
  }
);

// Export center billing data
export const exportCenterBillingData = createAsyncThunk(
  'centerAdmin/exportCenterBillingData',
  async ({ format, filters }, { rejectWithValue }) => {
    try {
      const res = await API.post('/billing/center/export', { format, filters }, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error('Center billing export error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to export center billing data');
    }
  }
);

// Verify and approve payment (Center Admin verifies what Receptionist marked as paid)
export const verifyCenterAdminPayment = createAsyncThunk(
  'centerAdmin/verifyPayment',
  async ({ requestId, verificationData }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/billing/test-requests/${requestId}/mark-paid`, {
        paymentMethod: verificationData.paymentMethod || 'cash',
        transactionId: verificationData.transactionId || 'verified_by_admin',
        receiptUpload: verificationData.receiptUpload,
        verificationNotes: verificationData.verificationNotes
      });
      
      toast.success('Payment verified successfully!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to verify payment';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Reject payment verification (if Center Admin finds issues)
export const rejectCenterAdminPayment = createAsyncThunk(
  'centerAdmin/rejectPayment', 
  async ({ requestId, rejectionReason }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/test-requests/${requestId}/billing/reject`, {
        rejectionReason,
        rejectedBy: 'center_admin',
        rejectionDate: new Date().toISOString()
      });
      toast.success('Payment verification rejected!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reject payment';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Fetch billing summary/stats for center admin dashboard
export const fetchCenterAdminBillingSummary = createAsyncThunk(
  'centerAdmin/fetchBillingSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/test-requests/billing/center-admin-summary');
      return res.data;
    } catch (error) {
      console.error('Center admin billing summary fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing summary');
    }
  }
);

// Re-export resetCenterAdminState from slice
export { resetCenterAdminState } from './centerAdminSlice';