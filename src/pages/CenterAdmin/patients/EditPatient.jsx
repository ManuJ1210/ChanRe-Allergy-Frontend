import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import API from "../../../services/api";
import { Users, ArrowLeft, User, Mail, Phone, MapPin, Building, Save, Edit } from 'lucide-react';
import { fetchPatientDetails, updatePatient } from "../../../features/centerAdmin/centerAdminThunks";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { patientDetails, loading: patientLoading, error: patientError } = useSelector((state) => state.centerAdmin);
  
  // Extract patient data from the new structure
  const patient = patientDetails?.patient || patientDetails;

  useEffect(() => {
    if (id) {
      dispatch(fetchPatientDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
  
    
    if (patient) {
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || patient.contact || '',
        age: patient.age || '',
        gender: patient.gender || '',
        address: patient.address || ''
      });
    }
  }, [patient, patientDetails, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await dispatch(updatePatient({ patientId: id, patientData: formData })).unwrap();
      navigate('/dashboard/CenterAdmin/patients/PatientList');
    } catch (err) {
      setError(err.message || 'Failed to update patient');
    } finally {
      setLoading(false);
    }
  };

  if (patientLoading || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">
                {patientLoading ? 'Loading patient information...' : 'Patient not found'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (patientError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-xs mb-4">{patientError}</p>
            <button
              onClick={() => navigate('/dashboard/CenterAdmin/patients/PatientList')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-xs"
            >
              Back to Patients List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/CenterAdmin/patients/PatientList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients List
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">Edit Patient</h1>
          <p className="text-slate-600 text-xs">Update patient information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Patient Information
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Update the patient's personal and contact details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="150"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter age"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Updating...' : 'Update Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 