import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import API from '../../services/api';

// Debug component to test reassignment functionality
export default function ReassignmentDebug() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log('🔄 Fetching patients...');
      const response = await API.get('/patients');
      console.log('Patients response:', response.data);
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    }
  };

  const fetchDoctors = async () => {
    try {
      console.log('🔄 Fetching doctors...');
      const response = await API.get('/doctors');
      console.log('Doctors response:', response.data);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    }
  };

  const getCenterId = () => {
    if (!user) return null;
    
    if (user.centerId) {
      if (typeof user.centerId === 'object' && user.centerId._id) {
        return user.centerId._id;
      }
      return user.centerId;
    }
    
    const storedCenterId = localStorage.getItem('centerId');
    if (storedCenterId) {
      return storedCenterId;
    }
    
    return null;
  };

  const handleReassign = async () => {
    if (!selectedPatient || !selectedDoctor || !reason) {
      toast.error('Please select patient, doctor, and provide reason');
      return;
    }

    setLoading(true);
    console.log('🔄 Starting reassignment...');
    console.log('Selected patient:', selectedPatient);
    console.log('Selected doctor:', selectedDoctor);
    console.log('Reason:', reason);
    console.log('Center ID:', getCenterId());

    try {
      const requestData = {
        patientId: selectedPatient._id,
        newDoctorId: selectedDoctor,
        reason: reason,
        notes: 'Debug test reassignment',
        centerId: getCenterId()
      };

      console.log('Sending request:', requestData);

      const response = await API.post('/patients/reassign', requestData);
      
      console.log('Reassignment response:', response.data);

      if (response.data.success) {
        toast.success('Patient reassigned successfully!');
        setSelectedPatient(null);
        setSelectedDoctor('');
        setReason('');
        fetchPatients(); // Refresh patients
      } else {
        toast.error(response.data.message || 'Failed to reassign patient');
      }
    } catch (error) {
      console.error('Reassignment error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to reassign patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reassignment Debug Tool</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User:</strong> {user?.name || 'Not logged in'}
            </div>
            <div>
              <strong>Center ID:</strong> {getCenterId() || 'Not found'}
            </div>
            <div>
              <strong>Patients Count:</strong> {patients.length}
            </div>
            <div>
              <strong>Doctors Count:</strong> {doctors.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Reassignment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <select
                value={selectedPatient?._id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p._id === e.target.value);
                  setSelectedPatient(patient);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name} - {patient.uhId} - Dr. {patient.assignedDoctor?.name || 'Not Assigned'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Reassignment
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for reassignment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleReassign}
              disabled={loading || !selectedPatient || !selectedDoctor || !reason}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Test Reassignment'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <p className="text-sm text-gray-600">
            Open browser console (F12) to see detailed logs of the reassignment process.
          </p>
        </div>
      </div>
    </div>
  );
}
