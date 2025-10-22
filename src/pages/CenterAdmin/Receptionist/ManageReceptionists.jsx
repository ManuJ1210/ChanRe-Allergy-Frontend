import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  fetchCenterAdminReceptionists, 
  deleteCenterAdminReceptionist, 
  toggleCenterAdminReceptionistStatus,
  fetchCenterAdminReceptionistStats,
  setFilters,
  clearError,
  clearSuccess 
} from '../../../features/centerAdmin/centerAdminReceptionistSlice';

const ManageReceptionists = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    receptionists, 
    loading, 
    error, 
    success, 
    message, 
    pagination, 
    filters,
    stats 
  } = useSelector((state) => state.centerAdminReceptionists);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    dispatch(fetchCenterAdminReceptionists({ 
      page: pagination.currentPage, 
      limit: itemsPerPage, 
      search: filters.search, 
      status: filters.status 
    }));
    dispatch(fetchCenterAdminReceptionistStats());
  }, [dispatch, pagination.currentPage, filters.search, filters.status, itemsPerPage]);

  useEffect(() => {
    if (success) {
      toast.success(message || 'Operation completed successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Clear the success state after showing the toast
      dispatch(clearSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Clear the error state after showing the toast
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    // Convert frontend status to backend isDeleted filter
    let backendFilter = '';
    if (status === 'active') {
      backendFilter = 'false'; // isDeleted: false
    } else if (status === 'inactive') {
      backendFilter = 'true'; // isDeleted: true
    }
    dispatch(setFilters({ status: backendFilter }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchCenterAdminReceptionists({ 
      page, 
      limit: itemsPerPage, 
      search: filters.search, 
      status: filters.status 
    }));
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    dispatch(fetchCenterAdminReceptionists({ 
      page: 1, 
      limit: newItemsPerPage, 
      search: filters.search, 
      status: filters.status 
    }));
  };

  const handleDelete = async () => {
    if (selectedReceptionist) {
      const result = await dispatch(deleteCenterAdminReceptionist(selectedReceptionist._id));
    
      setShowDeleteModal(false);
      setSelectedReceptionist(null);
    }
  };

  const handleToggleStatus = async (receptionist) => {
    const result = await dispatch(toggleCenterAdminReceptionistStatus(receptionist._id));
    // Toast will be shown by the success useEffect based on Redux state
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/dashboard/centeradmin/dashboard')}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors text-xs w-fit"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard/centeradmin/receptionist/addreceptionist')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-colors text-xs w-full sm:w-auto justify-center"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Add Receptionist
            </button>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Center Receptionists
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm text-center sm:text-left">
            Manage all receptionists in your center
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Total Receptionists</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Active Receptionists</p>
                <p className="text-sm sm:text-base font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-3 sm:p-4 lg:p-6 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">Inactive Receptionists</p>
                <p className="text-sm sm:text-base font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                <UserX className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-green-700 text-xs sm:text-sm">{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-red-700 text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-3 w-3 sm:h-4 sm:w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search receptionists by name, email, or username..."
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                />
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === '' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('active')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'false' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilter('inactive')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'true' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {receptionists.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {/* Left side - Results info and items per page */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-xs text-slate-600">
                    Showing {((pagination.currentPage - 1) * itemsPerPage) + 1} to {Math.min(pagination.currentPage * itemsPerPage, pagination.total)} of {pagination.total} results
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
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={pagination.currentPage === 1}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        pagination.currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <ArrowLeft className="h-3 w-3 sm:hidden" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage)}
                      className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white border border-blue-600"
                    >
                      {pagination.currentPage}
                    </button>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        pagination.currentPage === pagination.totalPages
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

        {/* Receptionists Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {loading ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-slate-600 font-medium text-xs sm:text-sm">Loading receptionists...</p>
                <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
              </div>
            ) : receptionists.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="bg-slate-100 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <UserCheck className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-2">No Receptionists Found</h3>
                <p className="text-slate-500 mb-4 sm:mb-6 text-xs sm:text-sm">Get started by adding your first receptionist.</p>
                <button
                  onClick={() => navigate('/dashboard/centeradmin/receptionist/addreceptionist')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  Add Receptionist
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {receptionists.map((receptionist) => (
                  <div key={receptionist._id} className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                            {receptionist.name ? receptionist.name.charAt(0).toUpperCase() : 'R'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800 text-xs sm:text-sm">{receptionist.name || 'Unknown'}</h3>
                          <p className="text-slate-500 text-xs">ID: {receptionist._id?.slice(-6)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        !receptionist.isDeleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {!receptionist.isDeleted ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        <span className="text-slate-700 text-xs font-medium truncate">{receptionist.email}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span className="text-slate-700 text-xs font-medium">{receptionist.phone || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500" />
                      <span className="text-slate-700 text-xs font-medium">@{receptionist.username || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      <span className="text-slate-700 text-xs font-medium">
                        Joined: {formatDate(receptionist.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-slate-200">
                      <button
                        onClick={() => navigate(`/dashboard/centeradmin/receptionist/viewreceptionist/${receptionist._id}`)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/centeradmin/receptionist/editreceptionist/${receptionist._id}`)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(receptionist)}
                        className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 ${
                          !receptionist.isDeleted 
                            ? 'bg-orange-50 hover:bg-orange-100 text-orange-700' 
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}
                      >
                        {!receptionist.isDeleted ? <UserX className="h-3 w-3 sm:h-4 sm:w-4" /> : <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />}
                        <span className="hidden sm:inline">{!receptionist.isDeleted ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReceptionist(receptionist);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Delete</span>
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
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Receptionist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-slate-600 text-xs">Loading receptionists...</span>
                        </div>
                      </td>
                    </tr>
                  ) : receptionists.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-slate-500 text-xs">
                        No receptionists found
                      </td>
                    </tr>
                  ) : (
                    receptionists.map((receptionist) => (
                      <tr key={receptionist._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">
                                {receptionist.name ? receptionist.name.charAt(0).toUpperCase() : 'R'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-xs font-medium text-slate-900">{receptionist.name || 'Unknown'}</div>
                              <div className="text-xs text-slate-500">ID: {receptionist._id?.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-slate-900">{receptionist.email}</div>
                          <div className="text-xs text-slate-500">{receptionist.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-900">
                          @{receptionist.username || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            !receptionist.isDeleted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {!receptionist.isDeleted ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {formatDate(receptionist.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/centeradmin/receptionist/viewreceptionist/${receptionist._id}`)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/centeradmin/receptionist/editreceptionist/${receptionist._id}`)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(receptionist)}
                              className={`p-1 ${
                                !receptionist.isDeleted 
                                  ? 'text-orange-600 hover:text-orange-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={!receptionist.isDeleted ? 'Deactivate' : 'Activate'}
                            >
                              {!receptionist.isDeleted ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReceptionist(receptionist);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">Confirm Delete</h3>
            <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm">
              Are you sure you want to delete <strong>{selectedReceptionist?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReceptionists; 