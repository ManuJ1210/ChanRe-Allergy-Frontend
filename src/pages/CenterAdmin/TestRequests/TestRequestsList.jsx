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
  RefreshCw,
  ArrowLeft,
  ArrowRight
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
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(7);


  useEffect(() => {
    if (user?.centerId) {
      // Handle both string and object cases for centerId
      const centerId = user.centerId._id || user.centerId;
      setCenterFilter(centerId);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch if we have a valid centerFilter (which should be set from user.centerId)
    if (centerFilter && centerFilter !== '') {
      fetchTestRequests();
    }
  }, [currentPage, statusFilter, urgencyFilter, centerFilter, itemsPerPage]);



  const fetchTestRequests = async () => {
    try {
      setLoading(true);
      
      // Extract center ID properly - handle both string and object cases
      const centerId = user?.centerId?._id || user?.centerId || centerFilter;
      
      // Don't proceed if we don't have a valid centerId
      if (!centerId) {
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(urgencyFilter !== 'all' && { urgency: urgencyFilter }),
        ...(searchTerm && { search: searchTerm }),
        // Filter by user's center for CenterAdmin
        centerId: centerId
      });

      const response = await API.get(`/test-requests?${params}`);
      
      setTestRequests(response.data.testRequests || response.data || []);
      setTotalPages(response.data.pagination?.totalPages || response.data.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || response.data.totalItems || testRequests.length);
      
    } catch (error) {
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Test Requests Overview
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm text-center sm:text-left">
            Monitor test requests for your center
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <TestTube className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{testRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-orange-100">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Bill Pending</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {testRequests.filter(tr => tr.status === 'Report_Generated' || tr.status === 'Report_Sent').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Test Completed</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {testRequests.filter(tr => 
                    tr.status === 'Report_Generated' || 
                    tr.status === 'Report_Sent' || 
                    tr.status === 'Completed'
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-red-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {testRequests.filter(tr => tr.status === 'Superadmin_Rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, doctor name, or test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                />
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
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
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="all">All Urgencies</option>
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
              </select>

              <select
                value={centerFilter}
                onChange={(e) => setCenterFilter(e.target.value)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                disabled
              >
                <option value={user?.centerId || 'all'}>
                  {user?.centerName || 'Your Center'}
                </option>
              </select>

              <button
                onClick={handleFilterReset}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-xs flex items-center justify-center"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {testRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {/* Left side - Results info and items per page */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-xs text-slate-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                      className="px-2 sm:px-3 py-1 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={7}>7</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-xs text-slate-600 hidden sm:inline">per page</span>
                  </div>
                </div>

                {/* Right side - Page navigation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 hidden sm:inline">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <ArrowLeft className="h-3 w-3 sm:hidden" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white border border-blue-600"
                    >
                      {currentPage}
                    </button>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        currentPage === totalPages
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ArrowRight className="h-3 w-3 sm:hidden" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {loading ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-slate-600 font-medium text-xs sm:text-sm">Loading test requests...</p>
                <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
              </div>
            ) : testRequests.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="bg-slate-100 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <TestTube className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-2">No Test Requests Found</h3>
                <p className="text-slate-500 mb-4 sm:mb-6 text-xs sm:text-sm">No test requests match your current filters.</p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {testRequests.map((testRequest) => (
                  <div key={testRequest._id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-3 sm:p-4 space-y-3 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800 text-xs sm:text-sm">{testRequest.patientName || testRequest.patientId?.name || 'N/A'}</h3>
                          <p className="text-slate-500 text-xs">Dr. {testRequest.doctorName || testRequest.doctorId?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        testRequest.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        testRequest.status === 'Superadmin_Rejected' ? 'bg-red-100 text-red-800' :
                        testRequest.status === 'Superadmin_Approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {testRequest.status?.replace(/_/g, ' ') || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Test Details */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <TestTube className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        <span className="text-slate-700 text-xs font-medium truncate">{testRequest.testType || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span className="text-slate-700 text-xs font-medium truncate">{testRequest.centerName || testRequest.centerId?.name || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Urgency and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(testRequest.urgency)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(testRequest.urgency)}`}>
                          {testRequest.urgency || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs">{formatDate(testRequest.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        onClick={() => navigate(`/dashboard/centeradmin/test-requests/${testRequest._id}`)}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default TestRequestsList;
