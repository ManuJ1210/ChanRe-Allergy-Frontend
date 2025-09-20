import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserCheck, ArrowLeft, Save, Building, User, Mail, Phone, GraduationCap, Award, Stethoscope, Calendar, FileText, AlertCircle } from 'lucide-react';
import { addCenterAdminDoctor, clearError, clearSuccess } from '../../../features/centerAdmin/centerAdminDoctorSlice';
import API from '../../../services/api';
import { toast } from 'react-toastify';
import { validateDoctorForm, hasFormErrors } from '../../../utils/formValidation';

const AddDocter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, success, message } = useSelector((state) => state.centerAdminDoctors);
  
  // Helper function to get centerId from user object  
  const getCenterId = () => {
    // Check if user.centerId is a string
    if (typeof user?.centerId === 'string') {
      return user.centerId;
    }
    // Check if user.centerId is an object with _id
    if (user?.centerId?._id) {
      return user.centerId._id;
    }
    // Check if user.id exists (fallback)
    if (user?.id) {
      return user.id;
    }
    return null;
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    qualification: '',
    designation: '',
    kmcNumber: '',
    hospitalName: '',
    specializations: [],
    experience: '',
    bio: '',
    role: 'doctor',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [centerInfo, setCenterInfo] = useState({
    name: "Loading...",
    code: "Loading..."
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch center information and auto-populate hospital name
  useEffect(() => {
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
          
          // Auto-populate hospitalName with center name
          setFormData(prev => ({
            ...prev,
            hospitalName: center.name
          }));
          
        } catch (error) {
          console.error('Error fetching center info:', error);
          // Try alternative approach
          try {
            const response = await API.get(`/centers/by-admin/${centerId}`);
            const center = response.data;
            
            setCenterInfo({
              name: center.name,
              code: center.code
            });
            
            setFormData(prev => ({
              ...prev,
              hospitalName: center.name
            }));
            
          } catch (altError) {
            console.error('Alternative approach also failed:', altError);
            // Form will use default values if API fails
          }
        }
      } else if (user && user.id) {
        // Try alternative approach
        try {
          const response = await API.get(`/centers/by-admin/${user.id}`);
          const center = response.data;
          
          setCenterInfo({
            name: center.name,
            code: center.code
          });
          
          setFormData(prev => ({
            ...prev,
            hospitalName: center.name
          }));
          
        } catch (altError) {
          console.error('Alternative approach failed:', altError);
          // Form will use default values if API fails
        }
      }
      // If all else fails, form will use the default values set in state initialization
    };
    
    fetchCenterInfo();
  }, [user]);

  useEffect(() => {
    if (success) {
      toast.success('Doctor added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/dashboard/centeradmin/doctors/doctorlist');
      }, 1500);
    }
  }, [success, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched({ ...touched, [name]: true });
    
    // Validate the field
    const validationErrors = validateDoctorForm({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: validationErrors[name] });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate the field
    const validationErrors = validateDoctorForm(formData);
    setErrors({ ...errors, [name]: validationErrors[name] });
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate the entire form
    const validationErrors = validateDoctorForm(formData);
    setErrors(validationErrors);
    
    // Check if there are any errors
    if (hasFormErrors(validationErrors)) {
      return; // Don't submit if there are validation errors
    }
    
    let centerId = getCenterId();
    
    // If no centerId, try to get it from the center we created
    if (!centerId && user && user.id) {
      try {
        const response = await API.get(`/centers/by-admin/${user.id}`);
        centerId = response.data._id;
      } catch (error) {
        console.error('Error getting center ID:', error);
        toast.error('Unable to get center information. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }
    
    if (!centerId) {
      toast.error('No center ID found. Please log in again as a center admin.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    dispatch(clearError());
    dispatch(clearSuccess());
    
    const submitData = {
      ...formData,
      centerId,
      status: 'active'
    };
    
    const result = await dispatch(addCenterAdminDoctor(submitData));
    
    if (addCenterAdminDoctor.fulfilled.match(result)) {
      toast.success('Doctor added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/centeradmin/doctors/doctorlist')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-3 sm:mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Add New Doctor
          </h1>
          <p className="text-slate-600 text-xs text-center sm:text-left">
            Register a new doctor for your center
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center justify-center sm:justify-start mb-2">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              Doctor Information
            </h2>
            <p className="text-slate-600 mt-1 text-xs text-center sm:text-left">
              Fill in the doctor details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs ${
                      touched.name && errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter full name"
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs ${
                      touched.phone && errors.phone 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs ${
                      touched.email && errors.email 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter email address"
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs ${
                      touched.username && errors.username 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter username"
                  />
                  {touched.username && errors.username && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs ${
                        touched.password && errors.password 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-200'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                    placeholder="Enter qualification"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                    placeholder="Enter designation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    KMC Number
                  </label>
                  <input
                    type="text"
                    name="kmcNumber"
                    value={formData.kmcNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                    placeholder="Enter KMC number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                    placeholder="Enter experience (e.g., 5 years)"
                  />
                </div>
              </div>
            </div>

            {/* Center Information */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-500" />
                Center Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Hospital/Center Name
                  </label>
                  <input
                    type="text"
                    value={centerInfo.name || 'Loading center...'}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 cursor-not-allowed text-xs"
                    placeholder="Hospital name will be auto-filled"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Center Code
                  </label>
                  <input
                    type="text"
                    value={centerInfo.code || 'Loading...'}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 cursor-not-allowed text-xs"
                    placeholder="Center code will be auto-filled"
                  />
                </div>
              </div>
              <input
                type="hidden"
                name="hospitalName"
                value={formData.hospitalName}
              />
            </div>

            {/* Specializations */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                Specializations
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                    placeholder="Add specialization"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialization}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Add
                  </button>
                </div>
                {formData.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(index)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Bio
              </h3>
              
              <div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs"
                  placeholder="Enter doctor bio"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading || hasFormErrors(errors)}
                className={`flex-1 py-2.5 sm:py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-xs ${
                  loading || hasFormErrors(errors)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding Doctor...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Add Doctor
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/centeradmin/doctors/doctorlist')}
                className="px-6 py-2.5 sm:py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 text-xs w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDocter;
