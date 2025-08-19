import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createReceptionistPatient } from "../../features/receptionist/receptionistThunks";
import { resetReceptionistState } from "../../features/receptionist/receptionistSlice";
import ReceptionistLayout from './ReceptionistLayout';
import API from "../../services/api";
import { User, Save, ArrowLeft, CheckCircle, AlertCircle, Mail, Phone, MapPin, Calendar, UserCheck, Building2, Building } from "lucide-react";

export default function AddPatient() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, addSuccess } = useSelector((state) => state.receptionist);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    contact: "",
    email: "",
    centerCode: "",
    assignedDoctor: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [centerInfo, setCenterInfo] = useState({
    name: "",
    code: ""
  });

  // Get center ID from user
  const getCenterId = () => {
    if (!user) return null;
    
    if (user.centerId) {
      if (typeof user.centerId === 'object' && user.centerId._id) {
        return user.centerId._id;
      }
      if (typeof user.centerId === 'string') {
        return user.centerId;
      }
    }
    
    if (user.centerID) return user.centerID;
    if (user.center_id) return user.center_id;
    if (user.center && user.center._id) return user.center._id;
    
    return null;
  };

  useEffect(() => {
    fetchDoctors();
    
    // Fetch center information and auto-populate
    const fetchCenterInfo = async () => {
      const centerId = getCenterId();
      if (centerId) {
        try {
          const response = await API.get(`/centers/${centerId}`);
          const center = response.data;
          
          setCenterInfo({
            name: center.name,
            code: center.code
          });
          
          // Auto-populate centerCode in form
          setFormData(prev => ({
            ...prev,
            centerCode: center.code
          }));
          
        } catch (error) {
          console.error('Error fetching center info:', error);
          // Fallback to user's centerCode if available
          if (user.centerCode) {
            setFormData(prev => ({
              ...prev,
              centerCode: user.centerCode
            }));
            setCenterInfo(prev => ({
              ...prev,
              code: user.centerCode,
              name: user.hospitalName || 'Center'
            }));
          }
        }
      } else {
        // Try to use centerCode directly if available
        if (user.centerCode) {
          setFormData(prev => ({
            ...prev,
            centerCode: user.centerCode
          }));
          setCenterInfo({
            code: user.centerCode,
            name: user.hospitalName || 'Center'
          });
        }
      }
    };
    
    fetchCenterInfo();
  }, [user]);

  useEffect(() => {
    if (addSuccess) {
      setTimeout(() => {
        dispatch(resetReceptionistState());
        navigate("/dashboard/receptionist/patients");
      }, 1000);
    }
  }, [addSuccess, dispatch, navigate]);

  const fetchDoctors = async () => {
    setDoctorLoading(true);
    setDoctorError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      setDoctorError("Failed to load doctors");
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(createReceptionistPatient(formData));
  };

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
                              onClick={() => navigate('/dashboard/receptionist/patients')}
              className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </button>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Add New Patient
            </h1>
            <p className="text-slate-600">
              Register a new patient with complete information
            </p>
          </div>

          {/* Alert Messages */}
          {addSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700">Patient added successfully!</span>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Patient Information
              </h2>
              <p className="text-slate-600 mt-1">
                Fill in the patient details below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter patient's full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    max="150"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    Center Information
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Center Name
                      </label>
                      <input
                        type="text"
                        value={centerInfo.name || 'Loading center...'}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
                        placeholder="Center name will be auto-filled"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Center Code
                      </label>
                      <input
                        type="text"
                        value={centerInfo.code || 'Loading...'}
                        readOnly
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
                        placeholder="Center code will be auto-filled"
                      />
                    </div>
                  </div>
                  <input
                    type="hidden"
                    name="centerCode"
                    value={formData.centerCode}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    Assigned Doctor
                  </label>
                  <select
                    name="assignedDoctor"
                    value={formData.assignedDoctor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select doctor</option>
                    {doctorLoading ? (
                      <option value="" disabled>Loading doctors...</option>
                    ) : doctorError ? (
                      <option value="" disabled>Error loading doctors</option>
                    ) : (
                      doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization || 'General'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter complete address"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/receptionist/patients')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding Patient...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Add Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );
}
