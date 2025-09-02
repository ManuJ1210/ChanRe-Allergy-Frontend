import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateReceptionistThunk } from '../../../features/centerAdmin/centerAdminThunks';
import { resetCenterAdminState } from '../../../features/centerAdmin/centerAdminSlice';
import { Eye, EyeOff, UserCheck, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../../services/api';

const EditReceptionist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, updateSuccess } = useSelector((state) => state.centerAdmin);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '', // Changed from phone to mobile to match AddReceptionist
    email: '',
    username: '',
    password: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
    userType: 'receptionist',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchReceptionist();
  }, [id]);



  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => {
        dispatch(resetCenterAdminState());
        navigate('/dashboard/centeradmin/receptionist/managereceptionists');
      }, 1500);
    }
  }, [updateSuccess, dispatch, navigate]);

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

  const fetchReceptionist = async () => {
    try {
      const response = await API.get(`/receptionists/${id}`);
      
      // Handle both phone and mobile fields (different models use different field names)
      const receptionistData = {
        ...response.data,
        mobile: response.data.mobile || response.data.phone || '', // Use mobile if available, fallback to phone
        password: ''
      };
      
      setFormData(receptionistData);
    } catch (err) {
      console.error('Failed to fetch receptionist:', err);
      toast.error('Failed to fetch receptionist details', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data for submission - ensure mobile field is sent
    const submissionData = {
      ...formData,
      phone: formData.mobile, // Also send as phone for models that use phone field
    };
    
    dispatch(updateReceptionistThunk({ id, receptionistData: submissionData }));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-xs">Loading receptionist details...</p>
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
                            onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Receptionists
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Edit Receptionist
          </h1>
          <p className="text-slate-600 text-xs">
            Update receptionist information
          </p>
        </div>

        {/* Alert Messages */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-xs">Receptionist updated successfully!</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <UserCheck className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
              Receptionist Information
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Update the receptionist details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter mobile number"
                />
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
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter email address"
                />
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
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter username"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="Enter new password (optional)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="Enter emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="Enter emergency contact name"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating Receptionist...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Receptionist
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

export default EditReceptionist; 