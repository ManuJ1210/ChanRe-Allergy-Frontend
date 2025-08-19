import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTestRequest, fetchTestRequests } from '../../features/doctor/doctorThunks';
import API from '../../services/api';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Save,
  X
} from 'lucide-react';

const NewTestRequest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientAddress: '',
    testType: '',
    testDescription: '',
    urgency: 'Normal',
    notes: ''
  });

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const userId = user._id || user.id;
      const response = await API.get(`/patients/doctor/${userId}`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient._id,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientAddress: patient.address
    }));
    setShowPatientModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.testType) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const requestData = {
        doctorId: user._id || user.id,
        patientId: formData.patientId,
        testType: formData.testType,
        testDescription: formData.testDescription,
        urgency: formData.urgency,
        notes: formData.notes
      };

      const result = await dispatch(createTestRequest(requestData)).unwrap();
      
      
      
      // Show success message
      setSuccessMessage(`Test request for ${formData.patientName} has been sent to the lab successfully!`);
      
      // Refresh test requests data
      dispatch(fetchTestRequests());
      
      // Navigate to test requests page after a short delay
      setTimeout(() => {
        navigate('/dashboard/doctor/test-requests');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating test request:', error);
      alert('Failed to send test request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'Urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Normal': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'Emergency': return <AlertTriangle className="text-red-500" />;
      case 'Urgent': return <Clock className="text-orange-500" />;
      case 'Normal': return <CheckCircle className="text-green-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/doctor/test-requests')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Requests
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">New Test Request</h1>
            <p className="text-slate-600">Send a test request to the central lab</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Patient *
              </label>
              {selectedPatient ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{selectedPatient.name}</div>
                      <div className="text-xs text-slate-600">
                        {selectedPatient.phone} • {selectedPatient.age} years • {selectedPatient.gender}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setFormData(prev => ({
                        ...prev,
                        patientId: '',
                        patientName: '',
                        patientPhone: '',
                        patientAddress: ''
                      }));
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPatientModal(true)}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <User className="h-5 w-5 mx-auto mb-2" />
                  Select Patient
                </button>
              )}
            </div>

            {/* Test Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Test Type *
                </label>
                <input
                  type="text"
                  name="testType"
                  value={formData.testType}
                  onChange={handleInputChange}
                  placeholder="e.g., Blood Test, Allergy Test, Skin Test"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Test Description
              </label>
              <textarea
                name="testDescription"
                value={formData.testDescription}
                onChange={handleInputChange}
                placeholder="Describe the specific tests or procedures needed..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information or special instructions..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Request Summary */}
            {selectedPatient && formData.testType && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-medium text-slate-800 mb-3">Request Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-600">Patient:</span>
                    <span className="ml-2 font-medium">{formData.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Test Type:</span>
                    <span className="ml-2 font-medium">{formData.testType}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Urgency:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(formData.urgency)}`}>
                      {formData.urgency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Status:</span>
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/doctor/test-requests')}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedPatient || !formData.testType}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Send to Lab
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Patient Selection Modal */}
        {showPatientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800">Select Patient</h3>
                  <button
                    onClick={() => setShowPatientModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No patients found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient._id}
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full p-4 text-left border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{patient.name}</div>
                              <div className="text-xs text-slate-600">
                                {patient.phone} • {patient.age} years • {patient.gender}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTestRequest; 