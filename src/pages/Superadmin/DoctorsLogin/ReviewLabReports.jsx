import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Eye, 
  MessageSquare, 
  FileText, 
  User, 
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  ExternalLink
} from 'lucide-react';
import { 
  fetchSuperAdminDoctorLabReports,
  sendFeedbackToCenterDoctor,
  clearError,
  clearSuccess 
} from '../../../features/superadmin/superAdminDoctorSlice';

const ReviewLabReports = () => {
  const dispatch = useDispatch();
  const { labReports, workingLoading, workingError, success, message } = useSelector(
    (state) => state.superAdminDoctors
  );

  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState({
    additionalTests: '',
    patientInstructions: '',
    notes: ''
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSuperAdminDoctorLabReports());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleReviewReport = (report) => {
    console.log('Setting selected report:', report);
    setSelectedReport(report);
    setShowFeedbackModal(true);
  };

  const handleSendFeedback = async () => {
    console.log('handleSendFeedback called, selectedReport:', selectedReport);
    
    if (!selectedReport || !selectedReport._id) {
      console.error('No selected report or missing report ID');
      return;
    }

    try {
      const feedbackData = {
        reportId: selectedReport._id,
        patientId: selectedReport.patientId?._id || selectedReport.patientId,
        centerDoctorId: selectedReport.doctorId?._id || selectedReport.doctorId,
        additionalTests: feedback.additionalTests,
        patientInstructions: feedback.patientInstructions,
        notes: feedback.notes
      };

      const result = await dispatch(sendFeedbackToCenterDoctor(feedbackData));
      
      if (sendFeedbackToCenterDoctor.fulfilled.match(result)) {
        setShowFeedbackModal(false);
        setSelectedReport(null);
        setFeedback({
          additionalTests: '',
          patientInstructions: '',
          notes: ''
        });
        // Refresh the lab reports to show updated status
        dispatch(fetchSuperAdminDoctorLabReports());
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  // PDF handling functions
  const handleViewPDF = async (report) => {
    try {
      console.log('🔍 Attempting to view PDF for report:', report);
      console.log('🔍 Report ID:', report._id);
      console.log('🔍 Report File:', report.reportFile);
      
      let pdfUrl;
      
      // Use the correct endpoint for lab reports
      pdfUrl = `http://localhost:5000/api/test-requests/${report._id}/download-report`;
      console.log('🔍 Using correct PDF endpoint:', pdfUrl);
      
      console.log('🔍 Fetching PDF from:', pdfUrl);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      // Fetch the PDF data with authentication headers
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let pdfBlob;
      
      // Check if response is already a PDF blob
      const contentType = response.headers.get('content-type');
      console.log('🔍 Response content-type:', contentType);
      
      if (contentType && contentType.includes('application/pdf')) {
        // Response is already a PDF blob
        pdfBlob = await response.blob();
        console.log('🔍 Using response as PDF blob');
      } else {
        // Handle text/JSON response that needs conversion
        console.log('🔍 Converting text response to PDF blob');
        const responseData = await response.text();
        console.log('🔍 Response data type:', typeof responseData);
        console.log('🔍 Response data length:', responseData.length);
        
        let pdfContent = responseData;
        
        // If it's a JSON response with PDF content
        if (typeof pdfContent === 'string' && pdfContent.startsWith('{')) {
          try {
            const jsonData = JSON.parse(pdfContent);
            if (jsonData.pdfContent) {
              pdfContent = jsonData.pdfContent;
            }
          } catch (e) {
            // Not JSON, use as-is
          }
        }
        
        // Clean up the PDF string (remove escape characters)
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
        pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
      }
      
      console.log('🔍 Final PDF blob size:', pdfBlob.size, 'bytes');
      console.log('🔍 Final PDF blob type:', pdfBlob.type);
      
      // Create a blob URL for the PDF
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      console.log('🔍 Created blob URL:', blobUrl);
      
      // Open PDF in new tab
      const newWindow = window.open(blobUrl, '_blank');
      
      if (newWindow) {
        console.log('🔍 PDF opened in new window successfully');
      } else {
        console.log('🔍 Failed to open new window (might be blocked by popup blocker)');
        // Fallback: try to open in same window
        window.open(blobUrl, '_self');
      }
      
      // Clean up the blob URL after a delay to ensure the PDF loads
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        console.log('🔍 Cleaned up blob URL');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error viewing PDF:', error);
      alert('Failed to load PDF report. Please try again or contact support.');
    }
  };

  const handleDownloadPDF = async (report) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      // Use the correct endpoint for lab reports
      const downloadUrl = `http://localhost:5000/api/test-requests/${report._id}/download-report`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lab-report-${report.patientId?.name || 'patient'}-${report.testType || 'test'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'feedback_sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending_review':
        return <Clock className="w-4 h-4" />;
      case 'feedback_sent':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (workingLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (workingError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="text-xs">{workingError}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-md font-bold text-gray-800 mb-2">Review Lab Reports</h1>
        <p className="text-gray-600 text-xs">
          Review completed lab reports and provide feedback to center admin doctors
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700 text-xs">{message}</span>
        </div>
      )}

      {workingError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700 text-xs">{workingError}</span>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Lab Reports</h2>
        </div>
        <div className="p-4 sm:p-6">
          {labReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-xs">No lab reports available for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile/Tablet View - Card Layout */}
              <div className="block lg:hidden">
                {labReports.map((report) => (
                  <div key={report._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Patient Info */}
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {report.patientId?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.patientId?.age || 'N/A'} years
                        </div>
                      </div>
                    </div>

                    {/* Test Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Test Type</p>
                        <p className="text-xs font-medium text-gray-900">{report.testType || 'N/A'}</p>
                        {report.testDescription && (
                          <p className="text-xs text-gray-600">{report.testDescription}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Requested By</p>
                        <p className="text-xs font-medium text-gray-900">Dr. {report.doctorId?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{report.centerId?.name || report.centerName || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Date and Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Completed Date</p>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-xs text-gray-900">
                            {report.completedDate || report.reportGeneratedDate || report.updatedAt ? 
                              new Date(report.completedDate || report.reportGeneratedDate || report.updatedAt).toLocaleDateString() 
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">
                            {report.status === 'completed' && 'Completed'}
                            {report.status === 'pending_review' && 'Pending Review'}
                            {report.status === 'feedback_sent' && 'Feedback Sent'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FileText className="w-3 h-3 mr-1" />
                          Viewable
                        </span>
                        <button
                          onClick={() => handleViewPDF(report)}
                          className="text-green-600 hover:text-green-900 flex items-center text-xs"
                          title="View PDF Report"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReviewReport(report)}
                          className="text-blue-600 hover:text-blue-900 flex items-center text-xs"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </button>
                        
                        {report.reportFile && (
                          <button
                            onClick={() => handleDownloadPDF(report)}
                            className="text-purple-600 hover:text-purple-900 flex items-center text-xs"
                            title="Download PDF Report"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden lg:block">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PDF
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {labReports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {report.patientId?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {report.patientId?.age || 'N/A'} years
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs text-gray-900">{report.testType || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{report.testDescription || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs text-gray-900">
                            Dr. {report.doctorId?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.centerId?.name || report.centerName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-900">
                              {report.completedDate || report.reportGeneratedDate || report.updatedAt ? 
                                new Date(report.completedDate || report.reportGeneratedDate || report.updatedAt).toLocaleDateString() 
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">
                              {report.status === 'completed' && 'Completed'}
                              {report.status === 'pending_review' && 'Pending Review'}
                              {report.status === 'feedback_sent' && 'Feedback Sent'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FileText className="w-3 h-3 mr-1" />
                              Viewable
                            </span>
                            <button
                              onClick={() => handleViewPDF(report)}
                              className="text-green-600 hover:text-green-900 flex items-center text-xs"
                              title="View PDF Report"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleReviewReport(report)}
                              className="text-blue-600 hover:text-blue-900 flex items-center text-xs"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </button>
                            
                            {report.reportFile && (
                              <button
                                onClick={() => handleDownloadPDF(report)}
                                className="text-purple-600 hover:text-purple-900 flex items-center text-xs"
                                title="Download PDF Report"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">
                Review Lab Report - {selectedReport.patientId?.name || 'N/A'}
              </h3>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Report Details */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Report Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Patient</p>
                    <p className="font-medium text-xs">{selectedReport.patientId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Test Type</p>
                    <p className="font-medium text-xs">{selectedReport.testType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Requested By</p>
                    <p className="font-medium text-xs">Dr. {selectedReport.doctorId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Center</p>
                    <p className="font-medium text-xs">{selectedReport.centerId?.name || selectedReport.centerName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Report Results */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Test Results</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Results Summary:</p>
                      <p className="text-xs text-gray-800">{selectedReport.results || 'No results available'}</p>
                    </div>
                    {selectedReport.reportSummary && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Report Summary:</p>
                        <p className="text-xs text-gray-800">{selectedReport.reportSummary}</p>
                      </div>
                    )}
                    {selectedReport.clinicalInterpretation && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Clinical Interpretation:</p>
                        <p className="text-xs text-gray-800">{selectedReport.clinicalInterpretation}</p>
                      </div>
                    )}
                    {selectedReport.conclusion && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Conclusion:</p>
                        <p className="text-xs text-gray-800">{selectedReport.conclusion}</p>
                      </div>
                    )}
                    {selectedReport.recommendations && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Recommendations:</p>
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">{selectedReport.recommendations}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Provide Feedback</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Additional Tests Recommended
                    </label>
                    <textarea
                      value={feedback.additionalTests}
                      onChange={(e) => setFeedback(prev => ({ ...prev, additionalTests: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      placeholder="Recommend any additional tests that should be performed..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Patient Instructions
                    </label>
                    <textarea
                      value={feedback.patientInstructions}
                      onChange={(e) => setFeedback(prev => ({ ...prev, patientInstructions: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      placeholder="Provide specific instructions for the patient..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={feedback.notes}
                      onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      placeholder="Any additional notes or observations..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-xs"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewLabReports;


