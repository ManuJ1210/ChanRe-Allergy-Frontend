import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchPatientDetails, addTestRequest, fetchPatientTestRequests, downloadTestReport } from '../../features/doctor/doctorThunks';
import { resetPatientDetails } from '../../features/doctor/doctorSlice';
import { downloadPDFReport, viewPDFReport } from '../../utils/pdfHandler';
import { 
  User, 
  FileText, 
  Pill, 
  Clock, 
  Plus, 
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw
} from 'lucide-react';

const PatientDetails = () => {
  const { patientId: rawPatientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Bulletproof patientId conversion - ensure it's always a string
  const patientId = typeof rawPatientId === 'object' && rawPatientId !== null
    ? rawPatientId._id || rawPatientId.id || String(rawPatientId)
    : String(rawPatientId);

  const { 
    patientDetails, 
    patientDetailsLoading, 
    patientDetailsError, 
    patientTestRequests,
    loading 
  } = useSelector((state) => state.doctor);

  // Destructure the data from patientDetails
  const { patient, history, medications, tests } = patientDetails || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [showTestForm, setShowTestForm] = useState(false);
  const [testForm, setTestForm] = useState({
    testType: '',
    notes: '',
    priority: 'normal'
  });

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientDetails(patientId));
      dispatch(fetchPatientTestRequests(patientId));
    }
    return () => {
      dispatch(resetPatientDetails());
    };
  }, [dispatch, patientId]);

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addTestRequest({ patientId, testData: testForm })).unwrap();
      setTestForm({ testType: '', notes: '', priority: 'normal' });
      setShowTestForm(false);
      
      // Refresh patient test requests data
      dispatch(fetchPatientTestRequests(patientId));
    } catch (error) {
      console.error('Error creating test request:', error);
      toast.error('Failed to create test request. Please try again.');
    }
  };

  const handleChange = (e) => {
    setTestForm({ ...testForm, [e.target.name]: e.target.value });
  };

  const handleDownloadReport = async (testRequestId) => {
    try {
      await downloadPDFReport(testRequestId);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };

  const handleViewReport = async (testRequestId) => {
    try {
      await viewPDFReport(testRequestId);
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error('Failed to view report. Please try again.');
    }
  };

  if (patientDetailsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-2 sm:p-3 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (patientDetailsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-2 sm:p-3 md:p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{patientDetailsError}</p>
          <button
            onClick={() => navigate('/dashboard/doctor/dashboard')}
            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!patientDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/dashboard/doctor/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-2 sm:mr-4">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800">{patient.name}</h1>
                  <p className="text-slate-600 text-sm sm:text-base">
                    {patient.age} years old • {patient.gender} • {patient.centerId?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    dispatch(fetchPatientDetails(patientId));
                    dispatch(fetchPatientTestRequests(patientId));
                  }}
                  disabled={patientDetailsLoading}
                  className="bg-slate-500 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-slate-600 flex items-center disabled:opacity-50 text-xs sm:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${patientDetailsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <button
                  onClick={() => navigate('/dashboard/doctor/new-test-request')}
                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Request
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center text-slate-600 text-sm sm:text-base">
                <Phone className="h-4 w-4 mr-2" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center text-slate-600 text-sm sm:text-base">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center text-slate-600 text-sm sm:text-base sm:col-span-2 lg:col-span-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{patient.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-4 sm:mb-6">
          <div className="border-b border-blue-100">
            <nav className="flex flex-col sm:flex-row space-y-0 space-x-0 sm:space-x-8 px-4 sm:px-6">
              {['overview', 'history', 'medications',  'test-requests'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab === 'test-requests' ? 'Test Requests' : tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Total Tests</h3>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">{tests.length}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-2">
                    <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Medications</h3>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">{medications.length}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Pending Tests</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {tests.filter(test => test.status === 'pending').length}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-2" />
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">History</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {history ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Patient History</h3>
                {history ? (
                  <div className="space-y-4 sm:space-y-6">
                                         {/* Medical Conditions */}
                     <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                       <h4 className="font-semibold text-slate-800 mb-4 text-base sm:text-lg">Medical Conditions</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                         {history.hayFever && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Hay Fever:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.hayFever === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.hayFever === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.hayFever}
                             </span>
                           </div>
                         )}
                         {history.asthma && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Asthma:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.asthma === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.asthma === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.asthma}
                             </span>
                           </div>
                         )}
                         {history.breathingProblems && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Breathing Problems:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.breathingProblems === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.breathingProblems === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.breathingProblems}
                             </span>
                           </div>
                         )}
                         {history.hivesSwelling && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Hives/Swelling:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.hivesSwelling === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.hivesSwelling === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.hivesSwelling}
                             </span>
                           </div>
                         )}
                         {history.sinusTrouble && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Sinus Trouble:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.sinusTrouble === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.sinusTrouble === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.sinusTrouble}
                             </span>
                           </div>
                         )}
                         {history.eczemaRashes && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Eczema/Rashes:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.eczemaRashes === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.eczemaRashes === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.eczemaRashes}
                             </span>
                           </div>
                         )}
                         {history.foodAllergies && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Food Allergies:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.foodAllergies === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.foodAllergies === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.foodAllergies}
                             </span>
                           </div>
                         )}
                         {history.arthriticDiseases && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Arthritic Diseases:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.arthriticDiseases === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.arthriticDiseases === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.arthriticDiseases}
                             </span>
                           </div>
                         )}
                         {history.immuneDefect && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Immune Defect:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.immuneDefect === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.immuneDefect === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.immuneDefect}
                             </span>
                           </div>
                         )}
                         {history.drugAllergy && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Drug Allergy:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.drugAllergy === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.drugAllergy === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.drugAllergy}
                             </span>
                           </div>
                         )}
                         {history.beeStingHypersensitivity && (
                           <div className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg">
                             <span className="text-slate-700 font-medium text-xs sm:text-sm">Bee Sting Hypersensitivity:</span>
                             <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                               history.beeStingHypersensitivity === 'yes' ? 'bg-green-100 text-green-700' : 
                               history.beeStingHypersensitivity === 'no' ? 'bg-red-100 text-red-700' : 
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {history.beeStingHypersensitivity}
                             </span>
                           </div>
                         )}
                       </div>
                     </div>

                    {/* Asthma Details */}
                    {(history.asthmaType || history.exacerbationsFrequency || history.coughWheezeFrequency) && (
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-800 mb-4 text-lg">Asthma Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {history.asthmaType && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Asthma Type:</span>
                              <span className="text-slate-600">{history.asthmaType}</span>
                            </div>
                          )}
                          {history.exacerbationsFrequency && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Exacerbations Frequency:</span>
                              <span className="text-slate-600">{history.exacerbationsFrequency}</span>
                            </div>
                          )}
                          {history.coughWheezeFrequency && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Cough/Wheeze Frequency:</span>
                              <span className="text-slate-600">{history.coughWheezeFrequency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Allergic Rhinitis */}
                    {(history.allergicRhinitisType || history.rhinitisSneezing || history.rhinitisNasalCongestion) && (
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-800 mb-4 text-lg">Allergic Rhinitis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {history.allergicRhinitisType && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Type:</span>
                              <span className="text-slate-600">{history.allergicRhinitisType}</span>
                            </div>
                          )}
                          {history.rhinitisSneezing && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Sneezing:</span>
                              <span className="text-slate-600">{history.rhinitisSneezing}</span>
                            </div>
                          )}
                          {history.rhinitisNasalCongestion && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Nasal Congestion:</span>
                              <span className="text-slate-600">{history.rhinitisNasalCongestion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skin Allergy */}
                    {(history.skinAllergyType || history.skinHeavesPresent || history.skinEczemaPresent) && (
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-800 mb-4 text-lg">Skin Allergy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {history.skinAllergyType && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Type:</span>
                              <span className="text-slate-600">{history.skinAllergyType}</span>
                            </div>
                          )}
                          {history.skinHeavesPresent && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Heaves Present:</span>
                              <span className="text-slate-600">{history.skinHeavesPresent}</span>
                            </div>
                          )}
                          {history.skinEczemaPresent && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Eczema Present:</span>
                              <span className="text-slate-600">{history.skinEczemaPresent}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medical History */}
                    {(history.hypertension || history.diabetes || history.epilepsy || history.ihd) && (
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-800 mb-4 text-lg">Medical History</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {history.hypertension && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Hypertension:</span>
                              <span className="text-slate-600">{history.hypertension}</span>
                            </div>
                          )}
                          {history.diabetes && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Diabetes:</span>
                              <span className="text-slate-600">{history.diabetes}</span>
                            </div>
                          )}
                          {history.epilepsy && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Epilepsy:</span>
                              <span className="text-slate-600">{history.epilepsy}</span>
                            </div>
                          )}
                          {history.ihd && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">IHD:</span>
                              <span className="text-slate-600">{history.ihd}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Examination */}
                    {(history.oralCavity || history.skin || history.ent || history.eye || history.respiratorySystem) && (
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-800 mb-4 text-lg">Examination</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {history.oralCavity && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Oral Cavity:</span>
                              <span className="text-slate-600">{history.oralCavity}</span>
                            </div>
                          )}
                          {history.skin && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Skin:</span>
                              <span className="text-slate-600">{history.skin}</span>
                            </div>
                          )}
                          {history.ent && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">ENT:</span>
                              <span className="text-slate-600">{history.ent}</span>
                            </div>
                          )}
                          {history.eye && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Eye:</span>
                              <span className="text-slate-600">{history.eye}</span>
                            </div>
                          )}
                          {history.respiratorySystem && (
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-slate-700 font-medium">Respiratory System:</span>
                              <span className="text-slate-600">{history.respiratorySystem}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                                         {/* Triggers */}
                     {(history.triggersUrtis !== undefined || history.triggersColdWeather !== undefined || history.triggersPollen !== undefined || history.triggersSmoke !== undefined || history.triggersExercise !== undefined || history.triggersPets !== undefined || history.triggersOthers) && (
                       <div className="bg-slate-50 rounded-lg p-6">
                         <h4 className="font-semibold text-slate-800 mb-4 text-lg">Triggers</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {history.triggersUrtis !== undefined && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">URTIs:</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                 history.triggersUrtis ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {history.triggersUrtis ? 'Yes' : 'No'}
                               </span>
                             </div>
                           )}
                           {history.triggersColdWeather !== undefined && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Cold Weather:</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                 history.triggersColdWeather ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {history.triggersColdWeather ? 'Yes' : 'No'}
                               </span>
                             </div>
                           )}
                           {history.triggersPollen !== undefined && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Pollen:</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                 history.triggersPollen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {history.triggersPollen ? 'Yes' : 'No'}
                               </span>
                             </div>
                           )}
                           {history.triggersSmoke !== undefined && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Smoke:</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                 history.triggersSmoke ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {history.triggersSmoke ? 'Yes' : 'No'}
                               </span>
                             </div>
                           )}
                           {history.triggersExercise !== undefined && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Exercise:</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                 history.triggersExercise ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {history.triggersExercise ? 'Yes' : 'No'}
                               </span>
                             </div>
                           )}
                           {history.triggersPets !== undefined && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Pets:</span>
                               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                 history.triggersPets ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {history.triggersPets ? 'Yes' : 'No'}
                               </span>
                             </div>
                           )}
                           {history.triggersOthers && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Other Triggers:</span>
                               <span className="text-slate-600">{history.triggersOthers}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     )}

                     {/* Other Information */}
                     {(history.occupation || history.location || history.familyHistory || history.otherFindings || history.probableChemicalExposure) && (
                       <div className="bg-slate-50 rounded-lg p-6">
                         <h4 className="font-semibold text-slate-800 mb-4 text-lg">Other Information</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {history.occupation && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Occupation:</span>
                               <span className="text-slate-600">{history.occupation}</span>
                             </div>
                           )}
                           {history.location && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Location:</span>
                               <span className="text-slate-600">{history.location}</span>
                             </div>
                           )}
                           {history.probableChemicalExposure && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Chemical Exposure:</span>
                               <span className="text-slate-600">{history.probableChemicalExposure}</span>
                             </div>
                           )}
                           {history.familyHistory && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Family History:</span>
                               <span className="text-slate-600">{history.familyHistory}</span>
                             </div>
                           )}
                           {history.otherFindings && (
                             <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                               <span className="text-slate-700 font-medium">Other Findings:</span>
                               <span className="text-slate-600">{history.otherFindings}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     )}

                    {/* Report File */}
                    {history.reportFile && (
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h4 className="font-semibold text-slate-800 mb-4 text-lg">Report File</h4>
                        <div className="p-3 bg-white rounded-lg">
                          <div className="font-medium text-slate-700 mb-1">Report File</div>
                          <div className="text-slate-600">{history.reportFile}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No history available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medications' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Medications</h3>
                {medications.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {medications.map((med, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-800 text-sm sm:text-base">{med.drugName}</h4>
                          <span className="text-xs sm:text-sm text-slate-500">
                            {new Date(med.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-1 text-xs sm:text-sm">Dose: {med.dose}</p>
                        <p className="text-slate-600 mb-1 text-xs sm:text-sm">Duration: {med.duration}</p>
                        {med.adverseEvent && (
                          <p className="text-slate-600 text-xs sm:text-sm">Adverse Event: {med.adverseEvent}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm sm:text-base">No medications found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tests' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Test Results</h3>
                {tests.length > 0 ? (
                  <div className="space-y-4">
                    {tests.map((test, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-slate-800">
                            {test.testType || 'General Test'}
                          </h4>
                          <span className="text-sm text-slate-500">
                            {new Date(test.date).toLocaleDateString()}
                          </span>
                        </div>
                        {test.notes && (
                          <p className="text-slate-600 mb-2">Notes: {test.notes}</p>
                        )}
                        {test.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            test.status === 'completed' ? 'bg-green-100 text-green-600' :
                            test.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {test.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No tests found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'test-requests' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800">Test Requests</h3>
                  <button
                    onClick={() => navigate('/dashboard/doctor/new-test-request')}
                    className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Test Request
                  </button>
                </div>
                
                {patientTestRequests.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {patientTestRequests.map((testRequest) => (
                      <div key={testRequest._id} className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 mb-1 text-sm sm:text-base">
                              {testRequest.testType}
                            </h4>
                            {testRequest.testDescription && (
                              <p className="text-xs sm:text-sm text-slate-600 mb-2">
                                {testRequest.testDescription}
                              </p>
                            )}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                              <span className="text-slate-500">
                                Created: {new Date(testRequest.createdAt).toLocaleDateString()}
                              </span>
                              {testRequest.completedDate && (
                                <span className="text-slate-500">
                                  Completed: {new Date(testRequest.completedDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            {/* ✅ NEW: Workflow Stage Display */}
                            {testRequest.workflowStage && (
                              <div className="mt-2">
                                <span className="text-xs text-slate-500">Workflow: </span>
                                <span className="text-xs font-medium text-blue-600 capitalize">
                                  {testRequest.workflowStage.replace(/_/g, ' ')}
                                </span>
                              </div>
                            )}
                            
                            {/* ✅ NEW: Superadmin Review Status */}
                            {testRequest.superadminReview && (
                              <div className="mt-2">
                                <span className="text-xs text-slate-500">Superadmin Review: </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  testRequest.superadminReview.status === 'approved' ? 'text-green-600 bg-green-100' :
                                  testRequest.superadminReview.status === 'rejected' ? 'text-red-600 bg-red-100' :
                                  testRequest.superadminReview.status === 'requires_changes' ? 'text-orange-600 bg-orange-100' :
                                  'text-yellow-600 bg-yellow-100'
                                }`}>
                                  {testRequest.superadminReview.status?.replace(/_/g, ' ') || 'Pending'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              testRequest.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              testRequest.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              testRequest.status === 'Assigned' ? 'bg-orange-100 text-orange-700' :
                              testRequest.status === 'Sample Collected' ? 'bg-purple-100 text-purple-700' :
                              testRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              testRequest.status === 'Superadmin_Review' ? 'bg-purple-100 text-purple-700' :
                              testRequest.status === 'Superadmin_Approved' ? 'bg-green-100 text-green-700' :
                              testRequest.status === 'Superadmin_Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {testRequest.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              testRequest.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                              testRequest.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {testRequest.urgency}
                            </span>
                          </div>
                        </div>
                        
                        {testRequest.assignedLabStaffName && (
                          <div className="text-xs sm:text-sm text-slate-600 mb-2">
                            Assigned to: {testRequest.assignedLabStaffName}
                          </div>
                        )}
                        
                        {testRequest.notes && (
                          <div className="text-xs sm:text-sm text-slate-600 mb-2">
                            Notes: {testRequest.notes}
                          </div>
                        )}
                        
                        {(['Completed', 'Report_Generated', 'Report_Sent', 'feedback_sent'].includes(testRequest.status)) && testRequest.testResults && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                            <h5 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">Test Results</h5>
                            <p className="text-xs sm:text-sm text-slate-600">{testRequest.testResults}</p>
                            {testRequest.testReport && (
                              <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                  onClick={() => handleViewReport(testRequest._id)}
                                  className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium"
                                >
                                  View Report
                                </button>
                                <button
                                  onClick={() => handleDownloadReport(testRequest._id)}
                                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                                >
                                  Download Report
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm sm:text-base">No test requests found</p>
                    <button
                      onClick={() => navigate('/dashboard/doctor/new-test-request')}
                      className="mt-4 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base w-full sm:w-auto"
                    >
                      Create First Test Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test Request Modal */}
        {showTestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Add Test Request</h3>
              <form onSubmit={handleTestSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    Test Type
                  </label>
                  <input
                    type="text"
                    name="testType"
                    value={testForm.testType}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., CBC, Allergy Panel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={testForm.notes}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Additional notes..."
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={testForm.priority}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTestForm(false)}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 px-3 sm:px-4 rounded-lg hover:bg-slate-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Adding...' : 'Add Test Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails; 