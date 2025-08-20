import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchSuperAdminDoctorPatientById,
  fetchSuperAdminDoctorPatientLabReports
} from '../../../features/superadmin/superAdminDoctorSlice';
import { 
  ArrowLeft, User, Activity, Eye, Download, File, AlertCircle, Calendar, Clock, UserCheck, Image, Video, Music
} from 'lucide-react';

const PatientLabReports = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    singlePatient: patient,
    patientLabReports: labReports,
    dataLoading, 
    dataError
  } = useSelector(state => state.superAdminDoctors);

  useEffect(() => {
    if (patientId && patientId !== 'undefined' && patientId !== 'null' && patientId !== '') {
      // Fetch patient and lab reports data
      const fetchData = async () => {
        try {
          await Promise.all([
            dispatch(fetchSuperAdminDoctorPatientById(patientId)),
            dispatch(fetchSuperAdminDoctorPatientLabReports(patientId))
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Report_Generated':
        return 'bg-blue-100 text-blue-800';
      case 'Report_Sent':
        return 'bg-purple-100 text-purple-800';
      case 'In_Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <p className="text-slate-600">Loading patient lab reports...</p>
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
              <h3 className="text-sm font-semibold text-red-800">Error Loading Patient Lab Reports</h3>
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

        {/* Lab Reports Content */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Patient Lab Reports
            </h2>
            <p className="text-slate-600 mt-1">
              All laboratory test results and medical investigations for this patient
            </p>
          </div>
          <div className="p-6">
            {!labReports || labReports.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No lab reports found</p>
                <p className="text-slate-400 text-sm mt-2">This patient has no lab report records yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {labReports.map((report, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h6 className="font-semibold text-gray-800 text-lg">{report.testType}</h6>
                        <p className="text-sm text-gray-500">
                          Created on {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-600">Test Description:</span>
                          <p className="text-gray-800">{report.testDescription || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-600">Urgency:</span>
                          <p className="text-gray-800">{report.urgency || 'Normal'}</p>
                        </div>
                      </div>
                      
                      {report.doctorId && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-600">Requested By:</span>
                            <p className="text-gray-800">{report.doctorId.name}</p>
                          </div>
                        </div>
                      )}
                      
                      {report.reportGeneratedDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium text-gray-600">Report Generated:</span>
                            <p className="text-gray-800">{new Date(report.reportGeneratedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Report Details */}
                    {(report.reportSummary || report.clinicalInterpretation || report.conclusion || report.recommendations) && (
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <h6 className="font-semibold text-gray-800 mb-3">Report Details</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {report.reportSummary && (
                            <div>
                              <span className="font-medium text-gray-600">Summary:</span>
                              <p className="text-gray-800 mt-1">{report.reportSummary}</p>
                            </div>
                          )}
                          {report.clinicalInterpretation && (
                            <div>
                              <span className="font-medium text-gray-600">Clinical Interpretation:</span>
                              <p className="text-gray-800 mt-1">{report.clinicalInterpretation}</p>
                            </div>
                          )}
                          {report.conclusion && (
                            <div>
                              <span className="font-medium text-gray-600">Conclusion:</span>
                              <p className="text-gray-800 mt-1">{report.conclusion}</p>
                            </div>
                          )}
                          {report.recommendations && (
                            <div>
                              <span className="font-medium text-gray-600">Recommendations:</span>
                              <p className="text-gray-800 mt-1">{report.recommendations}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PDF Report */}
                    {report.hasPdf && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <File className="h-6 w-6 text-blue-600" />
                            <div>
                              <span className="font-medium text-blue-800">PDF Report Available</span>
                              <p className="text-xs text-blue-600 mt-1">
                                Generated on {report.reportGeneratedDate ? new Date(report.reportGeneratedDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewFile(report.pdfFile, `${report.testType}_report.pdf`)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View PDF
                            </button>
                            <button
                              onClick={() => handleDownloadFile(report.pdfFile, `${report.testType}_report.pdf`)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Files */}
                    {report.additionalFiles && report.additionalFiles.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h6 className="font-semibold text-gray-800 mb-3">Additional Files</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {report.additionalFiles.map((file, fileIndex) => (
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

export default PatientLabReports;



