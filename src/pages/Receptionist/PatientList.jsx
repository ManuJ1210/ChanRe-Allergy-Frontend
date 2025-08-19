import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchReceptionistPatients, deleteReceptionistPatient } from "../../features/receptionist/receptionistThunks";
import { resetReceptionistState } from "../../features/receptionist/receptionistSlice";
import ReceptionistLayout from './ReceptionistLayout';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';

export default function PatientList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, loading, error, deleteSuccess } = useSelector((state) => state.receptionist);
  

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
  }, [dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      setTimeout(() => {
        dispatch(resetReceptionistState());
      }, 2000);
    }
  }, [deleteSuccess, dispatch]);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact?.includes(searchTerm) ||
      patient.phone?.includes(searchTerm) ||
      patient.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      dispatch(deleteReceptionistPatient(id));
    }
  };

  const getGenderStats = () => {
    const maleCount = patients.filter(p => p.gender === 'male').length;
    const femaleCount = patients.filter(p => p.gender === 'female').length;
    const otherCount = patients.filter(p => p.gender === 'other').length;
    return { maleCount, femaleCount, otherCount };
  };

  const genderStats = getGenderStats();

  if (loading) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading patients...</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  if (error) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Patient List
            </h1>
            <p className="text-slate-600">
              View and manage all patients in your center
            </p>
          </div>

          {/* Success Message */}
          {deleteSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700">Patient deleted successfully!</span>
            </div>
          )}

          {/* Search and Add Button */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => navigate('/dashboard/receptionist/add-patient')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Patient
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                  <p className="text-xl font-bold text-slate-800">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Male Patients</p>
                  <p className="text-xl font-bold text-slate-800">{genderStats.maleCount}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Female Patients</p>
                  <p className="text-xl font-bold text-slate-800">{genderStats.femaleCount}</p>
                </div>
                <User className="h-8 w-8 text-pink-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Other</p>
                  <p className="text-xl font-bold text-slate-800">{genderStats.otherCount}</p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
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
                      Age & Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-slate-600 mb-2">No Patients Found</h3>
                        <p className="text-slate-500 mb-4">
                          {searchTerm ? 'No patients match your search.' : 'Get started by adding your first patient.'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => navigate('/dashboard/receptionist/add-patient')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                          >
                            <Plus className="h-4 w-4" />
                            Add Patient
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-xs font-medium text-slate-900">
                                {patient.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                ID: {patient._id?.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-slate-900">
                              <Mail className="h-3 w-3 mr-2 text-slate-400" />
                              {patient.email || 'No email'}
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                              <Phone className="h-3 w-3 mr-2 text-slate-400" />
                              {patient.phone || patient.contact || 'No phone'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-xs text-slate-900">
                            <Calendar className="h-3 w-3 mr-2 text-slate-400" />
                            {patient.age} years, {patient.gender}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-xs text-slate-900">
                            <MapPin className="h-3 w-3 mr-2 text-slate-400" />
                            {patient.address || 'No address'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium">
                          <div className="flex items-center justify-center gap-2">
                            {patient._id ? (
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/profile/${patient._id}`)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                                title="View patient"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-slate-400 p-1" title="No patient ID available">
                                <Eye className="h-4 w-4" />
                              </span>
                            )}
                              
                          
                            {patient._id ? (
                              <button
                                onClick={() => navigate(`/dashboard/receptionist/edit-patient/${patient._id}`)}
                                className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                title="Edit patient"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-slate-400 p-1" title="No patient ID available">
                                <Edit className="h-4 w-4" />
                              </span>
                            )}
                            {patient._id ? (
                              <button
                                onClick={() => handleDelete(patient._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                title="Delete patient"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-slate-400 p-1" title="No patient ID available">
                                <Trash2 className="h-4 w-4" />
                              </span>
                            )}
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
    </ReceptionistLayout>
  );
}
