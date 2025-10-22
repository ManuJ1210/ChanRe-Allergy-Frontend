import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createReceptionistPatient } from "../../features/receptionist/receptionistThunks";
import { resetReceptionistState } from "../../features/receptionist/receptionistSlice";
import ReceptionistLayout from './ReceptionistLayout';
import API from "../../services/api";
import { User, Save, ArrowLeft, CheckCircle, AlertCircle, Mail, Phone, MapPin, Calendar, UserCheck, Building2, Building, Search, Clock, CheckCircle2 } from "lucide-react";
import { validatePatientForm, hasFormErrors } from "../../utils/formValidation";

export default function AddPatient() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, addSuccess } = useSelector((state) => state.receptionist);
  
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
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [centerInfo, setCenterInfo] = useState({
    name: "",
    code: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Appointment lookup states
  const [workflowMode, setWorkflowMode] = useState('new'); // 'new' or 'existing'
  const [confirmationCode, setConfirmationCode] = useState('');
  const [foundAppointment, setFoundAppointment] = useState(null);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState('');
  
  // Autocomplete states
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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
    fetchDoctors();
    
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
          console.error('Error fetching center info:', error);
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
        // Try to use centerCode directly if available
        if (user.centerCode) {
          setFormData(prev => ({
            ...prev,
            centerCode: user.centerCode
          }));
          setCenterInfo({
            code: user.centerCode,
            name: user.hospitalName || 'Center'
          });
        }
      }
    };
    
    fetchCenterInfo();
  }, [user]);

  useEffect(() => {
    if (addSuccess) {
      setTimeout(() => {
        dispatch(resetReceptionistState());
        navigate("/dashboard/receptionist/patients");
      }, 1000);
    }
  }, [addSuccess, dispatch, navigate]);

  const fetchDoctors = async () => {
    setDoctorLoading(true);
    setDoctorError("");
    try {
      const response = await API.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setDoctorError("Failed to load doctors");
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleLookupAppointment = async () => {
    if (!confirmationCode.trim()) {
      setAppointmentError('Please enter a confirmation code');
      return;
    }

    setAppointmentLoading(true);
    setAppointmentError('');
    
    try {
      const response = await API.get(`/patient-appointments/confirmation/${confirmationCode}`);
      if (response.data.success) {
        setFoundAppointment(response.data.data);
        // Auto-populate form with appointment data
        setFormData(prev => ({
          ...prev,
          name: response.data.data.patientName,
          age: response.data.data.patientAge,
          gender: response.data.data.patientGender,
          contact: response.data.data.patientPhone,
          email: response.data.data.patientEmail,
          address: response.data.data.patientAddress
        }));
      }
    } catch (error) {
      setAppointmentError(error.response?.data?.message || 'Appointment not found');
      setFoundAppointment(null);
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleAddExistingAppointment = async () => {
    if (!foundAppointment) return;

    try {
      // Create patient from appointment data
      const patientData = {
        name: foundAppointment.patientName,
        age: foundAppointment.patientAge,
        gender: foundAppointment.patientGender,
        contact: foundAppointment.patientPhone,
        email: foundAppointment.patientEmail,
        address: foundAppointment.patientAddress,
        centerCode: formData.centerCode,
        assignedDoctor: formData.assignedDoctor,
        appointmentId: foundAppointment._id,
        appointmentConfirmed: true
      };

      dispatch(createReceptionistPatient(patientData));
    } catch (error) {
      console.error('Error adding existing appointment:', error);
    }
  };

  const handleNameSearch = async (searchValue) => {
    if (searchValue.length < 2) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const centerId = getCenterId();
      const response = await API.get('/patient-appointments/search', {
        params: { name: searchValue, centerId }
      });
      
      if (response.data.success && response.data.data.length > 0) {
        setNameSuggestions(response.data.data);
        setShowSuggestions(true);
      } else {
        setNameSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching appointments:', error);
      setNameSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSuggestion = (appointment) => {
    setFoundAppointment(appointment);
    setFormData({
      ...formData,
      name: appointment.patientName,
      age: appointment.patientAge,
      gender: appointment.patientGender,
      contact: appointment.patientPhone,
      email: appointment.patientEmail,
      address: appointment.patientAddress
    });
    setShowSuggestions(false);
    setWorkflowMode('existing');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If name field is being changed, search for appointments
    if (name === 'name') {
      handleNameSearch(value);
    }
    
    // Mark field as touched
    setTouched({ ...touched, [name]: true });
    
    // Validate the field
    const validationErrors = validatePatientForm({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validationErrors[name] });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate the field
    const validationErrors = validatePatientForm(formData);
    setErrors({ ...errors, [name]: validationErrors[name] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate the entire form
    const validationErrors = validatePatientForm(formData);
    setErrors(validationErrors);
    
    // Check if there are any errors
    if (hasFormErrors(validationErrors)) {
      return; // Don't submit if there are validation errors
    }
    
    dispatch(createReceptionistPatient(formData));
  };

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard/receptionist/patients')}
              className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </button>
            <h1 className="text-md font-bold text-slate-800 mb-2">
              Add Patient
            </h1>
            <p className="text-slate-600 text-sm">
              Choose how to add the patient - new patient or existing appointment
            </p>
          </div>

          {/* Workflow Selection */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
              Patient Registration Method
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setWorkflowMode('existing')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  workflowMode === 'existing'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <CheckCircle2 className={`h-5 w-5 mr-2 ${workflowMode === 'existing' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className={`font-semibold ${workflowMode === 'existing' ? 'text-blue-700' : 'text-slate-700'}`}>
                    Existing Appointment
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Patient has already booked an appointment online. Use confirmation code to add them directly.
                </p>
              </button>

              <button
                onClick={() => setWorkflowMode('new')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  workflowMode === 'new'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <User className={`h-5 w-5 mr-2 ${workflowMode === 'new' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className={`font-semibold ${workflowMode === 'new' ? 'text-blue-700' : 'text-slate-700'}`}>
                    New Patient
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Patient is visiting for the first time. Create new patient record and appointment.
                </p>
              </button>
            </div>
          </div>

          {/* Appointment Lookup Section */}
          {workflowMode === 'existing' && (
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-500" />
                Lookup Existing Appointment
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmation Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="Enter 6-digit confirmation code"
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                      maxLength="6"
                    />
                    <button
                      onClick={handleLookupAppointment}
                      disabled={appointmentLoading || !confirmationCode.trim()}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {appointmentLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      {appointmentLoading ? 'Searching...' : 'Lookup'}
                    </button>
                  </div>
                  {appointmentError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {appointmentError}
                    </p>
                  )}
                </div>

                {/* Found Appointment Display */}
                {foundAppointment && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-semibold">Appointment Found!</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Patient:</span>
                        <span className="ml-2 text-slate-600">{foundAppointment.patientName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Phone:</span>
                        <span className="ml-2 text-slate-600">{foundAppointment.patientPhone}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Appointment Date:</span>
                        <span className="ml-2 text-slate-600">
                          {foundAppointment.confirmedDate 
                            ? new Date(foundAppointment.confirmedDate).toLocaleDateString()
                            : new Date(foundAppointment.preferredDate).toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Appointment Time:</span>
                        <span className="ml-2 text-slate-600">
                          {foundAppointment.confirmedTime || foundAppointment.preferredTime}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          foundAppointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {foundAppointment.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Confirmation Code:</span>
                        <span className="ml-2 text-blue-600 font-mono font-semibold">{foundAppointment.confirmationCode}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alert Messages */}
          {addSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700">Patient added successfully!</span>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-md font-semibold text-slate-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                {workflowMode === 'existing' ? 'Patient Information (Auto-filled from Appointment)' : 'Patient Information'}
              </h2>
              <p className="text-slate-600 mt-1 text-sm">
                {workflowMode === 'existing' 
                  ? 'Patient details are pre-filled from the appointment. You can modify if needed.'
                  : 'Fill in the patient details below'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={(e) => {
                      setTimeout(() => setShowSuggestions(false), 200);
                      handleBlur(e);
                    }}
                    onFocus={() => {
                      if (formData.name.length >= 2 && nameSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    required
                    readOnly={workflowMode === 'existing' && foundAppointment}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                      touched.name && errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : workflowMode === 'existing' && foundAppointment
                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter patient's full name"
                    autoComplete="off"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-11">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2 bg-blue-50 border-b border-blue-100">
                        <p className="text-xs font-semibold text-blue-700">Found {nameSuggestions.length} appointment(s)</p>
                      </div>
                      {nameSuggestions.map((appointment) => (
                        <button
                          key={appointment._id}
                          type="button"
                          onClick={() => handleSelectSuggestion(appointment)}
                          className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-500" />
                                {appointment.patientName}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  appointment.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Phone className="h-3 w-3" />
                                  {appointment.patientPhone}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Calendar className="h-3 w-3" />
                                  {appointment.confirmedDate 
                                    ? new Date(appointment.confirmedDate).toLocaleDateString() 
                                    : new Date(appointment.preferredDate).toLocaleDateString()
                                  } at {appointment.confirmedTime || appointment.preferredTime}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                                  <span>Code: {appointment.confirmationCode}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-2">
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    min="0"
                    max="150"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                      touched.age && errors.age 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter age"
                  />
                  {touched.age && errors.age && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                      touched.gender && errors.gender 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gender}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                      touched.contact && errors.contact 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter contact number"
                  />
                  {touched.contact && errors.contact && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                      touched.email && errors.email 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter email address"
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-500" />
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
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed text-sm"
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
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed text-sm"
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
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-blue-50 text-blue-700 cursor-not-allowed text-sm font-medium"
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
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    Assigned Doctor
                  </label>
                  <select
                    name="assignedDoctor"
                    value={formData.assignedDoctor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  >
                    <option value="">Select doctor</option>
                    {doctorLoading ? (
                      <option value="" disabled>Loading doctors...</option>
                    ) : doctorError ? (
                      <option value="" disabled>Error loading doctors</option>
                    ) : (
                      doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization || 'General'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                    touched.address && errors.address 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-200'
                  }`}
                  placeholder="Enter complete address"
                />
                {touched.address && errors.address && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/receptionist/patients')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </button>
                
                {workflowMode === 'existing' && foundAppointment ? (
                  <button
                    type="button"
                    onClick={handleAddExistingAppointment}
                    disabled={loading || !foundAppointment}
                    className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                      loading || !foundAppointment
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding Patient...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Add Existing Appointment
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || hasFormErrors(errors)}
                    className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                      loading || hasFormErrors(errors)
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding Patient...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Add New Patient
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );
}
