import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceptionistPrescriptions, fetchPatient, resetReceptionistState } from '../../../../features/receptionist/receptionistThunks';
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

const ViewPrescription = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { prescriptions, singlePatient, loading, error } = useSelector(state => state.receptionist);

  // Debug logging
  console.log('🔍 ViewPrescription - patientId:', patientId);
  console.log('🔍 ViewPrescription - Redux state:', { prescriptions, singlePatient, loading, error });
  console.log('🔍 ViewPrescription - prescriptions type:', typeof prescriptions);
  console.log('🔍 ViewPrescription - prescriptions value:', prescriptions);

  useEffect(() => {
    if (patientId) {
      console.log('🔍 ViewPrescription: Fetching prescriptions for patientId:', patientId);
      dispatch(fetchReceptionistPrescriptions(patientId));
      dispatch(fetchPatient(patientId));
    }

    // Cleanup function to reset state when component unmounts
    return () => {
      console.log('🧹 ViewPrescription: Cleaning up state');
      dispatch(resetReceptionistState());
    };
  }, [dispatch, patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `prescription-${patientId}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle array response from backend - get the most recent record
  const getLatestRecord = () => {
    if (!prescriptions) return null;
    
    // If it's an array, get the most recent one
    if (Array.isArray(prescriptions)) {
      return prescriptions.length > 0 ? prescriptions[0] : null; // Already sorted by createdAt desc
    }
    
    // If it's a single object, return it
    return prescriptions;
  };

  const latestRecord = getLatestRecord();

  // Additional debugging
  console.log('🔍 ViewPrescription - latestRecord:', latestRecord);
  console.log('🔍 ViewPrescription - latestRecord type:', typeof latestRecord);

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
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Prescription</h2>
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

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Prescriptions Found</h2>
              <p className="text-gray-600 mb-4">This patient doesn't have any prescriptions yet.</p>
              <button
                onClick={() => navigate(`/dashboard/receptionist/followup/prescription/add/${patientId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                Add Prescription
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
              <h1 className="text-2xl font-bold text-gray-800">Prescription Medical Record</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Pill size={16} />
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MEDICAL PRESCRIPTION</h1>
            <p className="text-gray-600">Prescription ID: {latestRecord._id}</p>
          </div>
          
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User size={20} className="mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium">{singlePatient?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient ID</label>
                <p className="text-gray-900 font-medium">{singlePatient?._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Prescription Date</label>
                <p className="text-gray-900 font-medium">
                  {latestRecord.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-8">
            {/* Diagnosis */}
            {latestRecord.diagnosis && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye size={20} className="mr-2 text-blue-600" />
                  Clinical Diagnosis
                </h2>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800">{latestRecord.diagnosis}</p>
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                Prescribed Medications
              </h2>
              {latestRecord.medications && latestRecord.medications.length > 0 ? (
                <div className="space-y-4">
                  {latestRecord.medications.map((med, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-l-4 border-blue-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{med.medicationName}</h3>
                          <p className="text-gray-600">{med.dosage}</p>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Duration:</span>
                              <span className="text-gray-800 ml-2">{med.duration}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Frequency:</span>
                              <span className="text-gray-800 ml-2">{med.frequency || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {med.instructions && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-500">Instructions:</span>
                          <p className="text-gray-800 mt-1">{med.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-l-4 border-gray-300">
                  <p className="text-gray-500 italic">No medications prescribed</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            {latestRecord.instructions && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Instructions</h2>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800">{latestRecord.instructions}</p>
                </div>
              </div>
            )}

            {/* Follow-up */}
            {latestRecord.followUp && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Follow-up Instructions</h2>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800">{latestRecord.followUp}</p>
                </div>
              </div>
            )}

            {/* Clinical Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Prescription Summary</h2>
              <div className="bg-white rounded-lg p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">Medications</h3>
                    <p className="text-sm text-gray-500">
                      {latestRecord.medications ? latestRecord.medications.length : 0} prescribed
                    </p>
                  </div>
                  
                  <div>
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">Prescribed By</h3>
                    <p className="text-sm text-gray-500">{latestRecord.doctorId?.name || latestRecord.prescribedBy?.name || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">Prescription Date</h3>
                    <p className="text-sm text-gray-500">
                      {latestRecord.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}
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
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Record Created:</span>
                <span className="text-gray-900">
                  {latestRecord.createdAt ? new Date(latestRecord.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-900">
                  {latestRecord.updatedAt ? new Date(latestRecord.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Signature */}
          <div className="border-t pt-6 mt-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Generated on: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">{latestRecord.doctorId?.name || latestRecord.prescribedBy?.name || 'Doctor'}</p>
                <p className="text-sm text-gray-600">Medical Professional</p>
                <p className="text-sm text-gray-600">{latestRecord.centerId?.name || 'Medical Center'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescription; 