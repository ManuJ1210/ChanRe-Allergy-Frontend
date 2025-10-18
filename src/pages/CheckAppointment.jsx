import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getAppointmentByCode, cancelAppointment } from '../services/api';
import HomeHeader from '../components/HomeHeader';
import { Dice1 } from 'lucide-react';

const CheckAppointment = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const handleCheckAppointment = async (e) => {
    e.preventDefault();
    
    if (!confirmationCode.trim()) {
      toast.error('Please enter your confirmation code');
      return;
    }

    try {
      setLoading(true);
      const response = await getAppointmentByCode(confirmationCode);
      if (response.success) {
        setAppointment(response.data);
        toast.success('Appointment found!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Appointment not found');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      const response = await cancelAppointment(confirmationCode, cancellationReason);
      if (response.success) {
        toast.success('Appointment cancelled successfully');
        setShowCancelForm(false);
        setCancellationReason('');
        // Refresh appointment data
        handleCheckAppointment({ preventDefault: () => {} });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'cancelled': return '❌';
      case 'completed': return '🏥';
      case 'no_show': return '👤';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <HomeHeader />
      
      {/* Hero Section - Matching BookAppointment Theme */}
      <section className="relative pt-32 bg-gray-50 pb-12">
        <div className="w-4/5 mx-auto px-4">
          <div className="text-center mb-8">
            {/* Clinic Badge */}
            <div className="inline-block mb-4 mt-10">
              <div
                className="bg-[#e0f2fe] text-[#2490eb] px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                CHECK APPOINTMENT STATUS
              </div>
            </div>

            {/* Main Heading */}
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight text-[#18100f] mb-4"
              style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
            >
              View Your<br />
              <span className="text-[#2490eb]">Appointment Details</span>
            </h1>

            {/* Description */}
            <p
              className="text-[#666666] text-base leading-relaxed max-w-xl mx-auto"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Enter your confirmation code to view your appointment details and current status.
            </p>
          </div>

          {/* Search Form - Matching BookAppointment Style */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 max-w-lg mx-auto">
            <form onSubmit={handleCheckAppointment}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter your 6-digit confirmation code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent text-center text-lg font-mono tracking-widest"
                  maxLength="6"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code you received</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '12px', fontWeight: '600' }}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Appointment Details - Matching BookAppointment Theme */}
      {appointment && (
        <section className="pb-12 ">
          <div className="w-4/5 mx-auto px-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Status Header */}
              <div className="bg-[#e0f2fe] rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#2490eb] rounded-full flex items-center justify-center">
                      <span className="text-2xl text-white">{getStatusIcon(appointment.status)}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#18100f]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        Appointment Details
                      </h2>
                      <p className="text-[#2490eb] font-semibold capitalize">{appointment.status} Status</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2490eb] text-sm font-medium">Confirmation Code</p>
                    <p className="text-2xl font-mono font-bold text-[#18100f]">{appointment.confirmationCode}</p>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-[#2490eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#18100f]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Patient Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Name</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.patientName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Age</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.patientAge} years</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Gender</span>
                      <span className="text-sm font-semibold text-[#18100f] capitalize">{appointment.patientGender}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Phone</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.patientPhone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Email</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.patientEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-[#2490eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#18100f]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Appointment Details
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Center</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.centerName}</span>
                    </div>
                    <div className="flex justify-between items-start py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Address</span>
                      <span className="text-sm font-semibold text-[#18100f] text-right max-w-32">{appointment.centerAddress}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Phone</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.centerPhone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Date</span>
                      <span className="text-sm font-semibold text-[#18100f]">{formatDate(appointment.preferredDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Time</span>
                      <span className="text-sm font-semibold text-[#18100f]">{appointment.preferredTime}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Type</span>
                      <span className="text-sm font-semibold text-[#18100f] capitalize">{appointment.appointmentType}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-[#2490eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#18100f]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      Medical Information
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {appointment.reasonForVisit && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Reason for Visit</h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{appointment.reasonForVisit}</p>
                      </div>
                    )}
                    {appointment.symptoms && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Symptoms</h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{appointment.symptoms}</p>
                      </div>
                    )}
                    {appointment.previousHistory && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Medical History</h4>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{appointment.previousHistory}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 bg-[#e0f2fe] rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#2490eb] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#18100f]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Contact Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Center Email</p>
                    <p className="text-sm font-semibold text-[#18100f]">{appointment.centerEmail}</p>
                  </div>
                  {appointment.centerPhone && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Center Phone</p>
                      <p className="text-sm font-semibold text-[#18100f]">{appointment.centerPhone}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-[#2490eb] bg-opacity-10 rounded-lg">
                  <p className="text-sm text-[#2490eb]">
                    <strong>Note:</strong> Please contact the center directly if you have any questions or need to reschedule your appointment.
                  </p>
                </div>
              </div>

              {/* Status Display */}
              <div className="mt-6">
                {appointment.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl">⏳</span>
                      </div>
                      <h3 className="text-lg font-semibold text-yellow-800">Appointment Pending Approval</h3>
                    </div>
                    <p className="text-yellow-700">
                      Your appointment request is currently under review by our medical staff. A receptionist will contact you within 24 hours to confirm your appointment details.
                    </p>
                  </div>
                )}
                {appointment.status === 'confirmed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl">✅</span>
                      </div>
                      <h3 className="text-lg font-semibold text-green-800">Appointment Confirmed</h3>
                    </div>
                    <p className="text-green-700">
                      Your appointment has been approved! Please arrive 15 minutes before your scheduled time. Bring a valid ID and any relevant medical documents.
                    </p>
                  </div>
                )}
                {appointment.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl">❌</span>
                      </div>
                      <h3 className="text-lg font-semibold text-red-800">Appointment Cancelled</h3>
                    </div>
                    <p className="text-red-700">
                      This appointment has been cancelled. Please contact our center to schedule a new appointment at your convenience.
                    </p>
                  </div>
                )}
                {appointment.status === 'completed' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xl">🏥</span>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-800">Appointment Completed</h3>
                    </div>
                    <p className="text-blue-700">
                      Thank you for choosing our medical center. We hope you had a positive experience and wish you good health.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                {appointment.status === 'pending' && (
                  <button
                    onClick={() => setShowCancelForm(true)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                  >
                    Cancel Appointment
                  </button>
                )}
                <button
                  onClick={() => {
                    setAppointment(null);
                    setConfirmationCode('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  Check Another Appointment
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cancel Modal - Matching Theme */}
      {showCancelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#18100f] mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Cancel Appointment
              </h3>
              <p className="text-gray-600">Please provide a reason for cancellation</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Reason for Cancellation
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent resize-none"
                placeholder="Please provide a reason for cancelling your appointment..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowCancelForm(false);
                  setCancellationReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="px-4 py-2 bg-[#2490eb] text-white rounded-lg hover:bg-[#14457b] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckAppointment;