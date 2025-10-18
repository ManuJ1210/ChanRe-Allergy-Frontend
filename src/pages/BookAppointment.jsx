import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  getAllCentersForBooking, 
  getNearbyCenters, 
  bookAppointment 
} from '../services/api';
import HomeHeader from '../components/HomeHeader';

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    patientAddress: '',
    preferredDate: '',
    preferredTime: '',
    appointmentType: 'consultation',
    reasonForVisit: '',
    symptoms: '',
    previousHistory: '',
    contactMethod: 'phone',
    preferredContactTime: '',
    notes: '',
    patientLocation: {
      latitude: null,
      longitude: null,
      city: '',
      state: '',
      pincode: ''
    }
  });

  // Time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
  ];

  useEffect(() => {
    fetchCenters();
    getUserLocation();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await getAllCentersForBooking();
      if (response.success) {
        setCenters(response.data);
        setFilteredCenters(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch centers');
      console.error('Error fetching centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setFormData(prev => ({
            ...prev,
            patientLocation: {
              ...prev.patientLocation,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      patientLocation: {
        ...prev.patientLocation,
        [name]: value
      }
    }));
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    setStep(2);
  };

  const handleSearchCenters = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = centers.filter(center => 
      center.name.toLowerCase().includes(searchTerm) ||
      center.location.toLowerCase().includes(searchTerm) ||
      center.address.toLowerCase().includes(searchTerm)
    );
    setFilteredCenters(filtered);
  };

  const handleNearbySearch = async () => {
    if (!userLocation) {
      toast.error('Location access is required for nearby search');
      return;
    }

    try {
      setLoading(true);
      const response = await getNearbyCenters(
        userLocation.latitude, 
        userLocation.longitude
      );
      if (response.success) {
        setFilteredCenters(response.data);
        toast.success('Found nearby centers');
      }
    } catch (error) {
      toast.error('Failed to find nearby centers');
      console.error('Error fetching nearby centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = [
      'patientName', 'patientEmail', 'patientPhone', 'patientAge', 
      'patientGender', 'patientAddress', 'preferredDate', 'preferredTime', 'reasonForVisit'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return;
      }
    }

    if (!selectedCenter) {
      toast.error('Please select a center');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        ...formData,
        centerId: selectedCenter._id,
        preferredDate: new Date(formData.preferredDate).toISOString()
      };

      const response = await bookAppointment(appointmentData);
      
      if (response.success) {
        toast.success('Appointment booked successfully!');
        setStep(3);
        // Store confirmation details for display
        setFormData(prev => ({
          ...prev,
          confirmationCode: response.data.confirmationCode,
          appointmentId: response.data.appointmentId
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="font-sans bg-gray-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12">
        <div className="w-4/5 mx-auto px-4">
          <div className="text-center mb-8">
            {/* Clinic Badge */}
            <div className="inline-block mb-4">
              <div
                className="bg-[#e0f2fe] text-[#2490eb] px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                BOOK YOUR APPOINTMENT
              </div>
            </div>

            {/* Main Heading */}
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight text-[#18100f] mb-4"
              style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
            >
              Choose Your<br />
              <span className="text-[#2490eb]">Preferred Center</span>
            </h1>

            {/* Description */}
            <p
              className="text-[#666666] text-base leading-relaxed max-w-xl mx-auto"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Select from our network of specialized allergy centers. Find the most convenient location for your consultation.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Centers
                </label>
                <input
                  type="text"
                  placeholder="Search by center name, location, or address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                  onChange={handleSearchCenters}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleNearbySearch}
                  disabled={!userLocation || loading}
                  className="px-4 py-2 bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '12px', fontWeight: '600' }}
                >
                  {loading ? 'Searching...' : 'Find Nearby'}
                </button>
              </div>
            </div>
            
            {userLocation && (
              <div className="bg-[#e0f2fe] p-3 rounded-lg">
                <p className="text-[#2490eb] font-medium text-sm">
                  📍 Location detected: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Centers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <div
                key={center._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#2490eb] transition-all duration-300 cursor-pointer group"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-[#e0f2fe] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#2490eb] transition-colors">
                    <svg className="w-6 h-6 text-[#2490eb] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{center.name}</h3>
                </div>
                
                <div className="space-y-2 text-gray-600 mb-4 text-sm">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-[#2490eb] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">{center.location}</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-[#2490eb] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">{center.address}</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-[#2490eb] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-xs">{center.email}</span>
                  </div>
                  {center.phone && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-[#2490eb] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="text-xs">{center.phone}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleCenterSelect(center)}
                  className="w-full bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase py-2 px-4 rounded-lg transition-all duration-300 shadow-sm"
                  style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '12px', fontWeight: '600' }}
                >
                  Select This Center
                </button>
              </div>
            ))}
          </div>

          {filteredCenters.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No centers found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderStep2 = () => (
    <div className="font-sans bg-gray-50 text-slate-800">
      <section className="relative pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            {/* Clinic Badge */}
            <div className="inline-block mb-4">
              <div
                className="bg-[#e0f2fe] text-[#2490eb] px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                APPOINTMENT DETAILS
              </div>
            </div>

            {/* Main Heading */}
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight text-[#18100f] mb-4"
              style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
            >
              Complete Your<br />
              <span className="text-[#2490eb]">Appointment Booking</span>
            </h1>

            {/* Selected Center Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 max-w-xl mx-auto">
              <h3 className="font-bold text-[#2490eb] text-base mb-1">Selected Center</h3>
              <p className="text-gray-700 font-semibold text-sm">{selectedCenter?.name}</p>
              <p className="text-gray-600 text-sm">{selectedCenter?.location}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Form Layout - Landscape */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Patient Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Patient Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="patientEmail"
                        value={formData.patientEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="patientPhone"
                        value={formData.patientPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                      <input
                        type="number"
                        name="patientAge"
                        value={formData.patientAge}
                        onChange={handleInputChange}
                        min="1"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                    <select
                      name="patientGender"
                      value={formData.patientGender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="patientAddress"
                      value={formData.patientAddress}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Appointment Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Time *</label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                        required
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Type</label>
                      <select
                        name="appointmentType"
                        value={formData.appointmentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                      >
                        <option value="consultation">Consultation</option>
                        <option value="followup">Follow-up</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Method</label>
                      <select
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-[#2490eb] bg-white"
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information - Full Width */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#e0f2fe] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#2490eb]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Medical Information</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Visit *</label>
                    <textarea
                      name="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                      placeholder="Describe your main concern or reason for the appointment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Symptoms</label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                      placeholder="Describe any current symptoms you're experiencing"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Previous Medical History</label>
                    <textarea
                      name="previousHistory"
                      value={formData.previousHistory}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                      placeholder="Any relevant medical history, allergies, or previous treatments"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2490eb] focus:border-transparent"
                      placeholder="Any additional information you'd like to share"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-300"
                style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
              >
                Back to Centers
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );

  const renderStep3 = () => (
    <div className="font-sans bg-gray-50 text-slate-800">
      <section className="relative pt-32 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="inline-block mb-4">
              <div
                className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                APPOINTMENT CONFIRMED
              </div>
            </div>
            
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight text-[#18100f] mb-4"
              style={{ fontFamily: 'Quicksand, sans-serif', textTransform: 'capitalize' }}
            >
              Appointment Booked<br />
              <span className="text-green-600">Successfully!</span>
            </h1>
            
            <div className="bg-[#e0f2fe] rounded-lg p-4 mb-6 text-left max-w-xl mx-auto">
              <h2 className="text-lg font-bold text-[#2490eb] mb-3">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 text-sm">
                <div>
                  <p><strong>Confirmation Code:</strong></p>
                  <p className="font-mono text-[#2490eb] text-base font-bold">{formData.confirmationCode}</p>
                </div>
                <div>
                  <p><strong>Center:</strong> {selectedCenter?.name}</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {new Date(formData.preferredDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p><strong>Time:</strong> {formData.preferredTime}</p>
                </div>
                <div>
                  <p><strong>Patient:</strong> {formData.patientName}</p>
                </div>
                <div>
                  <p><strong>Contact:</strong> {formData.patientPhone}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-800 mb-3">What happens next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-700 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Confirmation email sent</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>Receptionist will contact you</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Arrive 15 minutes early</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 01-1-1V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Bring ID and medical documents</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedCenter(null);
                  setFormData({
                    patientName: '',
                    patientEmail: '',
                    patientPhone: '',
                    patientAge: '',
                    patientGender: '',
                    patientAddress: '',
                    preferredDate: '',
                    preferredTime: '',
                    appointmentType: 'consultation',
                    reasonForVisit: '',
                    symptoms: '',
                    previousHistory: '',
                    contactMethod: 'phone',
                    preferredContactTime: '',
                    notes: '',
                    patientLocation: {
                      latitude: null,
                      longitude: null,
                      city: '',
                      state: '',
                      pincode: ''
                    }
                  });
                }}
                className="px-6 py-3 bg-[#2490eb] hover:bg-[#14457b] text-white font-semibold uppercase rounded-lg transition-all duration-300"
                style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
              >
                Book Another Appointment
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-300"
                style={{ fontFamily: 'Quicksand, sans-serif', fontSize: '14px', fontWeight: '600' }}
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen">
      <HomeHeader />
      <div className="pt-20">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default BookAppointment;