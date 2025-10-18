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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">No center ID found. Please contact administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointment Approvals</h1>
        <p className="text-gray-600">Review and approve patient appointment requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⏳ Pending ({allAppointments.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✅ Approved ({allAppointments.filter(a => a.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 All ({allAppointments.length})
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading appointment requests...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointment requests</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'No pending appointments to review.' 
                : 'No appointments found for the selected filter.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('patientName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Patient</span>
                        {sortField === 'patientName' && (
                          <span className="text-blue-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('preferredDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date & Time</span>
                        {sortField === 'preferredDate' && (
                          <span className="text-blue-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <span className="text-blue-600">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Age: {appointment.patientAge} | {appointment.patientGender}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Code: {appointment.confirmationCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className={`text-sm font-medium ${getPriorityColor(appointment)}`}>
                            {formatDate(appointment.preferredDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.preferredTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            {appointment.patientPhone}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {appointment.appointmentType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.contactMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.status === 'pending' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⏳ PENDING
                          </span>
                        )}
                        {appointment.status === 'confirmed' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✅ APPROVED
                          </span>
                        )}
                        {appointment.status === 'cancelled' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedAppointments.length)} of {sortedAppointments.length} results
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    ←
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Appointment Details - {selectedAppointment.patientName}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Patient Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                      <p><strong>Age:</strong> {selectedAppointment.patientAge} years</p>
                      <p><strong>Gender:</strong> {selectedAppointment.patientGender}</p>
                      <p><strong>Phone:</strong> {selectedAppointment.patientPhone}</p>
                      <p><strong>Email:</strong> {selectedAppointment.patientEmail}</p>
                      <p><strong>Address:</strong> {selectedAppointment.patientAddress}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Appointment Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Date:</strong> {formatDate(selectedAppointment.preferredDate)}</p>
                      <p><strong>Time:</strong> {selectedAppointment.preferredTime}</p>
                      <p><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                      <p><strong>Contact Method:</strong> {selectedAppointment.contactMethod}</p>
                      <p><strong>Confirmation Code:</strong> {selectedAppointment.confirmationCode}</p>
                      <p><strong>Recorded On:</strong> {formatDateTime(selectedAppointment.bookedAt || selectedAppointment.createdAt)}</p>
                      {selectedAppointment.status === 'confirmed' && selectedAppointment.confirmedAt && (
                        <p><strong>Confirmed On:</strong> {formatDateTime(selectedAppointment.confirmedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Medical Information</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Reason for Visit:</strong>
                        <p className="mt-1 text-gray-600">{selectedAppointment.reasonForVisit}</p>
                      </div>
                      {selectedAppointment.symptoms && (
                        <div>
                          <strong>Symptoms:</strong>
                          <p className="mt-1 text-gray-600">{selectedAppointment.symptoms}</p>
                        </div>
                      )}
                      {selectedAppointment.previousHistory && (
                        <div>
                          <strong>Previous History:</strong>
                          <p className="mt-1 text-gray-600">{selectedAppointment.previousHistory}</p>
                        </div>
                      )}
                      {selectedAppointment.notes && (
                        <div>
                          <strong>Additional Notes:</strong>
                          <p className="mt-1 text-gray-600">{selectedAppointment.notes}</p>
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
  );
};

export default AppointmentApprovals;
