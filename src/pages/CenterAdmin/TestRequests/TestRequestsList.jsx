import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/api';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  User,
  TestTube,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const TestRequestsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [testRequests, setTestRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    if (user?.centerId) {
      // Handle both string and object cases for centerId
      const centerId = user.centerId._id || user.centerId;
      console.log('🔍 Debug - User centerId:', user.centerId, 'Extracted centerId:', centerId);
      setCenterFilter(centerId);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch if we have a valid centerFilter (which should be set from user.centerId)
    if (centerFilter && centerFilter !== '') {
      fetchTestRequests();
    }
  }, [currentPage, statusFilter, urgencyFilter, centerFilter]);



  const fetchTestRequests = async () => {
    try {
      setLoading(true);
      
      // Extract center ID properly - handle both string and object cases
      const centerId = user?.centerId?._id || user?.centerId || centerFilter;
      
      // Don't proceed if we don't have a valid centerId
      if (!centerId) {
        console.warn('⚠️ No valid centerId found, skipping API call');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Debug - API call params:', {
        userCenterId: user?.centerId,
        extractedCenterId: centerId,
        centerFilter,
        statusFilter,
        urgencyFilter
      });
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(urgencyFilter !== 'all' && { urgency: urgencyFilter }),
        ...(searchTerm && { search: searchTerm }),
        // Filter by user's center for CenterAdmin
        centerId: centerId
      });

      const response = await API.get(`/test-requests?${params}`);
      
      console.log('🔍 Debug - API Response:', response.data);
      console.log('🔍 Debug - Response structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : 'No data'
      });
      
      setTestRequests(response.data.testRequests || response.data || []);
      setTotalPages(response.data.pagination?.totalPages || response.data.totalPages || 1);
      
    } catch (error) {
      console.error('❌ Frontend: Error fetching test requests:', error);
      setError('Failed to load test requests');
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTestRequests();
  };

  const handleFilterReset = () => {
    setStatusFilter('all');
    setUrgencyFilter('all');
    // Handle both string and object cases for centerId
    const centerId = user?.centerId?._id || user?.centerId || '';
    setCenterFilter(centerId);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state when waiting for user data or fetching test requests
  if (loading || !user?.centerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-xs">
              {!user?.centerId ? 'Loading user data...' : 'Loading test requests...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
            Test Requests Overview
          </h1>
          <p className="text-slate-600 text-xs text-center sm:text-left">
            Monitor test requests for your center
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <TestTube className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Total Requests</p>
                <p className="text-sm font-bold text-slate-800">{testRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Pending Review</p>
                <p className="text-sm font-bold text-slate-800">
                  {testRequests.filter(tr => tr.status === 'Superadmin_Review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Approved</p>
                <p className="text-sm font-bold text-slate-800">
                  {testRequests.filter(tr => tr.status === 'Superadmin_Approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-red-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Rejected</p>
                <p className="text-sm font-bold text-slate-800">
                  {testRequests.filter(tr => tr.status === 'Superadmin_Rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, doctor name, or test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Superadmin_Review">Pending Review</option>
                <option value="Superadmin_Approved">Approved</option>
                <option value="Superadmin_Rejected">Rejected</option>
                <option value="Assigned">Assigned to Lab</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="all">All Urgencies</option>
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
              </select>

              <select
                value={centerFilter}
                onChange={(e) => setCenterFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                disabled
              >
                <option value={user?.centerId || 'all'}>
                  {user?.centerName || 'Your Center'}
                </option>
              </select>

              <button
                onClick={handleFilterReset}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-xs flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Test Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Patient & Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Test Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Center
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {testRequests.map((testRequest) => (
                  <tr key={testRequest._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-xs font-medium text-slate-900">
                          {testRequest.patientName || testRequest.patientId?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Dr. {testRequest.doctorName || testRequest.doctorId?.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-xs font-medium text-slate-900">
                          {testRequest.testType || 'N/A'}
                        </div>
                        {testRequest.testDescription && (
                          <div className="text-xs text-slate-500">
                            {testRequest.testDescription}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-slate-900">
                        {testRequest.centerName || testRequest.centerId?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {testRequest.centerCode || testRequest.centerId?.code || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(testRequest.status)}`}>
                        {testRequest.status?.replace(/_/g, ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {getUrgencyIcon(testRequest.urgency)}
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(testRequest.urgency)}`}>
                          {testRequest.urgency || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-slate-900">
                        {formatDate(testRequest.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/dashboard/centeradmin/test-requests/${testRequest._id}`)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {testRequests.length === 0 && !loading && (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-xs">No test requests found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-xs font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-xs font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 bg-white border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-xs font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRequestsList;
