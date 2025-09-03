/**
 * Utility functions for patient permissions
 */

/**
 * Check if a doctor can edit a patient based on time restrictions
 * @param {Object} patient - The patient object
 * @param {Object} currentUser - The current logged-in user
 * @returns {Object} - { canEdit: boolean, reason: string }
 */
export const canDoctorEditPatient = (patient, currentUser) => {
  // If no patient or user data, deny access
  if (!patient || !currentUser) {
    return { canEdit: false, reason: 'Missing patient or user data' };
  }

  // If user is not a doctor, deny access
  if (currentUser.role !== 'doctor') {
    return { canEdit: false, reason: 'Only doctors can edit patients' };
  }

  // Check if doctor is either the registered doctor OR the assigned doctor
  const isRegisteredDoctor = patient.registeredBy && patient.registeredBy.toString() === currentUser._id;
  const isAssignedDoctor = patient.assignedDoctor && (
    typeof patient.assignedDoctor === 'string' 
      ? patient.assignedDoctor.toString() === currentUser._id
      : patient.assignedDoctor._id.toString() === currentUser._id
  );
  
  if (!isRegisteredDoctor && !isAssignedDoctor) {
    return { canEdit: false, reason: 'You can only edit patients you registered or are assigned to' };
  }

  // Check time restriction - can only edit within 24 hours of patient creation
  if (patient.createdAt) {
    const patientCreatedDate = new Date(patient.createdAt);
    const currentDate = new Date();
    
    // Calculate time difference in milliseconds
    const timeDifference = currentDate.getTime() - patientCreatedDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert to hours
    
    // Check if it's within 24 hours
    if (hoursDifference > 24) {
      return { 
        canEdit: false, 
        reason: 'You can only edit patients within 24 hours of registration' 
      };
    }
  }

  // If all checks pass, allow editing
  return { canEdit: true, reason: 'Edit allowed' };
};

/**
 * Get a user-friendly message for edit restrictions
 * @param {Object} patient - The patient object
 * @param {Object} currentUser - The current logged-in user
 * @returns {string} - User-friendly message
 */
export const getEditRestrictionMessage = (patient, currentUser) => {
  const permission = canDoctorEditPatient(patient, currentUser);
  
  if (permission.canEdit) {
    return '';
  }

  switch (permission.reason) {
    case 'You can only edit patients on the day they were registered':
      return 'Edit access expired. You can only edit patients on the day they were registered.';
    case 'You can only edit patients you registered':
      return 'You can only edit patients you registered.';
    case 'You can only edit patients assigned to you':
      return 'You can only edit patients assigned to you.';
    case 'Only doctors can edit patients':
      return 'Only doctors can edit patients.';
    default:
      return 'Edit access denied.';
  }
};

/**
 * Check if a doctor can delete a patient (always false for doctors)
 * @param {Object} patient - The patient object
 * @param {Object} currentUser - The current logged-in user
 * @returns {Object} - { canDelete: boolean, reason: string }
 */
export const canDoctorDeletePatient = (patient, currentUser) => {
  // Doctors cannot delete patients
  return { 
    canDelete: false, 
    reason: 'Doctors cannot delete patients. Only center admins can delete patients.' 
  };
};

/**
 * Check if a doctor can add followups to a patient based on time restrictions
 * @param {Object} patient - The patient object
 * @param {Object} currentUser - The current logged-in user
 * @returns {Object} - { canAddFollowUp: boolean, reason: string }
 */
export const canDoctorAddFollowUp = (patient, currentUser) => {
  // If no patient or user data, deny access
  if (!patient || !currentUser) {
    return { canAddFollowUp: false, reason: 'Missing patient or user data' };
  }

  // If user is not a doctor, deny access
  if (currentUser.role !== 'doctor') {
    return { canAddFollowUp: false, reason: 'Only doctors can add followups' };
  }

  // Check if doctor is either the registered doctor OR the assigned doctor
  const isRegisteredDoctor = patient.registeredBy && patient.registeredBy.toString() === currentUser._id;
  const isAssignedDoctor = patient.assignedDoctor && (
    typeof patient.assignedDoctor === 'string' 
      ? patient.assignedDoctor.toString() === currentUser._id
      : patient.assignedDoctor._id.toString() === currentUser._id
  );
  
  if (!isRegisteredDoctor && !isAssignedDoctor) {
    return { canAddFollowUp: false, reason: 'You can only add followups to patients you registered or are assigned to' };
  }

  // Check time restriction - can only add followups within 24 hours of patient creation
  if (patient.createdAt) {
    const patientCreatedDate = new Date(patient.createdAt);
    const currentDate = new Date();
    
    // Calculate time difference in milliseconds
    const timeDifference = currentDate.getTime() - patientCreatedDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert to hours
    
    // Check if it's within 24 hours
    if (hoursDifference > 24) {
      return { 
        canAddFollowUp: false, 
        reason: 'You can only add followups within 24 hours of patient registration' 
      };
    }
  }

  // If all checks pass, allow adding followups
  return { canAddFollowUp: true, reason: 'Followup addition allowed' };
};

/**
 * Get a user-friendly message for followup restrictions
 * @param {Object} patient - The patient object
 * @param {Object} currentUser - The current logged-in user
 * @returns {string} - User-friendly message
 */
export const getFollowUpRestrictionMessage = (patient, currentUser) => {
  const permission = canDoctorAddFollowUp(patient, currentUser);
  
  if (permission.canAddFollowUp) {
    return '';
  }

  switch (permission.reason) {
    case 'You can only add followups within 24 hours of patient registration':
      return 'Followup access expired. You can only add followups within 24 hours of patient registration.';
    case 'You can only add followups to patients you registered':
      return 'You can only add followups to patients you registered.';
    case 'You can only add followups to patients assigned to you':
      return 'You can only add followups to patients assigned to you.';
    case 'Only doctors can add followups':
      return 'Only doctors can add followups.';
    default:
      return 'Followup access denied.';
  }
};

/**
 * Calculate remaining time for patient editing and follow-up addition
 * @param {Object} patient - The patient object
 * @returns {Object} - { canEdit: boolean, remainingHours: number, remainingMinutes: number, isExpired: boolean }
 */
export const getRemainingTime = (patient) => {
  if (!patient || !patient.createdAt) {
    return { canEdit: false, remainingHours: 0, remainingMinutes: 0, isExpired: true };
  }

  const patientCreatedDate = new Date(patient.createdAt);
  const currentDate = new Date();
  
  // Calculate time difference in milliseconds
  const timeDifference = currentDate.getTime() - patientCreatedDate.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert to hours
  
  // Check if it's within 24 hours
  if (hoursDifference > 24) {
    return { canEdit: false, remainingHours: 0, remainingMinutes: 0, isExpired: true };
  }
  
  // Calculate remaining time
  const remainingHours = Math.floor(24 - hoursDifference);
  const remainingMinutes = Math.floor((24 - hoursDifference - remainingHours) * 60);
  
  return { 
    canEdit: true, 
    remainingHours, 
    remainingMinutes, 
    isExpired: false 
  };
};

/**
 * Format remaining time as a user-friendly string
 * @param {Object} patient - The patient object
 * @returns {string} - Formatted time string
 */
export const formatRemainingTime = (patient) => {
  const timeInfo = getRemainingTime(patient);
  
  if (timeInfo.isExpired) {
    return 'Edit Time Expired';
  }
  
  if (timeInfo.remainingHours > 0) {
    return `Edit: ${timeInfo.remainingHours}h ${timeInfo.remainingMinutes}m left`;
  } else {
    return `Edit: ${timeInfo.remainingMinutes}m left`;
  }
};
