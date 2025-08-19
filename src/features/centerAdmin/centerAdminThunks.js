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
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add follow up'));
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
      const res = await API.get(`/history/${patientId}`);
      dispatch(setHistory(res.data));
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to fetch history'));
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
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add allergic rhinitis'));
      throw error;
    }
  }
);

// Fetch allergic rhinitis
export const fetchAllergicRhinitis = createAsyncThunk(
  'centerAdmin/fetchAllergicRhinitis',
  async (patientId, { dispatch }) => {
    try {
      console.log('fetchAllergicRhinitis called with patientId:', patientId);
      
      if (!patientId) {
        console.log('No patientId provided, returning empty array');
        return [];
      }
      
      console.log('Making API call to:', `/allergic-rhinitis?patientId=${patientId}`);
      const res = await API.get(`/allergic-rhinitis?patientId=${patientId}`);
      console.log('API response:', res.data);
      return res.data;
    } catch (error) {
      console.error('fetchAllergicRhinitis error:', error);
      console.error('Error response:', error.response);
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
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add allergic conjunctivitis'));
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
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add atopic dermatitis'));
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
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add allergic bronchitis'));
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
      return res.data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Failed to add GPE'));
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
      const res = await API.get(`/prescriptions/${prescriptionId}`);
      return res.data;
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

// Re-export resetCenterAdminState from slice
export { resetCenterAdminState } from './centerAdminSlice';