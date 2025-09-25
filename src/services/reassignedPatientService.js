import API from './api';

/**
 * Service for handling reassigned patient operations
 */
class ReassignedPatientService {
  
  /**
   * Get reassigned patients for a specific doctor
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<Object>} - API response
   */
  static async getReassignedPatientsForDoctor(doctorId) {
    try {
      const response = await API.get(`/reassigned-patients/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting reassigned patients for doctor:', error);
      throw error;
    }
  }
  
  /**
   * Analyze patient reassignment status
   * @param {string} patientId - Patient ID
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<Object>} - API response
   */
  static async analyzePatientReassignment(patientId, doctorId) {
    try {
      const response = await API.get(`/reassigned-patients/analyze/${patientId}/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing patient reassignment:', error);
      throw error;
    }
  }
  
  /**
   * Get billing status for reassigned patient
   * @param {string} patientId - Patient ID
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<Object>} - API response
   */
  static async getReassignedPatientBillingStatus(patientId, doctorId) {
    try {
      const response = await API.get(`/reassigned-patients/billing-status/${patientId}/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting reassigned patient billing status:', error);
      throw error;
    }
  }
  
  /**
   * Create consultation fee for reassigned patient
   * @param {string} patientId - Patient ID
   * @param {string} doctorId - Doctor ID
   * @param {number} amount - Consultation fee amount
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} - API response
   */
  static async createConsultationFeeForReassignedPatient(patientId, doctorId, amount, paymentMethod = 'cash') {
    try {
      const response = await API.post(`/reassigned-patients/consultation-fee/${patientId}/${doctorId}`, {
        amount,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error creating consultation fee for reassigned patient:', error);
      throw error;
    }
  }
  
  /**
   * Get all patients with reassignment analysis
   * @param {string} doctorId - Optional doctor ID filter
   * @returns {Promise<Object>} - API response
   */
  static async getAllPatientsWithReassignmentAnalysis(doctorId = null) {
    try {
      const params = doctorId ? { doctorId } : {};
      const response = await API.get('/reassigned-patients/all-patients', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting all patients with reassignment analysis:', error);
      throw error;
    }
  }
  
  /**
   * Mark patient as reassigned in localStorage
   * @param {string} patientId - Patient ID
   * @param {Object} reassignmentInfo - Reassignment information
   */
  static markPatientAsReassigned(patientId, reassignmentInfo) {
    const reassignmentKey = `reassigned_${patientId}`;
    localStorage.setItem(reassignmentKey, JSON.stringify({
      reassigned: true,
      patientId,
      timestamp: new Date().toISOString(),
      ...reassignmentInfo
    }));
  }
  
  /**
   * Check if patient is marked as reassigned in localStorage
   * @param {string} patientId - Patient ID
   * @returns {Object|null} - Reassignment info or null
   */
  static getPatientReassignmentInfo(patientId) {
    const reassignmentKey = `reassigned_${patientId}`;
    const info = localStorage.getItem(reassignmentKey);
    
    if (info) {
      try {
        return JSON.parse(info);
      } catch (error) {
        console.error('Error parsing reassignment info:', error);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Clear reassignment marker for patient
   * @param {string} patientId - Patient ID
   */
  static clearPatientReassignmentMarker(patientId) {
    const reassignmentKey = `reassigned_${patientId}`;
    localStorage.removeItem(reassignmentKey);
  }
  
  /**
   * Check if patient is reassigned based on billing history
   * @param {Object} patient - Patient object with billing records
   * @param {string} currentDoctorId - Current assigned doctor ID
   * @returns {Object} - Reassignment analysis
   */
  static analyzePatientReassignmentLocally(patient, currentDoctorId) {
    try {
      const billingRecords = patient.billing || [];
      
      // Check if patient has billing records for different doctors
      const hasBillingForDifferentDoctor = billingRecords.some(bill => {
        const hasDoctorId = bill.doctorId && bill.doctorId.toString();
        return hasDoctorId && bill.doctorId.toString() !== currentDoctorId?.toString();
      });
      
      // Check if patient has multiple consultation fees
      const consultationFees = billingRecords.filter(bill => 
        bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
      );
      const hasMultipleConsultationFees = consultationFees.length > 1;
      
      // Check if patient has consultation fee for current doctor
      const hasConsultationForCurrentDoctor = consultationFees.some(fee => {
        const hasDoctorId = fee.doctorId && fee.doctorId.toString();
        return hasDoctorId && fee.doctorId.toString() === currentDoctorId?.toString();
      });
      
      // Check if patient has service charges for current doctor
      const serviceCharges = billingRecords.filter(bill => bill.type === 'service');
      const hasServiceChargesForCurrentDoctor = serviceCharges.some(charge => {
        const hasDoctorId = charge.doctorId && charge.doctorId.toString();
        return hasDoctorId && charge.doctorId.toString() === currentDoctorId?.toString();
      });
      
      const isReassigned = hasBillingForDifferentDoctor || hasMultipleConsultationFees;
      
      return {
        isReassigned,
        hasBillingForDifferentDoctor,
        hasMultipleConsultationFees,
        hasConsultationForCurrentDoctor,
        hasServiceChargesForCurrentDoctor,
        consultationFeesCount: consultationFees.length,
        totalBillingRecords: billingRecords.length,
        currentDoctorId,
        previousDoctors: this.getPreviousDoctors(billingRecords, currentDoctorId)
      };
      
    } catch (error) {
      console.error('Error analyzing patient reassignment locally:', error);
      return {
        isReassigned: false,
        hasBillingForDifferentDoctor: false,
        hasMultipleConsultationFees: false,
        hasConsultationForCurrentDoctor: false,
        hasServiceChargesForCurrentDoctor: false,
        consultationFeesCount: 0,
        totalBillingRecords: 0,
        currentDoctorId,
        previousDoctors: [],
        error: error.message
      };
    }
  }
  
  /**
   * Get list of previous doctors from billing records
   * @param {Array} billingRecords - Array of billing records
   * @param {string} currentDoctorId - Current doctor ID to exclude
   * @returns {Array} - Array of previous doctor IDs
   */
  static getPreviousDoctors(billingRecords, currentDoctorId) {
    const doctorIds = new Set();
    
    billingRecords.forEach(bill => {
      if (bill.doctorId && bill.doctorId.toString() !== currentDoctorId?.toString()) {
        doctorIds.add(bill.doctorId.toString());
      }
    });
    
    return Array.from(doctorIds);
  }
  
  /**
   * Get billing status for reassigned patient locally
   * @param {Object} patient - Patient object
   * @param {string} currentDoctorId - Current assigned doctor ID
   * @returns {Object} - Billing status analysis
   */
  static getReassignedPatientBillingStatusLocally(patient, currentDoctorId) {
    try {
      const reassignmentAnalysis = this.analyzePatientReassignmentLocally(patient, currentDoctorId);
      
      if (!reassignmentAnalysis.isReassigned) {
        return {
          needsConsultationFee: !reassignmentAnalysis.hasConsultationForCurrentDoctor,
          needsRegistrationFee: false, // Reassigned patients don't need registration fee
          needsServiceCharges: false, // Will be determined based on test requests
          status: reassignmentAnalysis.hasConsultationForCurrentDoctor ? 'All Fees Paid' : 'Consultation Fee Required',
          isReassigned: false
        };
      }
      
      // For reassigned patients, check if they have consultation fee for current doctor
      const needsConsultationFee = !reassignmentAnalysis.hasConsultationForCurrentDoctor;
      
      // Reassigned patients don't need registration fee
      const needsRegistrationFee = false;
      
      // Service charges will be determined based on test requests
      const needsServiceCharges = false;
      
      let status = 'All Fees Paid';
      if (needsConsultationFee) {
        status = 'Consultation Fee Required';
      }
      
      return {
        needsConsultationFee,
        needsRegistrationFee,
        needsServiceCharges,
        status,
        isReassigned: true,
        reassignmentAnalysis
      };
      
    } catch (error) {
      console.error('Error getting reassigned patient billing status locally:', error);
      return {
        needsConsultationFee: true,
        needsRegistrationFee: false,
        needsServiceCharges: false,
        status: 'Consultation Fee Required',
        isReassigned: false,
        error: error.message
      };
    }
  }
}

export default ReassignedPatientService;


