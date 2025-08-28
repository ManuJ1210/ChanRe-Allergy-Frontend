import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllergicBronchitis } from '../../../../../features/doctor/doctorThunks';

import { 
  ArrowLeft, 
  Activity,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const ViewAllergicBronchitis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allergicBronchitis, loading, error } = useSelector(state => state.doctor);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchAllergicBronchitis(patientId));
    }
  }, [dispatch, patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `allergic-bronchitis-${patientId}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle array response from backend - get the most recent record
  const getLatestRecord = () => {
    if (!allergicBronchitis) return null;
    
    // If it's an array, get the most recent one
    if (Array.isArray(allergicBronchitis)) {
      return allergicBronchitis.length > 0 ? allergicBronchitis[0] : null; // Already sorted by createdAt desc
    }
    
    // If it's a single object, return it
    return allergicBronchitis;
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
              <p className="text-gray-600 mb-4 text-xs">No allergic bronchitis record found for this patient.</p>
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
              <h1 className="text-md font-bold text-gray-800">Allergic Bronchitis Medical Record</h1>
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
            <h1 className="text-md font-bold text-gray-800 mb-2">ALLERGIC BRONCHITIS</h1>
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

            {/* Symptoms */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Presenting Symptoms</h2>
              <div className="bg-white rounded-lg p-4 border">
                {latestRecord.symptoms ? (
                  <p className="text-gray-800 whitespace-pre-wrap text-xs">{latestRecord.symptoms}</p>
                ) : (
                  <p className="text-gray-500 italic text-xs">No symptoms recorded</p>
                )}
              </div>
            </div>

            {/* GINA Grading */}
            {latestRecord.ginaGrading && Object.keys(latestRecord.ginaGrading).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  GINA Grading of Asthma
                </h2>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="space-y-3">
                    {Object.entries(latestRecord.ginaGrading).map(([question, value]) => (
                      <div key={question} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium text-xs">{question}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          value === 'Controlled' ? 'bg-green-100 text-green-800' :
                          value === 'Partially Controlled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PFT Grading */}
            {latestRecord.pftGrading && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  PFT Grading
                </h2>
                <div className="bg-white rounded-lg p-4 border">
                  <span className={`px-3 py-2 rounded-full text-xs font-medium ${
                    latestRecord.pftGrading === 'Mild' ? 'bg-green-100 text-green-800' :
                    latestRecord.pftGrading === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    latestRecord.pftGrading === 'Severe' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {latestRecord.pftGrading}
                  </span>
                </div>
              </div>
            )}

            {/* Habits */}
            {latestRecord.habits && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Patient Habits</h2>
                <div className="bg-white rounded-lg p-4 border">
                  <span className={`px-3 py-2 rounded-full text-xs font-medium ${
                    latestRecord.habits === 'Smoker' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {latestRecord.habits}
                  </span>
                </div>
              </div>
            )}

            {/* Clinical Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Clinical Summary</h2>
              <div className="bg-white rounded-lg p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Type</h3>
                    <p className="text-xs text-gray-500 capitalize">{latestRecord.type || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">GINA Criteria</h3>
                    <p className="text-xs text-gray-500">
                      {latestRecord.ginaGrading ? Object.keys(latestRecord.ginaGrading).length : 0} assessed
                    </p>
                  </div>
                  
                  <div>
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">PFT Grade</h3>
                    <p className="text-xs text-gray-500 capitalize">{latestRecord.pftGrading || 'N/A'}</p>
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

export default ViewAllergicBronchitis; 