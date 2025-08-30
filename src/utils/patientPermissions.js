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

  // If patient was not registered by this doctor, deny access
  if (patient.registeredBy && patient.registeredBy.toString() !== currentUser._id) {
    return { canEdit: false, reason: 'You can only edit patients you registered' };
  }

  // If patient was not assigned to this doctor, deny access
  if (patient.assignedDoctor && patient.assignedDoctor.toString() !== currentUser._id) {
    return { canEdit: false, reason: 'You can only edit patients assigned to you' };
  }

  // Check time restriction - can only edit on the same day
  if (patient.createdAt) {
    const patientCreatedDate = new Date(patient.createdAt);
    const currentDate = new Date();
    
    // Check if it's the same day
    const isSameDay = patientCreatedDate.toDateString() === currentDate.toDateString();
    
    if (!isSameDay) {
      return { 
        canEdit: false, 
        reason: 'You can only edit patients on the day they were registered' 
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
