import { createSlice } from '@reduxjs/toolkit';
import {
  createPatient,
  submitPatientTests,
  editPatient,
  fetchPatients,
  deletePatient,
  fetchPatientAndTests, // ✅ Combined patient + test reports
  getSinglePatient, // <-- import the thunk
  fetchPatientHistory, // <-- import the history thunk
} from './patientThunks';

const initialState = {
  loading: false,
  success: false,
  error: null,
  patients: [],

  // For submitting test reports
  testSubmitting: false,
  testSubmitSuccess: false,
  testSubmitError: null,

  // For editing patient
  editLoading: false,
  editSuccess: false,
  editError: null,

  // For deleting patient
  deleteLoading: false,
  deleteSuccess: false,
  deleteError: null,

  // ✅ For viewing patient & test data (ShowTests)
  viewLoading: false,
  viewError: null,
  selectedPatient: null,
  selectedTests: [],

  // For single patient fetch (EditPatient)
  patientLoading: false,
  patientError: null,
  singlePatient: null,

  // For patient history
  historyLoading: false,
  historyError: null,
  patientHistory: [],
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    resetPatientState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // --- CREATE PATIENT ---
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.patients.push(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // --- SUBMIT TEST REPORT ---
      .addCase(submitPatientTests.pending, (state) => {
        state.testSubmitting = true;
        state.testSubmitSuccess = false;
        state.testSubmitError = null;
      })
      .addCase(submitPatientTests.fulfilled, (state) => {
        state.testSubmitting = false;
        state.testSubmitSuccess = true;
      })
      .addCase(submitPatientTests.rejected, (state, action) => {
        state.testSubmitting = false;
        state.testSubmitSuccess = false;
        state.testSubmitError = action.payload;
      })

      // --- EDIT PATIENT ---
      .addCase(editPatient.pending, (state) => {
        state.editLoading = true;
        state.editSuccess = false;
        state.editError = null;
      })
      .addCase(editPatient.fulfilled, (state, action) => {
        state.editLoading = false;
        state.editSuccess = true;
        const updatedIndex = state.patients.findIndex((p) => p._id === action.payload._id);
        if (updatedIndex !== -1) {
          state.patients[updatedIndex] = action.payload;
        }
      })
      .addCase(editPatient.rejected, (state, action) => {
        state.editLoading = false;
        state.editSuccess = false;
        state.editError = action.payload;
      })

      // --- FETCH PATIENTS ---
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- DELETE PATIENT ---
      .addCase(deletePatient.pending, (state) => {
        state.deleteLoading = true;
        state.deleteSuccess = false;
        state.deleteError = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.patients = state.patients.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = false;
        state.deleteError = action.payload;
      })

      // --- FETCH PATIENT + TESTS (ShowTests page) ---
      .addCase(fetchPatientAndTests.pending, (state) => {
        state.viewLoading = true;
        state.viewError = null;
      })
      .addCase(fetchPatientAndTests.fulfilled, (state, action) => {
        state.viewLoading = false;
        state.selectedPatient = action.payload.patient;
        state.selectedTests = action.payload.tests;
      })
      .addCase(fetchPatientAndTests.rejected, (state, action) => {
        state.viewLoading = false;
        state.viewError = action.payload;
      })

      // --- FETCH SINGLE PATIENT (EditPatient) ---
      .addCase(getSinglePatient.pending, (state) => {
        state.patientLoading = true;
        state.patientError = null;
        state.singlePatient = null;
      })
      .addCase(getSinglePatient.fulfilled, (state, action) => {
        state.patientLoading = false;
        state.singlePatient = action.payload;
      })
      .addCase(getSinglePatient.rejected, (state, action) => {
        state.patientLoading = false;
        state.patientError = action.payload;
        state.singlePatient = null;
      })

      // --- FETCH PATIENT HISTORY ---
      .addCase(fetchPatientHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchPatientHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.patientHistory = action.payload;
      })
      .addCase(fetchPatientHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload;
      });
  },
});

export const { resetPatientState } = patientSlice.actions;
export default patientSlice.reducer;
