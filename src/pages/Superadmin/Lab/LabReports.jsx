import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/api';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  Phone,
  TrendingUp,
  Activity
} from 'lucide-react';

const LabReports = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lab reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.get('/lab-reports');
        setReports(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lab reports:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError('Failed to fetch lab reports');
        }
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Report_Sent':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'Report_Generated':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      case 'Testing_Completed':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'In_Lab_Testing':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200';
      case 'Sample_Collected':
        return 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200';
      case 'Pending':
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      case 'Urgent':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200';
      case 'Normal':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.centerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.testType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesCenter = filterCenter === 'all' || report.centerCode === filterCenter;
    
    return matchesSearch && matchesStatus && matchesCenter;
  });

  const handleViewReport = async (reportId) => {
    try {
      setError(null); // Clear any previous errors
      console.log('[PDF DEBUG] Starting view report for ID:', reportId);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view reports');
        return;
      }

      console.log('[PDF DEBUG] Making request to:', `/test-requests/${reportId}/download-report`);
      const response = await API.get(`/test-requests/${reportId}/download-report`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}` // Explicitly add token
        }
      });
      
      console.log('[PDF DEBUG] Response received:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        dataSize: response.data?.size || 'unknown'
      });
      
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      console.log('[PDF DEBUG] Content-Type:', contentType);
      
      let blob;
      if (contentType && contentType.includes('application/pdf')) {
        console.log('[PDF DEBUG] Processing as PDF blob');
        
        // Check if the PDF is too small (likely an error response)
        if (response.data.size < 1000) {
          console.warn('[PDF DEBUG] PDF file is suspiciously small:', response.data.size, 'bytes');
          // Try to read the response as text to see the actual error
          const reader = new FileReader();
          reader.onload = function(e) {
            console.error('[PDF DEBUG] Small PDF content:', e.target.result);
            
            // Check if it's a JSON response indicating the file is not a PDF
            try {
              const jsonData = JSON.parse(e.target.result);
              if (jsonData.reportFile && jsonData.reportFile.includes('.txt')) {
                setError('Report file is in text format, not PDF. Please regenerate the report as PDF.');
                return;
              }
            } catch (parseError) {
              // Not JSON, continue with generic error
            }
          };
          reader.readAsText(response.data);
          
          setError('PDF file is corrupted or not generated properly. Please regenerate the report.');
          return;
        }
        
        blob = new Blob([response.data], { type: 'application/pdf' });
      } else {
        console.log('[PDF DEBUG] Processing as text/JSON response');
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
      
      console.log('[PDF DEBUG] Final blob created:', {
        size: blob.size,
        type: blob.type
      });
      
      // Open PDF in new tab for viewing
      const url = window.URL.createObjectURL(blob);
      console.log('[PDF DEBUG] Opening URL in new tab:', url);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        console.log('[PDF DEBUG] URL revoked');
      }, 1000);
      
    } catch (error) {
      console.error('[PDF DEBUG] Error viewing report:', error);
      console.error('[PDF DEBUG] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again to view reports.');
      } else if (error.response?.status === 404) {
        setError('Report not found. The report may not have been generated yet.');
      } else {
        setError(`Failed to view report: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      setError(null); // Clear any previous errors
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to download reports');
        return;
      }

      const response = await API.get(`/test-requests/${reportId}/download-report`, {
        responseType: 'blob', // This is crucial for binary data
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}` // Explicitly add token
        }
      });
      
      // Check if response is actually PDF
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      
      if (contentType && contentType.includes('application/pdf')) {
        // Check if the PDF is too small (likely an error response)
        if (response.data.size < 1000) {
          console.warn('[PDF DEBUG] Download PDF file is suspiciously small:', response.data.size, 'bytes');
          // Try to read the response as text to see the actual error
          const reader = new FileReader();
          reader.onload = function(e) {
            console.error('[PDF DEBUG] Small download PDF content:', e.target.result);
          };
          reader.readAsText(response.data);
          
          setError('PDF file is corrupted or not generated properly. Please regenerate the report.');
          return;
        }
        
        // Handle proper PDF response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lab-report-${reportId}.pdf`);
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
        link.setAttribute('download', `lab-report-${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again to download reports.');
      } else if (error.response?.status === 404) {
        setError('Report not found. The report may not have been generated yet.');
      } else {
        setError('Failed to download report. Please try again.');
      }
    }
  };

  const handleSendReport = (reportId) => {
    // TODO: Implement send report functionality
    console.log('Sending report:', reportId);
    // This would typically trigger an email or notification to the doctor/patient
    alert('Send report functionality not yet implemented');
  };

  const centers = [...new Set(reports.map(report => report.centerCode).filter(Boolean))];
  const statuses = [...new Set(reports.map(report => report.status).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-xs sm:text-base">Loading lab reports...</p>
              <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-600" />
              </div>
              <p className="text-red-700 font-medium text-xs sm:text-base text-center">{error}</p>
              <p className="text-red-600 text-xs mt-1 text-center">Please try refreshing the page</p>
              {error.includes('login') && (
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-xs shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl md:text-xl font-bold text-slate-800 flex items-center mb-3 justify-center sm:justify-start bg-clip-text">
                  
                  Lab Reports
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-xs text-slate-600">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">All Centers</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{reports.length} total reports</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">{reports.filter(r => r.status === 'Report_Sent').length} sent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 md:mb-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-red-700 text-xs sm:text-base font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>

            {/* Center Filter */}
            <select
              value={filterCenter}
              onChange={(e) => setFilterCenter(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base transition-all duration-200"
            >
              <option value="all">All Centers</option>
              {centers.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCenter('all');
              }}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-base shadow-sm hover:shadow-md"
            >
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <h2 className="text-sm sm:text-lg font-semibold text-slate-800 flex items-center justify-center sm:justify-start mb-2">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Lab Reports ({filteredReports.length})
            </h2>
            <p className="text-slate-600 mt-1 text-xs sm:text-base text-center sm:text-left">
              View and manage lab reports from all centers
            </p>
          </div>
          
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {filteredReports.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="bg-slate-100 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium text-xs sm:text-base mb-2">No reports found</p>
                <p className="text-slate-500 text-xs sm:text-xs">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {filteredReports.map(report => (
                  <div key={report._id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 sm:p-5 space-y-4 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    {/* Patient Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-base sm:text-sm mb-1">{report.patientName}</h3>
                        <p className="text-slate-500 text-xs sm:text-xs">ID: {report.patientId}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    {/* Center & Test Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Building className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-700 text-xs font-medium">{report.centerName}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <span className="text-slate-700 text-xs font-medium">{report.testType}</span>
                      </div>
                    </div>
                    
                    {/* Urgency & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(report.urgency)}`}>
                          {report.urgency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700 text-xs font-medium">
                          {report.reportGeneratedDate ? 
                            new Date(report.reportGeneratedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            'Not generated'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {(report.status === 'Report_Generated' || report.status === 'Report_Sent' || report.status === 'Completed' || report.status === 'feedback_sent') && report.reportFilePath && (
                      <div className="flex flex-col gap-2 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleViewReport(report._id)}
                          className="w-full px-3 py-2.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 rounded-lg hover:from-purple-200 hover:to-violet-200 flex items-center justify-center gap-2 border border-purple-200 hover:border-purple-300 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          View PDF
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report._id)}
                          className="w-full px-3 py-2.5 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg hover:from-green-200 hover:to-emerald-200 flex items-center justify-center gap-2 border border-green-200 hover:border-green-300 transition-all duration-200"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Center</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Test Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Generated</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium text-xs">No reports found</p>
                        <p className="text-slate-500 text-xs mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report._id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{report.patientName}</div>
                          <div className="text-xs text-slate-500">ID: {report.patientId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{report.centerName}</div>
                          <div className="text-xs text-slate-500">Code: {report.centerCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{report.testType}</div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(report.urgency)}`}>
                            {report.urgency}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {report.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600">
                          {report.reportGeneratedDate ? 
                            new Date(report.reportGeneratedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            'Not generated'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        {(report.status === 'Report_Generated' || report.status === 'Report_Sent' || report.status === 'Completed' || report.status === 'feedback_sent') && report.reportFilePath && (
                            <>
                              <button
                                onClick={() => handleViewReport(report._id)}
                                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 rounded-lg hover:from-purple-200 hover:to-violet-200 border border-purple-200 hover:border-purple-300 transition-all duration-200"
                              >
                                <Eye className="inline mr-1 h-3 w-3" />
                                View PDF
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report._id)}
                                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg hover:from-green-200 hover:to-emerald-200 border border-green-200 hover:border-green-300 transition-all duration-200"
                              >
                                <Download className="inline mr-1 h-3 w-3" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabReports;