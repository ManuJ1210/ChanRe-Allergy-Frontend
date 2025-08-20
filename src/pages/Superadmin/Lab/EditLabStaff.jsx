import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateLabStaff, fetchLabStaffById } from '../../../features/superadmin/superadminThunks';
import { resetSuperadminState } from '../../../features/superadmin/superadminSlice';
import { ArrowLeft, Save, UserCheck, AlertCircle, Microscope } from 'lucide-react';
import API from '../../../services/api';
import { toast } from 'react-toastify';

export default function EditLabStaff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    staffName: '',
    email: '',
    phone: '',
    role: 'Lab Staff',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const { loading, error, updateSuccess } = useSelector((state) => state.superadmin);

  useEffect(() => {
    fetchLabStaffData();
  }, [id]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success('Lab staff member updated successfully!');
      dispatch(resetSuperadminState());
      navigate('/dashboard/Superadmin/Lab/LabStaffList');
    }
  }, [updateSuccess, dispatch, navigate]);

  const fetchLabStaffData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(`/lab-staff/${id}`);
      const labStaff = response.data;
      
      setFormData({
        staffName: labStaff.staffName || '',
        email: labStaff.email || '',
        phone: labStaff.phone || '',
        role: labStaff.role || 'Lab Staff',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching lab staff data:', error);
      toast.error('Failed to load lab staff data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.staffName || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const payload = {
        staffName: formData.staffName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };

      // Only include password if it's being updated
      if (formData.password) {
        payload.password = formData.password;
      }

      dispatch(updateLabStaff({ id, staffData: payload }));
    } catch (error) {
      console.error('Error updating lab staff:', error);
      toast.error('Failed to update lab staff member. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm sm:text-base">Loading lab staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Lab/LabStaffList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lab Staff
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Edit Lab Staff
          </h1>
          <p className="text-sm sm:text-base text-slate-600 text-center sm:text-left">
            Update laboratory staff member information
          </p>
        </div>

        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-sm sm:text-base">Lab staff member updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-sm sm:text-base">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center justify-center sm:justify-start">
              <Microscope className="h-5 w-5 mr-2 text-blue-500" />
              Lab Staff Information
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1 text-center sm:text-left">
              Update the details below to modify the lab staff account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-3 sm:mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Staff Name *
                  </label>
                  <input
                    type="text"
                    name="staffName"
                    value={formData.staffName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter staff name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter email address"
                  />
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
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  >
                    <option value="Lab Staff">Lab Staff</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Lab Assistant">Lab Assistant</option>
                    <option value="Lab Manager">Lab Manager</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-3 sm:mb-4">Account Security (Optional)</h3>
              <p className="text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                Leave password fields empty if you don't want to change the password
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/Superadmin/Lab/LabStaffList')}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Lab Staff
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