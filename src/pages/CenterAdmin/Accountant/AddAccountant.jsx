import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../../services/api';

const AddAccountant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        mobile: formData.mobile.trim(),
        address: formData.address.trim()
      };

      const response = await API.post('/accountants', submitData);
      
      toast.success('Accountant added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate('/dashboard/centeradmin/accountant/manageaccountants');
    } catch (error) {
      console.error('Error adding accountant:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add accountant';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/dashboard/centeradmin/accountant/manageaccountants')}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accountants
            </button>
          </div>
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
            Add New Accountant
          </h1>
          <p className="text-slate-600 text-xs text-center sm:text-left">
            Create a new accountant account for your center
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
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
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs ${
                      errors.email ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
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
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs ${
                      errors.username ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs ${
                      errors.mobile ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.mobile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs ${
                      errors.password ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs ${
                      errors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter address"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/centeradmin/accountant/manageaccountants')}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add Accountant
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

export default AddAccountant;
