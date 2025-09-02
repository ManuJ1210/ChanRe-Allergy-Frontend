import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssignedPatients } from "../../../features/doctor/doctorThunks";
import { useNavigate } from "react-router-dom";
import { canDoctorEditPatient } from "../../../utils/patientPermissions";
import { toast } from "react-toastify";
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 

  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Clock,
  Lock
} from 'lucide-react';
import API from '../../../services/api';

export default function PatientList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  const { assignedPatients = [], loading } = useSelector((state) => state.doctor);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAssignedPatients());
  }, [dispatch]);

  // Filter patients based on search term
  useEffect(() => {
    const filtered = (assignedPatients || []).filter(patient =>
      patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.centerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, assignedPatients]);

  // Doctors typically can't delete patients - this functionality is removed

  const getGenderStats = () => {
    const maleCount = (assignedPatients || []).filter(p => p?.gender === 'male').length;
    const femaleCount = (assignedPatients || []).filter(p => p?.gender === 'female').length;
    const otherCount = (assignedPatients || []).filter(p => p?.gender === 'other').length;
    return { maleCount, femaleCount, otherCount };
  };

  const genderStats = getGenderStats();

  // Handle assigning doctor to patient
  const handleAssignDoctor = async (patientId) => {
    if (!user || !user._id || !patientId) {
      toast.error('Unable to assign doctor. Please try again.');
      return;
    }

    try {
      const response = await API.put(`/patients/${patientId}`, {
        assignedDoctor: user._id
      });

      if (response.status === 200) {
        toast.success('Successfully assigned as doctor to this patient!');
        // Refresh patient list
        dispatch(fetchAssignedPatients());
      } else {
        toast.error(response.data?.message || 'Failed to assign doctor');
      }
    } catch (error) {
      toast.error('Failed to assign doctor. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
            Patient List
          </h1>
          <p className="text-slate-600 text-xs text-center sm:text-left">
            View and manage your assigned patients
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
              <button
                onClick={() => navigate('/dashboard/Doctor/patients/AddPatient')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center text-xs"
              >
                <Plus className="h-4 w-4" />
                Add Patient
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                <p className="text-sm font-bold text-slate-800">{(assignedPatients || []).length}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Male Patients</p>
                <p className="text-sm font-bold text-slate-800">{genderStats.maleCount}</p>
              </div>
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Female Patients</p>
                <p className="text-sm font-bold text-slate-800">{genderStats.femaleCount}</p>
              </div>
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">With Email</p>
                <p className="text-sm font-bold text-slate-800">
                  {(assignedPatients || []).filter(p => p?.email).length}
                </p>
              </div>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">With Phone</p>
                <p className="text-sm font-bold text-slate-800">
                  {(assignedPatients || []).filter(p => p?.phone || p?.contact).length}
                </p>
              </div>
              <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center justify-center sm:justify-start">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
              Patients List
            </h2>
            <p className="text-slate-600 mt-1 text-xs text-center sm:text-left">
              {filteredPatients.length} of {(assignedPatients || []).length} patients
            </p>
          </div>
          
          {/* Mobile Card View */}
          <div className="block lg:hidden p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 text-xs">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-xs">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient, index) => (
                  <div key={patient?._id || index} className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{patient?.name || 'N/A'}</h3>
                        <p className="text-slate-500 text-xs">#{index + 1}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        patient?.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                        patient?.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {patient?.gender || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-700 text-xs font-medium">{patient?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-slate-700 text-xs font-medium">{patient?.phone || patient?.contact || 'No phone'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <User className="h-4 w-4 text-indigo-500" />
                        <span className="text-slate-700 text-xs font-medium">{patient?.age || 'N/A'} years</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span className="text-slate-700 text-xs font-medium">{patient?.centerCode || 'Not assigned'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="text-slate-700 text-xs font-medium">
                        Dr. {patient?.assignedDoctor?.name || 'Not assigned'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => {
                          if (patient?._id) {
                            navigate(`/dashboard/Doctor/patients/profile/ViewProfile/${patient._id}`);
                          } else {
                            alert('Patient ID not found. Please refresh the page and try again.');
                          }
                        }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {canDoctorEditPatient(patient, user).canEdit ? (
                        <button
                          onClick={() => navigate(`/dashboard/Doctor/patients/EditPatient/${patient?._id}`)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-gray-50 text-gray-400 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                          title={canDoctorEditPatient(patient, user).reason}
                        >
                          <Clock className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                      {/* Delete button removed - doctors can't delete patients */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 text-xs">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-xs">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Age/Gender
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Center Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Assigned Doctor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPatients.map((patient, index) => (
                      <tr key={patient?._id || index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{patient?.name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">#{index + 1}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {patient?.email && (
                              <div className="flex items-center text-xs text-slate-600">
                                <Mail className="h-3 w-3 mr-2" />
                                {patient.email}
                              </div>
                            )}
                            {(patient?.phone || patient?.contact) && (
                              <div className="flex items-center text-xs text-slate-600">
                                <Phone className="h-3 w-3 mr-2" />
                                {patient.phone || patient.contact}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-slate-800">{patient?.age || 'N/A'} years</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              patient?.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                              patient?.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {patient?.gender || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-xs text-slate-600">
                            <MapPin className="h-3 w-3 mr-2" />
                            {patient?.centerCode || 'Not assigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">
                              {patient?.assignedDoctor?.name || 'Not assigned'}
                            </span>
                            {!patient?.assignedDoctor && user && (
                              <button
                                onClick={() => handleAssignDoctor(patient._id)}
                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                                title="Assign yourself to this patient"
                              >
                                Assign Me
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (patient?._id) {
                                  navigate(`/dashboard/Doctor/patients/profile/ViewProfile/${patient._id}`);
                                } else {
                                  alert('Patient ID not found. Please refresh the page and try again.');
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canDoctorEditPatient(patient, user).canEdit ? (
                              <button
                                onClick={() => navigate(`/dashboard/Doctor/patients/EditPatient/${patient?._id}`)}
                                className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                disabled
                                className="text-gray-400 p-1 rounded cursor-not-allowed"
                                title={canDoctorEditPatient(patient, user).reason}
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            )}
                            {/* Delete button removed - doctors can't delete patients */}
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
    </div>
  );
}
