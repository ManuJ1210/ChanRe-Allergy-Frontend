import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../../services/api';
import { 
  ArrowLeft, 
  Activity,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  UserCheck,
  MapPin,
  Phone,
  Stethoscope,
  TestTube,
  Download,
  Eye,
  Clock,
  Calendar,
  Mail,
  Building,
  AlertTriangle
} from 'lucide-react';

const TestRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [testRequest, setTestRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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

  // PDF handling functions
  const handleViewPDF = async () => {
    try {
      setPdfLoading(true);
      setError(null);
      
      const response = await API.get(`/test-requests/download-report/${id}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      
      let pdfBlob;
      if (contentType && contentType.includes('application/pdf')) {
        pdfBlob = response.data;
      } else {
        // Handle text/JSON response that needs conversion
        let pdfContent = response.data;
        if (typeof pdfContent === 'object' && pdfContent.pdfContent) {
          pdfContent = pdfContent.pdfContent;
        }
        
        const cleanedPdfContent = pdfContent
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .replace(/\\"/g, '"');
        
        const byteCharacters = cleanedPdfContent;
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
      }
      
      // Open PDF in new tab for viewing
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('Error viewing PDF:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again to view reports.');
      } else if (error.response?.status === 404) {
        setError('Report not found. The report may not have been generated yet.');
      } else {
        setError('Failed to view report. Please try again.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      setError(null);
      
      const response = await API.get(`/test-requests/download-report/${id}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      
      let pdfBlob;
      if (contentType && contentType.includes('application/pdf')) {
        pdfBlob = response.data;
      } else {
        // Handle text/JSON response that needs conversion
        let pdfContent = response.data;
        if (typeof pdfContent === 'object' && pdfContent.pdfContent) {
          pdfContent = pdfContent.pdfContent;
        }
        
        const cleanedPdfContent = pdfContent
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .replace(/\\"/g, '"');
        
        const byteCharacters = cleanedPdfContent;
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
      }
      
      // Download the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again to download reports.');
      } else if (error.response?.status === 404) {
        setError('Report not found. The report may not have been generated yet.');
      } else {
        setError('Failed to download report. Please try again.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Superadmin_Review':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Superadmin_Approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Superadmin_Rejected':
        return 'text-red-600 bg-red-50 border-red-200';
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

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Urgent':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
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

  if (error && !testRequest) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Error Loading Test Request</h2>
              <p className="text-gray-600 mb-4 text-xs">{error}</p>
              <button
                onClick={() => navigate('/dashboard/centeradmin/test-requests')}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
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
      <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-sm font-semibold text-gray-800 mb-2">No Test Request Found</h2>
              <p className="text-gray-600 mb-4 text-xs">The requested test request could not be found.</p>
              <button
                onClick={() => navigate('/dashboard/centeradmin/test-requests')}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
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
      <div className="max-w-5xl mx-auto p-2 sm:p-3 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard/centeradmin/test-requests')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
              >
                <ArrowLeft size={20} />
                <span>Back to Test Requests</span>
              </button>
              <h1 className="text-md font-bold text-gray-800">Test Request Details</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          {/* Record Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-md font-bold text-gray-800 mb-2">TEST REQUEST DETAILS</h1>
            <p className="text-gray-600 text-xs">Complete Information About This Test Request</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800 text-xs">{error}</p>
              </div>
            </div>
          )}
          
          {/* Test Request Information */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Test Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Request ID</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Status</label>
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(testRequest.status)}`}>
                  {testRequest.status?.replace(/_/g, ' ') || 'N/A'}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Urgency</label>
                <div className="flex items-center">
                  {getUrgencyIcon(testRequest.urgency)}
                  <span className={`ml-2 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(testRequest.urgency)}`}>
                    {testRequest.urgency || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Workflow Stage Information */}
            {testRequest.workflowStage && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block text-xs font-medium text-gray-500 mb-2">Workflow Stage</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white rounded-lg p-3">
                    <span className="text-xs font-medium text-blue-600 capitalize">
                      {testRequest.workflowStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Superadmin Review Information */}
          {testRequest.superadminReview && (
            <div className="bg-yellow-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-600" />
                Superadmin Review Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Review Status</label>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${
                    testRequest.superadminReview.status === 'approved' ? 'text-green-600 bg-green-50 border-green-200' :
                    testRequest.superadminReview.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-200' :
                    testRequest.superadminReview.status === 'requires_changes' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                    'text-yellow-600 bg-yellow-50 border-yellow-200'
                  }`}>
                    {testRequest.superadminReview.status?.replace(/_/g, ' ') || 'Pending'}
                  </span>
                </div>
                {testRequest.superadminReview.reviewedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Reviewed At</label>
                    <p className="text-gray-900 font-medium text-xs flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(testRequest.superadminReview.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {testRequest.superadminReview.reviewNotes && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500">Review Notes</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.superadminReview.reviewNotes}</p>
                  </div>
                )}
                {testRequest.superadminReview.additionalTests && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500">Additional Tests Recommended</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.superadminReview.additionalTests}</p>
                  </div>
                )}
                {testRequest.superadminReview.patientInstructions && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500">Patient Instructions</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.superadminReview.patientInstructions}</p>
                  </div>
                )}
                {testRequest.superadminReview.changesRequired && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500">Changes Required</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.superadminReview.changesRequired}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.patientName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Phone</label>
                <p className="text-gray-900 font-medium flex items-center text-xs">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {testRequest.patientPhone || testRequest.patientId?.phone || 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500">Patient Address</label>
                <p className="text-gray-900 font-medium flex items-center text-xs">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  {testRequest.patientAddress || testRequest.patientId?.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Doctor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500">Doctor Name</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.doctorName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Doctor Phone</label>
                <p className="text-gray-900 font-medium flex items-center text-xs">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {testRequest.doctorId?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Information */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Center Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500">Center Name</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.centerName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Center Code</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.centerCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <TestTube className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              Test Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500">Test Type</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.testType || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Test Description</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.testDescription || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Requested Date</label>
                <p className="text-gray-900 font-medium flex items-center text-xs">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {testRequest.createdAt ? new Date(testRequest.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Notes</label>
                <p className="text-gray-900 font-medium text-xs">{testRequest.notes || 'No notes'}</p>
              </div>
            </div>
          </div>

          {/* Lab Information */}
          {testRequest.assignedLabStaffName && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Lab Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Assigned Lab Staff</label>
                  <p className="text-gray-900 font-medium text-xs">{testRequest.assignedLabStaffName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Lab Staff Phone</label>
                  <p className="text-gray-900 font-medium flex items-center text-xs">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {testRequest.assignedLabStaffId?.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Information */}
          {testRequest.reportGeneratedDate ? (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Report Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Report Generated</label>
                  <p className="text-gray-900 font-medium flex items-center text-xs">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {new Date(testRequest.reportGeneratedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Generated By</label>
                  <p className="text-gray-900 font-medium text-xs">{testRequest.reportGeneratedByName || 'N/A'}</p>
                </div>
                {testRequest.reportSentDate && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Report Sent</label>
                    <p className="text-gray-900 font-medium flex items-center text-xs">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(testRequest.reportSentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {testRequest.reportSentByName && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Sent By</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.reportSentByName || 'N/A'}</p>
                  </div>
                )}
              </div>
              
              {/* PDF Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-medium text-gray-700 mb-3">PDF Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleViewPDF}
                    disabled={pdfLoading}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    {pdfLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View PDF
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    {pdfLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* PDF Actions - Always visible even when no report is generated */
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                PDF Actions
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleViewPDF}
                  disabled={pdfLoading}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  {pdfLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View PDF
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                >
                  {pdfLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Note: PDF will only be available if a report has been generated for this test request.
              </p>
            </div>
          )}

          {/* Test Results */}
          {testRequest.testResults && testRequest.testResults !== 'Pending' && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Test Results
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Results</label>
                  <p className="text-gray-900 font-medium text-xs">{testRequest.testResults || 'N/A'}</p>
                </div>
                {testRequest.conclusion && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Conclusion</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.conclusion}</p>
                  </div>
                )}
                {testRequest.recommendations && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Recommendations</label>
                    <p className="text-gray-900 font-medium text-xs">{testRequest.recommendations}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/dashboard/centeradmin/test-requests')}
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Back to Test Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRequestDetails;
