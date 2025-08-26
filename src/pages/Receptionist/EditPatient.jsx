import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchReceptionistSinglePatient, updateReceptionistPatient } from "../../features/receptionist/receptionistThunks";
import { resetReceptionistState } from "../../features/receptionist/receptionistSlice";
import ReceptionistLayout from './ReceptionistLayout';
import { User, Save, ArrowLeft, CheckCircle, AlertCircle, Mail, Phone, MapPin, Calendar, UserCheck, Building2 } from "lucide-react";
import API from "../../services/api";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singlePatient, patientLoading, patientError, updateSuccess } = useSelector((state) => state.receptionist);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    contact: "",
    phone: "",
    email: "",
    centerCode: "",
    assignedDoctor: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchReceptionistSinglePatient(id));
    }
    fetchDoctors();
  }, [dispatch, id]);

  useEffect(() => {
    if (singlePatient) {
      setFormData({
        name: singlePatient.name || "",
        age: singlePatient.age || "",
        gender: singlePatient.gender || "",
        address: singlePatient.address || "",
        contact: singlePatient.phone || singlePatient.contact || "",
        phone: singlePatient.phone || singlePatient.contact || "",
        email: singlePatient.email || "",
        centerCode: singlePatient.centerCode || "",
        assignedDoctor: singlePatient.assignedDoctor || "",
      });
    }
  }, [singlePatient]);

  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => {
        dispatch(resetReceptionistState());
        navigate("/dashboard/receptionist/patients");
      }, 1500);
    }
  }, [updateSuccess, dispatch, navigate]);

  const fetchDoctors = async () => {
    setDoctorLoading(true);
    setDoctorError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/doctors`, { 
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
    // Ensure phone data is properly included
    const submitData = {
      ...formData,
      contact: formData.phone || formData.contact,
      phone: formData.phone || formData.contact
    };
    dispatch(updateReceptionistPatient({ id, patientData: submitData }));
  };

  if (patientLoading) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading patient details...</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  if (patientError) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{patientError}</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  return (

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
              Edit Patient
            </h1>
            <p className="text-slate-600">
              Update patient information
            </p>
          </div>

          {/* Alert Messages */}
          {updateSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700">Patient updated successfully!</span>
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
                Update the patient details below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || formData.contact}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Center Code
                  </label>
                  <input
                    type="text"
                    name="centerCode"
                    value={formData.centerCode}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
                    placeholder="Center code (read-only)"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Center code cannot be modified
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
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
                  disabled={patientLoading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {patientLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating Patient...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    
  );
}
