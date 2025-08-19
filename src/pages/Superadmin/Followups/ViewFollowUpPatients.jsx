// src/pages/followup/ViewFollowUpPatients.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDetailedFollowUps } from "../../../features/superadmin/superadminThunks";
import { Users, Search, Activity, Eye, Calendar, Building2, Hash } from "lucide-react";

export default function ViewFollowUpPatients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patientFollowUps, loading, error } = useSelector((state) => state.superadmin);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchDetailedFollowUps());
  }, [dispatch]);



  // Filter patients by search
  const filteredPatients = patientFollowUps.filter((p) =>
    (p.patientId?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // Group records by patient
  const patientsWithFollowUps = filteredPatients.reduce((acc, record) => {
    const patientId = record.patientId?._id;
    if (!patientId) return acc;
    
    if (!acc[patientId]) {
      acc[patientId] = {
        patient: record.patientId,
        center: record.patientId?.centerId,
        records: [],
        hasTypes: new Set()
      };
    }
    
    acc[patientId].records.push(record);
    acc[patientId].hasTypes.add(record.type);
    
    return acc;
  }, {});

  const patientList = Object.values(patientsWithFollowUps);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm sm:text-base">Loading follow-up patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 text-center sm:text-left">
            Follow-up Patients
          </h1>
          <p className="text-slate-600 text-sm sm:text-base text-center sm:text-left">
            View and manage patient follow-up assessments across all centers
          </p>
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center justify-center sm:justify-start">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Follow-up Assessments
                </h2>
                <p className="text-slate-600 mt-1 text-sm sm:text-base">
                  Total: {patientFollowUps.length} patients with follow-ups
                </p>
              </div>
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {patientList.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-slate-600 mb-2">No Follow-up Patients Found</h3>
                <p className="text-slate-500 text-sm">
                  {search ? 'No patients match your search.' : 'No patients have follow-up assessments yet.'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {patientList.map((patient) => (
                  <div key={patient.patient._id} className="bg-slate-50 rounded-lg p-4 space-y-3">
                    {/* Patient Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">
                            {patient.patient.name || 'Unknown Patient'}
                          </div>
                          <div className="text-xs text-slate-500">
                            ID: {patient.patient._id?.slice(-6) || 'No ID'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Center Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-slate-900">
                        <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                        {patient.patient.centerId?.name || 'Unknown Center'}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Hash className="h-3 w-3 mr-2 text-slate-400" />
                        {patient.patient.centerCode || 'No code'}
                      </div>
                    </div>
                    
                    {/* Last Follow-up */}
                    <div className="flex items-center text-sm text-slate-900">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      {patient.records.length > 0 ? new Date(patient.records[0].createdAt || patient.records[0].date).toLocaleDateString() : 'No date'}
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <button
                        onClick={() => navigate(`/dashboard/superadmin/followups/PatientProfile/${patient.patient._id}`)}
                        className="w-full bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors text-center flex items-center justify-center"
                      >
                        <Users className="h-3 w-3 mr-2" />
                        View Profile
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Center
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Follow-up
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {patientList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-slate-600 mb-2">No Follow-up Patients Found</h3>
                      <p className="text-slate-500 text-sm">
                        {search ? 'No patients match your search.' : 'No patients have follow-up assessments yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  patientList.map((patient) => (
                    <tr key={patient.patient._id} className="hover:bg-slate-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-xs font-medium text-slate-900">
                              {patient.patient.name || 'Unknown Patient'}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {patient.patient._id?.slice(-6) || 'No ID'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-slate-900">
                          <Building2 className="h-3 w-3 mr-2 text-slate-400" />
                          {patient.patient.centerId?.name || 'Unknown Center'}
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Hash className="h-3 w-3 mr-2 text-slate-400" />
                          {patient.patient.centerCode || 'No code'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-slate-900">
                          <Calendar className="h-3 w-3 mr-2 text-slate-400" />
                          {patient.records.length > 0 ? new Date(patient.records[0].createdAt || patient.records[0].date).toLocaleDateString() : 'No date'}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs font-medium">
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            onClick={() => navigate(`/dashboard/superadmin/followups/PatientProfile/${patient.patient._id}`)}
                            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center"
                          >
                            <Users className="h-3 w-3 mr-2" />
                            View Profile
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
}
