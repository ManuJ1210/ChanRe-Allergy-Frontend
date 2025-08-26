import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAssignedPatients, createTestRequest } from '../../features/doctor/doctorThunks';
import { 
  ArrowLeft, 
  Plus, 
  User, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle,
  Save,
  Search,
  Loader2,
  X
} from 'lucide-react';

const AddTestRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: pathPatientId } = useParams();
  const dispatch = useDispatch();
  
  // Extract patient ID from URL query parameters or path parameters
  const queryParams = new URLSearchParams(location.search);
  const queryPatientId = queryParams.get('patientId');
  const preSelectedPatientId = queryPatientId || pathPatientId;
  
  // State for form data
  const [formData, setFormData] = useState({
    patientId: '',
    testType: '',
    testDescription: '',
    urgency: 'Normal',
    notes: ''
  });
  
  // State for patient search
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  // Get patients from Redux store
  const { assignedPatients, patientsLoading, patientsError } = useSelector((state) => state.doctor);
  
  // Fetch patients when component mounts
  useEffect(() => {
    dispatch(fetchAssignedPatients());
  }, [dispatch]);
  
  // Ref to track which patients we've already shown toast for
  const shownToastForPatientRef = useRef(new Set());
  
  // Pre-select patient if patientId is provided in URL
  useEffect(() => {
    console.log('🔍 Pre-selection effect triggered:', { preSelectedPatientId, assignedPatientsLength: assignedPatients?.length });
    
    if (preSelectedPatientId && assignedPatients && assignedPatients.length > 0) {
      const patient = assignedPatients.find(p => p._id === preSelectedPatientId);
      console.log('🔍 Found patient:', patient);
      
      if (patient) {
        // Check if patient has pending billing
        if (patient.billingStatus === 'pending') {
          toast.warning(`Cannot select ${patient.name}. Billing is pending for their test request.`);
          return;
        }
        
        // Pre-select the patient
        setFormData(prev => ({
          ...prev,
          patientId: patient._id,
          patientName: patient.name
        }));
        setSearchTerm(patient.name);
        
        // Only show toast once per patient (using patient ID as key)
        if (!shownToastForPatientRef.current.has(patient._id)) {
          toast.success(`Patient ${patient.name} pre-selected for test request`);
          shownToastForPatientRef.current.add(patient._id);
        }
        console.log('✅ Patient pre-selected successfully');
      } else {
        console.log('❌ Patient not found in assigned patients');
        toast.error('Patient not found or not assigned to you');
        // Clear the invalid patient ID from the URL
        navigate('/dashboard/doctor/add-test-request', { replace: true });
      }
    } else {
      console.log('🔍 Pre-selection conditions not met:', { 
        hasPatientId: !!preSelectedPatientId, 
        hasAssignedPatients: !!assignedPatients, 
        assignedPatientsLength: assignedPatients?.length 
      });
    }
  }, [preSelectedPatientId, assignedPatients, navigate]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle patient selection
  const handlePatientSelect = (patient) => {
    // ✅ NEW: Prevent selection of patients with pending billing
    if (patient.billingStatus === 'pending') {
      toast.warning(`Cannot select ${patient.name}. Billing is pending for their test request.`);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      patientId: patient._id,
      patientName: patient.name
    }));
    setShowPatientList(false);
    setSearchTerm(patient.name);
  };
  
  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm && assignedPatients) {
      const filtered = assignedPatients.filter(patient =>
        // Only show patients with clear billing status
        patient.billingStatus === 'clear' && (
          patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, assignedPatients]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!formData.testType.trim()) {
      toast.error('Please enter a test type');
      return;
    }
    
    if (!formData.testDescription.trim()) {
      toast.error('Please enter a test description');
      return;
    }
    
    try {
      // Create test request using the existing thunk
      await dispatch(createTestRequest(formData)).unwrap();
      toast.success('Test request created successfully!');
      navigate('/dashboard/doctor/test-requests');
    } catch (error) {
      toast.error(error.message || 'Failed to create test request. Please try again.');
      console.error('Error creating test request:', error);
    }
  };
  
  // Get urgency color and icon
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-100 text-red-700 border-red-200';
      case 'Urgent': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Normal': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'Emergency': return <AlertCircle className="h-4 w-4" />;
      case 'Urgent': return <Clock className="h-4 w-4" />;
      case 'Normal': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };
  
  // Show loading state while fetching patients
  if (patientsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">
            {preSelectedPatientId ? 'Loading patients and pre-selecting patient...' : 'Loading patients...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Show error state if patients failed to load
  if (patientsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load patients</p>
          <button
            onClick={() => dispatch(fetchAssignedPatients())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/doctor/test-requests')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Requests
          </button>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Create New Test Request
            {formData.patientName && (
              <span className="text-lg font-normal text-slate-600 ml-2">
                for {formData.patientName}
              </span>
            )}
          </h1>
          <p className="text-slate-600">
            Request laboratory tests for your patients
          </p>
          
          {/* ✅ NEW: Billing requirement warning */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Important Note</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Patients with pending billing for test requests cannot be selected. 
                  The receptionist must complete the billing process before a new test request can be created.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Patient <span className="text-red-500">*</span>
                {preSelectedPatientId && formData.patientId && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pre-selected
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="flex items-center border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <Search className="h-4 w-4 text-slate-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search for patient by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowPatientList(true);
                    }}
                    onFocus={() => setShowPatientList(true)}
                    className="flex-1 px-3 py-3 border-0 focus:ring-0 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPatientList(!showPatientList)}
                    className="px-3 py-3 text-slate-400 hover:text-slate-600"
                  >
                    <User className="h-4 w-4" />
                  </button>
                  {formData.patientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, patientId: '', patientName: '' }));
                        setSearchTerm('');
                        // Remove patient ID from toast tracking so it can show again if re-selected
                        if (formData.patientId) {
                          shownToastForPatientRef.current.delete(formData.patientId);
                        }
                      }}
                      className="px-3 py-3 text-slate-400 hover:text-slate-600 border-l border-slate-300"
                      title="Clear patient selection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Patient List Dropdown */}
                {showPatientList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchTerm ? (
                      // Show filtered patients when searching
                      filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient._id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            disabled={patient.billingStatus === 'pending'}
                            className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-b-0 ${
                              patient.billingStatus === 'pending' 
                                ? 'bg-slate-100 cursor-not-allowed opacity-60' 
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-medium text-slate-800 flex items-center justify-between">
                              {patient.name}
                              {patient.billingStatus === 'pending' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Billing Pending
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">
                              {patient.phone && `Phone: ${patient.phone}`}
                              {patient.email && patient.phone && ' • '}
                              {patient.email && `Email: ${patient.email}`}
                            </div>
                            {patient.billingStatus === 'pending' && patient.pendingTestRequest && (
                              <div className="text-xs text-yellow-600 mt-1">
                                Test Request: {patient.pendingTestRequest.status} • Amount: ₹{patient.pendingTestRequest.amount}
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-slate-500 text-sm">
                          {assignedPatients.some(p => 
                            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.phone?.includes(searchTerm) ||
                            p.email?.toLowerCase().includes(searchTerm.toLowerCase())
                          ) ? (
                            'All matching patients have pending billing for test requests'
                          ) : (
                            `No patients found matching "${searchTerm}"`
                          )}
                        </div>
                      )
                    ) : (
                      // Show all patients when no search term
                      assignedPatients.filter(p => p.billingStatus === 'clear').length > 0 ? (
                        assignedPatients.filter(p => p.billingStatus === 'clear').map((patient) => (
                          <button
                            key={patient._id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            disabled={patient.billingStatus === 'pending'}
                            className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-b-0 ${
                              patient.billingStatus === 'pending' 
                                ? 'bg-slate-100 cursor-not-allowed opacity-60' 
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-medium text-slate-800 flex items-center justify-between">
                              {patient.name}
                              {patient.billingStatus === 'pending' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Billing Pending
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">
                              {patient.phone && `Phone: ${patient.phone}`}
                              {patient.email && patient.phone && ' • '}
                              {patient.email && `Email: ${patient.email}`}
                            </div>
                            {patient.billingStatus === 'pending' && patient.pendingTestRequest && (
                              <div className="text-xs text-yellow-600 mt-1">
                                Test Request: {patient.pendingTestRequest.status} • Amount: ₹{patient.pendingTestRequest.amount}
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-slate-500 text-sm">
                          {assignedPatients.length === 0 ? (
                            'No patients assigned to you yet'
                          ) : (
                            'All assigned patients have pending billing for test requests'
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
                
                {/* Selected Patient Display */}
                {formData.patientName && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">
                        Selected: {formData.patientName}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Patient Count Info */}
                <div className="mt-2 text-xs text-slate-500">
                  {assignedPatients.filter(p => p.billingStatus === 'clear').length} of {assignedPatients.length} patient{assignedPatients.length !== 1 ? 's' : ''} available for test requests
                  {assignedPatients.filter(p => p.billingStatus === 'pending').length > 0 && (
                    <span className="text-yellow-600 ml-2">
                      • {assignedPatients.filter(p => p.billingStatus === 'pending').length} with pending billing
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Test Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Test Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="testType"
                value={formData.testType}
                onChange={handleInputChange}
                placeholder="e.g., Blood Test, Allergy Panel, CBC, etc."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Test Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Test Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="testDescription"
                value={formData.testDescription}
                onChange={handleInputChange}
                placeholder="Provide detailed description of the tests required..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Normal', 'Urgent', 'Emergency'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                    className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                      formData.urgency === level
                        ? getUrgencyColor(level)
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {getUrgencyIcon(level)}
                    <span className="font-medium">{level}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information, special instructions, or clinical context..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/doctor/test-requests')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Test Request
              </button>
            </div>
          </form>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-blue-800 font-medium mb-2">How Test Requests Work</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Your test request will be reviewed by the superadmin</li>
                <li>• Once approved, it will be assigned to lab staff</li>
                <li>• You'll receive updates on the testing progress</li>
                <li>• Final reports will be available for download</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTestRequest;
