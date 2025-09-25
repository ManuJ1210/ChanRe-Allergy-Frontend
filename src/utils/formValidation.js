// Form validation utilities for ChanRe-Allergy application

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats including spaces, dashes, parentheses)
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{10,15}$/;

// Password validation regex (minimum 8 characters, at least one letter and one number)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// Username validation regex (alphanumeric and underscore, 3-20 characters)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Name validation regex (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s\-']+$/;

// KMC number validation regex (alphanumeric)
const KMC_REGEX = /^[A-Za-z0-9]+$/;

// Center code validation regex (alphanumeric, 3-10 characters)
const CENTER_CODE_REGEX = /^[A-Za-z0-9]{3,10}$/;

// Validation functions
export const validateEmail = (email) => {
  if (!email || email.trim() === '') return null; // Email is optional
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  
  // Remove all non-digit characters except + for validation
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with + (international) or is a local number
  if (cleanPhone.startsWith('+')) {
    // International format: + followed by 7-15 digits
    if (!/^\+[0-9]{7,15}$/.test(cleanPhone)) {
      return 'Please enter a valid international phone number';
    }
  } else {
    // Local format: exactly 10 digits for Indian phone numbers
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return 'Please enter a valid 10-digit phone number';
    }
  }
  
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!PASSWORD_REGEX.test(password)) return 'Password must contain at least one letter and one number';
  return null;
};

export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (!USERNAME_REGEX.test(username)) return 'Username must be 3-20 characters long and contain only letters, numbers, and underscores';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (!NAME_REGEX.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  return null;
};

export const validateAge = (age) => {
  if (!age) return 'Age is required';
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) return 'Please enter a valid age';
  if (ageNum < 0 || ageNum > 150) return 'Age must be between 0 and 150';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') return `${fieldName} is required`;
  return null;
};

export const validateKMCNumber = (kmcNumber) => {
  if (!kmcNumber) return null; // Optional field
  if (!KMC_REGEX.test(kmcNumber)) return 'KMC number can only contain letters and numbers';
  return null;
};

export const validateCenterCode = (code) => {
  if (!code) return 'Center code is required';
  if (!CENTER_CODE_REGEX.test(code)) return 'Center code must be 3-10 characters long and contain only letters and numbers';
  return null;
};

export const validateExperience = (experience) => {
  if (!experience) return null; // Optional field
  if (experience.length < 1) return 'Experience description cannot be empty';
  if (experience.length > 50) return 'Experience description must be less than 50 characters';
  return null;
};

export const validateQualification = (qualification) => {
  if (!qualification) return null; // Optional field
  if (qualification.length < 2) return 'Qualification must be at least 2 characters long';
  return null;
};

export const validateBio = (bio) => {
  if (!bio) return null; // Optional field
  if (bio.length > 500) return 'Bio must be less than 500 characters';
  return null;
};

export const validateSpecialization = (specialization) => {
  if (!specialization) return 'Specialization is required';
  if (specialization.length < 2) return 'Specialization must be at least 2 characters long';
  if (specialization.length > 50) return 'Specialization must be less than 50 characters';
  return null;
};

// Patient form validation
export const validatePatientForm = (formData) => {
  const errors = {};
  
  errors.name = validateName(formData.name);
  errors.age = validateAge(formData.age);
  errors.gender = validateRequired(formData.gender, 'Gender');
  errors.contact = validatePhone(formData.contact);
  errors.email = formData.email ? validateEmail(formData.email) : null;
  errors.address = validateRequired(formData.address, 'Address');
  errors.assignedDoctor = validateRequired(formData.assignedDoctor, 'Assigned Doctor');
  
  return errors;
};

// Doctor form validation
export const validateDoctorForm = (formData) => {
  const errors = {};
  
  errors.name = validateName(formData.name);
  errors.phone = validatePhone(formData.phone);
  errors.email = validateEmail(formData.email);
  errors.username = validateUsername(formData.username);
  errors.password = validatePassword(formData.password);
  errors.qualification = validateQualification(formData.qualification);
  errors.designation = validateQualification(formData.designation); // Make designation optional like qualification
  errors.kmcNumber = validateKMCNumber(formData.kmcNumber);
  errors.experience = validateExperience(formData.experience);
  errors.bio = validateBio(formData.bio);
  
  return errors;
};

// Receptionist form validation
export const validateReceptionistForm = (formData) => {
  const errors = {};
  
  errors.name = validateName(formData.name);
  errors.phone = validatePhone(formData.phone);
  errors.email = validateEmail(formData.email);
  errors.username = validateUsername(formData.username);
  errors.password = validatePassword(formData.password);
  
  return errors;
};

// Center form validation
export const validateCenterForm = (formData) => {
  const errors = {};
  
  errors.name = validateName(formData.name);
  errors.location = validateRequired(formData.location, 'Location');
  errors.address = validateRequired(formData.address, 'Address');
  errors.email = validateEmail(formData.email);
  errors.phone = validatePhone(formData.phone);
  errors.code = validateCenterCode(formData.code);
  
  return errors;
};

// Lab Staff form validation
export const validateLabStaffForm = (formData) => {
  const errors = {};
  
  errors.name = validateName(formData.name);
  errors.phone = validatePhone(formData.phone);
  errors.email = validateEmail(formData.email);
  errors.username = validateUsername(formData.username);
  errors.password = validatePassword(formData.password);
  errors.qualification = validateRequired(formData.qualification, 'Qualification');
  errors.designation = validateRequired(formData.designation, 'Designation');
  
  return errors;
};

// Helper function to check if form has errors
export const hasFormErrors = (errors) => {
  return Object.values(errors).some(error => error !== null);
};

// Helper function to get first error message
export const getFirstError = (errors) => {
  const firstError = Object.values(errors).find(error => error !== null);
  return firstError || null;
};

// Helper function to clear all errors
export const clearFormErrors = (errors) => {
  const clearedErrors = {};
  Object.keys(errors).forEach(key => {
    clearedErrors[key] = null;
  });
  return clearedErrors;
};

// Real-time validation helper
export const validateField = (fieldName, value, validationType) => {
  switch (validationType) {
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'password':
      return validatePassword(value);
    case 'username':
      return validateUsername(value);
    case 'name':
      return validateName(value);
    case 'age':
      return validateAge(value);
    case 'required':
      return validateRequired(value, fieldName);
    case 'kmc':
      return validateKMCNumber(value);
    case 'centerCode':
      return validateCenterCode(value);
    case 'experience':
      return validateExperience(value);
    case 'qualification':
      return validateQualification(value);
    case 'bio':
      return validateBio(value);
    case 'specialization':
      return validateSpecialization(value);
    default:
      return null;
  }
};
