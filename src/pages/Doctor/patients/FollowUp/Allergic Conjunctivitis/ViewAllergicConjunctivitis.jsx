import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllergicConjunctivitis } from '../../../../../features/doctor/doctorThunks';

import { 
  ArrowLeft, 
  AlertCircle,
  Activity,
  User,
  Calendar,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const ViewAllergicConjunctivitis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allergicConjunctivitis, loading, error } = useSelector(state => state.doctor);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchAllergicConjunctivitis(patientId));
    }
  }, [dispatch, patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `allergic-conjunctivitis-${patientId}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle array response from backend - get the most recent record
  const getLatestRecord = () => {
    if (!allergicConjunctivitis) return null;
    
    // If it's an array, get the most recent one
    if (Array.isArray(allergicConjunctivitis)) {
      return allergicConjunctivitis.length > 0 ? allergicConjunctivitis[0] : null; // Already sorted by createdAt desc
    }
    
    // If it's a single object, return it
    return allergicConjunctivitis;
  };

  const latestRecord = getLatestRecord();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-md font-semibold text-gray-800 mb-2">Error Loading Record</h2>
              <p className="text-gray-600 mb-4 text-xs">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!latestRecord) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-md font-semibold text-gray-800 mb-2">No Record Found</h2>
              <p className="text-gray-600 mb-4 text-xs">No allergic conjunctivitis record found for this patient.</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get present symptoms for summary
  const presentSymptoms = latestRecord.symptoms ? 
    Object.entries(latestRecord.symptoms)
      .filter(([_, value]) => value === 'yes')
      .map(([symptom, _]) => symptom) : [];

  // Get severity summary
  const severitySummary = latestRecord.grading ? 
    Object.entries(latestRecord.grading)
      .filter(([_, value]) => value !== '')
      .map(([criterion, severity]) => ({ 
        criterion, 
        severity: typeof severity === 'string' ? severity : String(severity || '') 
      })) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
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
              <h1 className="text-md font-bold text-gray-800">Allergic Conjunctivitis Medical Record</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-xs"
              >
                <FileText size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-xs"
              >
                <FileText size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Record Header */}
          <div className="text-center mb-8">
            <h1 className="text-md font-bold text-gray-800 mb-2">ALLERGIC CONJUNCTIVITIS</h1>
            <p className="text-gray-600 text-xs">Medical Assessment Record</p>
          </div>
          
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium text-xs">{latestRecord.patientId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient ID</label>
                <p className="text-gray-900 font-medium text-xs">{latestRecord.patientId?._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Assessment Date</label>
                <p className="text-gray-900 font-medium text-xs">
                  {latestRecord.createdAt ? new Date(latestRecord.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-8">
            {/* Diagnosis */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                Clinical Diagnosis
              </h2>
              <div className="bg-white rounded-lg p-4 border">
                <span className="text-xs font-semibold text-blue-600 capitalize">
                  {latestRecord.type || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Presenting Symptoms */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Presenting Symptoms</h2>
              {presentSymptoms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {presentSymptoms.map((symptom, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-800 font-medium text-xs">{symptom}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border-l-4 border-gray-300">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-xs">No symptoms reported</span>
                  </div>
                </div>
              )}
            </div>

            {/* Severity Assessment */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Severity Assessment</h2>
              {severitySummary.length > 0 ? (
                <div className="space-y-4">
                  {severitySummary.map(({ criterion, severity }, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800 font-medium text-xs">{criterion}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          severity === 'mild' ? 'bg-green-100 text-green-800' :
                          severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {typeof severity === 'string' && severity.length > 0 
                            ? severity.charAt(0).toUpperCase() + severity.slice(1)
                            : severity || 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border-l-4 border-gray-300">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-xs">No severity assessment completed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Clinical Summary</h2>
              <div className="bg-white rounded-lg p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-blue-600">{presentSymptoms.length}</span>
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Symptoms</h3>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                  
                  <div>
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-semibold text-green-600">
                        {latestRecord.type ? latestRecord.type.split(' ')[0] : 'N/A'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Type</h3>
                    <p className="text-xs text-gray-500">Diagnosis</p>
                  </div>
                  
                  <div>
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-purple-600">{severitySummary.length}</span>
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Criteria</h3>
                    <p className="text-xs text-gray-500">Assessed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Record Metadata */}
          <div className="border-t pt-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Record Created:</span>
                <span className="text-gray-900">
                  {latestRecord.createdAt ? new Date(latestRecord.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-900">
                  {latestRecord.updatedAt ? new Date(latestRecord.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllergicConjunctivitis; 