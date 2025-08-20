import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pill, 
  Calendar, 
  User,
  AlertCircle,
  RefreshCw,
  Clock,
  FileText
} from 'lucide-react';
import { fetchSuperAdminDoctorPatientMedications } from '../../../features/superadmin/superAdminDoctorSlice';

const PatientMedications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  const { 
    patientMedications,
    dataLoading,
    dataError
  } = useSelector((state) => state.superAdminDoctors);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchSuperAdminDoctorPatientMedications(patientId));
    }
  }, [dispatch, patientId]);

  const handleBack = () => {
    navigate('/dashboard/superadmin/doctor/patients');
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-md font-bold text-gray-900">Patient Medications</h1>
                <p className="text-gray-600 mt-1 text-xs">Complete medication history and prescriptions</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(fetchSuperAdminDoctorPatientMedications(patientId))}
              disabled={dataLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {dataError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center shadow-sm">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <span className="text-red-700 font-medium text-xs">{dataError}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Medication Records</h2>
                <p className="text-gray-600 mt-1 text-xs">All prescribed medications, dosages, and treatment plans</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  {patientMedications?.length || 0} Medications
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!patientMedications ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No Medications Available</h3>
                <p className="text-gray-500 max-w-md mx-auto text-xs">
                  No medication records found. Medications will appear here once prescribed.
                </p>
              </div>
            ) : patientMedications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No Medications Found</h3>
                <p className="text-gray-500 max-w-md mx-auto text-xs">
                  No medication records found for this patient.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Medications */}
                {patientMedications.filter(med => !med.adverseEvent).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-green-600" />
                      Active Medications
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {patientMedications
                        .filter(medication => !medication.adverseEvent)
                        .map((medication, index) => (
                          <div key={index} className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <Pill className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 text-xs">{medication.drugName}</h4>
                                  <p className="text-xs text-gray-500">Prescribed on {new Date(medication.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Active
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                              <div className="bg-white p-3 rounded-lg">
                                <span className="font-medium text-gray-600">Dose:</span>
                                <p className="text-gray-800 mt-1">{medication.dose}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <span className="font-medium text-gray-600">Duration:</span>
                                <p className="text-gray-800 mt-1">{medication.duration}</p>
                              </div>
                              {medication.frequency && (
                                <div className="bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Frequency:</span>
                                  <p className="text-gray-800 mt-1">{medication.frequency}</p>
                                </div>
                              )}
                              {medication.prescribedBy && (
                                <div className="bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Prescribed By:</span>
                                  <p className="text-gray-800 mt-1">{medication.prescribedBy}</p>
                                </div>
                              )}
                              {medication.prescribedDate && (
                                <div className="bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Prescribed Date:</span>
                                  <p className="text-gray-800 mt-1">{new Date(medication.prescribedDate).toLocaleDateString()}</p>
                                </div>
                              )}
                              {medication.instructions && (
                                <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Instructions:</span>
                                  <p className="text-gray-800 mt-1">{medication.instructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Discontinued Medications */}
                {patientMedications.filter(med => med.adverseEvent).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-red-600" />
                      Discontinued Medications
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {patientMedications
                        .filter(medication => medication.adverseEvent)
                        .map((medication, index) => (
                          <div key={index} className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                  <Pill className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800 text-xs">{medication.drugName}</h4>
                                  <p className="text-xs text-gray-500">Prescribed on {new Date(medication.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Discontinued
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                              <div className="bg-white p-3 rounded-lg">
                                <span className="font-medium text-gray-600">Dose:</span>
                                <p className="text-gray-800 mt-1">{medication.dose}</p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <span className="font-medium text-gray-600">Duration:</span>
                                <p className="text-gray-800 mt-1">{medication.duration}</p>
                              </div>
                              {medication.frequency && (
                                <div className="bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Frequency:</span>
                                  <p className="text-gray-800 mt-1">{medication.frequency}</p>
                                </div>
                              )}
                              {medication.prescribedBy && (
                                <div className="bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Prescribed By:</span>
                                  <p className="text-gray-800 mt-1">{medication.prescribedBy}</p>
                                </div>
                              )}
                              {medication.prescribedDate && (
                                <div className="bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Prescribed Date:</span>
                                  <p className="text-gray-800 mt-1">{new Date(medication.prescribedDate).toLocaleDateString()}</p>
                                </div>
                              )}
                              <div className="md:col-span-2 lg:col-span-3 bg-red-100 p-3 rounded-lg">
                                <span className="font-medium text-red-800">Adverse Event:</span>
                                <p className="text-red-700 mt-1">{medication.adverseEvent}</p>
                              </div>
                              {medication.instructions && (
                                <div className="md:col-span-2 lg:col-span-3 bg-white p-3 rounded-lg">
                                  <span className="font-medium text-gray-600">Original Instructions:</span>
                                  <p className="text-gray-800 mt-1">{medication.instructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Medication Summary */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Medication Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-600">{patientMedications.filter(med => !med.adverseEvent).length}</div>
                      <div className="text-xs text-gray-600">Active Medications</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-red-600">{patientMedications.filter(med => med.adverseEvent).length}</div>
                      <div className="text-xs text-gray-600">Discontinued</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600">{patientMedications.length}</div>
                      <div className="text-xs text-gray-600">Total Prescriptions</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMedications;
