import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { Users, ArrowLeft, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import { toast } from 'react-toastify';

const AddPatient = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    contact: "",
    email: "",
    centerCode: "",
  });
  
  const [centerInfo, setCenterInfo] = useState({
    name: "Loading...",
    code: "Loading..."
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
        // Alternative approach: Try to fetch center by admin ID
        if (user && user.id) {
          try {
            const response = await API.get(`/centers/by-admin/${user.id}`);
            const center = response.data;
            
            setCenterInfo({
              name: center.name,
              code: center.code
            });
            
            setFormData(prev => ({
              ...prev,
              centerCode: center.code
            }));
            
          } catch (altError) {
            // Final fallback to user fields
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
            } else {
              setCenterInfo({
                name: 'Error: No center data',
                code: 'N/A'
              });
            }
          }
        } else {
          setCenterInfo({
            name: 'Error: No user data',
            code: 'N/A'
          });
        }
      }
    };
    
    fetchCenterInfo();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.gender || !formData.contact) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const patientData = {
        ...formData,
        centerId: getCenterId(),
        assignedDoctor: user._id || user.id, // Automatically assign to the logged-in doctor
        registeredBy: user._id || user.id
      };

      const response = await API.post('/patients', patientData);
      
      toast.success(`Patient "${response.data.patient.name}" added successfully!`);
      
      // Navigate to the patients list page
      setTimeout(() => {
        navigate('/dashboard/doctor/patients');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard/doctor/patients')}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Patient List
            </button>
          </div>
          
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Add New Patient
          </h1>
          <p className="text-slate-600">
            Register a new patient to your center. The patient will be automatically assigned to you.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="150"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Contact Number *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Center Information
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Center Name
                    </label>
                    <input
                      type="text"
                      value={centerInfo.name || 'Loading center...'}
                      readOnly
                      className="w-full border border-slate-300 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed px-3 py-2"
                      placeholder="Center name will be auto-filled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Center Code
                    </label>
                    <input
                      type="text"
                      value={centerInfo.code || 'Loading...'}
                      readOnly
                      className="w-full border border-slate-300 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed px-3 py-2"
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
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>



            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Patient...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Add Patient
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
