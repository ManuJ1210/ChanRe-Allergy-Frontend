import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { 
  ArrowLeft, 
  Activity,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Eye,
  UserCheck,
  MapPin,
  Phone,
  Stethoscope,
  TestTube,
  Download,
  Play,
  StopCircle,
  Send
} from 'lucide-react';

const TestRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [testRequest, setTestRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTestRequestDetails();
    }
  }, [id]);

  const fetchTestRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/test-requests/${id}`);
      setTestRequest(response.data);
    } catch (error) {
      console.error('Error fetching test request details:', error);
      setError('Failed to load test request details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `test-request-${id}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Assigned':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Sample_Collection_Scheduled':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Sample_Collected':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'In_Lab_Testing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Testing_Completed':
        return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'Report_Generated':
        return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'Report_Sent':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Urgent':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Normal':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Test Request</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate('/dashboard/lab/test-requests')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Test Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!testRequest) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">No Test Request Found</h2>
              <p className="text-gray-600 mb-4">The requested test request could not be found.</p>
              <button
                onClick={() => navigate('/dashboard/lab/test-requests')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Test Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/lab/test-requests')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Test Request Details</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Record Header */}
          <div className="text-center mb-8">
            <h1 className="text-md font-bold text-gray-800 mb-2">LABORATORY TEST REQUEST</h1>
            <p className="text-xs text-gray-600">Medical Test Request Record</p>
          </div>
          
          {/* Test Request Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Test Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Request ID</label>
                <p className="text-gray-900 font-medium">{testRequest._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Request Date</label>
                <p className="text-gray-900 font-medium">
                  {testRequest.createdAt ? new Date(testRequest.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 font-medium">
                  {testRequest.updatedAt ? new Date(testRequest.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Status and Urgency */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Status & Priority
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Current Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(testRequest.status)}`}>
                  {testRequest.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Urgency Level</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(testRequest.urgency)}`}>
                  {testRequest.urgency}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Patient Name</label>
                    <p className="text-gray-900 font-medium">{testRequest.patientName || testRequest.patientId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Patient ID</label>
                    <p className="text-gray-900 font-medium">{testRequest.patientId && typeof testRequest.patientId === 'object' ? testRequest.patientId._id || 'N/A' : testRequest.patientId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Patient Phone</label>
                    <p className="text-gray-900 font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {testRequest.patientPhone || testRequest.patientId?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Patient Address</label>
                    <p className="text-gray-900 font-medium flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      {testRequest.patientAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Center</label>
                    <p className="text-gray-900 font-medium">{testRequest.centerName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
              Requesting Doctor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500">Doctor Name</label>
                <p className="text-gray-900 font-medium">{testRequest.doctorName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Doctor ID</label>
                <p className="text-gray-900 font-medium">{testRequest.doctorId && typeof testRequest.doctorId === 'object' ? testRequest.doctorId._id || 'N/A' : testRequest.doctorId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <TestTube className="h-5 w-5 mr-2 text-blue-600" />
              Test Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Test Type</label>
                <p className="text-gray-900 font-medium">{testRequest.testType || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Test Description</label>
                <p className="text-gray-900">{testRequest.testDescription || 'N/A'}</p>
              </div>
              {testRequest.testNotes && (
                <div>
                  <label className="block text-xs font-medium text-gray-500">Additional Notes</label>
                  <p className="text-gray-900">
                    {typeof testRequest.testNotes === 'object' 
                      ? JSON.stringify(testRequest.testNotes, null, 2) 
                      : testRequest.testNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sample Collection Details */}
          {(testRequest.sampleCollectorId || testRequest.sampleCollectorName) && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Sample Collection Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Sample Collector</label>
                      <p className="text-gray-900 font-medium">{testRequest.sampleCollectorName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Scheduled Date</label>
                      <p className="text-gray-900 font-medium">
                        {testRequest.sampleCollectionScheduledDate ? 
                          new Date(testRequest.sampleCollectionScheduledDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Collection Status</label>
                      <p className="text-gray-900 font-medium">{testRequest.sampleCollectionStatus || 'Not Started'}</p>
                    </div>
                    {testRequest.sampleCollectionNotes && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Collection Notes</label>
                        <p className="text-gray-900">
                          {typeof testRequest.sampleCollectionNotes === 'object' 
                            ? JSON.stringify(testRequest.sampleCollectionNotes, null, 2) 
                            : testRequest.sampleCollectionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lab Testing Details */}
          {(testRequest.labStaffId || testRequest.labStaffName) && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <TestTube className="h-5 w-5 mr-2 text-blue-600" />
                Lab Testing Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Lab Staff</label>
                      <p className="text-gray-900 font-medium">{testRequest.labStaffName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Testing Started</label>
                      <p className="text-gray-900 font-medium">
                        {testRequest.labTestingStartedDate ? 
                          new Date(testRequest.labTestingStartedDate).toLocaleDateString() : 'Not Started'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Testing Completed</label>
                      <p className="text-gray-900 font-medium">
                        {testRequest.labTestingCompletedDate ? 
                          new Date(testRequest.labTestingCompletedDate).toLocaleDateString() : 'Not Completed'}
                      </p>
                    </div>
                    {testRequest.labTestingNotes && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Testing Notes</label>
                        <p className="text-gray-900">
                          {typeof testRequest.labTestingNotes === 'object' 
                            ? JSON.stringify(testRequest.labTestingNotes, null, 2) 
                            : testRequest.labTestingNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testRequest.testResults && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                Test Results
              </h2>
              <div className="bg-white rounded-lg p-4 border">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {typeof testRequest.testResults === 'object' 
                    ? JSON.stringify(testRequest.testResults, null, 2) 
                    : testRequest.testResults}
                </p>
              </div>
            </div>
          )}

          {/* Report Information */}
          {testRequest.reportGeneratedDate && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Report Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Report Generated</label>
                      <p className="text-gray-900 font-medium">
                        {new Date(testRequest.reportGeneratedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Report Sent</label>
                      <p className="text-gray-900 font-medium">
                        {testRequest.reportSentDate ? 
                          new Date(testRequest.reportSentDate).toLocaleDateString() : 'Not Sent'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    {testRequest.reportFilePath && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Report File</label>
                        <button className="flex items-center text-blue-600 hover:text-blue-700">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </button>
                      </div>
                    )}
                    {testRequest.reportNotes && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Report Notes</label>
                        <p className="text-gray-900">
                  {typeof testRequest.reportNotes === 'object' 
                    ? JSON.stringify(testRequest.reportNotes, null, 2) 
                    : testRequest.reportNotes}
                </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => navigate('/dashboard/lab/test-requests')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Test Requests
            </button>
            
            {/* Conditional action buttons based on status */}
            {/* Show Schedule Collection button if no collection has been scheduled yet */}
            {!testRequest.sampleCollectionScheduledDate && (
              <button
                onClick={() => navigate(`/dashboard/lab/schedule-collection/${id}`)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Collection
              </button>
            )}
            
            {testRequest.status === 'Sample_Collection_Scheduled' && (
              <button
                onClick={() => navigate(`/dashboard/lab/update-status/${id}`)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Collection
              </button>
            )}
            
            {testRequest.status === 'Sample_Collected' && (
              <button
                onClick={() => navigate(`/dashboard/lab/start-testing/${id}`)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Start Testing
              </button>
            )}
            
            {testRequest.status === 'In_Lab_Testing' && (
              <button
                onClick={() => navigate(`/dashboard/lab/complete-testing/${id}`)}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Complete Testing
              </button>
            )}
            
            {testRequest.status === 'Testing_Completed' && (
              <button
                onClick={() => navigate(`/dashboard/lab/generate-report/${id}`)}
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            )}
            
            {testRequest.status === 'Report_Generated' && (
              <button
                onClick={() => navigate(`/dashboard/lab/send-report/${id}`)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRequestDetails; 