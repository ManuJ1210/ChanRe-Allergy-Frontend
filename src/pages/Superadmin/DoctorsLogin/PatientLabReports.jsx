import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Eye, 
  MessageSquare,
  AlertCircle,
  RefreshCw,
  FileText,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { 
  fetchSuperAdminDoctorPatientById,
  fetchSuperAdminDoctorPatientLabReports,
  sendFeedbackToCenterDoctor
} from '../../../features/superadmin/superAdminDoctorSlice';

const PatientLabReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  const { 
    singlePatient: patient,
    patientLabReports: labReports,
    dataLoading, 
    dataError
  } = useSelector((state) => state.superAdminDoctors);

  const [feedbackModal, setFeedbackModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    if (patientId) {
      console.log('🔍 PatientLabReports: Fetching data for patientId:', patientId);
      
      // Check if the patientId is valid by trying to fetch it
      dispatch(fetchSuperAdminDoctorPatientById(patientId))
        .then((result) => {
          if (result.error) {
            console.log('⚠️ Invalid patient ID, redirecting to patients list');
            navigate('/dashboard/superadmin/doctor/patients');
            return;
          }
          dispatch(fetchSuperAdminDoctorPatientLabReports(patientId));
        })
        .catch((error) => {
          console.log('⚠️ Error fetching patient, redirecting to patients list');
          navigate('/dashboard/superadmin/doctor/patients');
        });
    }
  }, [dispatch, patientId, navigate]);

  useEffect(() => {
    console.log('📊 PatientLabReports: patient state:', patient);
    console.log('📊 PatientLabReports: labReports state:', labReports);
  }, [patient, labReports]);

  const handleBack = () => {
    navigate('/dashboard/superadmin/doctor/patients');
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

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-sm font-semibold text-red-800">Error Loading Patient Data</h3>
            </div>
            <p className="text-red-700 mb-4 text-xs">{dataError}</p>
            <button
              onClick={handleBack}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-xs"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-sm font-semibold text-yellow-800">Patient Not Found</h3>
            </div>
            <p className="text-yellow-700 mb-4 text-xs">
              The patient with ID "{patientId}" was not found. Please check the URL and try again.
            </p>
            <button
              onClick={handleBack}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-xs"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-md font-bold text-gray-900">Lab Reports</h1>
                <p className="text-gray-600 mt-1 text-xs">Review and provide feedback on laboratory reports</p>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch(fetchSuperAdminDoctorPatientById(patientId));
                dispatch(fetchSuperAdminDoctorPatientLabReports(patientId));
              }}
              disabled={dataLoading}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-red-700 flex items-center shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {dataError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center shadow-sm">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <span className="text-red-700 font-medium text-xs">{dataError}</span>
          </div>
        )}

        {/* Patient Info */}
        {patient && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{patient.name}</h2>
                  <div className="flex items-center space-x-4 text-gray-600 mt-1 text-xs">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {patient.age} years, {patient.gender}
                    </span>
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {patient.centerId?.name || 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {patient.assignedDoctor?.name || 'Not assigned'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total Reports</div>
                <div className="text-xl font-bold text-orange-600">{labReports?.length || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Lab Reports */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Laboratory Reports</h2>
                <p className="text-gray-600 mt-1 text-xs">All test results, reports, and analysis</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                  {labReports?.length || 0} Reports
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!labReports || labReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No Lab Reports Found</h3>
                <p className="text-gray-500 max-w-md mx-auto text-xs">
                  No laboratory reports found for this patient. Reports will appear here once tests are completed.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {labReports.map((report, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-xs">{report.testType}</h4>
                          <p className="text-xs text-gray-500">Created on {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          report.status === 'Report_Generated' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'Report_Sent' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        <button
                          onClick={() => handleSendFeedback(report)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-xs"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Send Feedback
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Test Description:</span>
                        <p className="text-gray-800 mt-1">{report.testDescription || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Urgency:</span>
                        <p className="text-gray-800 mt-1">{report.urgency || 'Normal'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-600">Created:</span>
                        <p className="text-gray-800 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                      {report.doctorId && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Requested By:</span>
                          <p className="text-gray-800 mt-1">{report.doctorId.name}</p>
                        </div>
                      )}
                      {report.assignedLabStaffId && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Lab Staff:</span>
                          <p className="text-gray-800 mt-1">{report.assignedLabStaffId.name}</p>
                        </div>
                      )}
                      {report.sampleCollectorId && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Sample Collector:</span>
                          <p className="text-gray-800 mt-1">{report.sampleCollectorId.name}</p>
                        </div>
                      )}
                      {report.labTechnicianId && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Lab Technician:</span>
                          <p className="text-gray-800 mt-1">{report.labTechnicianId.name}</p>
                        </div>
                      )}
                      {report.sampleCollectionScheduledDate && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Sample Collection Scheduled:</span>
                          <p className="text-gray-800 mt-1">{new Date(report.sampleCollectionScheduledDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {report.sampleCollectionActualDate && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Sample Collected:</span>
                          <p className="text-gray-800 mt-1">{new Date(report.sampleCollectionActualDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {report.testingStartDate && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Testing Started:</span>
                          <p className="text-gray-800 mt-1">{new Date(report.testingStartDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {report.testingEndDate && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Testing Completed:</span>
                          <p className="text-gray-800 mt-1">{new Date(report.testingEndDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {report.reportGeneratedDate && (
                        <div className="bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Report Generated:</span>
                          <p className="text-gray-800 mt-1">{new Date(report.reportGeneratedDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {report.notes && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Notes:</span>
                          <p className="text-gray-800 mt-1">{report.notes}</p>
                        </div>
                      )}
                      {report.testResults && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Test Results:</span>
                          <p className="text-gray-800 mt-1">{report.testResults}</p>
                        </div>
                      )}
                      {report.resultDetails && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Result Details:</span>
                          <p className="text-gray-800 mt-1">{report.resultDetails}</p>
                        </div>
                      )}
                      {report.reportSummary && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Report Summary:</span>
                          <p className="text-gray-800 mt-1">{report.reportSummary}</p>
                        </div>
                      )}
                      {report.clinicalInterpretation && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Clinical Interpretation:</span>
                          <p className="text-gray-800 mt-1">{report.clinicalInterpretation}</p>
                        </div>
                      )}
                      {report.conclusion && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Conclusion:</span>
                          <p className="text-gray-800 mt-1">{report.conclusion}</p>
                        </div>
                      )}
                      {report.recommendations && (
                        <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                          <span className="font-medium text-gray-600">Recommendations:</span>
                          <p className="text-gray-800 mt-1">{report.recommendations}</p>
                        </div>
                      )}
                      
                      {/* PDF Information */}
                      {report.hasPdf && (
                        <div className="md:col-span-2 lg:col-span-3 bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-blue-800 text-xs">PDF Report Available</span>
                              <p className="text-xs text-blue-600 mt-1">
                                Generated on {report.reportGeneratedDate ? new Date(report.reportGeneratedDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={() => window.open(`/api/files/${report.pdfFile}`, '_blank')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-xs"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View PDF
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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

export default PatientLabReports;
