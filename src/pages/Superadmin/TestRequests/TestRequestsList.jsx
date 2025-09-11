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
  const [centerFilter, setCenterFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    fetchTestRequests();
    fetchCenters();
  }, [currentPage, statusFilter, urgencyFilter, centerFilter, itemsPerPage]);

  const fetchTestRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(urgencyFilter !== 'all' && { urgency: urgencyFilter }),
        ...(centerFilter !== 'all' && { centerId: centerFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await API.get(`/test-requests?${params}`);
      
      
      const testRequestsData = response.data.testRequests || response.data || [];
      setTestRequests(testRequestsData);
      
      // Set total pages
      const totalPagesFromAPI = response.data.pagination?.totalPages || response.data.totalPages || 1;
      setTotalPages(totalPagesFromAPI);
      
      // Set total items - use API data if available, otherwise use current page data length as fallback
      const totalItemsFromAPI = response.data.pagination?.totalItems || response.data.totalItems;
      if (totalItemsFromAPI !== undefined && totalItemsFromAPI !== null) {
        setTotalItems(totalItemsFromAPI);
      } else {
        // Fallback: if we're on the first page and have data, use the length
        // This is not ideal but prevents showing "0 results" when there's actually data
        setTotalItems(testRequestsData.length);
      }
      
    } catch (error) {
      console.error('❌ Frontend: Error fetching test requests:', error);
      setError('Failed to load test requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await API.get('/centers');
      setCenters(response.data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Billing_Pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Billing_Generated':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'Billing_Paid':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
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
    setCenterFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination handlers
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && testRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-xs sm:text-base">Loading test requests...</p>
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
          <h1 className="text-xl sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Test Requests Overview
          </h1>
          <p className="text-slate-600 text-xs sm:text-base text-center sm:text-left">
            Monitor all test requests across all centers
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
                <p className="text-xl font-bold text-slate-800">{testRequests.length}</p>
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
                <p className="text-xl font-bold text-slate-800">
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
                <p className="text-xl font-bold text-slate-800">
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
                <p className="text-xl font-bold text-slate-800">
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
                />
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
              >
                <option value="all">All Statuses</option>
                <option value="Billing_Pending">Billing Pending</option>
                <option value="Billing_Generated">Billing Generated</option>
                <option value="Billing_Paid">Billing Paid</option>
                <option value="Superadmin_Review">Pending Review</option>
                <option value="Superadmin_Approved">Approved</option>
                <option value="Superadmin_Rejected">Rejected</option>
                <option value="Assigned">Assigned to Lab</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
              >
                <option value="all">All Urgencies</option>
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
              </select>

              <select
                value={centerFilter}
                onChange={(e) => setCenterFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-base"
              >
                <option value="all">All Centers</option>
                {centers.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleFilterReset}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-xs sm:text-base flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {testRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side - Results info and items per page */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-xs text-slate-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems || testRequests.length)} of {totalItems || testRequests.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                      className="px-3 py-1 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={7}>7</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-xs text-slate-600">per page</span>
                  </div>
                </div>

                {/* Right side - Page navigation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white border border-blue-600"
                    >
                      {currentPage}
                    </button>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                        onClick={() => navigate(`/dashboard/superadmin/test-requests/${testRequest._id}`)}
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
              <p className="text-slate-500 text-xs sm:text-base">No test requests found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TestRequestsList;
