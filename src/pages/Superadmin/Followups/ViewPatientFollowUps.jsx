import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientGeneralFollowUps } from '../../../features/superadmin/superadminThunks';
import { Activity, Eye, ArrowLeft, Calendar, User, AlertCircle, RefreshCw } from "lucide-react";

export default function ViewPatientFollowUps() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get followups from Redux state
  const { 
    patientFollowUps: followUps,
    loading: followUpsLoading,
    error: followUpsError
  } = useSelector(state => state.superadmin);

  const [retryCount, setRetryCount] = useState(0);

  // Validate patientId when component mounts or patientId changes
  useEffect(() => {
    const valid = patientId && patientId !== 'undefined' && patientId !== 'null' && patientId !== '';
    console.log('🔍 PatientId validation:', { patientId, valid });
    
    // Add a small delay to ensure route parameters are properly parsed
    if (!valid && patientId) {
      const timer = setTimeout(() => {
        const delayedValid = patientId && patientId !== 'undefined' && patientId !== 'null' && patientId !== '';
        console.log('🔍 Delayed validation:', { patientId, delayedValid });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [patientId]);

  useEffect(() => {
    console.log('🔍 ViewPatientFollowUps useEffect triggered');
    console.log('🔍 patientId from useParams:', patientId);
    console.log('🔍 patientId type:', typeof patientId);
    console.log('🔍 patientId value:', patientId);
    
    // Don't proceed if patientId is not valid
    if (!patientId || patientId === 'undefined' || patientId === 'null' || patientId === '') {
      console.log('⏳ Waiting for valid patientId...');
      return;
    }
    
    console.log('✅ Valid patientId, fetching followups...');
    dispatch(fetchPatientGeneralFollowUps(patientId));
  }, [dispatch, patientId, retryCount]);

  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
  };

  // Map follow-up types to their view routes
  const viewRoutes = {
    "Allergic Rhinitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAllergicRhinitis/${patientId}`,
    "Atopic Dermatitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAtopicDermatitis/${patientId}`,
    "Allergic Conjunctivitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAllergicConjunctivitis/${patientId}`,
    "Allergic Bronchitis": (patientId) => `/dashboard/Superadmin/Followups/ViewAllergicBronchitis/${patientId}`,
    "GPE": (patientId) => `/dashboard/Superadmin/Followups/ViewGPE/${patientId}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Patient Follow-ups
          </h1>
          <p className="text-slate-600 text-sm sm:text-base text-center sm:text-left">
            View all follow-up assessments for this patient
          </p>
          {/* Debug info */}
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p>Patient ID: {patientId || 'Not provided'}</p>
            <p>Status: {followUpsLoading ? 'Loading...' : followUpsError ? 'Error' : 'Ready'}</p>
          </div>
        </div>

        {/* Follow-ups Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center justify-center sm:justify-start">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Follow-up Records
            </h2>
            <p className="text-slate-600 mt-1 text-sm sm:text-base text-center sm:text-left">
              Total: {followUps.length} records
            </p>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {!patientId || patientId === 'undefined' || patientId === 'null' || patientId === '' ? (
              <div className="p-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-yellow-600 text-sm">Waiting for patient ID...</p>
                  <p className="text-yellow-500 text-xs mt-2">Patient ID: {patientId || 'Not provided'}</p>
                </div>
              </div>
            ) : followUpsLoading ? (
              <div className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 text-sm">Loading follow-ups...</p>
                </div>
              </div>
            ) : followUpsError ? (
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                      <span className="text-red-700 text-sm sm:text-base">{followUpsError}</span>
                    </div>
                    <button
                      onClick={retryFetch}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            ) : followUps.length === 0 ? (
              <div className="p-6">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-600 mb-2">No Follow-ups Found</h3>
                  <p className="text-slate-500 text-sm">No follow-up records available for this patient.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {followUps.map((rec, idx) => (
                  <div key={rec._id || idx} className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between mb-3">
                      <h6 className="font-semibold text-gray-800 text-sm">
                        {rec.type || 'Follow-up'}
                      </h6>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {rec.date ? new Date(rec.date).toLocaleDateString() : 
                           rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="flex gap-2">
                          {/* View Details Button based on follow-up type */}
                          {rec.type && (
                            <button
                              onClick={() => {
                                console.log('🔍 Navigating to view page for follow-up type:', rec.type);
                                console.log('🔍 Patient ID:', patientId);
                                
                                const route = viewRoutes[rec.type];
                                if (route) {
                                  const fullRoute = route(patientId);
                                  console.log('🔍 Full route:', fullRoute);
                                  console.log('🔍 Attempting navigation...');
                                  navigate(fullRoute);
                                } else {
                                  console.log('⚠️ No route found for follow-up type:', rec.type);
                                  console.log('⚠️ Available types:', Object.keys(viewRoutes));
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title={`View ${rec.type} Details`}
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
                      {rec.patientId && (
                        <div className="bg-white p-2 rounded text-xs">
                          <span className="text-gray-600">Patient: </span>
                          <span className="text-gray-800 font-medium">{rec.patientId.name}</span>
                          {rec.patientId.centerId && (
                            <span className="text-gray-500 ml-2">({rec.patientId.centerId.name})</span>
                          )}
                        </div>
                      )}
                      
                      {/* Quality of Life */}
                      {rec.qualityOfLife && (
                        <div className="bg-white p-2 rounded text-xs">
                          <span className="text-gray-600">Quality of Life Impact: </span>
                          <span className="text-gray-800 font-medium">{rec.qualityOfLife}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            {!patientId || patientId === 'undefined' || patientId === 'null' || patientId === '' ? (
              <div className="p-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-yellow-600 text-sm sm:text-base">Waiting for patient ID...</p>
                  <p className="text-yellow-500 text-xs mt-2">Patient ID: {patientId || 'Not provided'}</p>
                </div>
              </div>
            ) : followUpsLoading ? (
              <div className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 text-sm sm:text-base">Loading follow-ups...</p>
                </div>
              </div>
            ) : followUpsError ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-red-700 text-sm sm:text-base">{followUpsError}</span>
                  </div>
                  <button
                    onClick={retryFetch}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : followUps.length === 0 ? (
              <div className="p-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-600 mb-2">No Follow-ups Found</h3>
                  <p className="text-slate-500 text-sm">No follow-up records available for this patient.</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Follow-up Type
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Quality of Life
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {followUps.map((rec, idx) => (
                    <tr key={rec._id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Activity className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-800">{rec.type || 'Follow-up'}</p>
                            {rec.patientId && (
                              <p className="text-xs text-slate-500">
                                Patient: {rec.patientId.name}
                                {rec.patientId.centerId && ` (${rec.patientId.centerId.name})`}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-slate-700">
                        {rec.date ? new Date(rec.date).toLocaleDateString() : 
                         rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-slate-700">
                        {rec.qualityOfLife ? `${rec.qualityOfLife}/5` : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-slate-700">
                        <button
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                          onClick={() => {
                            console.log('🔍 Navigating to view page for follow-up type:', rec.type);
                            console.log('🔍 Patient ID:', patientId);
                            
                            const route = viewRoutes[rec.type];
                            if (route) {
                              const fullRoute = route(patientId);
                              console.log('🔍 Full route:', fullRoute);
                              console.log('🔍 Attempting navigation...');
                              navigate(fullRoute);
                            } else {
                              console.log('⚠️ No route found for follow-up type:', rec.type);
                              console.log('⚠️ Available types:', Object.keys(viewRoutes));
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 