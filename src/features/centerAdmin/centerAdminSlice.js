import { createSlice } from '@reduxjs/toolkit';
import { fetchAtopicDermatitis, fetchAllFollowUps, fetchCenterFollowUps, fetchPatientDetails, fetchPatientPrescriptions, fetchPatientHistory, fetchPatientMedications, addPatientHistory, addPatientMedication, createDoctor, updateDoctor, fetchAllergicRhinitis, fetchSingleAllergicRhinitis, fetchAllergicConjunctivitis, addAtopicDermatitis, addAllergicBronchitis, fetchAllergicBronchitis, addGPE, fetchGPE, addPatientPrescription, fetchPrescription, fetchSinglePrescription, deletePrescription, addFollowUp, updatePatient, deletePatient, submitPatientTests, fetchTests, fetchCenterAdminBillingRequests, verifyCenterAdminPayment, rejectCenterAdminPayment, fetchCenterAdminBillingSummary } from './centerAdminThunks';

const initialState = {
  center: null,
  centerLoading: false,
  centerError: null,
  receptionists: [],
  doctors: [],
  followUps: [],
  prescriptions: [],
  medications: [],
  history: null,
  tests: [],
  atopicDermatitis: null,
  allergicRhinitis: null,
  allergicConjunctivitis: null,
  allergicBronchitis: null,
  gpe: null,
  prescription: null,
  patientDetails: null,
  patientMedications: [],
  patientHistory: null,
  loading: false,
  error: null,
  medLoading: false,
  medError: null,
  historyLoading: false,
  historyError: null,
  addSuccess: false,
  addHistorySuccess: false,
  addMedicationSuccess: false,
  testSubmitting: false,
  testSubmitSuccess: false,
  testSubmitError: null,
  addAtopicDermatitisSuccess: false,
  addAllergicRhinitisSuccess: false,
  addAllergicBronchitisSuccess: false,
  addGPESuccess: false,
  addPrescriptionSuccess: false,
  addFollowUpSuccess: false,
  // Billing verification state
  billingRequests: [],
  billingRequestsLoading: false,
  billingRequestsError: null,
  billingSummary: null,
  billingVerificationLoading: false,
  billingVerificationError: null,
  updateSuccess: false,
  deleteSuccess: false
};

const centerAdminSlice = createSlice({
  name: 'centerAdmin',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCenter: (state, action) => {
      state.center = action.payload;
      state.centerLoading = false;
      state.centerError = null;
    },
    setCenterLoading: (state, action) => {
      state.centerLoading = action.payload;
    },
    setCenterError: (state, action) => {
      state.centerError = action.payload;
      state.centerLoading = false;
    },
    setReceptionists: (state, action) => {
      state.receptionists = action.payload;
      state.loading = false;
      state.error = null;
    },
    setDoctors: (state, action) => {
      state.doctors = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFollowUps: (state, action) => {
      state.followUps = action.payload;
    },
    setPrescriptions: (state, action) => {
      state.prescriptions = action.payload;
    },
    setMedications: (state, action) => {
      state.medications = action.payload;
    },
    setHistory: (state, action) => {
      const payload = action.payload;
      // Do not overwrite existing non-empty history with an empty payload
      if (payload == null) {
        return;
      }
      if (Array.isArray(payload)) {
        if (payload.length === 0 && Array.isArray(state.history) && state.history.length > 0) {
          return;
        }
        state.history = payload;
      } else {
        state.history = [payload];
      }
    },
    setTests: (state, action) => {
      state.tests = action.payload;
    },
    setAddSuccess: (state, action) => {
      state.addSuccess = action.payload;
    },
    setAddHistorySuccess: (state, action) => {
      state.addHistorySuccess = action.payload;
    },
    setAddMedicationSuccess: (state, action) => {
      state.addMedicationSuccess = action.payload;
    },
    setAddAllergicRhinitisSuccess: (state, action) => {
      state.addAllergicRhinitisSuccess = action.payload;
    },
    setAddAtopicDermatitisSuccess: (state, action) => {
      state.addAtopicDermatitisSuccess = action.payload;
    },
    setAddAllergicBronchitisSuccess: (state, action) => {
      state.addAllergicBronchitisSuccess = action.payload;
    },
    setAddGPESuccess: (state, action) => {
      state.addGPESuccess = action.payload;
    },
    setAddPrescriptionSuccess: (state, action) => {
      state.addPrescriptionSuccess = action.payload;
    },
    setAddFollowUpSuccess: (state, action) => {
      state.addFollowUpSuccess = action.payload;
    },
    setUpdateSuccess: (state, action) => {
      state.updateSuccess = action.payload;
    },
    setDeleteSuccess: (state, action) => {
      state.deleteSuccess = action.payload;
    },
    setMedLoading: (state, action) => {
      state.medLoading = action.payload;
    },
    setMedError: (state, action) => {
      state.medError = action.payload;
      state.medLoading = false;
    },
    setHistoryLoading: (state, action) => {
      state.historyLoading = action.payload;
    },
    setHistoryError: (state, action) => {
      state.historyError = action.payload;
      state.historyLoading = false;
    },
    resetCenterAdminState: (state) => {
      state.addSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.addHistorySuccess = false;
      state.addMedicationSuccess = false;
      state.testSubmitting = false;
      state.testSubmitSuccess = false;
      state.testSubmitError = null;
      state.addAllergicRhinitisSuccess = false;
      state.addAtopicDermatitisSuccess = false;
      state.addAllergicBronchitisSuccess = false;
      state.addGPESuccess = false;
      state.addPrescriptionSuccess = false;
      state.addFollowUpSuccess = false;
      // Reset billing verification state
      state.billingRequestsLoading = false;
      state.billingRequestsError = null;
      state.billingVerificationLoading = false;
      state.billingVerificationError = null;
      state.error = null;
      state.centerError = null;
    },
    addReceptionist: (state, action) => {
      state.receptionists.push(action.payload);
    },
    updateReceptionist: (state, action) => {
      const index = state.receptionists.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.receptionists[index] = action.payload;
      }
    },
    deleteReceptionist: (state, action) => {
      state.receptionists = state.receptionists.filter(r => r._id !== action.payload);
    },
    addDoctor: (state, action) => {
      state.doctors.push(action.payload);
    },
    updateDoctorAction: (state, action) => {
      const index = state.doctors.findIndex(d => d._id === action.payload._id);
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
    },
    deleteDoctor: (state, action) => {
      state.doctors = state.doctors.filter(d => d._id !== action.payload);
    },
    addPrescription: (state, action) => {
      state.prescriptions.push(action.payload);
    },
    addMedication: (state, action) => {
      state.medications.push(action.payload);
    },
    addTest: (state, action) => {
      state.tests.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch atopic dermatitis
      .addCase(fetchAtopicDermatitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAtopicDermatitis.fulfilled, (state, action) => {
        state.loading = false;
        state.atopicDermatitis = action.payload;
      })
      .addCase(fetchAtopicDermatitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all follow-ups
      .addCase(fetchAllFollowUps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFollowUps.fulfilled, (state, action) => {
        state.loading = false;
        state.followUps = action.payload;
      })
      .addCase(fetchAllFollowUps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch center follow-ups
      .addCase(fetchCenterFollowUps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterFollowUps.fulfilled, (state, action) => {
        state.loading = false;
        state.followUps = action.payload;
      })
      .addCase(fetchCenterFollowUps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch patient details
      .addCase(fetchPatientDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.patientDetails = action.payload;
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch patient prescriptions
      .addCase(fetchPatientPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPatientPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch patient history
      .addCase(fetchPatientHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.patientHistory = action.payload;
      })
      .addCase(fetchPatientHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch patient medications
      .addCase(fetchPatientMedications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.patientMedications = action.payload;
      })
      .addCase(fetchPatientMedications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add patient history
      .addCase(addPatientHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPatientHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.addHistorySuccess = true;
      })
      .addCase(addPatientHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add patient medication
      .addCase(addPatientMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPatientMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.addMedicationSuccess = true;
      })
      .addCase(addPatientMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch tests
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit patient tests
      .addCase(submitPatientTests.pending, (state) => {
        state.testSubmitting = true;
        state.testSubmitError = null;
        state.testSubmitSuccess = false;
      })
      .addCase(submitPatientTests.fulfilled, (state, action) => {
        state.testSubmitting = false;
        state.testSubmitSuccess = true;
        state.testSubmitError = null;
      })
      .addCase(submitPatientTests.rejected, (state, action) => {
        state.testSubmitting = false;
        state.testSubmitError = action.payload || 'Failed to submit test reports';
        state.testSubmitSuccess = false;
      })
      
      // Create doctor
      .addCase(createDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.addSuccess = true;
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update doctor
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch allergic rhinitis
      .addCase(fetchAllergicRhinitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergicRhinitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicRhinitis = action.payload;
      })
      .addCase(fetchAllergicRhinitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single allergic rhinitis by ID
      .addCase(fetchSingleAllergicRhinitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleAllergicRhinitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicRhinitis = action.payload;
      })
      .addCase(fetchSingleAllergicRhinitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch allergic conjunctivitis
      .addCase(fetchAllergicConjunctivitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergicConjunctivitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicConjunctivitis = action.payload;
      })
      .addCase(fetchAllergicConjunctivitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add atopic dermatitis
      .addCase(addAtopicDermatitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAtopicDermatitis.fulfilled, (state, action) => {
        state.loading = false;
        state.addAtopicDermatitisSuccess = true;
      })
      .addCase(addAtopicDermatitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add allergic bronchitis
      .addCase(addAllergicBronchitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAllergicBronchitis.fulfilled, (state, action) => {
        state.loading = false;
        state.addAllergicBronchitisSuccess = true;
      })
      .addCase(addAllergicBronchitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch allergic bronchitis
      .addCase(fetchAllergicBronchitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergicBronchitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicBronchitis = action.payload;
      })
      .addCase(fetchAllergicBronchitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add GPE
      .addCase(addGPE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGPE.fulfilled, (state, action) => {
        state.loading = false;
        state.addGPESuccess = true;
      })
      .addCase(addGPE.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch GPE
      .addCase(fetchGPE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGPE.fulfilled, (state, action) => {
        state.loading = false;
        state.gpe = action.payload;
      })
      .addCase(fetchGPE.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add patient prescription
      .addCase(addPatientPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPatientPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.addPrescriptionSuccess = true;
      })
      .addCase(addPatientPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch prescription
      .addCase(fetchPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescription = action.payload;
      })
      .addCase(fetchPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single prescription by ID
      .addCase(fetchSinglePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSinglePrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescription = action.payload;
      })
      .addCase(fetchSinglePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete prescription
      .addCase(deletePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted prescription from the prescriptions array
        state.prescriptions = state.prescriptions.filter(p => p._id !== action.payload);
        // Also clear the single prescription if it was the one deleted
        if (state.prescription && state.prescription._id === action.payload) {
          state.prescription = null;
        }
      })
      .addCase(deletePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add follow up
      .addCase(addFollowUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFollowUp.fulfilled, (state, action) => {
        state.loading = false;
        state.addFollowUpSuccess = true;
      })
      .addCase(addFollowUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update patient
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        // Update the patient details in state
        if (state.patientDetails && state.patientDetails.patient) {
          state.patientDetails.patient = { ...state.patientDetails.patient, ...action.payload.patient };
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete patient
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        // Clear patient details after deletion
        state.patientDetails = null;
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===============================
      // BILLING VERIFICATION REDUCERS
      // ===============================
      
      // Fetch billing requests for verification
      .addCase(fetchCenterAdminBillingRequests.pending, (state) => {
        state.billingRequestsLoading = true;
        state.billingRequestsError = null;
      })
      .addCase(fetchCenterAdminBillingRequests.fulfilled, (state, action) => {
        state.billingRequestsLoading = false;
        state.billingRequests = action.payload || [];
      })
      .addCase(fetchCenterAdminBillingRequests.rejected, (state, action) => {
        state.billingRequestsLoading = false;
        state.billingRequestsError = action.payload;
      })

      // Verify payment
      .addCase(verifyCenterAdminPayment.pending, (state) => {
        state.billingVerificationLoading = true;
        state.billingVerificationError = null;
      })
      .addCase(verifyCenterAdminPayment.fulfilled, (state, action) => {
        state.billingVerificationLoading = false;
        // Update the billing request in the list
        const updatedRequest = action.payload?.testRequest;
        if (updatedRequest) {
          const index = state.billingRequests.findIndex(req => req._id === updatedRequest._id);
          if (index !== -1) {
            state.billingRequests[index] = updatedRequest;
          }
        }
      })
      .addCase(verifyCenterAdminPayment.rejected, (state, action) => {
        state.billingVerificationLoading = false;
        state.billingVerificationError = action.payload;
      })

      // Reject payment 
      .addCase(rejectCenterAdminPayment.pending, (state) => {
        state.billingVerificationLoading = true;
        state.billingVerificationError = null;
      })
      .addCase(rejectCenterAdminPayment.fulfilled, (state, action) => {
        state.billingVerificationLoading = false;
        // Update the billing request in the list
        const updatedRequest = action.payload?.testRequest;
        if (updatedRequest) {
          const index = state.billingRequests.findIndex(req => req._id === updatedRequest._id);
          if (index !== -1) {
            state.billingRequests[index] = updatedRequest;
          }
        }
      })
      .addCase(rejectCenterAdminPayment.rejected, (state, action) => {
        state.billingVerificationLoading = false;
        state.billingVerificationError = action.payload;
      })

      // Fetch billing summary
      .addCase(fetchCenterAdminBillingSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterAdminBillingSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.billingSummary = action.payload;
      })
      .addCase(fetchCenterAdminBillingSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setLoading,
  setError,
  clearError,
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
  setAddFollowUpSuccess,
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
  addTest
} = centerAdminSlice.actions;

export default centerAdminSlice.reducer; 