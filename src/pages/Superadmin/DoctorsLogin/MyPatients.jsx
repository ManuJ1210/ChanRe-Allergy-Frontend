import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSuperAdminDoctorAssignedPatients } from '../../../features/superadmin/superAdminDoctorSlice';

const MyPatients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignedPatients, workingLoading, workingError } = useSelector(
    (state) => state.superAdminDoctors
  );

  useEffect(() => {
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
      <h1 className="text-md font-bold text-gray-800 mb-8">My Assigned Patients</h1>
      
      {assignedPatients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xs">No patients assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedPatients.map((patient) => (
            <div key={patient._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">{patient.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  patient.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {patient.status}
                </span>
              </div>
              
              <div className="space-y-2 text-gray-600 text-xs">
                <p><span className="font-medium">Age:</span> {patient.age}</p>
                <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                <p><span className="font-medium">Phone:</span> {patient.phone}</p>
                {patient.email && (
                  <p><span className="font-medium">Email:</span> {patient.email}</p>
                )}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => navigate(`/dashboard/superadmin/doctor/patient/${patient._id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-xs"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate(`/dashboard/superadmin/doctor/patient/${patient._id}/history`)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-xs"
                >
                  History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPatients;
