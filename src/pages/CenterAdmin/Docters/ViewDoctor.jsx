import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCenterAdminDoctorById } from '../../../features/centerAdmin/centerAdminDoctorSlice';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Building, Calendar, Clock, Stethoscope, Award, FileText, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

const ViewDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentDoctor, loading, error } = useSelector((state) => state.centerAdminDoctors);

  useEffect(() => {
    if (id) {
      dispatch(fetchCenterAdminDoctorById(id));
    }
  }, [dispatch, id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-xs font-medium">Loading doctor details...</p>
          <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 text-sm mb-4 font-semibold">Error</div>
          <p className="text-slate-600 text-xs mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard/centeradmin/doctors/doctorlist')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!currentDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-slate-600 text-sm mb-4 font-semibold">Doctor not found</div>
          <button
            onClick={() => navigate('/dashboard/centeradmin/doctors/doctorlist')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/centeradmin/doctors/doctorlist')}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-md font-bold text-slate-900 text-center sm:text-left bg-clip-text ">
                  Doctor Details
                </h1>
                <p className="text-slate-600 text-xs text-center sm:text-left">
                  View comprehensive information about the doctor
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/dashboard/centeradmin/doctors/editdoctor/${currentDoctor._id}`)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Doctor
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 py-6 sm:py-8 text-white">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-sm font-bold">{currentDoctor.name}</h2>
                <p className="text-blue-100 text-xs">{currentDoctor.designation || 'Doctor'}</p>
                <p className="text-blue-100 text-xs">{currentDoctor.qualification}</p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Personal Information */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Personal Information
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.phone || currentDoctor.mobile || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <User className="h-5 w-5 text-indigo-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Username</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                  Professional Information
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <GraduationCap className="h-5 w-5 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Qualification</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.qualification || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <Building className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Hospital</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.hospitalName || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <User className="h-5 w-5 text-indigo-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">KMC Number</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.kmcNumber || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Specializations</p>
                      <p className="text-slate-900 text-xs">
                        {currentDoctor.specializations && currentDoctor.specializations.length > 0 
                          ? currentDoctor.specializations.join(', ')
                          : currentDoctor.specialization || 'Not specified'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Experience</p>
                      <p className="text-slate-900 text-xs">{currentDoctor.experience || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {currentDoctor.bio && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Bio
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-700 leading-relaxed text-xs">{currentDoctor.bio}</p>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Created</p>
                    <p className="text-slate-900 text-xs">
                      {new Date(currentDoctor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Last Updated</p>
                    <p className="text-slate-900 text-xs">
                      {new Date(currentDoctor.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl sm:col-span-2 lg:col-span-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Status</p>
                    <p className="text-slate-900 text-xs">
                      {currentDoctor.isDeleted ? 'Inactive' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDoctor; 