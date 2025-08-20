// Front-End/src/utils/pdfHandler.js

import API from '../services/api';

/**
 * Download PDF report from backend
 * @param {string} reportId - The test request ID
 * @param {string} fileName - Optional custom filename
 * @returns {Promise<void>}
 */
export const downloadPDFReport = async (reportId, fileName = null) => {
  try {
    const response = await API.get(`/test-requests/${reportId}/download-report`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
      // Ensure axios doesn't try to parse the response
      transformResponse: [(data) => data],
    });

    // Create blob from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Check if blob is valid
    if (blob.size === 0) {
      throw new Error('Received empty PDF file');
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `lab-report-${reportId}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    
    // Check if error response contains JSON error message
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Failed to download PDF');
      } catch (parseError) {
        throw new Error('Failed to download PDF');
      }
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to download PDF');
  }
};

/**
 * View PDF report in new browser tab
 * @param {string} reportId - The test request ID
 * @returns {Promise<void>}
 */
export const viewPDFReport = async (reportId) => {
  try {
    const response = await API.get(`/test-requests/${reportId}/download-report`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
      // Ensure axios doesn't try to parse the response
      transformResponse: [(data) => data],
    });

    // Create blob from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Check if blob is valid
    if (blob.size === 0) {
      throw new Error('Received empty PDF file');
    }

    // Create object URL and open in new tab
    const url = window.URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    
    if (!newTab) {
      // If popup was blocked, try downloading instead
      await downloadPDFReport(reportId);
      return { success: true, fallback: true };
    }
    
    // Clean up URL after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    return { success: true };
  } catch (error) {
    console.error('Error viewing PDF:', error);
    
    // Check if error response contains JSON error message
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Failed to view PDF');
      } catch (parseError) {
        throw new Error('Failed to view PDF');
      }
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to view PDF');
  }
};

/**
 * Check if a report is available for download
 * @param {object} testRequest - The test request object
 * @returns {boolean}
 */
export const isReportAvailable = (testRequest) => {
  const validStatuses = ['Report_Generated', 'Report_Sent', 'Completed', 'feedback_sent'];
  return validStatuses.includes(testRequest.status) && testRequest.reportFilePath;
};

/**
 * Get appropriate message for report status
 * @param {object} testRequest - The test request object
 * @returns {string}
 */
export const getReportStatusMessage = (testRequest) => {
  if (!testRequest) return 'No test request found';
  
  switch (testRequest.status) {
    case 'Pending':
    case 'Assigned':
      return 'Test request is pending. Report not yet available.';
    case 'Sample_Collection_Scheduled':
    case 'Sample_Collected':
      return 'Sample collection in progress. Report will be available after testing.';
    case 'In_Lab_Testing':
      return 'Testing in progress. Report will be available soon.';
    case 'Testing_Completed':
      return 'Testing completed. Report generation pending.';
    case 'Report_Generated':
      return 'Report is ready for download.';
    case 'Report_Sent':
    case 'Completed':
    case 'feedback_sent':
      return 'Report has been sent and is available for download.';
    case 'Cancelled':
      return 'Test request was cancelled. No report available.';
    default:
      return 'Report status unknown.';
  }
};

export default {
  downloadPDFReport,
  viewPDFReport,
  isReportAvailable,
  getReportStatusMessage
};