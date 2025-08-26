import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../../services/api";
import { 
  Users, 
  UserPlus, 
  Search, 
  Eye, 
  Plus,
  Filter,
  RefreshCw,
  FileText,
  Pill,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PatientList() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayPatients: 0,
    pendingTests: 0,
    completedTests: 0
  });

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const centerId = getCenterId();
      
      let url = `/patients?page=${currentPage}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const response = await API.get(url);
      setPatients(response.data.patients);
      setTotalPages(response.data.pagination.totalPages);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const getCenterId = () => {
    if (!user) return null;
    
    if (user.centerId) {
      if (typeof user.centerId === 'object' && user.centerId._id) {
        return user.centerId._id;
      }
      if (typeof user.centerId === 'string') {
        return user.centerId;
      }
    }
    
    if (user.centerID) return user.centerID;
    if (user.center_id) return user.center_id;
    if (user.center && user.center._id) return user.center._id;
    
    return null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients();
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("");
    fetchPatients();
  };

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Patient Management
              </h1>
              <p className="text-slate-600">
                Manage all patients in your center
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/doctor/add-patient')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Today's Patients</p>
                <p className="text-2xl font-bold text-slate-800">{stats.todayPatients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Pending Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendingTests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-slate-600">Completed Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.completedTests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Center
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Assigned Doctor
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900 truncate">{patient.name}</div>
                          <div className="text-xs sm:text-sm text-slate-500">{patient.age} years • {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{patient.phone}</div>
                      <div className="text-sm text-slate-500 truncate max-w-[150px]">{patient.email}</div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{patient.centerId?.name || 'N/A'}</div>
                      <div className="text-sm text-slate-500">{patient.centerCode}</div>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {patient.assignedDoctor?.name || 'Not Assigned'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.status || 'active'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/dashboard/doctor/patients/profile/${patient._id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded transition-colors flex-shrink-0"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/doctor/patients/add-history/${patient._id}`)}
                          className="text-green-600 hover:text-green-900 p-1.5 rounded transition-colors flex-shrink-0"
                          title="Add History"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/doctor/patients/profile/add-medications/${patient._id}`)}
                          className="text-purple-600 hover:text-purple-900 p-1.5 rounded transition-colors flex-shrink-0"
                          title="Add Medications"
                        >
                          <Pill className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/doctor/patients/add-test/${patient._id}`)}
                          className="text-orange-600 hover:text-orange-900 p-1.5 rounded transition-colors flex-shrink-0"
                          title="Add Test"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {patients.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No patients found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your search or filters.' : 'Get started by adding your first patient.'}
            </p>
            <button
              onClick={() => navigate('/dashboard/doctor/add-patient')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center mx-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
