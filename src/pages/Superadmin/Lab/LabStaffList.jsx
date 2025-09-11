import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabStaff, deleteLabStaff } from '../../../features/superadmin/superadminThunks';
import { Trash2, Edit, UserCheck, Plus, Search, Microscope, User, Mail, Phone, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LabStaffList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { labStaff = [], loading, deleteSuccess } = useSelector((state) => state.superadmin);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    dispatch(fetchLabStaff());
  }, [dispatch]);

  // Calculate pagination
  const totalPages = Math.ceil(labStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLabStaff = labStaff.slice(startIndex, endIndex);

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

  useEffect(() => {
    if (deleteSuccess) {
      // Refresh the list after successful deletion
      dispatch(fetchLabStaff());
    }
  }, [deleteSuccess, dispatch]);

  const handleDelete = (staffId) => {
    if (window.confirm('Are you sure you want to delete this lab staff member?')) {
      dispatch(deleteLabStaff(staffId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-lg sm:text-xl md:text-xl font-bold text-slate-800 mb-2 sm:text-left  bg-clip-text ">
            Lab Staff Management
          </h1>
          <p className="text-slate-600 text-xs sm:text-base text-center sm:text-left max-w-2xl">
            Manage and monitor all laboratory staff members across your healthcare network
          </p>
        </div>

        {/* Success Message */}
        {deleteSuccess && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-center shadow-sm">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-700 text-xs sm:text-base font-medium">Lab staff member deleted successfully</span>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 mb-4 sm:mb-6 md:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-sm sm:text-lg font-semibold text-slate-800 flex items-center justify-center sm:justify-start mb-2">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Microscope className="h-5 w-5 text-blue-600" />
                  </div>
                  Laboratory Staff
                </h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-6 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Total: <span className="font-semibold text-blue-600">{labStaff.length}</span> staff members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active: <span className="font-semibold text-green-600">{labStaff.length}</span></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/Superadmin/Lab/AddLabStaff')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-base w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Add New Staff
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {labStaff.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side - Results info and items per page */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-xs text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, labStaff.length)} of {labStaff.length} results
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

        {/* Lab Staff Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-xs sm:text-base font-medium">Loading lab staff...</p>
                <p className="text-slate-500 text-xs sm:text-xs mt-1">Please wait while we fetch the data</p>
              </div>
            ) : labStaff.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="bg-slate-100 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Microscope className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-slate-700 mb-2">No Lab Staff Found</h3>
                <p className="text-slate-500 mb-6 text-xs sm:text-base max-w-md mx-auto">Get started by adding your first laboratory staff member to manage your healthcare operations.</p>
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Lab/AddLabStaff')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Staff
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {currentLabStaff.map((staff) => (
                  <div key={staff._id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 sm:p-5 space-y-4 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    {/* Staff Info Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                          <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-base sm:text-sm mb-1">{staff.staffName}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="truncate">{staff.email}</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                        {staff.role || 'Lab Staff'}
                      </span>
                    </div>
                    
                    {/* Contact & Date Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-700 text-xs font-medium">{staff.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700 text-xs font-medium">
                          {new Date(staff.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => navigate(`/dashboard/Superadmin/Lab/EditLabStaff/${staff._id}`)}
                        className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(staff._id)}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-red-200 hover:border-red-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        {loading ? 'Deleting...' : 'Delete'}
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
                      Staff Member
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                          <p className="text-slate-600 font-medium">Loading lab staff...</p>
                          <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
                        </div>
                      </td>
                    </tr>
                  ) : labStaff.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12">
                        <div className="text-center">
                          <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Microscope className="h-12 w-12 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Lab Staff Found</h3>
                          <p className="text-slate-500 mb-6 text-base max-w-md mx-auto">Get started by adding your first laboratory staff member to manage your healthcare operations.</p>
                          <button
                            onClick={() => navigate('/dashboard/Superadmin/Lab/AddLabStaff')}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Plus className="h-4 w-4" />
                            Add Staff
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentLabStaff.map((staff) => (
                      <tr key={staff._id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-4">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900">{staff.staffName}</div>
                              <div className="text-xs text-slate-500">{staff.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-900 font-medium">{staff.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                            {staff.role || 'Lab Staff'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600">
                            {new Date(staff.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-3">
                            <button
                              onClick={() => navigate(`/dashboard/Superadmin/Lab/EditLabStaff/${staff._id}`)}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(staff._id)}
                              disabled={loading}
                              className="bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 border border-red-200 hover:border-red-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                              {loading ? 'Deleting...' : 'Delete'}
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
    </div>
  );
} 