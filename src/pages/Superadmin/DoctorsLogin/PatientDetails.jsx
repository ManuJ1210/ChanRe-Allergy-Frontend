import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Activity, 
  Pill, 
  FileText, 
  Eye, 
  Mail, 
  UserCheck, 
  Building, 
  Stethoscope,
  MessageSquare,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  fetchSuperAdminDoctorAssignedPatients,
  fetchSuperAdminDoctorPatientById,
  fetchSuperAdminDoctorPatientHistory,
  fetchSuperAdminDoctorPatientMedications,
  fetchSuperAdminDoctorPatientFollowups,
  fetchSuperAdminDoctorPatientLabReports,
  sendFeedbackToCenterDoctor
} from '../../../features/superadmin/superAdminDoctorSlice';

const PatientDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  const { 
    assignedPatients,
    singlePatient: patient,
    patientHistory,
    patientMedications,
    patientFollowups,
    patientLabReports,
    workingLoading,
    workingError,
    dataLoading,
    dataError
  } = useSelector((state) => state.superAdminDoctors);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    dispatch(fetchSuperAdminDoctorAssignedPatients());
  }, [dispatch]);

  useEffect(() => {
    if (patientId) {
      // Check if the patientId is valid by trying to fetch it
      const checkAndFetchPatient = async () => {
        try {
          const result = await dispatch(fetchSuperAdminDoctorPatientById(patientId));
          
          // If patient not found or error occurred, redirect to first available patient
          if (result.error || !result.payload) {
            if (assignedPatients.length > 0) {
              navigate(`/dashboard/superadmin/doctor/patient/${assignedPatients[0]._id}/profile`);
            } else {
              navigate('/dashboard/superadmin/doctor/patients');
            }
            return;
          }
        } catch (error) {
          navigate('/dashboard/superadmin/doctor/patients');
        }
      };

      checkAndFetchPatient();
    }
  }, [dispatch, patientId, assignedPatients, navigate]);

  const filteredPatients = assignedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleViewProfile = (patientId) => {
    navigate(`/dashboard/superadmin/doctor/patient/${patientId}/profile`);
  };

  const handleViewLabReports = (patientId) => {
    navigate(`/dashboard/superadmin/doctor/patient/${patientId}/lab-reports`);
  };

  const handleSendFeedback = (report) => {
    setSelectedReport(report);
    setFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      alert('Please enter a feedback message');
      return;
    }

    try {
      await dispatch(sendFeedbackToCenterDoctor({
        testRequestId: selectedReport._id,
        feedback: feedbackMessage
      }));
      setFeedbackModal(false);
      setFeedbackMessage('');
      setSelectedReport(null);
      alert('Feedback sent successfully!');
    } catch (error) {
      alert('Error sending feedback: ' + error.message);
    }
  };

  if (workingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (workingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-xs">{workingError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/superadmin/doctor/dashboard')}
                className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-md font-bold text-gray-900">Patient Details</h1>
                <p className="text-gray-600 mt-1 text-xs">Review patient information and lab reports</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(fetchSuperAdminDoctorAssignedPatients())}
              disabled={workingLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${workingLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {workingError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center shadow-sm">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <span className="text-red-700 font-medium text-xs">{workingError}</span>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Patients with Completed Lab Reports</h2>
                <p className="text-gray-600 mt-1 text-xs">Patients who have completed lab tests and reports</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {filteredPatients.length} Patients
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No Patients Found</h3>
                <p className="text-gray-500 max-w-md mx-auto text-xs">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients with completed lab reports found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Center
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-xs font-medium text-gray-900">{patient.name}</div>
                              <div className="text-xs text-gray-500">{patient.age} years, {patient.gender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-900">{patient.phone}</div>
                          <div className="text-xs text-gray-500">{patient.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-900">{patient.centerId?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{patient.centerId?.code || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-900">{patient.assignedDoctor?.name || 'Not assigned'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProfile(patient._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-xs"
                            >
                              <User className="w-4 h-4 mr-1" />
                              Profile
                            </button>
                            <button
                              onClick={() => handleViewLabReports(patient._id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-xs"
                            >
                              <Activity className="w-4 h-4 mr-1" />
                              Lab Reports
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Modal */}
        {feedbackModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Send Feedback</h3>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Feedback Message</label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  rows="4"
                  placeholder="Enter your feedback for the lab report..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={submitFeedback}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-xs"
                >
                  Send Feedback
                </button>
                <button
                  onClick={() => {
                    setFeedbackModal(false);
                    setFeedbackMessage('');
                    setSelectedReport(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
