// src/features/doctor/doctorSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  createDoctor,
  fetchAllDoctors,
  fetchDoctorById,
  updateDoctor,
  deleteDoctor,
  fetchAssignedPatients,
  fetchPatientDetails,
  addTestRequest,
  fetchTestRequests,
  createTestRequest,
  fetchTestRequestById,
  downloadTestReport,
  fetchPatientTestRequests,
  fetchPatientHistory,
  fetchPatientMedications,
  fetchPatientFollowUps,
  fetchTests,
  fetchAllergicRhinitis,
  addAllergicRhinitis,
  fetchAllergicConjunctivitis,
  addAllergicConjunctivitis,
  addAtopicDermatitis,
  addAllergicBronchitis,
  addGPE,
  fetchAllergicBronchitis,
  fetchAtopicDermatitis,
  fetchGPE,
  fetchPrescriptions,
  fetchDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchTestRequestFeedback,
  fetchTestRequestsWithFeedback
} from './doctorThunks';

const initialState = {
  // Admin functionality
  loading: false,
  success: false,
  error: null,
  doctors: [],
  doctorData: null,
  updateSuccess: false,
  
  // Doctor-specific functionality
  assignedPatients: [],
  patientDetails: null,
  testRequests: [],
  patientTestRequests: [],
  singleTestRequest: null,
  patientHistory: [],
  patientMedications: [],
  patientFollowUps: [],
  tests: [],
  allergicRhinitis: [],
  allergicConjunctivitis: [],
  allergicBronchitis: [],
  atopicDermatitis: [],
  gpe: [],
  prescriptions: [],
  addAllergicRhinitisSuccess: false,
  addAllergicConjunctivitisSuccess: false,
  addAtopicDermatitisSuccess: false,
  addAllergicBronchitisSuccess: false,
  addGPESuccess: false,
  patientsLoading: false,
  patientDetailsLoading: false,
  testRequestsLoading: false,
  singleTestRequestLoading: false,
  patientHistoryLoading: false,
  patientMedicationsLoading: false,
  patientFollowUpsLoading: false,
  patientsError: null,
  patientDetailsError: null,
  testRequestsError: null,
  singleTestRequestError: null,
  patientHistoryError: null,
  patientMedicationsError: null,
  patientFollowUpsError: null,
  
  // Notification and Feedback state
  notifications: [],
  unreadNotificationsCount: 0,
  notificationsLoading: false,
  notificationsError: null,
  testRequestsWithFeedback: [],
  feedbackLoading: false,
  feedbackError: null,
};

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    resetDoctorState: () => initialState,
    resetUpdateStatus: (state) => {
      state.updateSuccess = false;
    },
    resetPatientDetails: (state) => {
      state.patientDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create doctor
      .addCase(createDoctor.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to create doctor';
      })

      // Update doctor
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.updateSuccess = false;
        state.error = action.payload || 'Failed to update doctor';
      })

      // Fetch doctor by ID
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.doctorData = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorData = action.payload;
        state.error = null;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.doctorData = null;
        state.error = action.payload || 'Failed to fetch doctor';
      })
      
      // Fetch all doctors
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
        state.error = null;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch doctors';
      })

      // Delete doctor
      .addCase(deleteDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Remove the deleted doctor from the doctors array
        state.doctors = state.doctors.filter(doctor => doctor._id !== action.meta.arg);
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete doctor';
      })

      // Fetch assigned patients
      .addCase(fetchAssignedPatients.pending, (state) => {
        state.patientsLoading = true;
        state.patientsError = null;
      })
      .addCase(fetchAssignedPatients.fulfilled, (state, action) => {
        state.patientsLoading = false;
        state.assignedPatients = action.payload;
        state.patientsError = null;
      })
      .addCase(fetchAssignedPatients.rejected, (state, action) => {
        state.patientsLoading = false;
        state.patientsError = action.payload || 'Failed to fetch assigned patients';
      })

      // Fetch patient details
      .addCase(fetchPatientDetails.pending, (state) => {
        state.patientDetailsLoading = true;
        state.patientDetailsError = null;
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        state.patientDetailsLoading = false;
        
        // Handle structured response from doctor-specific endpoint
        if (action.payload.patient) {
          // New structure: { patient, history, medications, tests }
          state.patientDetails = action.payload.patient;
          state.patientHistory = action.payload.history || [];
          state.patientMedications = action.payload.medications || [];
          state.tests = action.payload.tests || [];
        } else {
          // Fallback: treat payload as patient object directly
          state.patientDetails = action.payload;
        }
        
        state.patientDetailsError = null;
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        state.patientDetailsLoading = false;
        state.patientDetailsError = action.payload || 'Failed to fetch patient details';
      })

      // Add test request
      .addCase(addTestRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTestRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(addTestRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add test request';
      })

      // Fetch test requests
      .addCase(fetchTestRequests.pending, (state) => {
        state.testRequestsLoading = true;
        state.testRequestsError = null;
      })
      .addCase(fetchTestRequests.fulfilled, (state, action) => {
        state.testRequestsLoading = false;
        state.testRequests = action.payload;
        state.testRequestsError = null;
      })
      .addCase(fetchTestRequests.rejected, (state, action) => {
        state.testRequestsLoading = false;
        state.testRequestsError = action.payload || 'Failed to fetch test requests';
      })

      // Create test request
      .addCase(createTestRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createTestRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create test request';
      })

      // Fetch test request by ID
      .addCase(fetchTestRequestById.pending, (state) => {
        state.singleTestRequestLoading = true;
        state.singleTestRequestError = null;
      })
      .addCase(fetchTestRequestById.fulfilled, (state, action) => {
        state.singleTestRequestLoading = false;
        state.singleTestRequest = action.payload;
        state.singleTestRequestError = null;
      })
      .addCase(fetchTestRequestById.rejected, (state, action) => {
        state.singleTestRequestLoading = false;
        state.singleTestRequestError = action.payload || 'Failed to fetch test request';
      })

      // Download test report
      .addCase(downloadTestReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadTestReport.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(downloadTestReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to download report';
      })

      // Fetch patient test requests
      .addCase(fetchPatientTestRequests.pending, (state) => {
        state.testRequestsLoading = true;
        state.testRequestsError = null;
      })
      .addCase(fetchPatientTestRequests.fulfilled, (state, action) => {
        state.testRequestsLoading = false;
        state.patientTestRequests = action.payload;
        state.testRequestsError = null;
      })
      .addCase(fetchPatientTestRequests.rejected, (state, action) => {
        state.testRequestsLoading = false;
        state.testRequestsError = action.payload || 'Failed to fetch patient test requests';
      })

      // Fetch doctor notifications
      .addCase(fetchDoctorNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.notificationsError = null;
      })
      .addCase(fetchDoctorNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadNotificationsCount = action.payload.unreadCount;
        state.notificationsError = null;
      })
      .addCase(fetchDoctorNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.notificationsError = action.payload || 'Failed to fetch notifications';
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload.notification._id;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.read = true;
        }
        state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
      })

      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadNotificationsCount = 0;
      })

      // Fetch test request feedback
      .addCase(fetchTestRequestFeedback.pending, (state) => {
        state.feedbackLoading = true;
        state.feedbackError = null;
      })
      .addCase(fetchTestRequestFeedback.fulfilled, (state, action) => {
        state.feedbackLoading = false;
        state.singleTestRequest = action.payload;
        state.feedbackError = null;
      })
      .addCase(fetchTestRequestFeedback.rejected, (state, action) => {
        state.feedbackLoading = false;
        state.feedbackError = action.payload || 'Failed to fetch feedback';
      })

      // Fetch test requests with feedback
      .addCase(fetchTestRequestsWithFeedback.pending, (state) => {
        state.feedbackLoading = true;
        state.feedbackError = null;
      })
      .addCase(fetchTestRequestsWithFeedback.fulfilled, (state, action) => {
        state.feedbackLoading = false;
        state.testRequestsWithFeedback = action.payload.testRequestsWithFeedback;
        state.feedbackError = null;
      })
      .addCase(fetchTestRequestsWithFeedback.rejected, (state, action) => {
        state.feedbackLoading = false;
        state.feedbackError = action.payload || 'Failed to fetch test requests with feedback';
      })

      // Fetch patient history
      .addCase(fetchPatientHistory.pending, (state) => {
        state.patientHistoryLoading = true;
        state.patientHistoryError = null;
      })
      .addCase(fetchPatientHistory.fulfilled, (state, action) => {
        state.patientHistoryLoading = false;
        state.patientHistory = action.payload;
        state.patientHistoryError = null;
      })
      .addCase(fetchPatientHistory.rejected, (state, action) => {
        state.patientHistoryLoading = false;
        state.patientHistoryError = action.payload || 'Failed to fetch patient history';
      })

      // Fetch patient medications
      .addCase(fetchPatientMedications.pending, (state) => {
        state.patientMedicationsLoading = true;
        state.patientMedicationsError = null;
      })
      .addCase(fetchPatientMedications.fulfilled, (state, action) => {
        state.patientMedicationsLoading = false;
        state.patientMedications = action.payload;
        state.patientMedicationsError = null;
      })
      .addCase(fetchPatientMedications.rejected, (state, action) => {
        state.patientMedicationsLoading = false;
        state.patientMedicationsError = action.payload || 'Failed to fetch patient medications';
      })

      // Fetch patient follow-ups
      .addCase(fetchPatientFollowUps.pending, (state) => {
        state.patientFollowUpsLoading = true;
        state.patientFollowUpsError = null;
      })
      .addCase(fetchPatientFollowUps.fulfilled, (state, action) => {
        state.patientFollowUpsLoading = false;
        state.patientFollowUps = action.payload;
        state.patientFollowUpsError = null;
      })
      .addCase(fetchPatientFollowUps.rejected, (state, action) => {
        state.patientFollowUpsLoading = false;
        state.patientFollowUpsError = action.payload || 'Failed to fetch patient follow-ups';
      })

      // Fetch tests
      .addCase(fetchTests.pending, (state) => {
        state.testRequestsLoading = true;
        state.testRequestsError = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.testRequestsLoading = false;
        state.patientTestRequests = action.payload;
        state.testRequestsError = null;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.testRequestsLoading = false;
        state.testRequestsError = action.payload || 'Failed to fetch tests';
      })

      // Fetch allergic rhinitis
      .addCase(fetchAllergicRhinitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergicRhinitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicRhinitis = action.payload;
        state.error = null;
      })
      .addCase(fetchAllergicRhinitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch allergic rhinitis';
      })

      // Add allergic rhinitis
      .addCase(addAllergicRhinitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAllergicRhinitis.fulfilled, (state, action) => {
        state.loading = false;
        state.addAllergicRhinitisSuccess = true;
        state.error = null;
      })
      .addCase(addAllergicRhinitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add allergic rhinitis';
      })

      // Add allergic conjunctivitis
      .addCase(addAllergicConjunctivitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAllergicConjunctivitis.fulfilled, (state, action) => {
        state.loading = false;
        state.addAllergicConjunctivitisSuccess = true;
        state.error = null;
      })
      .addCase(addAllergicConjunctivitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add allergic conjunctivitis';
      })

      // Add atopic dermatitis
      .addCase(addAtopicDermatitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAtopicDermatitis.fulfilled, (state, action) => {
        state.loading = false;
        state.addAtopicDermatitisSuccess = true;
        state.error = null;
      })
      .addCase(addAtopicDermatitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add atopic dermatitis';
      })

      // Add allergic bronchitis
      .addCase(addAllergicBronchitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAllergicBronchitis.fulfilled, (state, action) => {
        state.loading = false;
        state.addAllergicBronchitisSuccess = true;
        state.error = null;
      })
      .addCase(addAllergicBronchitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add allergic bronchitis';
      })

      // Add GPE
      .addCase(addGPE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGPE.fulfilled, (state, action) => {
        state.loading = false;
        state.addGPESuccess = true;
        state.error = null;
      })
      .addCase(addGPE.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add GPE';
      })

      // Fetch allergic conjunctivitis
      .addCase(fetchAllergicConjunctivitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergicConjunctivitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicConjunctivitis = action.payload;
        state.error = null;
      })
      .addCase(fetchAllergicConjunctivitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch allergic conjunctivitis';
      })

      // Fetch allergic bronchitis
      .addCase(fetchAllergicBronchitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllergicBronchitis.fulfilled, (state, action) => {
        state.loading = false;
        state.allergicBronchitis = action.payload;
        state.error = null;
      })
      .addCase(fetchAllergicBronchitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch allergic bronchitis';
      })

      // Fetch atopic dermatitis
      .addCase(fetchAtopicDermatitis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAtopicDermatitis.fulfilled, (state, action) => {
        state.loading = false;
        state.atopicDermatitis = action.payload;
        state.error = null;
      })
      .addCase(fetchAtopicDermatitis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch atopic dermatitis';
      })

      // Fetch GPE
      .addCase(fetchGPE.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGPE.fulfilled, (state, action) => {
        state.loading = false;
        state.gpe = action.payload;
        state.error = null;
      })
      .addCase(fetchGPE.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch GPE';
      })

      // Fetch prescriptions
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch prescriptions';
      });
  },
});

export const { resetDoctorState, resetUpdateStatus, resetPatientDetails } = doctorSlice.actions;
export default doctorSlice.reducer;
