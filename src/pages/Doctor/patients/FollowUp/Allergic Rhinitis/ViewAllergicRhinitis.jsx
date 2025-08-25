import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllergicRhinitis } from '../../../../../features/centerAdmin/centerAdminThunks';

import { 
  ArrowLeft, 
  Activity,
  AlertCircle,
  Calendar,
  User,
  Eye,
  FileText,
  Stethoscope,
  Pill
} from 'lucide-react';

const ViewAllergicRhinitis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allergicRhinitis, loading, error } = useSelector(state => state.centerAdmin);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchAllergicRhinitis(patientId));
    }
  }, [dispatch, patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-md font-semibold text-gray-800 mb-2">Error Loading Record</h3>
              <p className="text-gray-600 mb-4 text-xs">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!allergicRhinitis || allergicRhinitis.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-md font-semibold text-gray-800 mb-2">No Allergic Rhinitis Record Found</h3>
              <p className="text-gray-600 mb-4 text-xs">This patient doesn't have any allergic rhinitis records yet.</p>
              <button
                onClick={() => navigate(`/center-admin/followup/allergic-rhinitis/add/${patientId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2 text-xs"
              >
                Add Record
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const record = Array.isArray(allergicRhinitis) ? allergicRhinitis[0] : allergicRhinitis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-md font-bold text-gray-800">ALLERGIC RHINITIS RECORD</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/center-admin/followup/allergic-rhinitis/add/${patientId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Add New Record
              </button>
            </div>
          </div>
        </div>

        {/* Record Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Information
              </h3>
              <div className="space-y-2">
                <p className="text-xs"><span className="font-medium">Name:</span> {record.patientId?.name || 'N/A'}</p>
                <p className="text-xs"><span className="font-medium">Age:</span> {record.patientId?.age || 'N/A'}</p>
                <p className="text-xs"><span className="font-medium">Gender:</span> {record.patientId?.gender || 'N/A'}</p>
                <p className="text-xs"><span className="font-medium">Phone:</span> {record.patientId?.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Record Details
              </h3>
              <div className="space-y-2">
                <p className="text-xs"><span className="font-medium">Date:</span> {new Date(record.createdAt).toLocaleDateString()}</p>
                <p className="text-xs"><span className="font-medium">Quality of Life Score:</span> {record.qualityOfLife || 'N/A'}</p>
                <p className="text-xs"><span className="font-medium">Updated:</span> {new Date(record.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Nasal Symptoms */}
          {record.nasalSymptoms && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Nasal Symptom Severity
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(record.nasalSymptoms).map(([symptom, value]) => (
                    <div key={symptom} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 capitalize text-xs">
                        {symptom.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Score: {value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-700 text-xs">
                    Total Nasal Symptoms: {Object.values(record.nasalSymptoms).reduce((sum, val) => sum + (parseInt(val) || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Non-Nasal Symptoms */}
          {record.nonNasalSymptoms && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Non-Nasal Symptom Severity
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(record.nonNasalSymptoms).map(([symptom, value]) => (
                    <div key={symptom} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 capitalize text-xs">
                        {symptom.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Score: {value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-700 text-xs">
                    Total Non-Nasal Symptoms: {Object.values(record.nonNasalSymptoms).reduce((sum, val) => sum + (parseInt(val) || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quality of Life */}
          {record.qualityOfLife !== undefined && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Quality of Life Assessment</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-700 text-xs">
                  Severity Score: <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">{record.qualityOfLife}</span>
                </p>
              </div>
            </div>
          )}

          {/* Medications */}
          {record.medications && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Pill className="h-5 w-5 mr-2 text-blue-600" />
                Medications
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(record.medications).map(([type, medication]) => (
                    <div key={type}>
                      <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}:
                      </label>
                      <p className="text-gray-800 text-xs">{medication || 'Not specified'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ENT Examination */}
          {record.entExamination && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                ENT Examination
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 text-xs">{record.entExamination}</p>
              </div>
            </div>
          )}

          {/* GPE */}
          {record.gpe && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">General Physical Examination (GPE)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(record.gpe).map(([vital, value]) => (
                    <div key={vital}>
                      <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">
                        {vital}:
                      </label>
                      <p className="text-gray-800 text-xs">{value || 'Not recorded'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Systematic Examination */}
          {record.systematicExamination && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Systematic Examination</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {Object.entries(record.systematicExamination).map(([system, value]) => {
                    if (system === 'followUpAdvice') return null;
                    return (
                      <div key={system}>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">
                          {system}:
                        </label>
                        <p className="text-gray-800 text-xs">{value || 'Not recorded'}</p>
                      </div>
                    );
                  })}
                </div>
                {record.systematicExamination.followUpAdvice && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Follow-up Advice:</label>
                    <p className="text-gray-800 text-xs">{record.systematicExamination.followUpAdvice}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs"
            >
              Back to Follow-ups
            </button>
            <button
              onClick={() => navigate(`/center-admin/followup/allergic-rhinitis/add/${patientId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              Add New Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllergicRhinitis; 