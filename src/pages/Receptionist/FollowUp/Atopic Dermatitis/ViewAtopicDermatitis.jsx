import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceptionistAtopicDermatitis, fetchPatient, resetReceptionistState } from '../../../../features/receptionist/receptionistThunks';
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

const ViewAtopicDermatitis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { atopicDermatitis, singlePatient, loading, error } = useSelector(state => state.receptionist);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchReceptionistAtopicDermatitis(patientId));
    }
  }, [dispatch, patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `atopic-dermatitis-${patientId}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle array response from backend - get the most recent record
  const getLatestRecord = () => {
    if (!atopicDermatitis) return null;
    
    // If it's an array, get the most recent one
    if (Array.isArray(atopicDermatitis)) {
      return atopicDermatitis.length > 0 ? atopicDermatitis[0] : null; // Already sorted by createdAt desc
    }
    
    // If it's a single object, return it
    return atopicDermatitis;
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
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Record</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Record Found</h2>
              <p className="text-gray-600 mb-4">No atopic dermatitis record found for this patient.</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Atopic Dermatitis Record</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FileText size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Main Title */}
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">ATOPIC DERMATITIS</h1>
          
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium">{latestRecord?.patientId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient ID</label>
                <p className="text-gray-900 font-medium">{latestRecord?.patientId?._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900 font-medium">{latestRecord?.patientId?.age || 'N/A'} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 font-medium">{latestRecord?.patientId?.gender || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Atopic Dermatitis</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <p className="text-gray-900">{latestRecord.symptoms || 'No symptoms recorded'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Affected Areas/Surface of the body</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <p className="text-gray-900">{latestRecord.affectedAreas || 'No affected areas recorded'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Intensity Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Intensity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestRecord.intensity && Object.entries(latestRecord.intensity).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">{key}</label>
                  <div className="bg-gray-50 rounded-md p-2 border">
                    <span className="text-gray-900">{value || 'Not specified'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On skin without eczema Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">On skin without eczema</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Dryness</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <span className="text-gray-900">{latestRecord.drynessWithoutEczema || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* On skin with eczema Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">On skin with eczema</h2>
            <div className="space-y-4">
              {[
                { key: "redness", label: "Redness" },
                { key: "swelling", label: "Swelling" },
                { key: "oozing", label: "Oozing" },
                { key: "scratching", label: "Traces of scratching" },
                { key: "thickenedSkin", label: "Thickened Skin" }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
                  <div className="bg-gray-50 rounded-md p-3 border">
                    <span className="text-gray-900">{latestRecord[key] || 'Not specified'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Sliders Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Severity Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Severity of Itching</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <span className="text-gray-900">Value: {latestRecord.itching || 0}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Severity of Sleep Disturbance</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <span className="text-gray-900">Value: {latestRecord.sleepDisturbance || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Medications/Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Present Medications</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <p className="text-gray-900">{latestRecord.presentMedications || 'No medications recorded'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Local Applications</label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <p className="text-gray-900">{latestRecord.localApplications || 'No local applications recorded'}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Medications</label>
              <div className="bg-gray-50 rounded-md p-3 border">
                <p className="text-gray-900">{latestRecord.otherMedications || 'No other medications recorded'}</p>
              </div>
            </div>
          </div>

          {/* Record Info */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">
                  {latestRecord.createdAt ? new Date(latestRecord.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Updated:</span>
                <span className="text-gray-900">
                  {latestRecord.updatedAt ? new Date(latestRecord.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAtopicDermatitis; 