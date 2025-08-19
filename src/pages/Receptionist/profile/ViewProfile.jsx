import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceptionistSinglePatient,
  fetchReceptionistPatientMedications,
  fetchReceptionistPatientHistory,
  fetchReceptionistPatientTests,
  fetchReceptionistFollowUps,
  fetchReceptionistAllergicRhinitis,
  fetchReceptionistAllergicConjunctivitis,
  fetchReceptionistAllergicBronchitis,
  fetchReceptionistAtopicDermatitis,
  fetchReceptionistGPE,
  fetchReceptionistPrescriptions
} from '../../../features/receptionist/receptionistThunks';
import ReceptionistLayout from '../ReceptionistLayout';
import {
  ArrowLeft, User, Phone, Calendar, MapPin, Activity, Pill, FileText, Eye, Edit, Plus, AlertCircle, Mail, UserCheck
} from 'lucide-react';

const TABS = ["Overview", "Follow Up", "Prescription"];

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Overview");
  const [dataFetched, setDataFetched] = useState(false);



  const {
    singlePatient: patient,
    medications,
    history,
    tests,
    followUps,
    allergicRhinitis,
    atopicDermatitis,
    allergicConjunctivitis,
    allergicBronchitis,
    gpe,
    prescriptions,
    loading,
    error,
    patientLoading,
    patientError,
    historyLoading,
    historyError
  } = useSelector(state => state.receptionist);

  useEffect(() => {
    // Check if ID is valid (not undefined, null, or empty string)
    if (!id || id === 'undefined' || id === 'null' || id === '') {
      return;
    }

    if (id && !dataFetched) {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch all patient data
      const fetchData = async () => {
        try {
          await Promise.all([
            dispatch(fetchReceptionistSinglePatient(id)),
            dispatch(fetchReceptionistPatientMedications(id)),
            dispatch(fetchReceptionistPatientHistory(id)),
            dispatch(fetchReceptionistPatientTests(id)),
            dispatch(fetchReceptionistFollowUps(id)),
            dispatch(fetchReceptionistAllergicRhinitis(id)),
            dispatch(fetchReceptionistAllergicConjunctivitis(id)),
            dispatch(fetchReceptionistAllergicBronchitis(id)),
            dispatch(fetchReceptionistAtopicDermatitis(id)),
            dispatch(fetchReceptionistGPE(id)),
            dispatch(fetchReceptionistPrescriptions(id))
          ]);

          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching patient data:', error);
        }
      };

      fetchData();
    } else if (dataFetched) {
      console.log('✅ Data already fetched, skipping');
    }
  }, [dispatch, id, dataFetched, navigate]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ViewProfile Debug Info:', {
      patientId: id,
      patient,
      loading,
      error,
      medications: medications?.length || 0,
      history: history ? (Array.isArray(history) ? history.length : 1) : 0,
      historyLoading,
      historyError,
      tests: tests?.length || 0,
      followUps: followUps?.length || 0,
      allergicRhinitis: allergicRhinitis?.length || 0,
      atopicDermatitis: atopicDermatitis?.length || 0,
      allergicConjunctivitis: allergicConjunctivitis?.length || 0,
      allergicBronchitis: allergicBronchitis?.length || 0,
      gpe: gpe?.length || 0,
      prescriptions: prescriptions?.length || 0,
      dataFetched
    });
  }, [patient, loading, error, medications, history, historyLoading, historyError, tests, followUps, allergicRhinitis, atopicDermatitis, allergicConjunctivitis, allergicBronchitis, gpe, prescriptions, dataFetched, id]);

  if (!id) return (
    <ReceptionistLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">No patient ID provided in the URL.</p>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );

  if (patientLoading) return (
    <ReceptionistLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading patient information...</p>
            </div>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );

  if (patientError) return (
    <ReceptionistLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{patientError}</p>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );

  if (!patient) return (
    <ReceptionistLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600">Patient not found.</p>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );

  // Ensure patient is an object with expected properties
  if (typeof patient !== 'object' || patient === null) {
    return (
      <ReceptionistLayout>
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Invalid patient data format.</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/receptionist/patients')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients List
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
            <button
              onClick={() => navigate(`/dashboard/receptionist/edit-patient/${patient?._id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 mb-8">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex-1 ${activeTab === tab
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
                      <label className="block text-sm font-medium text-slate-500 mb-1">Mobile</label>
                      <p className="text-slate-800 break-words">
                        {typeof patient.phone === 'string' ? patient.phone :
                          typeof patient.contact === 'string' ? patient.contact : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                      <p className="text-slate-800 break-words">{typeof patient.email === 'string' ? patient.email : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Location</label>
                      <p className="text-slate-800 break-words">{typeof patient.address === 'string' ? patient.address : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Assigned Doctor</label>
                      <p className="text-slate-800 break-words">
                        {patient.assignedDoctor?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Gender</label>
                      <p className="text-slate-800 capitalize break-words">{patient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Age</label>
                      <p className="text-slate-800 break-words">{patient.age ? `${patient.age} years` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Center</label>
                      <p className="text-slate-800 break-words">
                        {patient.centerId?.name ||
                          (typeof patient.centerCode === 'string' ? patient.centerCode : 'N/A')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investigations */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-blue-100">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Investigations
                </h2>
                <p className="text-slate-600 mt-1">
                  Laboratory test results and medical investigations
                </p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading investigations...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">CBC</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Hb</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">TC</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">DC</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">N</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">E</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">L</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">M</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Platelets</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">ESR</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Serum Creatinine</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Serum IgE</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">C3, C4</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">ANA</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Urine</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Allergy Panel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tests && Array.isArray(tests) && tests.length > 0 ? (
                          tests.map((test, idx) => (
                            <tr key={test._id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {test.date ? new Date(test.date).toLocaleDateString() : ''}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.CBC || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.Hb || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.TC || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.DC || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.Neutrophils || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.Eosinophil || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.Lymphocytes || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.Monocytes || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.Platelets || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.ESR || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.SerumCreatinine || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.SerumIgELevels || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.C3C4Levels || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.ANA_IF || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.UrineRoutine || ''}</td>
                              <td className="px-4 py-3 text-sm text-slate-800">{test.AllergyPanel || ''}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={17} className="px-4 py-8 text-center text-slate-500">
                              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                              <p>No investigations found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-blue-100">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-blue-500" />
                  Medications
                </h2>
                <p className="text-slate-600 mt-1">
                  Current and past medications prescribed
                </p>
              </div>
              <div className="p-6">
                {/* Assuming medLoading is not directly available from useSelector,
                      but it's not used in the new code, so we'll keep it as is. */}
                {/* {medLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading medications...</p>
                    </div>
                  ) : medError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600">{medError}</p>
                    </div>
                  ) : */}
                {medications.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Adverse Effect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {medications.map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-slate-800">{med.drugName}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{med.dose}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{med.duration}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{med.frequency || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{med.prescribedBy || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{med.adverseEvent || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-blue-100">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Medical History
                </h2>
                <p className="text-slate-600 mt-1">
                  Complete patient medical history and examination records
                </p>
              </div>
              <div className="p-6">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading history...</p>
                  </div>
                ) : historyError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{historyError}</p>
                  </div>
                ) : !history || (Array.isArray(history) && history.length === 0) || (typeof history === 'object' && Object.keys(history).length === 0) ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No history found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Medical Conditions
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Triggers
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {(Array.isArray(history) ? history : [history]).map((h, idx) => (
                          <tr key={h._id || idx} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-slate-900">
                                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-900">
                                <div className="flex flex-wrap gap-1">
                                  {h.hayFever && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Hay Fever</span>}
                                  {h.asthma && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Asthma</span>}
                                  {h.breathingProblems && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Breathing Problems</span>}
                                  {h.foodAllergies && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Food Allergies</span>}
                                  {h.drugAllergy && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Drug Allergy</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-900">
                                <div className="flex flex-wrap gap-1">
                                  {h.triggersUrtis && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">URTIs</span>}
                                  {h.triggersColdWeather && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Cold Weather</span>}
                                  {h.triggersPollen && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Pollen</span>}
                                  {h.triggersSmoke && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Smoke</span>}
                                  {h.triggersExercise && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Exercise</span>}
                                  {h.triggersPets && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Pets</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-medium">
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/AddHistory/ViewHistory/${h._id}`)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Follow Up" && (
          <div className="space-y-8">
            {/* Allergic Rhinitis */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Allergic Rhinitis</h2>
                <button
                  onClick={() => navigate(`/dashboard/receptionist/followup/allergic-rhinitis/add/${patient._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Follow Up
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allergicRhinitis && allergicRhinitis.length > 0 ? (
                        allergicRhinitis.map((rhinitis, idx) => (
                          <tr key={rhinitis._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.centerCode || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.phone || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              {rhinitis.updatedAt ? new Date(rhinitis.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/followup/allergic-rhinitis/view/${rhinitis._id}`)}
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
                            <p>No allergic rhinitis records found</p>
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
              <div className="p-6 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Atopic Dermatitis</h2>
                <button
                  onClick={() => navigate(`/dashboard/receptionist/followup/atopic-dermatitis/add/${patient._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Follow Up
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Symptoms</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {atopicDermatitis && atopicDermatitis.length > 0 ? (
                        atopicDermatitis.map((dermatitis, idx) => (
                          <tr key={dermatitis._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">
                              {dermatitis.createdAt ? new Date(dermatitis.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800">{dermatitis.symptoms || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.centerCode || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.centerName || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient._id}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{dermatitis.updatedBy || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/followup/atopic-dermatitis/view/${dermatitis._id}`)}
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
                            <p>No atopic dermatitis records found</p>
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
              <div className="p-6 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Allergic Conjunctivitis</h2>
                <button
                  onClick={() => navigate(`/dashboard/receptionist/followup/allergic-conjunctivitis/add/${patient._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Follow Up
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allergicConjunctivitis && allergicConjunctivitis.length > 0 ? (
                        allergicConjunctivitis.map((conjunctivitis, idx) => (
                          <tr key={conjunctivitis._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.centerCode || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.phone || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              {conjunctivitis.updatedAt ? new Date(conjunctivitis.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/followup/allergic-conjunctivitis/view/${conjunctivitis._id}`)}
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
                            <p>No allergic conjunctivitis records found</p>
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
              <div className="p-6 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Allergic Bronchitis</h2>
                <button
                  onClick={() => navigate(`/dashboard/receptionist/followup/allergic-bronchitis/add/${patient._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Follow Up
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allergicBronchitis && allergicBronchitis.length > 0 ? (
                        allergicBronchitis.map((bronchitis, idx) => (
                          <tr key={bronchitis._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.centerCode || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.phone || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              {bronchitis.updatedAt ? new Date(bronchitis.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/followup/allergic-bronchitis/view/${bronchitis._id}`)}
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
                            <p>No allergic bronchitis records found</p>
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
              <div className="p-6 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">GPE</h2>
                <button
                  onClick={() => navigate(`/dashboard/receptionist/followup/gpe/add/${patient._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Follow Up
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {gpe && gpe.length > 0 ? (
                        gpe.map((gpe, idx) => (
                          <tr key={gpe._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.age}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.centerCode || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{patient.phone || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              {gpe.updatedAt ? new Date(gpe.updatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/followup/gpe/view/${gpe._id}`)}
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
                            <p>No GPE records found</p>
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
            <div className="p-6 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Prescription</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('🔄 Manually refreshing prescriptions...');
                    dispatch(fetchReceptionistPrescriptions(patient._id));
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-xs"
                >
                  Refresh
                </button>
                <button
                  onClick={() => navigate(`/dashboard/receptionist/followup/prescription/add/${patient._id}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Prescription
                </button>
              </div>
            </div>
            <div className="p-6">

              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Visit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medications</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {prescriptions && prescriptions.length > 0 ? (
                      prescriptions.map((prescription, idx) => (
                        <tr key={prescription._id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-800">
                            {prescription.date ? new Date(prescription.date).toLocaleDateString() : 
                             prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800">{prescription.visit || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs text-slate-800">
                            {prescription.medications && prescription.medications.length > 0 ? (
                              <div className="space-y-1">
                                {prescription.medications.map((med, medIdx) => (
                                  <div key={medIdx} className="text-xs">
                                    <span className="font-medium">{med.medicationName}</span>
                                    <span className="text-slate-600"> - {med.dosage}mg, {med.duration} days</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              'No medications'
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800">
                            {typeof prescription.updatedBy === 'string' ? prescription.updatedBy :
                              typeof prescription.updatedBy === 'object' && prescription.updatedBy?.name ? prescription.updatedBy.name : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-800">
                            <button
                              onClick={() => navigate(`/dashboard/receptionist/followup/prescription/view/${prescription._id}`)}
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
                          <p>No prescriptions found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default ViewProfile; 