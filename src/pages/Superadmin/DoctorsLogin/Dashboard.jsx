import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuperAdminDoctorWorkingStats, fetchSuperAdminDoctorAssignedPatients } from '../../../features/superadmin/superAdminDoctorSlice';
import { User, FileText, MessageSquare, Clock, Eye } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { workingStats, assignedPatients, workingLoading, workingError } = useSelector(
    (state) => state.superAdminDoctors
  );

  useEffect(() => {
    dispatch(fetchSuperAdminDoctorWorkingStats());
    dispatch(fetchSuperAdminDoctorAssignedPatients());
  }, [dispatch]);

  if (workingLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (workingError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="text-xs">{workingError}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-md font-bold text-gray-800 mb-8">Superadmin Doctor Dashboard</h1>
      
      {/* Stats Cards - Focused on Patient Care */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-600">Assigned Patients</p>
              <p className="text-xl font-semibold text-gray-900">
                {workingStats?.assignedPatients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-600">Pending Lab Reports</p>
              <p className="text-xl font-semibold text-gray-900">
                {workingStats?.pendingLabReports || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-600">Feedback Sent</p>
              <p className="text-xl font-semibold text-gray-900">
                {workingStats?.feedbackSent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-600">Recent Followups</p>
              <p className="text-xl font-semibold text-gray-900">
                {workingStats?.recentFollowups || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions - Patient Focused */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Patient Details</h3>
              <p className="text-gray-600 mb-4 text-xs">
                View complete patient information, history, and followups
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/superadmin/doctor/patients'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-xs"
              >
                View Patients
              </button>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Lab Reports</h3>
              <p className="text-gray-600 mb-4 text-xs">
                Review lab reports and provide feedback to center admin doctors
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/superadmin/doctor/lab-reports'}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-xs"
              >
                Review Reports
              </button>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Patient History</h3>
              <p className="text-gray-600 mb-4 text-xs">
                Access complete patient medical history and followup records
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/superadmin/doctor/patients'}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-xs"
              >
                View History
              </button>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients with Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Recent Patients</h2>
        </div>
        <div className="p-6">
          {assignedPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-xs">No assigned patients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedPatients.slice(0, 5).map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">
                              {patient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-xs font-medium text-gray-900">{patient.name}</div>
                            <div className="text-xs text-gray-500">{patient.age} years</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{patient.phone}</div>
                        <div className="text-xs text-gray-500">{patient.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.location.href = `/dashboard/superadmin/doctor/patient/${patient._id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center text-xs"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </div>
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
  );
};

export default Dashboard;
