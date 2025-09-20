import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, UserCheck, ArrowLeft, Plus, X, AlertCircle } from 'lucide-react';
import { addSuperAdminDoctor, clearError, clearSuccess } from '../../../features/superadmin/superAdminDoctorSlice';
import { validateDoctorForm, hasFormErrors } from '../../../utils/formValidation';

const AddSuperadminDoctor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, success, message } = useSelector((state) => state.superAdminDoctors);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    username: '',
    password: '',
    qualification: '',
    designation: '',
    kmcNumber: '',
    hospitalName: '',
    experience: '',
    specializations: [],
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
    
    dispatch(clearError());
    dispatch(clearSuccess());
    
    // Debug logging to see what we're sending
    console.log('🚀 Submitting doctor data:', formData);
    console.log('🚀 Specializations being sent:', formData.specializations);
    
    const result = await dispatch(addSuperAdminDoctor(formData));
    
    if (addSuperAdminDoctor.fulfilled.match(result)) {
      setTimeout(() => {
        navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList');
      }, 1500);
    }
  };

  // Clear error and success messages on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-3 sm:mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Doctors
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
            Add New Superadmin Doctor
          </h1>
          <p className="text-xs text-slate-600 text-center sm:text-left">
            Register a new doctor for superadmin management
          </p>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-xs">{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
              Doctor Information
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Fill in the doctor details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
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
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
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

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                    touched.mobile && errors.mobile 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-200'
                  }`}
                  placeholder="Enter mobile number"
                />
                {touched.mobile && errors.mobile && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Email Address */}
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
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
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

              {/* Username */}
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
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
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

              {/* Password */}
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
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
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

              {/* Qualification */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter qualification"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs ${
                    touched.designation && errors.designation 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-200'
                  }`}
                  placeholder="Enter designation"
                />
                {touched.designation && errors.designation && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.designation}
                  </p>
                )}
              </div>

              {/* KMC Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  KMC Number
                </label>
                <input
                  type="text"
                  name="kmcNumber"
                  value={formData.kmcNumber}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter KMC number"
                />
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Hospital Name
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter hospital name"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter experience (e.g., 5 years)"
                />
              </div>
            </div>

            {/* Specializations */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Specializations
              </label>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="Add specialization"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSpecialization();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialization}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-xs w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                
                {formData.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full"
                      >
                        <span className="text-xs">{spec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="3"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs resize-none ${
                  touched.bio && errors.bio 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-slate-200'
                }`}
                placeholder="Enter doctor bio"
              />
              {touched.bio && errors.bio && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.bio}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading || hasFormErrors(errors)}
                className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs ${
                  loading || hasFormErrors(errors)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                onClick={() => navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList')}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs w-full sm:w-auto"
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

export default AddSuperadminDoctor; 