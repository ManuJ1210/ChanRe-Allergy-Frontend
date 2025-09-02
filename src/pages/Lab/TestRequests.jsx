import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { 
  Microscope, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Edit,
  Filter,
  Search,
  Calendar,
  User,
  Phone,
  MapPin,
  RefreshCw,
  Trash2,
  Download
} from 'lucide-react';

export default function TestRequests() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [testRequests, setTestRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchTestRequests();
    } else if (user && !user._id && !user.id) {
      setLoading(false);
    }
  }, [user]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && (user._id || user.id)) {
        fetchTestRequests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!user || (!user._id && !user.id)) return;

    const interval = setInterval(() => {
      fetchTestRequests();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [testRequests, searchTerm, statusFilter, urgencyFilter]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('State updated:', {
      testRequestsCount: testRequests.length,
      filteredRequestsCount: filteredRequests.length
    });
    
    // Log all unique statuses to help debug
    if (testRequests.length > 0) {
      const uniqueStatuses = [...new Set(testRequests.map(req => req.status))];
      console.log('All unique statuses in data:', uniqueStatuses);
      
      // Log count for each status
      uniqueStatuses.forEach(status => {
        const count = testRequests.filter(req => req.status === status).length;
        console.log(`Status "${status}": ${count} requests`);
      });
      
      // Log counts for each category
      const pendingCount = testRequests.filter(req => ['Pending', 'pending', 'PENDING'].includes(req.status)).length;
      const assignedCount = testRequests.filter(req => ['Assigned', 'assigned', 'ASSIGNED'].includes(req.status)).length;
      const inProgressCount = testRequests.filter(req => ['Sample_Collection_Scheduled', 'Sample_Collected', 'In_Lab_Testing', 'Testing_Completed', 'sample_collection_scheduled', 'sample_collected', 'in_lab_testing', 'testing_completed', 'In_Progress', 'in_progress'].includes(req.status)).length;
      const completedCount = testRequests.filter(req => ['Report_Generated', 'Report_Sent', 'Completed'].includes(req.status)).length;
      const cancelledCount = testRequests.filter(req => ['Cancelled', 'cancelled', 'CANCELLED'].includes(req.status)).length;
      
      console.log('Category counts:', {
        pending: pendingCount,
        assigned: assignedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount
      });
    }
  }, [testRequests.length, filteredRequests.length, testRequests]);

  const fetchTestRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/test-requests/lab-staff');
      const data = response.data;
      console.log('Fetched test requests:', data.length);
      setTestRequests(data);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error fetching test requests:', error);
      setError('Failed to load test requests');
      setTestRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchTestRequests();
  };

  const filterRequests = () => {
    let filtered = [...testRequests]; // Create a copy to avoid mutating original array

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.centerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'All') {
      filtered = filtered.filter(request => request.urgency === urgencyFilter);
    }

    console.log('Filtering requests:', {
      total: testRequests.length,
      filtered: filtered.length,
      searchTerm,
      statusFilter,
      urgencyFilter
    });

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Billing_Paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Superadmin_Approved':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Billing_Paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'Superadmin_Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Assigned':
        return <Microscope className="h-4 w-4" />;
      case 'Sample_Collection_Scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'Sample_Collected':
        return <User className="h-4 w-4" />;
      case 'In_Lab_Testing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Testing_Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Report_Generated':
        return <Eye className="h-4 w-4" />;
      case 'Report_Sent':
        return <CheckCircle className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;

      case 'Cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Urgent':
        return <Clock className="h-4 w-4" />;
      case 'Normal':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (requestId) => {
    navigate(`/dashboard/lab/test-request/${requestId}`);
  };

  const handleUpdateStatus = (requestId) => {
    navigate(`/dashboard/lab/update-status/${requestId}`);
  };

  const handleViewReport = async (requestId) => {
    try {
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view reports');
        return;
      }

      const response = await API.get(`/test-requests/download-report/${requestId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
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
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again to view reports.');
      } else if (error.response?.status === 404) {
        setError('Report not found. The report may not have been generated yet.');
      } else {
        setError('Failed to view report. Please try again.');
      }
    }
  };

  const handleDownloadReport = async (requestId) => {
    try {
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to download reports');
        return;
      }

      const response = await API.get(`/test-requests/download-report/${requestId}`, {
        responseType: 'blob', // This is crucial for binary data
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
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
        link.setAttribute('download', `lab-report-${requestId}.pdf`);
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
        link.setAttribute('download', `lab-report-${requestId}.pdf`);
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

  const handleDeleteRequest = async (requestId, patientName) => {
    if (window.confirm(`Are you sure you want to delete the test request for ${patientName}? This action cannot be undone.`)) {
      try {
        const response = await API.delete(`/test-requests/${requestId}`);
        if (response.status === 200) {
          // Remove the deleted request from the state
          setTestRequests(prevRequests => {
            const updatedRequests = prevRequests.filter(request => request._id !== requestId);
            console.log('After delete - Total requests:', updatedRequests.length);
            return updatedRequests;
          });
          toast.success('Test request deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting test request:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete test request';
        toast.error(errorMessage);
      }
    }
  };

  if (!user || (!user._id && !user.id)) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading test requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-md font-bold text-slate-800 mb-2">
                Test Requests
              </h1>
                                             <p className="text-xs text-slate-600">
                  Manage and track test requests that are ready for lab processing or already completed
                </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {lastRefreshTime && (
            <p className="text-xs text-slate-500">
              Last updated: {lastRefreshTime.toLocaleTimeString()}
            </p>
          )}
        </div>

                 {/* ✅ NEW: Workflow Information */}
         <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
           <div className="flex items-start">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-blue-800">Lab Workflow</h3>
                               <div className="mt-2 text-sm text-blue-700">
                  <p>This page shows test requests that are <strong>ready for lab processing</strong> (with completed billing) OR <strong>already completed</strong> (regardless of billing status).</p>
                  <p className="mt-1">Test requests with pending billing are handled by receptionists and center admins first.</p>
                </div>
             </div>
           </div>
         </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              {error.includes('login') && (
                <button
                  onClick={() => navigate('/login')}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status Counts */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Status Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-md font-bold text-green-600">
                {testRequests.filter(req => 
                  ['Billing_Paid', 'Superadmin_Approved'].includes(req.status)
                ).length}
              </div>
              <div className="text-xs text-green-700">Ready for Lab</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-md font-bold text-blue-600">
                {testRequests.filter(req => 
                  ['Assigned', 'assigned', 'ASSIGNED'].includes(req.status)
                ).length}
              </div>
              <div className="text-xs text-blue-700">Assigned</div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-md font-bold text-orange-600">
                {testRequests.filter(req => 
                  ['Sample_Collection_Scheduled', 'Sample_Collected', 'In_Lab_Testing', 'Testing_Completed', 'sample_collection_scheduled', 'sample_collected', 'in_lab_testing', 'testing_completed', 'In_Progress', 'in_progress'].includes(req.status)
                ).length}
              </div>
              <div className="text-xs text-orange-700">In Progress</div>
            </div>
                         <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
               <div className="text-md font-bold text-emerald-600">
                 {testRequests.filter(req => 
                   ['Report_Generated', 'Report_Sent', 'Completed'].includes(req.status)
                 ).length}
               </div>
               <div className="text-xs text-emerald-700">Completed</div>
             </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-md font-bold text-red-600">
                {testRequests.filter(req => 
                  ['Cancelled', 'cancelled', 'CANCELLED'].includes(req.status)
                ).length}
              </div>
              <div className="text-xs text-red-700">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
                         <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="All">All Status</option>
               <option value="Billing_Paid">Billing Paid</option>
               <option value="Superadmin_Approved">Superadmin Approved</option>
               <option value="Assigned">Assigned</option>
               <option value="Sample_Collection_Scheduled">Sample Collection Scheduled</option>
               <option value="Sample_Collected">Sample Collected</option>
               <option value="In_Lab_Testing">In Lab Testing</option>
               <option value="Testing_Completed">Testing Completed</option>
               <option value="Report_Generated">Report Generated</option>
               <option value="Report_Sent">Report Sent</option>
               <option value="Completed">Completed</option>
               <option value="Completed">Completed</option>
               <option value="Cancelled">Cancelled</option>
             </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Urgency</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setUrgencyFilter('All');
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-xs text-slate-600">
            Showing {filteredRequests.length} of {testRequests.length} test requests
          </p>
        </div>

        {/* Test Requests List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {filteredRequests.length === 0 ? (
                         <div className="text-center py-12">
               <Microscope className="h-12 w-12 text-slate-400 mx-auto mb-4" />
               <h3 className="text-sm font-medium text-slate-900 mb-2">No test requests found</h3>
                               <p className="text-xs text-slate-600">
                  {testRequests.length === 0 
                    ? "No test requests are ready for lab processing or completed yet." 
                    : "No test requests match your current filters."}
                </p>
               <p className="text-xs text-slate-500 mt-2">
                 Test requests with pending billing are handled by receptionists and center admins first.
               </p>
             </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <div key={request._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.replace(/_/g, ' ')}</span>
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                          {getUrgencyIcon(request.urgency)}
                          <span className="ml-1">{request.urgency}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900 mb-1">Patient</h3>
                          <p className="text-xs text-slate-600">{request.patientName}</p>
                          <p className="text-xs text-slate-500">{request.patientPhone}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900 mb-1">Doctor</h3>
                          <p className="text-xs text-slate-600">{request.doctorName}</p>
                          <p className="text-xs text-slate-500">{request.centerName}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900 mb-1">Test Type</h3>
                          <p className="text-xs text-slate-600">{request.testType}</p>
                          <p className="text-xs text-slate-500">{request.testDescription}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900 mb-1">Created</h3>
                          <p className="text-xs text-slate-600">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {request.notes && (
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-slate-900 mb-1">Notes</h3>
                          <p className="text-xs text-slate-600">{request.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(request._id)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request._id)}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Status
                      </button>
                      {(request.status === 'Report_Generated' || request.status === 'Report_Sent' || request.status === 'Completed') && request.reportFilePath && (
                        <>
                          <button
                            onClick={() => handleViewReport(request._id)}
                            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Report
                          </button>
                          <button
                            onClick={() => handleDownloadReport(request._id)}
                            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Report
                          </button>
                        </>
                      )}
                      {(request.status === 'Cancelled') && (
                        <button
                          onClick={() => handleDeleteRequest(request._id, request.patientName)}
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}