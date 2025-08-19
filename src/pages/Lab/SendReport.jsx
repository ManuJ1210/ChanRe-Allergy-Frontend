import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
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
  Save,
  Send,
  Mail,
  Download,
  Eye
} from 'lucide-react';

const SendReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [testRequest, setTestRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Simplified form state
  const [formData, setFormData] = useState({
    sendMethod: 'both', // email, system, both
    emailSubject: '',
    emailMessage: '',
    notificationMessage: '',
    sentTo: ''
  });

  useEffect(() => {
    if (id) {
      fetchTestRequestDetails();
    }
  }, [id]);

  const fetchTestRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/test-requests/${id}`);
      const testRequestData = response.data;
      setTestRequest(testRequestData);
      
      // Get doctor email from populated doctorId
      const doctorEmail = testRequestData.doctorId?.email || testRequestData.doctorEmail || 'N/A';
      const doctorName = testRequestData.doctorId?.name || testRequestData.doctorName || 'Doctor';
      
      // Pre-fill form with default values
      setFormData({
        sendMethod: 'both',
        emailSubject: `Test Report - ${testRequestData.patientName} - ${testRequestData.testType}`,
        emailMessage: `Dear Dr. ${doctorName},

Please find attached the test report for patient ${testRequestData.patientName}.

Test Details:
- Patient: ${testRequestData.patientName}
- Test Type: ${testRequestData.testType}
- Request ID: ${testRequestData._id}
- Report Generated: ${testRequestData.reportGeneratedDate ? new Date(testRequestData.reportGeneratedDate).toLocaleDateString() : 'N/A'}

The report has been completed and is ready for your review.

Best regards,
Lab Team`,
        notificationMessage: `Test report for patient ${testRequestData.patientName} (${testRequestData.testType}) has been completed and is ready for review.`,
        sentTo: doctorName
      });
    } catch (error) {
      console.error('Error fetching test request details:', error);
      setError('Failed to load test request details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const requestData = {
        sendMethod: formData.sendMethod,
        emailSubject: formData.emailSubject,
        emailMessage: formData.emailMessage,
        notificationMessage: formData.notificationMessage,
        reportSentDate: new Date().toISOString(),
        sentTo: formData.sentTo,
        deliveryConfirmation: true,
        status: 'Report_Sent'
      };

      const response = await API.put(`/test-requests/${id}/send-report`, requestData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/dashboard/lab/test-request/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending report:', error);
      setError(error.response?.data?.message || 'Failed to send report');
    } finally {
      setSaving(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await API.get(`/test-requests/${id}/download-report`, {
        responseType: 'blob', // This is crucial for binary data
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Check if response is actually PDF
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      
      if (contentType && contentType.includes('application/pdf')) {
        // Handle proper PDF response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `test-report-${testRequest._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle the current issue where PDF comes as text/JSON
        let pdfContent = response.data;
        
        // If it's a JSON response with PDF content as string
        if (typeof pdfContent === 'object' && pdfContent.pdfContent) {
          pdfContent = pdfContent.pdfContent;
        } else if (typeof pdfContent === 'string') {
          // If it's the raw PDF string you showed in your question
          pdfContent = pdfContent;
        }
        
        // Clean up the PDF string (remove JSON escape characters)
        const cleanedPdfContent = pdfContent
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .replace(/\\"/g, '"');
        
        // Convert string to binary
        const byteCharacters = cleanedPdfContent;
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Create PDF blob
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `test-report-${testRequest._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report');
    }
  };

  // Alternative function to view PDF in browser instead of downloading
  const viewReport = async () => {
    try {
      const response = await API.get(`/test-requests/${id}/download-report`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      
      let blob;
      if (contentType && contentType.includes('application/pdf')) {
        blob = new Blob([response.data], { type: 'application/pdf' });
      } else {
        // Handle text/JSON response
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
        blob = new Blob([byteArray], { type: 'application/pdf' });
      }
      
      // Open PDF in new tab for viewing
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('Error viewing report:', error);
      setError('Failed to view report');
    }
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

  if (error && !testRequest) {
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

  // Get doctor email from populated doctorId
  const doctorEmail = testRequest.doctorId?.email || testRequest.doctorEmail || 'N/A';
  const doctorName = testRequest.doctorId?.name || testRequest.doctorName || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/dashboard/lab/test-request/${id}`)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Send Test Report</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Record Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-2">SEND TEST REPORT</h1>
            <p className="text-gray-600">Send Report to Requesting Doctor</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-800">
                  Report sent successfully! Redirecting to test request details...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {/* Test Request Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Test Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Request ID</label>
                <p className="text-gray-900 font-medium">{testRequest._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium">{testRequest.patientName || testRequest.patientId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Test Type</label>
                <p className="text-gray-900 font-medium">{testRequest.testType || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
              Requesting Doctor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500">Doctor Name</label>
                <p className="text-gray-900 font-medium">{doctorName}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Doctor Email</label>
                <p className="text-gray-900 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {doctorEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Report Information */}
          {testRequest.reportGeneratedDate && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Report Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Report Generated</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(testRequest.reportGeneratedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Report File</label>
                  <div className="flex space-x-3">
                    <button
                      onClick={viewReport}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </button>
                    <button
                      onClick={downloadReport}
                      className="flex items-center text-green-600 hover:text-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simplified Send Report Form */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" />
              Send Report to Doctor
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Send Method */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Send Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sendMethod"
                      value="both"
                      checked={formData.sendMethod === 'both'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Both Email and System Notification (Recommended)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sendMethod"
                      value="email"
                      checked={formData.sendMethod === 'email'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Email Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sendMethod"
                      value="system"
                      checked={formData.sendMethod === 'system'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>System Notification Only</span>
                  </label>
                </div>
              </div>

              {/* Email Subject */}
              {formData.sendMethod !== 'system' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    name="emailSubject"
                    value={formData.emailSubject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Email Message */}
              {formData.sendMethod !== 'system' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Email Message
                  </label>
                  <textarea
                    name="emailMessage"
                    value={formData.emailMessage}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* System Notification Message */}
              {formData.sendMethod !== 'email' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    System Notification Message
                  </label>
                  <textarea
                    name="notificationMessage"
                    value={formData.notificationMessage}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/lab/test-request/${id}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReport;