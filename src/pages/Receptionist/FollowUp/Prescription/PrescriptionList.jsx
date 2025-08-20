import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchReceptionistPrescriptions, deleteReceptionistPrescription } from '../../../../features/receptionist/receptionistThunks';
import { Plus, Eye, FileText, Trash2, ArrowLeft, User, Calendar } from 'lucide-react';

const PrescriptionList = ({ patientId: propPatientId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const patientId = propPatientId || params.patientId || params.id;
  const { prescriptions, loading, error } = useSelector((state) => state.receptionist);

  useEffect(() => {
    if (patientId && patientId !== 'undefined') {
      dispatch(fetchReceptionistPrescriptions(patientId));
    }
  }, [dispatch, patientId]);

  const handleDelete = (prescriptionId, patientName) => {
    if (window.confirm(`Are you sure you want to delete the prescription for ${patientName}?`)) {
      dispatch(deleteReceptionistPrescription(prescriptionId));
    }
  };

  const handleBack = () => {
    // Navigate back to patient profile or follow-up page
    navigate(`/dashboard/receptionist/profile/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Patient Profile</span>
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 flex items-center mb-2">
                <FileText className="h-8 w-8 mr-3 text-blue-500" />
                Prescriptions
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Patient ID: {patientId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{prescriptions.length} prescription records</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                onClick={() => navigate(`/dashboard/receptionist/followup/prescription/add/${patientId}`)}
              >
                <Plus className="h-5 w-5" />
                Add Prescription
              </button>
            </div>
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Prescription Records
            </h2>
            <p className="text-slate-600 mt-1">
              View and manage patient prescriptions
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Visit Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading prescriptions...</p>
                        <p className="text-slate-500 text-sm">Please wait while we fetch the data</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <div className="text-red-500 mb-2">
                          <FileText className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                        <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
                      </div>
                    </td>
                  </tr>
                ) : prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-16 w-16 text-slate-300 mb-4" />
                        <p className="text-slate-600 font-medium text-lg">No prescriptions found</p>
                        <p className="text-slate-500 text-sm mt-1">Start by adding a new prescription</p>
                        <button
                          onClick={() => navigate(`/dashboard/receptionist/followup/prescription/add/${patientId}`)}
                          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add First Prescription
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  prescriptions.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800 font-medium">
                          {p.date ? new Date(p.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.visit || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800 font-medium">
                          {p.patientId?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {p.updatedBy?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                            onClick={() => navigate(`/dashboard/receptionist/followup/prescription/view/${p._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                            onClick={() => handleDelete(p._id, p.patientId?.name || 'Unknown Patient')}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionList; 