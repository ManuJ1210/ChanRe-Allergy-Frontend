import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchPatientDetails, fetchPatientMedications, fetchPatientHistory, fetchPatientFollowUps, fetchAllergicRhinitis, fetchAllergicConjunctivitis, fetchAllergicBronchitis, fetchAtopicDermatitis, fetchGPE, fetchPrescriptions, fetchTests, fetchPatientTestRequests, updatePatient } from '../../../../features/doctor/doctorThunks';
import { canDoctorEditPatient, getEditRestrictionMessage, canDoctorAddFollowUp } from '../../../../utils/patientPermissions';
import { 
  ArrowLeft, User, Phone, Calendar, MapPin, Activity, Pill, FileText, Eye, Edit, Plus, AlertCircle, Mail, UserCheck, Clock, Lock
} from 'lucide-react';
import API from '../../../../services/api';

const TABS = ["Overview", "Follow Up", "Prescription", "Lab Report Status", "History", "Investigation", "Medications"];

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);



    const { 
    patientDetails, 
    patientMedications: medications, 
    patientHistory: history, 
    tests,
    patientTestRequests: testRequests,
    patientFollowUps: followUps,
    allergicRhinitis,
    atopicDermatitis,
    allergicConjunctivitis,
    allergicBronchitis,
    gpe,
    prescriptions,
    loading, error, patientMedicationsLoading: medLoading, patientMedicationsError: medError, patientHistoryLoading: historyLoading, patientHistoryError: historyError, testsLoading, testsError
  } = useSelector(state => state.doctor);

  // Extract patient data from the new structure
  const patient = patientDetails?.patient || patientDetails;
  

  
  // Handle assigning doctor to patient
  const handleAssignDoctor = async () => {
    if (!user || !user._id || !patient || !patient._id) {
      toast.error('Unable to assign doctor. Please try again.');
      return;
    }

    try {
      const response = await API.put(`/patients/${patient._id}`, {
        assignedDoctor: user._id
      });

      if (response.status === 200) {
        toast.success('Successfully assigned as doctor to this patient!');
        // Refresh patient data
        dispatch(fetchPatientDetails(id));
      } else {
        toast.error(response.data?.message || 'Failed to assign doctor');
      }
    } catch (error) {
      toast.error('Failed to assign doctor. Please try again.');
    }
  };
  
  // Get current user from auth state
  const { user } = useSelector((state) => state.auth);
  
  // Check if doctor can edit this patient
  const editPermission = canDoctorEditPatient(patient, user);
  const editRestrictionMessage = getEditRestrictionMessage(patient, user);

  // Debug logging
  console.log('🔍 Doctor ViewProfile Debug:', {
    patientId: patient?._id,
    patient: patient,
    user: user,
    editPermission: editPermission,
    patientRegisteredBy: patient?.registeredBy,
    patientAssignedDoctor: patient?.assignedDoctor,
    userRole: user?.role,
    userId: user?._id
  });




  


  // Doctors typically can't delete patients - this functionality is removed

  useEffect(() => {
    // Check if ID is valid (not undefined, null, or empty string)
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      return;
    }
    
    if (id) {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Check for refresh parameter (from successful test submission)
      const urlParams = new URLSearchParams(location.search);
      const refreshParam = urlParams.get('refresh');
      
      if (refreshParam) {
        // Clear the refresh parameter from URL
        window.history.replaceState({}, '', `/dashboard/Doctor/patients/profile/ViewProfile/${id}`);
      }

      // Fetch patient details first (includes history, medications)
      dispatch(fetchPatientDetails(id));
      
      // Fetch test requests for Lab Report Status tab
      dispatch(fetchPatientTestRequests(id));
      
      // Fetch laboratory tests for Investigation tab
      dispatch(fetchTests(id));
      
      // Fetch additional follow-up data that's not included in patient details
      dispatch(fetchPatientFollowUps(id));
      dispatch(fetchAllergicRhinitis(id));
      dispatch(fetchAllergicConjunctivitis(id));
      dispatch(fetchAllergicBronchitis(id));
      dispatch(fetchAtopicDermatitis(id));
      dispatch(fetchGPE(id));
      dispatch(fetchPrescriptions(id));
    }
  }, [dispatch, id, navigate, location.search]);



  if (!id) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-xs">No patient ID provided in the URL.</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-xs">Loading patient information...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-xs">
            {loading ? 'Loading patient information...' : 'Patient not found or failed to load.'}
          </p>
          {error && <p className="text-red-500 mt-2 text-xs">Error: {error}</p>}
        </div>
      </div>
    </div>
  );

  // Ensure patient is an object with expected properties
  if (typeof patient !== 'object' || patient === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-xs">Invalid patient data format.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
          <div className="mb-6 sm:mb-8">
              <button
                              onClick={() => navigate('/dashboard/Doctor/patients/PatientList')}
              className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
              >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients List
              </button>
          </div>

          {/* Patient Header */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-md font-bold text-slate-800 mb-2">{patient?.name || 'Patient Name'}</h1>
                                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-slate-600 text-xs">
                      {patient?.gender && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                          {patient.gender}
                        </span>
                      )}
                      {patient?.age && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {patient.age} years
                        </span>
                      )}
                      {patient?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                          {patient.phone}
                        </span>
                      )}
                      {patient?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                          {patient.email}
                        </span>
                      )}
                      {patient?.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          {patient.address}
                        </span>
                      )}
                    </div>
                </div>
            </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                {editPermission.canEdit ? (
                  <button
                    onClick={() => navigate(`/dashboard/Doctor/patients/EditPatient/${patient?._id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center text-xs"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Patient
                  </button>
                ) : (
                  <div className="relative group">
                    <button
                      disabled
                      className="bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 justify-center text-xs cursor-not-allowed"
                    >
                      <Clock className="h-4 w-4" />
                      Edit Patient
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {editRestrictionMessage}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/dashboard/Doctor/AddTestRequest?patientId=${patient?._id}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center text-xs"
                >
                  <FileText className="h-4 w-4" />
                  Test Request
                </button>
                {/* Delete button removed - doctors can't delete patients */}
              </div>
            </div>
          </div>



          {/* 24-hour restriction notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-blue-700 text-xs">
                <strong>Note:</strong> Patient editing and followup addition are only available within 24 hours of patient registration
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex-1 text-xs ${
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
            <div className="space-y-6 sm:space-y-8">
              {/* Patient Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-4 sm:p-6 border-b border-blue-100">
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Patient Details
            </h2>
                  <p className="text-slate-600 mt-1 text-xs">
                    Complete patient information and contact details
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                        <p className="text-slate-800 font-medium text-xs">{patient.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Mobile</label>
                        <p className="text-slate-800 text-xs">
                          {typeof patient.phone === 'string' ? patient.phone :
                           typeof patient.contact === 'string' ? patient.contact : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                        <p className="text-slate-800 text-xs">{typeof patient.email === 'string' ? patient.email : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                        <p className="text-slate-800 text-xs">{typeof patient.address === 'string' ? patient.address : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Doctor</label>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-800 text-xs">
                            {patient.assignedDoctor?.name || 'Not assigned'}
                          </p>
                          {!patient.assignedDoctor && user && (
                            <button
                              onClick={() => handleAssignDoctor()}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                            >
                              Assign Me
                            </button>
                          )}
                        </div>

                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                        <p className="text-slate-800 capitalize text-xs">{patient.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Age</label>
                        <p className="text-slate-800 text-xs">{patient.age ? `${patient.age} years` : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Center</label>
                        <p className="text-slate-800 text-xs">
                          {patient.centerId?.name ||
                           (typeof patient.centerCode === 'string' ? patient.centerCode : 'N/A')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Follow Up" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Allergic Rhinitis */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-800">Allergic Rhinitis</h2>
                  {(() => {
                    const canAdd = user ? canDoctorAddFollowUp(patient, user).canAddFollowUp : false;
                    
                    if (canAdd) {
                      return (
                        <button
                          onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/AddAllergicRhinitis/${patient._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                        >
                          Add Follow Up
                        </button>
                      );
                    } else {
                      return (
                        <button
                          disabled
                          className="bg-gray-400 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium cursor-not-allowed text-xs w-full sm:w-auto flex items-center justify-center"
                          title="Followups can only be added within 24 hours of patient registration"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Add Follow Up
                        </button>
                      );
                    }
                  })()}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {allergicRhinitis && allergicRhinitis.length > 0 ? (
                          allergicRhinitis.map((rhinitis, idx) => (
                            <tr key={rhinitis._id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.name}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.age}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.centerCode || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.phone || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                {rhinitis.updatedAt ? new Date(rhinitis.updatedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                <button
                                  onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/ViewAllergicRhinitis/${patient._id}`)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-xs">No allergic rhinitis records found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
            </div>
          </div>
              </div>

              {/* Atopic Dermatitis */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-800">Atopic Dermatitis</h2>
                                {(() => {
                                  const canAdd = user ? canDoctorAddFollowUp(patient, user).canAddFollowUp : false;
                                  
                                  if (canAdd) {
                                    return (
                                      <button
                                        onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/AtopicDermatitis/${patient._id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                                      >
                                        Add Follow Up
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button
                                        disabled
                                        className="bg-gray-400 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium cursor-not-allowed text-xs w-full sm:w-auto flex items-center justify-center"
                                        title="Followups can only be added within 24 hours of patient registration"
                                      >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Add Follow Up
                                      </button>
                                    );
                                  }
                                })()}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Symptoms</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Name</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient ID</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated By</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {atopicDermatitis && atopicDermatitis.length > 0 ? (
                          atopicDermatitis.map((dermatitis, idx) => (
                            <tr key={dermatitis._id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                {dermatitis.createdAt ? new Date(dermatitis.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{dermatitis.symptoms || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.centerCode || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.centerId?.name || patient.centerName || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient._id?.toString() || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                {typeof dermatitis.updatedBy === 'string' ? dermatitis.updatedBy : 
                                 typeof dermatitis.updatedBy === 'object' && dermatitis.updatedBy?.name ? dermatitis.updatedBy.name : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                <button
                                  onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/ViewAtopicDermatitis/${dermatitis._id}`)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-xs">No atopic dermatitis records found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Allergic Conjunctivitis */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-800">Allergic Conjunctivitis</h2>
                                {(() => {
                                  const canAdd = user ? canDoctorAddFollowUp(patient, user).canAddFollowUp : false;
                                  
                                  if (canAdd) {
                                    return (
                                      <button
                                        onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/AddAllergicConjunctivitis/${patient._id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                                      >
                                        Add Follow Up
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button
                                        disabled
                                        className="bg-gray-400 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium cursor-not-allowed text-xs w-full sm:w-auto flex items-center justify-center"
                                        title="Followups can only be added within 24 hours of patient registration"
                                      >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Add Follow Up
                                      </button>
                                    );
                                  }
                                })()}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {allergicConjunctivitis && allergicConjunctivitis.length > 0 ? (
                          allergicConjunctivitis.map((conjunctivitis, idx) => (
                            <tr key={conjunctivitis._id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.name}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.age}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.centerCode || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.phone || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                {conjunctivitis.updatedAt ? new Date(conjunctivitis.updatedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                <button
                                  onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/ViewAllergicConjunctivitis/${patient._id}`)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-xs">No allergic conjunctivitis records found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
              </div>
            </div>
          </div>

              {/* Allergic Bronchitis */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-800">Allergic Bronchitis</h2>
                            {(() => {
                              const canAdd = user ? canDoctorAddFollowUp(patient, user).canAddFollowUp : false;
                              
                              if (canAdd) {
                                return (
                                  <button
                                    onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/AddAllergicBronchitis/${patient._id}`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                                  >
                                    Add Follow Up
                                  </button>
                                );
                              } else {
                                return (
                                  <button
                                    disabled
                                    className="bg-gray-400 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium cursor-not-allowed text-xs w-full sm:w-auto flex items-center justify-center"
                                    title="Followups can only be added within 24 hours of patient registration"
                                  >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Add Follow Up
                                  </button>
                                );
                              }
                            })()}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {allergicBronchitis && allergicBronchitis.length > 0 ? (
                          allergicBronchitis.map((bronchitis, idx) => (
                            <tr key={bronchitis._id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.name}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.age}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.centerCode || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.phone || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                {bronchitis.updatedAt ? new Date(bronchitis.updatedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                            <button
                onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/ViewAllergicBronchitis/${patient._id}`)}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                View
              </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-xs">No allergic bronchitis records found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
            </div>
          </div>
        </div>

              {/* GPE */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-sm font-semibold text-slate-800">GPE</h2>
                        {(() => {
                          const canAdd = user ? canDoctorAddFollowUp(patient, user).canAddFollowUp : false;
                          
                          if (canAdd) {
                            return (
                              <button
                                onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/AddGPE/${patient._id}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                              >
                                Add Follow Up
                              </button>
                            );
                          } else {
                            return (
                              <button
                                disabled
                                className="bg-gray-400 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium cursor-not-allowed text-xs w-full sm:w-auto flex items-center justify-center"
                                title="Followups can only be added within 24 hours of patient registration"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Add Follow Up
                              </button>
                            );
                          }
                        })()}
          </div>
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {gpe && gpe.length > 0 ? (
                          gpe.map((gpe, idx) => (
                            <tr key={gpe._id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.name}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.age}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.centerCode || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient.phone || 'N/A'}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                {gpe.updatedAt ? new Date(gpe.updatedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                        <button
                      onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/ViewGPE/${patient._id}`)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View
                    </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                                                    <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p className="text-xs">No GPE records found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
            </div>
          )}
          {activeTab === "Prescription" && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-sm font-semibold text-slate-800">Prescription</h2>
                        {(() => {
                          const canAdd = user ? canDoctorAddFollowUp(patient, user).canAddFollowUp : false;
                          
                          if (canAdd) {
                            return (
                              <button
                                onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/AddPrescription/${patient._id}`)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                              >
                                Add Prescription
                              </button>
                            );
                          } else {
                            return (
                              <button
                                disabled
                                className="bg-gray-400 text-gray-600 px-3 sm:px-4 py-2 rounded-lg font-medium cursor-not-allowed text-xs w-full sm:w-auto flex items-center justify-center"
                                title="Followups can only be added within 24 hours of patient registration"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Add Prescription
                              </button>
                            );
                          }
                        })()}
          </div>
              <div className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Visit</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient ID</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated By</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {prescriptions && prescriptions.length > 0 ? (
                        prescriptions.map((prescription, idx) => (
                          <tr key={prescription._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                              {prescription.createdAt ? new Date(prescription.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{prescription.visitNumber || idx + 1}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{patient._id?.toString() || 'N/A'}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                              {typeof prescription.updatedBy === 'string' ? prescription.updatedBy : 
                               typeof prescription.updatedBy === 'object' && prescription.updatedBy?.name ? prescription.updatedBy.name : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                                        <button
                      onClick={() => navigate(`/dashboard/Doctor/patients/FollowUp/ViewPrescription/${patient._id}`)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View
                    </button>
                              
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-xs">No prescriptions found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
            </div>
          )}

          {/* Lab Report Status Tab */}
          {activeTab === "Lab Report Status" && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Lab Report Status
                  </h2>
                  <p className="text-slate-600 mt-1 text-xs">Track laboratory test request status and results</p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/Doctor/patients/AddTest/${patient._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                >
                  Add Test Request
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Requested</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lab</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {testRequests && testRequests.length > 0 ? (
                        testRequests.map((request, idx) => (
                          <tr key={request._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                              {request.testType || 'General Lab Test'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                request.status === 'Completed' || request.status === 'Report_Sent'
                                  ? 'bg-green-100 text-green-800' 
                                  : request.status === 'In_Lab_Testing' || request.status === 'Testing_Completed'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'Billing_Pending' || request.status === 'Billing_Generated'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {request.status?.replace(/_/g, ' ') || 'Pending'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">
                              {request.labStaffId?.staffName || request.centerName || 'Not Assigned'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                              {request.reportFilePath ? (
                                <span className="text-green-600 font-medium">Available</span>
                              ) : (
                                <span className="text-gray-500">Pending</span>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs">
                              {request.reportFilePath ? (
                                <button
                                  onClick={() => navigate(`/dashboard/doctor/test-request/${request._id}`)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  Download
                                </button>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-xs">No lab reports found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "History" && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Patient History
                  </h2>
                  <p className="text-slate-600 mt-1 text-xs">Medical history, family history, and clinical notes</p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/Doctor/patients/AddHistory/${patient._id}`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                >
                  Add History
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-xs">Loading history...</p>
                  </div>
                ) : historyError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-xs">{historyError}</p>
                  </div>
                ) : (history || []).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs">No history records found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(history || []).map((historyItem, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                          <h3 className="text-sm font-medium text-slate-800">
                            Medical History Record #{idx + 1}
                          </h3>
                          <div className="flex gap-2">
                            <span className="text-xs text-slate-500">
                              {historyItem.createdAt ? new Date(historyItem.createdAt).toLocaleDateString() : 
                               historyItem.date ? new Date(historyItem.date).toLocaleDateString() : 'N/A'}
                            </span>
                            <button
                              onClick={() => navigate(`/dashboard/Doctor/patients/AddHistory/ViewHistory/${patient._id}`)}
                              className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Allergic Conditions</h4>
                            <p className="text-slate-600"><span className="font-medium">Hay Fever:</span> {historyItem.hayFever || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Asthma:</span> {historyItem.asthma || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Food Allergies:</span> {historyItem.foodAllergies || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Drug Allergy:</span> {historyItem.drugAllergy || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Eczema/Rashes:</span> {historyItem.eczemaRashes || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Respiratory</h4>
                            <p className="text-slate-600"><span className="font-medium">Breathing Problems:</span> {historyItem.breathingProblems || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Sinus Trouble:</span> {historyItem.sinusTrouble || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Hives/Swelling:</span> {historyItem.hivesSwelling || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Asthma Type:</span> {historyItem.asthmaType || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Exercise Induced:</span> {historyItem.exerciseInducedSymptoms || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Medical History</h4>
                            <p className="text-slate-600"><span className="font-medium">Hypertension:</span> {historyItem.hypertension || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Diabetes:</span> {historyItem.diabetes || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Hospital Admissions:</span> {historyItem.hospitalAdmission || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Family Smoking:</span> {historyItem.familySmoking || 'N/A'}</p>
                            <p className="text-slate-600"><span className="font-medium">Pets at Home:</span> {historyItem.petsAtHome || 'N/A'}</p>
                          </div>
                        </div>
                        {/* Show triggers if available */}
                        {(historyItem.triggersUrtis || historyItem.triggersColdWeather || historyItem.triggersPollen || 
                          historyItem.triggersSmoke || historyItem.triggersExercise || historyItem.triggersPets || 
                          historyItem.triggersOthers) && (
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <h4 className="font-medium text-slate-700 mb-2">Triggers</h4>
                            <div className="flex flex-wrap gap-2">
                              {historyItem.triggersUrtis && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">URTI</span>}
                              {historyItem.triggersColdWeather && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Cold Weather</span>}
                              {historyItem.triggersPollen && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pollen</span>}
                              {historyItem.triggersSmoke && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Smoke</span>}
                              {historyItem.triggersExercise && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Exercise</span>}
                              {historyItem.triggersPets && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Pets</span>}
                              {historyItem.triggersOthers && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">{historyItem.triggersOthers}</span>}
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

          {/* Investigation Tab */}
          {activeTab === "Investigation" && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Laboratory Investigations
                  </h2>
                  <p className="text-slate-600 mt-1 text-xs">Detailed laboratory test results and analysis</p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/Doctor/patients/AddTest/${patient._id}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                >
                  Add Investigation
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {testsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-xs">Loading laboratory investigations...</p>
                  </div>
                ) : testsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-xs">{testsError}</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                                          <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CBC</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hb</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">TC</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DC</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Neutrophils</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Eosinophil</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lymphocytes</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Monocytes</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Platelets</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ESR</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serum Creatinine</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serum IgE Levels</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">C3, C4 Levels</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ANA (IF)</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Urine Routine</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allergy Panel</th>
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tests && tests.length > 0 ? (
                        tests.map((test, idx) => (
                          <tr key={test._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">{test.date ? new Date(test.date).toLocaleDateString() : test.createdAt ? new Date(test.createdAt).toLocaleDateString() : ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.CBC || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.Hb || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.TC || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.DC || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.Neutrophils || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.Eosinophil || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.Lymphocytes || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.Monocytes || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.Platelets || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.ESR || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.SerumCreatinine || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.SerumIgELevels || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.C3C4Levels || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.ANA_IF || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.UrineRoutine || ''}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-800">{test.AllergyPanel || ''}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={17} className="px-4 py-8 text-center text-slate-500">
                            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-xs sm:text-sm">No investigations found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === "Medications" && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                    <Pill className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Medications
                  </h2>
                  <p className="text-slate-600 mt-1 text-xs">Current and past medications prescribed to the patient</p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/Doctor/patients/profile/AddMedications/${patient._id}`)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs w-full sm:w-auto"
                >
                  Add Medication
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {medLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 text-xs">Loading medications...</p>
                  </div>
                ) : medError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-xs">{medError}</p>
                  </div>
                ) : (medications || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs">No medications found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Drug Name</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dose</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prescribed By</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Prescribed</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Adverse Effect</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(medications || []).map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-slate-800">{med.drugName}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">{med.dose}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">{med.duration}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">{med.frequency || 'N/A'}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">
                              {typeof med.prescribedBy === 'string' ? med.prescribedBy : 
                               typeof med.prescribedBy === 'object' && med.prescribedBy?.name ? med.prescribedBy.name : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">
                              {med.createdAt ? new Date(med.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">{med.adverseEvent || 'None'}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600">{med.notes || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ViewProfile; 