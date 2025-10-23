import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserCheck, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { addCenterAdminReceptionist, clearError, clearSuccess } from '../../../features/centerAdmin/centerAdminReceptionistSlice';
import { validateReceptionistForm, hasFormErrors } from '../../../utils/formValidation';

const AddReceptionist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, success, message } = useSelector((state) => state.centerAdminReceptionists);
  
  // Get centerId from Redux only
  const centerId = user?.centerId;

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    username: '',
    password: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
    role: 'receptionist',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (success) {
      toast.success('Receptionist added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        dispatch(clearSuccess());
        navigate('/dashboard/centeradmin/receptionist/managereceptionists');
      }, 1500);
    }
  }, [success, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
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
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    
    // Mark field as touched
    setTouched({ ...touched, [name]: true });
    
    // Validate the entire form with updated data
    const validationErrors = validateReceptionistForm(updatedFormData);
    setErrors(validationErrors);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate the entire form
    const validationErrors = validateReceptionistForm(formData);
    setErrors(validationErrors);
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
    const validationErrors = validateReceptionistForm(formData);
    setErrors(validationErrors);
    
    // Check if there are any errors
    if (hasFormErrors(validationErrors)) {
      return; // Don't submit if there are validation errors
    }
    
    if (!centerId) {
      toast.error('No center ID found. Please log in again as a center admin.', {
        position: "top-right",
        autoClose: 3000,
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
    
    dispatch(addCenterAdminReceptionist(submitData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-3 sm:mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Back to Receptionists
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Add New Receptionist
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm text-center sm:text-left">
            Register a new receptionist for your center
          </p>
        </div>

    

        {/* Alert Messages */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-green-700 text-xs sm:text-sm">{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-red-700 text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
              Receptionist Information
            </h2>
            <p className="text-slate-600 mt-1 text-xs sm:text-sm">
              Fill in the receptionist details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-3 sm:mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm ${
                      touched.name && errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter full name"
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm ${
                      touched.mobile && errors.mobile 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {touched.mobile && errors.mobile && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.mobile}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm ${
                      touched.email && errors.email 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter email address"
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm ${
                      touched.username && errors.username 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter username"
                  />
                  {touched.username && errors.username && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.username}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
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
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm ${
                        touched.password && errors.password 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-200'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.password}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-3 sm:mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows="3"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm ${
                      touched.address && errors.address 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200'
                    }`}
                    placeholder="Enter full address"
                  />
                  {touched.address && errors.address && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.address}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm"
                    placeholder="Enter emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs sm:text-sm"
                    placeholder="Enter emergency contact name"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
                className="px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || hasFormErrors(errors)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium ${
                  loading || hasFormErrors(errors)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Adding Receptionist...</span>
                    <span className="sm:hidden">Adding...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add Receptionist</span>
                    <span className="sm:hidden">Add</span>
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

export default AddReceptionist; 