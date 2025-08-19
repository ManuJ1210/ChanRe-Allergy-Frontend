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
  UserCheck,
  Building2,
  Filter,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Pill
} from 'lucide-react';

export default function ManagePatients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, loading, error, deleteSuccess } = useSelector((state) => state.receptionist);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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
    let filtered = patients.filter(patient =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact?.includes(searchTerm) ||
      patient.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply additional filters
    if (selectedFilter === 'no-doctor') {
      filtered = filtered.filter(patient => !patient.assignedDoctor);
    } else if (selectedFilter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(patient => new Date(patient.createdAt) >= oneWeekAgo);
    } else if (selectedFilter === 'inactive') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(patient => new Date(patient.updatedAt) < oneMonthAgo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name);
        case 'age':
          return (a.age || 0) - (b.age || 0);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  }, [patients, searchTerm, selectedFilter, sortBy]);

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

  const getManagementStats = () => {
    const totalPatients = patients.length;
    const noDoctor = patients.filter(p => !p.assignedDoctor).length;
    const recentPatients = patients.filter(p => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(p.createdAt) >= oneWeekAgo;
    }).length;
    const inactivePatients = patients.filter(p => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(p.updatedAt) < oneMonthAgo;
    }).length;

    return { totalPatients, noDoctor, recentPatients, inactivePatients };
  };

  const genderStats = getGenderStats();
  const managementStats = getManagementStats();

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
              Patient Management
            </h1>
            <p className="text-slate-600">
              Advanced patient management with filtering, sorting, and administrative controls
            </p>
          </div>

          {/* Success Message */}
          {deleteSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700">Patient deleted successfully!</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                  <p className="text-xl font-bold text-slate-800">{managementStats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">No Doctor Assigned</p>
                  <p className="text-xl font-bold text-slate-800">{managementStats.noDoctor}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Recent Patients</p>
                  <p className="text-2xl font-bold text-slate-800">{managementStats.recentPatients}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Inactive Patients</p>
                  <p className="text-2xl font-bold text-slate-800">{managementStats.inactivePatients}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Management Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Patients</option>
                      <option value="no-doctor">No Doctor Assigned</option>
                      <option value="recent">Recent (Last 7 days)</option>
                      <option value="inactive">Inactive (Last month)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="age">Sort by Age</option>
                      <option value="recent">Sort by Recent</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard/receptionist/add-patient')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Patient
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    title="Export patient data"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
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
                      Center Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Assigned Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">No Patients Found</h3>
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
                              <div className="text-sm font-medium text-slate-900">
                                {patient.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                ID: {patient._id?.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-slate-900">
                              <Mail className="h-3 w-3 mr-2 text-slate-400" />
                              {patient.email || 'No email'}
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                              <Phone className="h-3 w-3 mr-2 text-slate-400" />
                              {patient.phone || 'No phone'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-900">
                            <Calendar className="h-3 w-3 mr-2 text-slate-400" />
                            {patient.age} years, {patient.gender}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-900">
                            <Building2 className="h-3 w-3 mr-2 text-slate-400" />
                            {patient.centerCode || 'No code'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-900">
                            <UserCheck className="h-3 w-3 mr-2 text-slate-400" />
                            {patient.assignedDoctor?.name || (
                              <span className="text-yellow-600 font-medium">Not assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-900">
                            <Calendar className="h-3 w-3 mr-2 text-slate-400" />
                            {new Date(patient.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/receptionist/add-history/${patient._id}`)}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                              title="Add History"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/receptionist/add-medications/${patient._id}`)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="Add Medications"
                            >
                              <Pill className="h-4 w-4" />
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
    </ReceptionistLayout>
  );
}
