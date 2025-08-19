import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchSuperAdminDoctorPatientById,
  fetchSuperAdminDoctorPatientHistory
} from '../../../features/superadmin/superAdminDoctorSlice';
import { 
  ArrowLeft, User, FileText, Eye, Download, Image, Video, Music, File, AlertCircle, Calendar
} from 'lucide-react';

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    singlePatient: patient,
    patientHistory: history,
    dataLoading, 
    dataError
  } = useSelector(state => state.superAdminDoctors);

  useEffect(() => {
    if (patientId && patientId !== 'undefined' && patientId !== 'null' && patientId !== '') {
      // Fetch patient and history data
      const fetchData = async () => {
        try {
          await Promise.all([
            dispatch(fetchSuperAdminDoctorPatientById(patientId)),
            dispatch(fetchSuperAdminDoctorPatientHistory(patientId))
          ]);
        } catch (error) {
          console.error('Error fetching patient data:', error);
        }
      };

      fetchData();
    }
  }, [dispatch, patientId]);

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <File className="h-4 w-4" />;
    if (fileType?.includes('image')) return <Image className="h-4 w-4" />;
    if (fileType?.includes('video')) return <Video className="h-4 w-4" />;
    if (fileType?.includes('audio')) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleViewFile = (fileUrl, fileName) => {
    if (fileUrl) {
      window.open(`/api/files/${fileUrl}`, '_blank');
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = `/api/files/${fileUrl}`;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!patientId) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">No patient ID provided in the URL.</p>
        </div>
      </div>
    </div>
  );

  if (dataLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading patient history...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-sm font-semibold text-red-800">Error Loading Patient History</h3>
            </div>
            <p className="text-red-700 mb-4">{dataError}</p>
            <button
              onClick={() => navigate('/dashboard/superadmin/followups/viewfollowuppatients')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-sm font-semibold text-yellow-800">Patient Not Found</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              The patient with ID "{patientId}" was not found. Please check the URL and try again.
            </p>
            <button
              onClick={() => navigate('/dashboard/superadmin/followups/viewfollowuppatients')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/dashboard/superadmin/followups/PatientProfile/${patientId}`)}
              className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient Profile
            </button>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Read Only
              </span>
            </div>
          </div>
        </div>

        {/* Patient Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">{patient?.name || 'Patient Name'}</h1>
              <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                {patient?.gender && (
                  <span className="flex items-center gap-1">
                    <span>Gender: {patient.gender}</span>
                  </span>
                )}
                {patient?.age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{patient.age} years</span>
                  </span>
                )}
                {patient?.phone && (
                  <span className="flex items-center gap-1">
                    <span>Phone: {patient.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Medical History Content */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Complete Medical History
            </h2>
            <p className="text-slate-600 mt-1">
              All patient medical history and examination records
            </p>
          </div>
          <div className="p-6">
            {!history || !history.historyData || history.historyData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No medical history found</p>
                <p className="text-slate-400 text-sm mt-2">This patient has no medical history records yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.historyData.map((record, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 text-lg">{record.type}</h6>
                        <p className="text-sm text-gray-500">
                          Recorded on {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Medical Record
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h6 className="font-medium text-gray-700 mb-2">Description:</h6>
                      <p className="text-gray-800 text-sm leading-relaxed">{record.description}</p>
                    </div>
                    
                    {/* File attachments if any */}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h6 className="font-medium text-gray-700 mb-3">Attachments:</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {record.attachments.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-700 font-medium truncate block">{file.name}</span>
                                <span className="text-xs text-gray-500 block">{file.type}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewFile(file.url, file.name)}
                                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                  title="View file"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file.url, file.name)}
                                  className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                  title="Download file"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;



