import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getAppointmentByCode, cancelAppointment } from '../services/api';
import HomeHeader from '../components/HomeHeader';
import { Dice1 } from 'lucide-react';
import TopHeader from '../components/TopHeader';  
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
      <TopHeader />
      <HomeHeader />
      
      {/* Hero Section - Matching BookAppointment Theme */}
      <section className="relative pt-22 mt-10 ">
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      appointment.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse' :
                      appointment.status === 'confirmed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                      appointment.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                      appointment.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                      'bg-[#2490eb]'
                    }`}>
                      <span className="text-2xl text-white">{getStatusIcon(appointment.status)}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#18100f]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        Appointment Details
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          appointment.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-300 animate-pulse' :
                          appointment.status === 'confirmed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300' :
                          appointment.status === 'cancelled' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300' :
                          appointment.status === 'completed' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-300' :
                          'bg-[#2490eb] text-white'
                        }`}>
                          {getStatusIcon(appointment.status)} {appointment.status.toUpperCase()}
                        </span>
                      </div>
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
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#18100f]">
                          {appointment.confirmedDate ? formatDate(appointment.confirmedDate) : formatDate(appointment.preferredDate)}
                        </span>
                        {appointment.confirmedDate && (
                          <div className="text-xs text-green-600 font-medium">✓ Confirmed</div>
                        )}
                        {!appointment.confirmedDate && (
                          <div className="text-xs text-yellow-600 font-medium">⏳ Preferred</div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Time</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#18100f]">
                          {appointment.confirmedTime || appointment.preferredTime}
                        </span>
                        {appointment.confirmedTime && (
                          <div className="text-xs text-green-600 font-medium">✓ Confirmed</div>
                        )}
                        {!appointment.confirmedTime && (
                          <div className="text-xs text-yellow-600 font-medium">⏳ Preferred</div>
                        )}
                      </div>
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
                <div className="mt-6 p-4 bg-gradient-to-r from-[#2490eb] to-[#14457b] rounded-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base mb-1">Important Notice</h4>
                      <p className="text-white text-sm leading-relaxed">
                        Please contact the center directly if you have any questions or need to reschedule your appointment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              <div className="mt-6">
                {appointment.status === 'pending' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center mr-4 animate-pulse">
                        <svg className="w-6 h-6 text-yellow-600 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-yellow-800 mb-1">⏳ Appointment Pending Approval</h3>
                        <p className="text-yellow-600 text-sm font-medium">Status: Under Review</p>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-yellow-700 font-medium">
                        Your appointment request is currently under review by our medical staff. A receptionist will contact you within 24 hours to confirm your appointment details.
                      </p>
                      <div className="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                        <p className="text-yellow-800 font-semibold text-sm">
                          📅 Your Preferred Time: {formatDate(appointment.preferredDate)} at {appointment.preferredTime}
                        </p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Note: The final appointment time may be adjusted based on doctor availability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {appointment.status === 'confirmed' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800 mb-1">✅ Appointment Confirmed</h3>
                        <p className="text-green-600 text-sm font-medium">Status: Approved</p>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-green-200">
                      <p className="text-green-700 font-medium">
                        Your appointment has been approved! Please arrive 15 minutes before your scheduled time. Bring a valid ID and any relevant medical documents.
                      </p>
                      {appointment.confirmedDate && appointment.confirmedTime && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-300">
                          <p className="text-green-800 font-semibold text-sm">
                            📅 Final Schedule: {formatDate(appointment.confirmedDate)} at {appointment.confirmedTime}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {appointment.status === 'cancelled' && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-rose-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-800 mb-1">❌ Appointment Cancelled</h3>
                        <p className="text-red-600 text-sm font-medium">Status: Cancelled</p>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-red-200">
                      <p className="text-red-700 font-medium">
                        This appointment has been cancelled. Please contact our center to schedule a new appointment at your convenience.
                      </p>
                    </div>
                  </div>
                )}
                {appointment.status === 'completed' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-800 mb-1">🏥 Appointment Completed</h3>
                        <p className="text-blue-600 text-sm font-medium">Status: Completed</p>
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-blue-700 font-medium">
                        Thank you for choosing our medical center. We hope you had a positive experience and wish you good health.
                      </p>
                    </div>
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