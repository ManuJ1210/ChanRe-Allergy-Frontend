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
    const response = await API.get(`/test-requests/download-report/${reportId}`, {
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
      throw new Error('Received empty PDF file from server');
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
    
    // ✅ NEW: Handle report locking errors
    if (error.response && error.response.status === 403) {
      const errorData = error.response.data;
      if (errorData && errorData.error === 'report_locked') {
        const reason = errorData.details?.reason || 'Tests must be completed and payment must be fully settled';
        throw new Error(`Report is locked: ${reason}. Please complete all requirements to access the report.`);
      } else if (errorData && errorData.error === 'partial_payment_restriction') {
        throw new Error('Patient has not paid the bill fully. Please complete the payment to access the report.');
      }
    }

    // Check if error response contains JSON error message
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        console.error('Server error details:', errorData);
        
        // ✅ NEW: Check for report locking in blob response
        if (errorData && errorData.error === 'report_locked') {
          const reason = errorData.details?.reason || 'Tests must be completed and payment must be fully settled';
          throw new Error(`Report is locked: ${reason}. Please complete all requirements to access the report.`);
        } else if (errorData && errorData.error === 'partial_payment_restriction') {
          const details = errorData.details;
          const message = `Report access is restricted due to partial payment.\n\nBill Amount: ₹${details.totalAmount}\nPaid Amount: ₹${details.paidAmount}\nRemaining Balance: ₹${details.remainingBalance}\n\nPlease complete the payment to access the report.\nOnly Lab Staff can access reports with partial payments.`;
          throw new Error(message);
        }
        
        throw new Error(errorData.message || 'Failed to download PDF');
      } catch (parseError) {
        console.error('Error parsing server response:', parseError);
        throw new Error('Failed to download PDF - server response error');
      }
    }
    
    // Log additional error details
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data type:', typeof error.response.data);
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
    const response = await API.get(`/test-requests/download-report/${reportId}`, {
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
      throw new Error('Received empty PDF file from server');
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
    
    // ✅ NEW: Handle report locking errors
    if (error.response && error.response.status === 403) {
      const errorData = error.response.data;
      if (errorData && errorData.error === 'report_locked') {
        const reason = errorData.details?.reason || 'Tests must be completed and payment must be fully settled';
        throw new Error(`Report is locked: ${reason}. Please complete all requirements to access the report.`);
      } else if (errorData && errorData.error === 'partial_payment_restriction') {
        throw new Error('Patient has not paid the bill fully. Please complete the payment to access the report.');
      }
    }
    
    // Check if error response contains JSON error message
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        console.error('Server error details:', errorData);
        
        // ✅ NEW: Check for report locking in blob response
        if (errorData && errorData.error === 'report_locked') {
          const reason = errorData.details?.reason || 'Tests must be completed and payment must be fully settled';
          throw new Error(`Report is locked: ${reason}. Please complete all requirements to access the report.`);
        } else if (errorData && errorData.error === 'partial_payment_restriction') {
          const details = errorData.details;
          const message = `Report access is restricted due to partial payment.\n\nBill Amount: ₹${details.totalAmount}\nPaid Amount: ₹${details.paidAmount}\nRemaining Balance: ₹${details.remainingBalance}\n\nPlease complete the payment to access the report.\nOnly Lab Staff can access reports with partial payments.`;
          throw new Error(message);
        }
        
        throw new Error(errorData.message || 'Failed to view PDF');
      } catch (parseError) {
        console.error('Error parsing server response:', parseError);
        throw new Error('Failed to view PDF - server response error');
      }
    }
    
    // Log additional error details
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data type:', typeof error.response.data);
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
 * Check report availability from server
 * @param {string} reportId - The test request ID
 * @returns {Promise<object>} - Report status information
 */
export const checkReportAvailability = async (reportId) => {
  try {
    const response = await API.get(`/test-requests/report-status/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking report availability:', error);
    
    // ✅ NEW: Handle report locking errors
    if (error.response && error.response.status === 403) {
      const errorData = error.response.data;
      if (errorData && errorData.error === 'report_locked') {
        const reason = errorData.details?.reason || 'Tests must be completed and payment must be fully settled';
        return {
          isAvailable: false,
          isRestricted: true,
          restrictionType: 'report_locked',
          message: `Report is locked: ${reason}. Please complete all requirements to access the report.`,
          details: errorData.details
        };
      } else if (errorData && errorData.error === 'partial_payment_restriction') {
        return {
          isAvailable: false,
          isRestricted: true,
          restrictionType: 'partial_payment',
          message: 'Patient has not paid the bill fully. Please complete the payment to access the report.',
          details: errorData.details
        };
      }
    }
    
    throw new Error(error.response?.data?.message || 'Failed to check report availability');
  }
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
  checkReportAvailability,
  getReportStatusMessage
};