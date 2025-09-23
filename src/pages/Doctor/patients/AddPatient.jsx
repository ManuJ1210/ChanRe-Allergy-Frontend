import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPatient } from "../../../features/doctor/doctorThunks";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateName, validateEmail, validatePhone, validateAge } from "../../../utils/formValidation";
const AddPatient = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success, error } = useSelector((state) => state.doctor);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    contact: "",
    email: "",
    centerCode: "",
    assignedDoctor: "",
  });
  
  const [centerInfo, setCenterInfo] = useState({
    name: "Loading...",
    code: "Loading..."
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Get center ID from user
  const getCenterId = () => {
    if (!user) return null;
    
    if (user.centerId) {
      if (typeof user.centerId === 'object' && user.centerId._id) {
        return user.centerId._id;
      }
      if (typeof user.centerId === 'string') {
        return user.centerId;
      }
    }
    
    if (user.centerID) return user.centerID;
    if (user.center_id) return user.center_id;
    if (user.center && user.center._id) return user.center._id;
    
    return null;
  };

  useEffect(() => {
    // Auto-assign current doctor
    if (user && user._id) {
      setFormData(prev => ({
        ...prev,
        assignedDoctor: user._id
      }));
    }
    
    // Fetch center information and auto-populate
    const fetchCenterInfo = async () => {
      const centerId = getCenterId();
      
      if (centerId) {
        try {
          const response = await API.get(`/centers/${centerId}`);
          const center = response.data;
          
          setCenterInfo({
            name: center.name,
            code: center.code
          });
          
          // Auto-populate centerCode in form
          setFormData(prev => ({
            ...prev,
            centerCode: center.code
          }));
          
        } catch (error) {
          
          // Fallback to user's centerCode if available
          if (user.centerCode) {

            setFormData(prev => ({
              ...prev,
              centerCode: user.centerCode
            }));
            setCenterInfo(prev => ({
              ...prev,
              code: user.centerCode,
              name: user.hospitalName || 'Center'
            }));
          }
        }
      } else {

        
        // Alternative approach: Try to fetch center by admin ID
        if (user && user.id) {
          try {
            const response = await API.get(`/centers/by-admin/${user.id}`);
            const center = response.data;
            
            setCenterInfo({
              name: center.name,
              code: center.code
            });
            
            setFormData(prev => ({
              ...prev,
              centerCode: center.code
            }));
            
          } catch (altError) {
    
            
            // Final fallback to user fields
            if (user.centerCode) {
      
              setFormData(prev => ({
                ...prev,
                centerCode: user.centerCode
              }));
              setCenterInfo({
                code: user.centerCode,
                name: user.hospitalName || 'Center'
              });
            } else {
      
              setCenterInfo({
                name: 'Error: No center data',
                code: 'N/A'
              });
            }
          }
        } else {
  
          setCenterInfo({
            name: 'Error: No user data',
            code: 'N/A'
          });
        }
      }
    };
    
    fetchCenterInfo();
  }, [dispatch, user]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    // Validate age
    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Validate email (optional but if provided, must be valid)
    if (formData.email && formData.email.trim()) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    // Validate contact (required, must be valid 10-digit number)
    const contactError = validatePhone(formData.contact);
    if (contactError) newErrors.contact = contactError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'age':
        error = validateAge(value);
        break;
      case 'email':
        if (value && value.trim()) {
          error = validateEmail(value);
        }
        break;
      case 'contact':
        error = validatePhone(value);
        break;
      case 'gender':
        if (!value) {
          error = 'Gender is required';
        }
        break;
      default:
        break;
    }

    // Only set error if field has been touched
    if (touchedFields[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }

    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched when submitting
    const allFields = ['name', 'age', 'gender', 'contact', 'email'];
    const touchedAllFields = {};
    allFields.forEach(field => {
      touchedAllFields[field] = true;
    });
    setTouchedFields(touchedAllFields);
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    dispatch(createPatient(formData));
  };

  // Remove automatic validation on form data changes
  // Validation will only happen on blur and submit

  useEffect(() => {
    if (success) {
      navigate("/dashboard/doctor/recently-assigned-patients");
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/Doctor/patients/PatientList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients List
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Add New Patient (Doctor)
          </h1>
          <p className="text-slate-600 text-xs">
            Register a new patient and assign to yourself
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Patient Information
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Fill in the details to register a new patient
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-800 mb-4">Personal Information</h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter patient name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    required
                  />
                  {errors.name && touchedFields.name && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter age"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                        errors.age ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      required
                    />
                    {errors.age && touchedFields.age && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.age}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                        errors.gender ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && touchedFields.gender && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.gender}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-xs"
                  ></textarea>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-800 mb-4">Contact Information</h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter 10-digit phone number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                      errors.contact ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    required
                  />
                  {errors.contact && touchedFields.contact && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {errors.contact}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && touchedFields.email && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Center Information
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Center Name
                      </label>
                      <input
                        type="text"
                        value={centerInfo.name || 'Loading center...'}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed text-xs"
                        placeholder="Center name will be auto-filled"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Center Code
                      </label>
                      <input
                        type="text"
                        value={centerInfo.code || 'Loading...'}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed text-xs"
                        placeholder="Center code will be auto-filled"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        UH ID (Auto-generated)
                      </label>
                      <input
                        type="text"
                        value={`${centerInfo.code || 'Loading'}001`}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-blue-50 text-blue-700 cursor-not-allowed text-xs font-medium"
                        placeholder="UH ID will be auto-generated"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Format: Center Code + Serial Number (e.g., 223344001)
                      </p>
                    </div>
                  </div>
                  <input
                    type="hidden"
                    name="centerCode"
                    value={formData.centerCode}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Assigned Doctor
                  </label>
                  <input
                    type="text"
                    value={user?.name || 'Current Doctor'}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed text-xs"
                    placeholder="Doctor will be auto-assigned"
                  />
                  <input
                    type="hidden"
                    name="assignedDoctor"
                    value={formData.assignedDoctor}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Patient will be automatically assigned to you
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading || Object.keys(errors).some(key => errors[key] && touchedFields[key])}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs ${
                  loading || Object.keys(errors).some(key => errors[key] && touchedFields[key])
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding Patient...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Add Patient
                  </>
                )}
              </button>
              {Object.keys(errors).some(key => errors[key] && touchedFields[key]) && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Please fix the errors above before submitting
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
