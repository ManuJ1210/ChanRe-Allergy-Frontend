import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceptionistGPE, fetchPatient, resetReceptionistState } from '../../../../features/receptionist/receptionistThunks.js';
import { 
  ArrowLeft, 
  Activity,
  AlertCircle,
  Calendar,
  User,
  Eye,
  FileText,
  Stethoscope,
  Pill,
  UserCheck,
  Clock
} from 'lucide-react';

const ViewGPE = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { gpe, singlePatient, loading, error } = useSelector(state => state.receptionist);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchReceptionistGPE(patientId));
    }
  }, [dispatch, patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `gpe-${patientId}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle array response from backend - get the most recent record
  const getLatestRecord = () => {
    if (!gpe) return null;
    
    // If it's an array, get the most recent one
    if (Array.isArray(gpe)) {
      return gpe.length > 0 ? gpe[0] : null; // Already sorted by createdAt desc
    }
    
    // If it's a single object, return it
    return gpe;
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
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Record Found</h2>
              <p className="text-gray-600 mb-4">No GPE record found for this patient.</p>
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
      <div className="max-w-5xl mx-auto p-6">
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
              <h1 className="text-2xl font-bold text-gray-800">GPE Medical Record</h1>
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
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Record Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">GPE</h1>
            <p className="text-gray-600">General Physical Examination Record</p>
          </div>
          
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium">{latestRecord?.patientId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient ID</label>
                <p className="text-gray-900 font-medium">{latestRecord?.patientId?._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Assessment Date</label>
                <p className="text-gray-900 font-medium">
                  {latestRecord.createdAt ? new Date(latestRecord.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-8">
            {/* GPE Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                GPE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestRecord.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-gray-900 font-medium">{latestRecord.weight}</p>
                  </div>
                )}
                {latestRecord.pulse && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pulse</label>
                    <p className="text-gray-900 font-medium">{latestRecord.pulse}</p>
                  </div>
                )}
                {latestRecord.bp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bp</label>
                    <p className="text-gray-900 font-medium">{latestRecord.bp}</p>
                  </div>
                )}
                {latestRecord.rr && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">RR</label>
                    <p className="text-gray-900 font-medium">{latestRecord.rr}</p>
                  </div>
                )}
                {latestRecord.temp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Temp</label>
                    <p className="text-gray-900 font-medium">{latestRecord.temp}</p>
                  </div>
                )}
                {latestRecord.spo2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">SPO2%</label>
                    <p className="text-gray-900 font-medium">{latestRecord.spo2}</p>
                  </div>
                )}
                {latestRecord.entExamination && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">ENT Examination</label>
                    <p className="text-gray-900 font-medium">{latestRecord.entExamination}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Systematic Examination Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Systematic Examination
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestRecord.cns && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">CNS</label>
                    <p className="text-gray-900 font-medium">{latestRecord.cns}</p>
                  </div>
                )}
                {latestRecord.cvs && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">CVS</label>
                    <p className="text-gray-900 font-medium">{latestRecord.cvs}</p>
                  </div>
                )}
                {latestRecord.rs && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">RS</label>
                    <p className="text-gray-900 font-medium">{latestRecord.rs}</p>
                  </div>
                )}
                {latestRecord.pa && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">P/A</label>
                    <p className="text-gray-900 font-medium">{latestRecord.pa}</p>
                  </div>
                )}
                {latestRecord.drugAdverseNotion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Drug Adverse Notion</label>
                    <p className="text-gray-900 font-medium">{latestRecord.drugAdverseNotion}</p>
                  </div>
                )}
                {latestRecord.drugCompliance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Drug Compliance</label>
                    <p className="text-gray-900 font-medium">{latestRecord.drugCompliance}</p>
                  </div>
                )}
                {latestRecord.adviseFollowUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Advise to be followed up till next visit</label>
                    <p className="text-gray-900 font-medium">{latestRecord.adviseFollowUp}</p>
                  </div>
                )}
                {latestRecord.eyeMedication && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Eye Medication</label>
                    <p className="text-gray-900 font-medium">{latestRecord.eyeMedication}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Clinical Summary</h2>
              <div className="bg-white rounded-lg p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Stethoscope className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">Vital Signs</h3>
                    <p className="text-sm text-gray-500">
                      {[latestRecord.weight, latestRecord.pulse, latestRecord.bp, latestRecord.rr, latestRecord.temp, latestRecord.spo2].filter(Boolean).length} recorded
                    </p>
                  </div>
                  
                  <div>
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">System Exam</h3>
                    <p className="text-sm text-gray-500">
                      {[latestRecord.cns, latestRecord.cvs, latestRecord.rs, latestRecord.pa].filter(Boolean).length} systems assessed
                    </p>
                  </div>
                  
                  <div>
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Eye className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">ENT Exam</h3>
                    <p className="text-sm text-gray-500">
                      {latestRecord.entExamination ? 'Completed' : 'Not recorded'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Record Metadata */}
          <div className="border-t pt-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

export default ViewGPE; 