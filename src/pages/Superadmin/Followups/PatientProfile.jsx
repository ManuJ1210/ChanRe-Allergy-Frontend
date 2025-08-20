import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchSuperAdminDoctorPatientById,
  fetchSuperAdminDoctorPatientMedications, 
  fetchSuperAdminDoctorPatientHistory, 
  fetchSuperAdminDoctorPatientLabReports
} from '../../../features/superadmin/superAdminDoctorSlice';
import { fetchPatientGeneralFollowUps } from '../../../features/superadmin/superadminThunks';
import { 
  ArrowLeft, User, Phone, Calendar, MapPin, Activity, Pill, FileText, Eye, Mail, UserCheck, Building, Stethoscope,
  Download, ExternalLink, Image, Video, Music, File, AlertCircle
} from 'lucide-react';

const PatientProfile = () => {
  const params = useParams();
  const { patientId } = params;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Overview");

  
  console.log('🔍 PatientProfile component rendered');
  console.log('🔍 useParams result:', params);
  console.log('🔍 Extracted patientId:', patientId);
  console.log('🔍 Current URL:', window.location.href);

  const { 
    singlePatient: patient,
    patientMedications: medications, 
    patientHistory: history, 
    patientLabReports: labReports,
    dataLoading, 
    dataError
  } = useSelector(state => state.superAdminDoctors);
  
  const superadminState = useSelector(state => state.superadmin);
  const { 
    patientFollowUps: followUps,
    loading: followUpsLoading,
    error: followUpsError
  } = superadminState;
  


  useEffect(() => {
    console.log('🔍 PatientProfile useEffect - patientId:', patientId, 'type:', typeof patientId);
    
    if (patientId && patientId !== 'undefined' && patientId !== 'null' && patientId !== '') {
      console.log('✅ Valid patientId, fetching data...');
      // Fetch all patient data
      const fetchData = async () => {
        try {
          console.log('🚀 Dispatching fetch actions for patientId:', patientId);
          
                     // Fetch follow-ups
           await dispatch(fetchPatientGeneralFollowUps(patientId));
          
          // Then fetch other data
          await Promise.all([
            dispatch(fetchSuperAdminDoctorPatientById(patientId)),
            dispatch(fetchSuperAdminDoctorPatientMedications(patientId)),
            dispatch(fetchSuperAdminDoctorPatientHistory(patientId)),
            dispatch(fetchSuperAdminDoctorPatientLabReports(patientId))
          ]);
          console.log('✅ All data fetched successfully');
        } catch (error) {
          console.error('❌ Error fetching patient data:', error);
        }
      };

      fetchData();
    } else {
      console.log('❌ Invalid patientId:', patientId);
    }
  }, [dispatch, patientId]);

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <File className="h-4 w-4" />;
    if (fileType?.includes('image')) return <Image className="h-4 w-4" />;
    if (fileType?.includes('video')) return <Video className="h-4 w-4" />;
    if (fileType?.includes('audio')) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleViewFile = (fileUrl, fileName) => {
    if (fileUrl) {
      window.open(`/api/files/${fileUrl}`, '_blank');
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = `/api/files/${fileUrl}`;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };



  if (!patientId || patientId === 'undefined' || patientId === 'null' || patientId === '') {
    console.log('❌ PatientProfile: Invalid patientId detected:', patientId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">No patient ID provided in the URL.</p>
            <p className="text-red-500 text-sm mt-2">Patient ID: {patientId}</p>
            <button
              onClick={() => navigate('/dashboard/superadmin/followups/viewfollowuppatients')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dataLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading patient information...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-sm font-semibold text-red-800">Error Loading Patient Data</h3>
            </div>
            <p className="text-red-700 mb-4">{dataError}</p>
                         <button
               onClick={() => navigate('/dashboard/superadmin/followups/viewfollowuppatients')}
               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
             >
               Go Back
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-sm font-semibold text-yellow-800">Patient Not Found</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              The patient with ID "{patientId}" was not found. Please check the URL and try again.
            </p>
                         <button
               onClick={() => navigate('/dashboard/superadmin/followups/viewfollowuppatients')}
               className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
             >
               Go Back
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
                 {/* Header */}
         <div className="mb-8">
           <button
             onClick={() => navigate('/dashboard/superadmin/followups/viewfollowuppatients')}
             className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
           >
             <ArrowLeft className="h-4 w-4 mr-2" />
             Back to Follow-up Patients
           </button>
         </div>

        {/* Patient Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">{patient?.name || 'Patient Name'}</h1>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  {patient?.gender && (
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      {patient.gender}
                    </span>
                  )}
                  {patient?.age && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {patient.age} years
                    </span>
                  )}
                  {patient?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {patient.phone}
                    </span>
                  )}
                  {patient?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {patient.email}
                    </span>
                  )}
                  {patient?.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {patient.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Read Only
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 mb-8">
          <div className="flex gap-2">
                         {["Overview", "Follow-ups", "Medical History", "Medications", "Lab Reports"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex-1 ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Patient Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Patient Details
                </h2>
                <p className="text-slate-600 mt-1">
                  Complete patient information and contact details
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                      <p className="text-slate-800 font-medium break-words">{patient.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Mobile</label>
                      <p className="text-slate-800 break-words">
                        {typeof patient.phone === 'string' ? patient.phone :
                         typeof patient.contact === 'string' ? patient.contact : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                      <p className="text-slate-800 break-words">{typeof patient.email === 'string' ? patient.email : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                      <p className="text-slate-800 break-words">{typeof patient.address === 'string' ? patient.address : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Doctor</label>
                      <p className="text-slate-800 break-words flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                        {patient.assignedDoctor?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                      <p className="text-slate-800 capitalize break-words">{patient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Age</label>
                      <p className="text-slate-800 break-words">{patient.age ? `${patient.age} years` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Center</label>
                      <p className="text-slate-800 break-words flex items-center">
                        <Building className="h-4 w-4 mr-2 text-blue-500" />
                        {patient.centerId?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Lab Reports</p>
                    <p className="text-xl font-bold text-blue-600">{labReports?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Medications</p>
                    <p className="text-xl font-bold text-green-600">{medications?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Pill className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">History Records</p>
                    <p className="text-xl font-bold text-purple-600">{history?.historyData?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
                             <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500">Follow-ups</p>
                     <p className="text-xl font-bold text-indigo-600">{followUps?.length || 0}</p>
                   </div>
                   <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                     <FileText className="h-6 w-6 text-indigo-600" />
                   </div>
                 </div>
               </div>
               <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-slate-500">Registration Date</p>
                     <p className="text-xs font-bold text-orange-600">
                       {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                     </p>
                   </div>
                   <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                     <Calendar className="h-6 w-6 text-orange-600" />
                   </div>
                 </div>
               </div>
            </div>
          </div>
                 )}

         {activeTab === "Follow-ups" && (
           <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                           <div className="p-6 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      Patient Follow-ups
                    </h2>
                    <p className="text-slate-600 mt-1">
                      All follow-up records and treatment plans for this patient
                    </p>
                  </div>

                </div>
              </div>
                           <div className="p-6">

                
                {followUpsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading follow-ups...</p>
                  </div>
                ) : followUpsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-500">Error loading follow-ups</p>
                    <p className="text-red-400 text-sm mt-2">{followUpsError}</p>
                  </div>
                ) : !followUps || followUps.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No follow-ups found</p>
                    <p className="text-slate-400 text-sm mt-2">This patient has no follow-up records yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                                         {followUps.map((followUp, index) => {
                       return (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-semibold text-gray-800 text-sm">
                              {followUp.type || 'Follow-up'}
                            </h6>
                                                         <div className="flex items-center gap-2">
                               <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                 {followUp.date ? new Date(followUp.date).toLocaleDateString() : 
                                  followUp.createdAt ? new Date(followUp.createdAt).toLocaleDateString() : 'N/A'}
                               </span>
                                                               <div className="flex gap-2">
                                  {/* View Details Button based on follow-up type */}
                                  {followUp.type && (
                                    <button
                                                                             onClick={() => {
                                         console.log('🔍 Navigating to view page for follow-up type:', followUp.type);
                                         console.log('🔍 Follow-up ID:', followUp._id);
                                         console.log('🔍 Patient ID:', patientId);
                                         
                                         // Map follow-up types to their view routes
                                         const viewRoutes = {
                                           "Allergic Rhinitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAllergicRhinitis/${patientId}`,
                                           "Atopic Dermatitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAtopicDermatitis/${patientId}`,
                                           "Allergic Conjunctivitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAllergicConjunctivitis/${patientId}`,
                                           "Allergic Bronchitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAllergicBronchitis/${patientId}`,
                                           "GPE": (patientId) => `/dashboard/Superadmin/Followups/ViewGPE/${patientId}`,
                                         };
                                         
                                         const route = viewRoutes[followUp.type];
                                         if (route) {
                                           const fullRoute = route(patientId);
                                           console.log('🔍 Full route:', fullRoute);
                                           console.log('🔍 Attempting navigation...');
                                           navigate(fullRoute);
                                         } else {
                                           console.log('⚠️ No route found for follow-up type:', followUp.type);
                                           console.log('⚠️ Available types:', Object.keys(viewRoutes));
                                         }
                                       }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                                      title={`View ${followUp.type} Details`}
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>View Details</span>
                                    </button>
                                  )}
                                </div>
                             </div>
                          </div>
                          
                          {/* Basic Info (Always Visible) */}
                          <div className="space-y-2 mb-3">
                            {/* Patient Info */}
                            {followUp.patientId && (
                              <div className="bg-white p-2 rounded text-xs">
                                <span className="text-gray-600">Patient: </span>
                                <span className="text-gray-800 font-medium">{followUp.patientId.name}</span>
                                {followUp.patientId.centerId && (
                                  <span className="text-gray-500 ml-2">({followUp.patientId.centerId.name})</span>
                                )}
                              </div>
                            )}
                            
                            {/* Quality of Life */}
                            {followUp.qualityOfLife && (
                              <div className="bg-white p-2 rounded text-xs">
                                <span className="text-gray-600">Quality of Life Impact: </span>
                                <span className="text-gray-800 font-medium">{followUp.qualityOfLife}/5</span>
                              </div>
                            )}
                          </div>
                          


                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
           </div>
         )}

         {activeTab === "Medical History" && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Medical History
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Complete patient medical history and examination records
                  </p>
                </div>
                                                 <button
                  onClick={() => {
                    console.log('🔍 Navigating to PatientHistory with patientId:', patientId);
                    console.log('🔍 Navigation path:', `/dashboard/superadmin/followups/PatientHistory/${patientId}`);
                    navigate(`/dashboard/superadmin/followups/PatientHistory/${patientId}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Full History
                </button>
              </div>
            </div>
            <div className="p-6">
              {!history || !history.historyData || history.historyData.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No medical history found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {history.historyData.map((record, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-semibold text-gray-800 text-sm">{record.type}</h6>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mb-3">{record.description}</p>
                      
                      {/* File attachments if any */}
                      {record.attachments && record.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {record.attachments.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                                {getFileIcon(file.type)}
                                <span className="text-xs text-gray-700 truncate max-w-24">{file.name}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleViewFile(file.url, file.name)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="View file"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="text-green-600 hover:text-green-800 p-1"
                                    title="Download file"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

                 {activeTab === "Medications" && (
           <div className="bg-white rounded-xl shadow-sm border border-blue-100">
             <div className="p-6 border-b border-blue-100">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                     <Pill className="h-5 w-5 mr-2 text-blue-500" />
                     Medications
                   </h2>
                   <p className="text-slate-600 mt-1">
                     Current and past medications prescribed
                   </p>
                 </div>
                                 <button
                  onClick={() => {
                    console.log('🔍 Navigating to PatientMedications with patientId:', patientId);
                    console.log('🔍 Navigation path:', `/dashboard/superadmin/followups/PatientMedications/${patientId}`);
                    navigate(`/dashboard/superadmin/followups/PatientMedications/${patientId}`);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Pill className="h-4 w-4" />
                  View All Medications
                </button>
               </div>
             </div>
            <div className="p-6">
              {!medications || medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No medications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Drug Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dose</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prescribed By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {medications.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-medium text-slate-800">{med.drugName}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{med.dose}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{med.duration}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{med.frequency || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{med.prescribedBy || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {med.prescriptionFile && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewFile(med.prescriptionFile, `${med.drugName}_prescription`)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(med.prescriptionFile, `${med.drugName}_prescription`)}
                                  className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                >
                                  <Download className="h-3 w-3" />
                                  Download
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Lab Reports" && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-500" />
                    Lab Reports
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Laboratory test results and medical investigations
                  </p>
                </div>
                                 <button
                   onClick={() => {
                     console.log('🔍 Navigating to PatientLabReports with patientId:', patientId);
                     console.log('🔍 Navigation path:', `/dashboard/superadmin/followups/PatientLabReports/${patientId}`);
                     navigate(`/dashboard/superadmin/followups/PatientLabReports/${patientId}`);
                   }}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                 >
                   <Activity className="h-4 w-4" />
                   View All Reports
                 </button>
              </div>
            </div>
            <div className="p-6">
              {!labReports || labReports.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No lab reports found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {labReports.map((report, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 text-sm">{report.testType}</h6>
                          <p className="text-xs text-gray-500">Created on {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'Report_Generated' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'Report_Sent' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                        <div><span className="font-medium">Test Description:</span> {report.testDescription || 'N/A'}</div>
                        <div><span className="font-medium">Urgency:</span> {report.urgency || 'Normal'}</div>
                        {report.doctorId && <div><span className="font-medium">Requested By:</span> {report.doctorId.name}</div>}
                        {report.reportGeneratedDate && <div><span className="font-medium">Report Generated:</span> {new Date(report.reportGeneratedDate).toLocaleDateString()}</div>}
                      </div>

                      {/* Report Details */}
                      {(report.reportSummary || report.clinicalInterpretation || report.conclusion || report.recommendations) && (
                        <div className="bg-white p-4 rounded-lg mb-4">
                          <h6 className="font-semibold text-gray-800 mb-3">Report Details</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {report.reportSummary && (
                              <div>
                                <span className="font-medium text-gray-600">Summary:</span>
                                <p className="text-gray-800 mt-1">{report.reportSummary}</p>
                              </div>
                            )}
                            {report.clinicalInterpretation && (
                              <div>
                                <span className="font-medium text-gray-600">Clinical Interpretation:</span>
                                <p className="text-gray-800 mt-1">{report.clinicalInterpretation}</p>
                              </div>
                            )}
                            {report.conclusion && (
                              <div>
                                <span className="font-medium text-gray-600">Conclusion:</span>
                                <p className="text-gray-800 mt-1">{report.conclusion}</p>
                              </div>
                            )}
                            {report.recommendations && (
                              <div>
                                <span className="font-medium text-gray-600">Recommendations:</span>
                                <p className="text-gray-800 mt-1">{report.recommendations}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PDF Report */}
                      {report.hasPdf && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <File className="h-6 w-6 text-blue-600" />
                              <div>
                                <span className="font-medium text-blue-800">PDF Report Available</span>
                                <p className="text-xs text-blue-600 mt-1">
                                  Generated on {report.reportGeneratedDate ? new Date(report.reportGeneratedDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewFile(report.pdfFile, `${report.testType}_report.pdf`)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-xs"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View PDF
                              </button>
                              <button
                                onClick={() => handleDownloadFile(report.pdfFile, `${report.testType}_report.pdf`)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-xs"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Files */}
                      {report.additionalFiles && report.additionalFiles.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg mt-4">
                          <h6 className="font-semibold text-gray-800 mb-3">Additional Files</h6>
                          <div className="flex flex-wrap gap-3">
                            {report.additionalFiles.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                                {getFileIcon(file.type)}
                                <span className="text-xs text-gray-700 truncate max-w-32">{file.name}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleViewFile(file.url, file.name)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="View file"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="text-green-600 hover:text-green-800 p-1"
                                    title="Download file"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
