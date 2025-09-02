import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCenterAdminReceptionistById } from '../../../features/centerAdmin/centerAdminReceptionistSlice';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const ViewReceptionist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentReceptionist, loading, error } = useSelector((state) => state.centerAdminReceptionists);

  useEffect(() => {
    if (id) {
      dispatch(fetchCenterAdminReceptionistById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-xs">Loading receptionist details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-sm mb-4">Error</div>
          <p className="text-gray-600 text-xs">{error}</p>
          <button
            onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!currentReceptionist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-sm mb-4">Receptionist not found</div>
          <button
            onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-md font-bold text-gray-900">Receptionist Details</h1>
                <p className="text-gray-600 text-xs">View comprehensive information about the receptionist</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/dashboard/centeradmin/receptionist/editreceptionist/${currentReceptionist._id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Edit Receptionist
              </button>
            </div>
          </div>
        </div>

        {/* Receptionist Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-sm font-bold">{currentReceptionist.name}</h2>
                <p className="text-green-100 text-xs">Receptionist</p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-gray-900 text-xs">{currentReceptionist.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Mobile Number</p>
                      <p className="text-gray-900 text-xs">{currentReceptionist.mobile || currentReceptionist.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Username</p>
                      <p className="text-gray-900 text-xs">{currentReceptionist.username}</p>
                    </div>
                  </div>
                  
                  {/* Address */}
                  {currentReceptionist.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-gray-900 text-xs">{currentReceptionist.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Account Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-gray-900 text-xs">
                        {new Date(currentReceptionist.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-gray-900 text-xs">
                        {new Date(currentReceptionist.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-gray-900 text-xs">
                        {currentReceptionist.isDeleted ? 'Inactive' : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Emergency Contact Information */}
            {(currentReceptionist.emergencyContact || currentReceptionist.emergencyContactName) && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Emergency Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentReceptionist.emergencyContactName && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Emergency Contact Name</p>
                        <p className="text-gray-900 text-xs">{currentReceptionist.emergencyContactName}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentReceptionist.emergencyContact && (
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Emergency Contact Number</p>
                        <p className="text-gray-900 text-xs">{currentReceptionist.emergencyContact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReceptionist; 