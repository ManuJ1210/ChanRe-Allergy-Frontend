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
  Stethoscope,
  Calendar,
  Building
} from 'lucide-react';
import { 
  fetchCenterAdminDoctors, 
  deleteCenterAdminDoctor, 
  toggleCenterAdminDoctorStatus,
  fetchCenterAdminDoctorStats,
  setFilters,
  clearError,
  clearSuccess 
} from '../../../features/centerAdmin/centerAdminDoctorSlice';
import { toast } from 'react-toastify';

const DoctorList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    doctors, 
    loading, 
    error, 
    success, 
    message, 
    pagination, 
    filters,
    stats 
  } = useSelector((state) => state.centerAdminDoctors);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    dispatch(fetchCenterAdminDoctors({ 
      page: pagination.currentPage, 
      limit: pagination.limit, 
      search: filters.search, 
      status: filters.status 
    }));
    dispatch(fetchCenterAdminDoctorStats());
  }, [dispatch, pagination.currentPage, filters.search, filters.status]);

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
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
    dispatch(fetchCenterAdminDoctors({ 
      page, 
      limit: pagination.limit, 
      search: filters.search, 
      status: filters.status 
    }));
  };

  const handleDelete = async () => {
    if (selectedDoctor) {
      const result = await dispatch(deleteCenterAdminDoctor(selectedDoctor._id));
      if (deleteCenterAdminDoctor.fulfilled.match(result)) {
       
      }
      setShowDeleteModal(false);
      setSelectedDoctor(null);
    }
  };

  const handleToggleStatus = async (doctor) => {
    const result = await dispatch(toggleCenterAdminDoctorStatus(doctor._id));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/dashboard/centeradmin/dashboard')}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors text-xs w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard/centeradmin/doctors/adddoctor')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              Add Doctor
            </button>
          </div>
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left  bg-clip-text ">
            Center Doctors
          </h1>
          <p className="text-slate-600 text-xs text-center sm:text-left">
            Manage all doctors in your center
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Doctors</p>
                <p className="text-sm font-bold text-slate-800">{stats.total || 0}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Active Doctors</p>
                <p className="text-sm font-bold text-green-600">{stats.active || 0}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Inactive Doctors</p>
                <p className="text-sm font-bold text-red-600">{stats.inactive || 0}</p>
              </div>
              <div className="bg-red-100 p-2 sm:p-3 rounded-xl">
                <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctors by name, email, or username..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                />
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  statusFilter === '' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('active')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  statusFilter === 'false' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilter('inactive')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  statusFilter === 'true' 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium text-xs">Loading doctors...</p>
                <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">No Doctors Found</h3>
                <p className="text-slate-500 mb-6 text-xs">Get started by adding your first doctor.</p>
                <button
                  onClick={() => navigate('/dashboard/centeradmin/doctors/adddoctor')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add Doctor
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-4 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-xs">
                            {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">Dr. {doctor.name || 'Unknown'}</h3>
                          <p className="text-slate-500 text-xs">@{doctor.username || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        !doctor.isDeleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {!doctor.isDeleted ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-700 text-xs font-medium">{doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700 text-xs font-medium">{doctor.phone || doctor.mobile || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Stethoscope className="h-4 w-4 text-indigo-500" />
                        <span className="text-slate-700 text-xs font-medium">
                          {doctor.specializations && doctor.specializations.length > 0 
                            ? doctor.specializations.join(', ')
                            : doctor.specialization || 'General'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Building className="h-4 w-4 text-purple-500" />
                        <span className="text-slate-700 text-xs font-medium">{doctor.hospitalName || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-slate-700 text-xs font-medium">
                        Joined: {formatDate(doctor.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => navigate(`/dashboard/centeradmin/doctors/viewdoctor/${doctor._id}`)}
                        className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/centeradmin/doctors/editdoctor/${doctor._id}`)}
                        className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-green-200 hover:border-green-300 hover:shadow-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(doctor)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 border ${
                          !doctor.isDeleted 
                            ? 'bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 text-orange-700 border-orange-200 hover:border-orange-300' 
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 border-green-200 hover:border-green-300'
                        } hover:shadow-sm`}
                      >
                        {!doctor.isDeleted ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        {!doctor.isDeleted ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-red-200 hover:border-red-300 hover:shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                          <span className="ml-3 text-slate-600 font-medium text-xs">Loading doctors...</span>
                        </div>
                      </td>
                    </tr>
                  ) : doctors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <div className="text-center">
                          <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCheck className="h-12 w-12 text-slate-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">No Doctors Found</h3>
                          <p className="text-slate-500 mb-6 text-xs">Get started by adding your first doctor.</p>
                          <button
                            onClick={() => navigate('/dashboard/centeradmin/doctors/adddoctor')}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs"
                          >
                            <Plus className="h-4 w-4" />
                            Add Doctor
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr key={doctor._id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">
                                {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-xs font-semibold text-slate-900">Dr. {doctor.name || 'Unknown'}</div>
                              <div className="text-xs text-slate-500">@{doctor.username || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-slate-900">{doctor.email}</div>
                          <div className="text-xs text-slate-500">{doctor.phone || doctor.mobile || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-slate-900">
                            {doctor.specializations && doctor.specializations.length > 0 
                              ? doctor.specializations.join(', ')
                              : doctor.specialization || 'General'
                            }
                          </div>
                          <div className="text-xs text-slate-500">{doctor.hospitalName || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            !doctor.isDeleted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {!doctor.isDeleted ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {formatDate(doctor.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/centeradmin/doctors/viewdoctor/${doctor._id}`)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/centeradmin/doctors/editdoctor/${doctor._id}`)}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(doctor)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                !doctor.isDeleted 
                                  ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              }`}
                              title={!doctor.isDeleted ? 'Deactivate' : 'Activate'}
                            >
                              {!doctor.isDeleted ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-700 text-center sm:text-left">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 text-xs text-slate-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 mb-6 text-xs">
              Are you sure you want to delete <strong>Dr. {selectedDoctor?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 text-xs font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

export default DoctorList;
