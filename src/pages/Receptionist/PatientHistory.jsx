import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchReceptionistSinglePatient } from "../../features/receptionist/receptionistThunks";
import ReceptionistLayout from './ReceptionistLayout';
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  FlaskConical, 
  Pill, 
  Clock,
  Building2,
  UserCheck
} from 'lucide-react';

export default function PatientHistory() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { singlePatient, patientLoading, patientError } = useSelector((state) => state.receptionist);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (id) {
      dispatch(fetchReceptionistSinglePatient(id));
    }
  }, [dispatch, id]);

  if (patientLoading) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading patient details...</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  if (patientError) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{patientError}</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  if (!singlePatient) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-700">Patient not found</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'history', label: 'History', icon: FileText },
    { id: 'tests', label: 'Tests', icon: FlaskConical },
    { id: 'medications', label: 'Medications', icon: Pill },
  ];

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-500" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Full Name</label>
            <p className="text-slate-900">{singlePatient.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
            <p className="text-slate-900">{singlePatient.age} years</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
            <p className="text-slate-900 capitalize">{singlePatient.gender}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Center Code</label>
            <p className="text-slate-900">{singlePatient.centerCode || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <p className="text-slate-900">{singlePatient.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <p className="text-slate-900">{singlePatient.contact || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
            <p className="text-slate-900">{singlePatient.address || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Doctor</label>
            <p className="text-slate-900">
              {singlePatient.assignedDoctor?.name ? `Dr. ${singlePatient.assignedDoctor.name}` : 'Not assigned'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Medical History
        </h3>
        {singlePatient.history ? (
          <div className="space-y-6">
            {singlePatient.history.medicalHistory && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Medical History</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {singlePatient.history.medicalHistory}
                </p>
              </div>
            )}
            {singlePatient.history.familyHistory && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Family History</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {singlePatient.history.familyHistory}
                </p>
              </div>
            )}
            {singlePatient.history.socialHistory && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Social History</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {singlePatient.history.socialHistory}
                </p>
              </div>
            )}
            {singlePatient.history.allergies && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Allergies</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {singlePatient.history.allergies}
                </p>
              </div>
            )}
            {singlePatient.history.currentMedications && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Current Medications</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {singlePatient.history.currentMedications}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No History Available</h3>
            <p className="text-slate-500">Medical history has not been recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
          Test Records
        </h3>
        {singlePatient.tests && singlePatient.tests.length > 0 ? (
          <div className="space-y-4">
            {singlePatient.tests.map((test, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-800">{test.testName}</h4>
                  <span className="text-sm text-slate-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(test.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{test.description}</p>
                {test.results && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-slate-700">Results: </span>
                    <span className="text-sm text-slate-600">{test.results}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FlaskConical className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Tests Available</h3>
            <p className="text-slate-500">No test records found for this patient.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Pill className="h-5 w-5 mr-2 text-blue-500" />
          Medication Records
        </h3>
        {singlePatient.medications && singlePatient.medications.length > 0 ? (
          <div className="space-y-4">
            {singlePatient.medications.map((medication, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-800">{medication.medicationName}</h4>
                  <span className="text-sm text-slate-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(medication.prescribedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Dosage: </span>
                    <span className="text-slate-600">{medication.dosage}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Frequency: </span>
                    <span className="text-slate-600">{medication.frequency}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Duration: </span>
                    <span className="text-slate-600">{medication.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Prescribed By: </span>
                    <span className="text-slate-600">{medication.prescribedBy}</span>
                  </div>
                </div>
                {medication.instructions && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-slate-700">Instructions: </span>
                    <span className="text-sm text-slate-600">{medication.instructions}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Pill className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Medications Available</h3>
            <p className="text-slate-500">No medication records found for this patient.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'history':
        return renderHistory();
      case 'tests':
        return renderTests();
      case 'medications':
        return renderMedications();
      default:
        return renderProfile();
    }
  };

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Patient History
            </h1>
            <p className="text-slate-600">
              View complete patient information and medical records
            </p>
          </div>

          {/* Patient Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-800">{singlePatient.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {singlePatient.age} years, {singlePatient.gender}
                    </span>
                    {singlePatient.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {singlePatient.email}
                      </span>
                    )}
                    {singlePatient.contact && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {singlePatient.contact}
                      </span>
                    )}
                    {singlePatient.centerCode && (
                      <span className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {singlePatient.centerCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="border-b border-slate-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );
} 