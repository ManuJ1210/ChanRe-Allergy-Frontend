import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Building,
  Calendar,
  FileText,
  Award,
  MapPin,
  Clock,
  Shield
} from 'lucide-react';
import { 
  fetchSuperAdminDoctorById, 
  deleteSuperAdminDoctor,
  clearError, 
  clearSuccess 
} from '../../../features/superadmin/superAdminDoctorSlice';

const ViewSuperadminDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentDoctor, loading, error, success, message } = useSelector((state) => state.superAdminDoctors);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSuperAdminDoctorById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleEdit = () => {
    navigate(`/dashboard/Superadmin/Docters/EditSuperadminDoctor/${id}`);
  };

  const handleDelete = async () => {
    await dispatch(deleteSuperAdminDoctor(id));
    setShowDeleteModal(false);
    if (success) {
      navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-xs">Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            
            <button
              onClick={() => navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600 text-xs">Doctor not found</p>
            <button
              onClick={() => navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList')}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs"
            >
              Back to List
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
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Docters/SuperAdminDoctorList')}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-4 text-xs"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Doctor List
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-md font-bold text-slate-800 mb-2">Doctor Details</h1>
              <p className="text-slate-600 text-xs">View comprehensive information about the doctor</p>
            </div>
            
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-xs">{message}</p>
          </div>
        )}

        {/* Doctor Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-sm font-bold mb-1">{currentDoctor.name}</h2>
                <p className="text-blue-100 text-xs">{currentDoctor.designation || 'Doctor'}</p>
                <div className="flex items-center mt-2">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {currentDoctor.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium text-xs">{currentDoctor.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Mobile</p>
                      <p className="font-medium text-xs">{currentDoctor.mobile}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Username</p>
                      <p className="font-medium text-xs">{currentDoctor.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Joined</p>
                      <p className="font-medium text-xs">{formatDate(currentDoctor.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Professional Information
                </h3>
                
                <div className="space-y-3">
                  {currentDoctor.qualification && (
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-3 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Qualification</p>
                        <p className="font-medium text-xs">{currentDoctor.qualification}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentDoctor.designation && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-3 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Designation</p>
                        <p className="font-medium text-xs">{currentDoctor.designation}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentDoctor.kmcNumber && (
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-3 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">KMC Number</p>
                        <p className="font-medium text-xs">{currentDoctor.kmcNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentDoctor.hospitalName && (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-3 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Hospital</p>
                        <p className="font-medium text-xs">{currentDoctor.hospitalName}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentDoctor.experience && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Experience</p>
                        <p className="font-medium text-xs">{currentDoctor.experience}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specializations */}
            {currentDoctor.specializations && currentDoctor.specializations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentDoctor.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {currentDoctor.bio && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Bio
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed text-xs">{currentDoctor.bio}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-2">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentDoctor.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentDoctor.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-2">Super Admin Staff:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentDoctor.isSuperAdminStaff 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {currentDoctor.isSuperAdminStaff ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 mb-6 text-xs">
              Are you sure you want to delete Dr. {currentDoctor.name}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSuperadminDoctor; 