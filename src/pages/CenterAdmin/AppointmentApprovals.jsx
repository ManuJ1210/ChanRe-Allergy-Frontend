import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  getCenterAppointments, 
  updateAppointmentStatus 
} from '../../services/api';

const AppointmentApprovals = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [filter, setFilter] = useState('pending'); // Only show pending by default
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('preferredDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Get center ID from user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const centerId = user.centerId ? (typeof user.centerId === 'object' ? user.centerId._id || user.centerId.toString() : user.centerId) : null;

  useEffect(() => {
    if (centerId) {
      fetchAppointments();
    }
  }, [centerId]);

  // Filter appointments based on current filter
  const filteredAppointments = allAppointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date sorting
    if (sortField === 'preferredDate' || sortField === 'createdAt' || sortField === 'bookedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const appointments = sortedAppointments.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Fetch all appointments by not passing status parameter
      const response = await getCenterAppointments(centerId);
      if (response.success) {
        setAllAppointments(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch appointment requests');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      setUpdateLoading(true);
      const response = await updateAppointmentStatus(appointmentId, 'confirmed');
      if (response.success) {
        toast.success('Appointment approved successfully!');
        setShowModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Failed to approve appointment');
      console.error('Error approving appointment:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      setUpdateLoading(true);
      const response = await updateAppointmentStatus(appointmentId, 'cancelled');
      if (response.success) {
        toast.success('Appointment rejected');
        setShowModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Failed to reject appointment');
      console.error('Error rejecting appointment:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPriorityColor = (appointment) => {
    const appointmentDate = new Date(appointment.preferredDate);
    const today = new Date();
    const daysUntilAppointment = Math.ceil((appointmentDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilAppointment <= 1) return 'text-red-600';
    if (daysUntilAppointment <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (!centerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <p className="text-red-800 text-lg font-semibold">No center ID found. Please contact administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Appointment Approvals</h1>
          <p className="text-slate-600 text-lg">Review and approve patient appointment requests for your center</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex space-x-2 bg-slate-100 p-2 rounded-lg">
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                filter === 'pending'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              ⏳ Pending ({allAppointments.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                filter === 'confirmed'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              ✅ Approved ({allAppointments.filter(a => a.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              📋 All ({allAppointments.length})
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2490eb]"></div>
              <p className="mt-4 text-slate-600 text-lg">Loading appointment requests...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 text-8xl mb-6">📅</div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-3">No appointment requests</h3>
              <p className="text-slate-600 text-lg">
                {filter === 'pending' 
                  ? 'No pending appointments to review.' 
                  : 'No appointments found for the selected filter.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleSort('patientName')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Patient</span>
                          {sortField === 'patientName' && (
                            <span className="text-[#2490eb] font-bold">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleSort('preferredDate')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Date & Time</span>
                          {sortField === 'preferredDate' && (
                            <span className="text-[#2490eb] font-bold">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Status</span>
                          {sortField === 'status' && (
                            <span className="text-[#2490eb] font-bold">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-slate-900">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-slate-500">
                              Age: {appointment.patientAge} | {appointment.patientGender}
                            </div>
                            <div className="text-xs text-[#2490eb] mt-1 font-medium">
                              Code: {appointment.confirmationCode}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className={`text-sm font-semibold ${getPriorityColor(appointment)}`}>
                              {formatDate(appointment.preferredDate)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {appointment.preferredTime}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm text-slate-900 font-medium">
                              {appointment.patientPhone}
                            </div>
                            <div className="text-sm text-slate-500">
                              {appointment.patientEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-medium capitalize">
                            {appointment.appointmentType}
                          </div>
                          <div className="text-sm text-slate-500">
                            {appointment.contactMethod}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {appointment.status === 'pending' && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                              ⏳ PENDING
                            </span>
                          )}
                          {appointment.status === 'confirmed' && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                              ✅ APPROVED
                            </span>
                          )}
                          {appointment.status === 'cancelled' && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                              ❌ CANCELLED
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(appointment._id)}
                                  disabled={updateLoading}
                                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                  title="Approve Appointment"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(appointment._id)}
                                  disabled={updateLoading}
                                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                  title="Reject Appointment"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openModal(appointment)}
                              className="inline-flex items-center px-3 py-2 bg-[#2490eb] text-white text-xs font-semibold rounded-lg hover:bg-[#14457b] transition-all duration-200 shadow-sm hover:shadow-md"
                              title="View Details"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    <span className="mr-2">←</span>
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    Next
                    <span className="ml-2">→</span>
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-semibold text-slate-700">Show:</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-[#2490eb] focus:border-[#2490eb] focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm font-semibold text-slate-700">per page</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedAppointments.length)} of {sortedAppointments.length} results
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-300 text-slate-500 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <span className="mr-1">←</span>
                      Prev
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm ${
                              currentPage === pageNum
                                ? 'bg-[#2490eb] text-white shadow-lg hover:bg-[#14457b]'
                                : 'bg-white border-2 border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-300 text-slate-500 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      Next
                      <span className="ml-1">→</span>
                    </button>
                  </div>
                </div>
              </div>
          </>
        )}
      </div>

        {/* Detailed Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-slate-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-2xl rounded-xl bg-white border-slate-200">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Appointment Details - {selectedAppointment.patientName}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                  >
                    <span className="text-3xl">&times;</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Patient Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-4 text-lg">Patient Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-slate-700">Name:</strong> <span className="text-slate-600">{selectedAppointment.patientName}</span></p>
                        <p><strong className="text-slate-700">Age:</strong> <span className="text-slate-600">{selectedAppointment.patientAge} years</span></p>
                        <p><strong className="text-slate-700">Gender:</strong> <span className="text-slate-600">{selectedAppointment.patientGender}</span></p>
                        <p><strong className="text-slate-700">Phone:</strong> <span className="text-slate-600">{selectedAppointment.patientPhone}</span></p>
                        <p><strong className="text-slate-700">Email:</strong> <span className="text-slate-600">{selectedAppointment.patientEmail}</span></p>
                        <p><strong className="text-slate-700">Address:</strong> <span className="text-slate-600">{selectedAppointment.patientAddress}</span></p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-4 text-lg">Appointment Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-slate-700">Date:</strong> <span className="text-slate-600">{formatDate(selectedAppointment.preferredDate)}</span></p>
                        <p><strong className="text-slate-700">Time:</strong> <span className="text-slate-600">{selectedAppointment.preferredTime}</span></p>
                        <p><strong className="text-slate-700">Type:</strong> <span className="text-slate-600">{selectedAppointment.appointmentType}</span></p>
                        <p><strong className="text-slate-700">Contact Method:</strong> <span className="text-slate-600">{selectedAppointment.contactMethod}</span></p>
                        <p><strong className="text-slate-700">Confirmation Code:</strong> <span className="text-[#2490eb] font-semibold">{selectedAppointment.confirmationCode}</span></p>
                        <p><strong className="text-slate-700">Recorded On:</strong> <span className="text-slate-600">{formatDateTime(selectedAppointment.bookedAt || selectedAppointment.createdAt)}</span></p>
                        {selectedAppointment.status === 'confirmed' && selectedAppointment.confirmedAt && (
                          <p><strong className="text-slate-700">Confirmed On:</strong> <span className="text-green-600 font-semibold">{formatDateTime(selectedAppointment.confirmedAt)}</span></p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-4 text-lg">Medical Information</h4>
                      <div className="space-y-4 text-sm">
                        <div>
                          <strong className="text-slate-700">Reason for Visit:</strong>
                          <p className="mt-2 text-slate-600 bg-white p-3 rounded-lg border border-slate-200">{selectedAppointment.reasonForVisit}</p>
                        </div>
                        {selectedAppointment.symptoms && (
                          <div>
                            <strong className="text-slate-700">Symptoms:</strong>
                            <p className="mt-2 text-slate-600 bg-white p-3 rounded-lg border border-slate-200">{selectedAppointment.symptoms}</p>
                          </div>
                        )}
                        {selectedAppointment.previousHistory && (
                          <div>
                            <strong className="text-slate-700">Previous History:</strong>
                            <p className="mt-2 text-slate-600 bg-white p-3 rounded-lg border border-slate-200">{selectedAppointment.previousHistory}</p>
                          </div>
                        )}
                        {selectedAppointment.notes && (
                          <div>
                            <strong className="text-slate-700">Additional Notes:</strong>
                            <p className="mt-2 text-slate-600 bg-white p-3 rounded-lg border border-slate-200">{selectedAppointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-4">
                  {selectedAppointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedAppointment._id)}
                        disabled={updateLoading}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Appointment
                      </button>
                      <button
                        onClick={() => handleReject(selectedAppointment._id)}
                        disabled={updateLoading}
                        className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject Appointment
                      </button>
                    </>
                  )}
                  <button
                    onClick={closeModal}
                    className="inline-flex items-center px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentApprovals;
