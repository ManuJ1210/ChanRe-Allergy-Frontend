import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPatients } from "../../../features/patient/patientThunks";
import { useNavigate } from "react-router-dom";
import { deletePatient } from '../../../features/patient/patientThunks';
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
  ArrowLeft,
  ArrowRight,
  Clock,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { formatRemainingTime } from '../../../utils/patientPermissions';

export default function PatientList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  
  // Sub-search states
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [finalFilteredPatients, setFinalFilteredPatients] = useState([]);
  const [searchField, setSearchField] = useState('all'); // all, name, email, phone, uhId, address

  const { patients = [], getLoading } = useSelector((state) => state.patient);

  useEffect(() => {
    dispatch(getPatients());
  }, [dispatch]);

  // Filter patients based on search term (primary search)
  useEffect(() => {
    const filtered = (patients || []).filter(patient =>
      patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.uhId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
    setCurrentPage(1); // Reset to first page when search changes
    
    // Show sub-search if we have results and a search term
    setShowSubSearch(filtered.length > 0 && searchTerm.trim() !== '');
  }, [searchTerm, patients]);

  // Apply sub-search filter on the already filtered patients
  useEffect(() => {
    if (!showSubSearch || subSearchTerm.trim() === '') {
      setFinalFilteredPatients(filteredPatients);
      return;
    }

    const subFiltered = filteredPatients.filter(patient => {
      const term = subSearchTerm.toLowerCase();
      
      switch (searchField) {
        case 'name':
          return patient?.name?.toLowerCase().includes(term);
        case 'email':
          return patient?.email?.toLowerCase().includes(term);
        case 'phone':
          return patient?.phone?.toLowerCase().includes(term) || 
                 patient?.contact?.toLowerCase().includes(term);
        case 'uhId':
          return patient?.uhId?.toLowerCase().includes(term);
        case 'address':
          return patient?.address?.toLowerCase().includes(term);
        case 'doctor':
          return patient?.assignedDoctor?.name?.toLowerCase().includes(term);
        default: // 'all'
          return patient?.name?.toLowerCase().includes(term) ||
                 patient?.email?.toLowerCase().includes(term) ||
                 patient?.phone?.toLowerCase().includes(term) ||
                 patient?.contact?.toLowerCase().includes(term) ||
                 patient?.uhId?.toLowerCase().includes(term) ||
                 patient?.address?.toLowerCase().includes(term) ||
                 patient?.assignedDoctor?.name?.toLowerCase().includes(term);
      }
    });
    
    setFinalFilteredPatients(subFiltered);
    setCurrentPage(1); // Reset to first page when sub-search changes
  }, [filteredPatients, subSearchTerm, searchField, showSubSearch]);

  // Calculate pagination based on final filtered patients
  const totalPages = Math.ceil(finalFilteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = finalFilteredPatients.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Clear search functions
  const clearAllSearches = () => {
    setSearchTerm('');
    setSubSearchTerm('');
    setShowSubSearch(false);
    setSearchField('all');
    setCurrentPage(1);
  };

  const clearSubSearch = () => {
    setSubSearchTerm('');
    setSearchField('all');
  };

  const handleDelete = (id) => {
    
    if (window.confirm('Are you sure you want to delete this patient?')) {
      dispatch(deletePatient(id));
    }
  };

  const getGenderStats = () => {
    const maleCount = (patients || []).filter(p => p?.gender === 'male').length;
    const femaleCount = (patients || []).filter(p => p?.gender === 'female').length;
    const otherCount = (patients || []).filter(p => p?.gender === 'other').length;
    return { maleCount, femaleCount, otherCount };
  };

  const genderStats = getGenderStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
            Patient List
          </h1>
          <p className="text-slate-600 text-xs text-center sm:text-left">
            View and manage all patients in your center
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Primary Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name, email, phone, address, UH ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearAllSearches}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => navigate('/dashboard/CenterAdmin/patients/AddPatient')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add Patient
                </button>
              </div>

              {/* Sub-search (appears when primary search has results) */}
              {showSubSearch && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Refine search in {filteredPatients.length} results
                    </span>
                    <button
                      onClick={() => setShowSubSearch(false)}
                      className="ml-auto text-blue-400 hover:text-blue-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
                      >
                        <option value="all">All Fields</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="uhId">UH ID</option>
                        <option value="address">Address</option>
                        <option value="doctor">Assigned Doctor</option>
                      </select>
                    </div>
                    
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <input
                        type="text"
                        placeholder={`Search in ${searchField === 'all' ? 'all fields' : searchField}...`}
                        value={subSearchTerm}
                        onChange={(e) => setSubSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
                      />
                      {subSearchTerm && (
                        <button
                          onClick={clearSubSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {subSearchTerm && (
                    <div className="mt-2 text-xs text-blue-600">
                      Found {finalFilteredPatients.length} results in {filteredPatients.length} primary results
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                <p className="text-sm font-bold text-slate-800">{(patients || []).length}</p>
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
                  {(patients || []).filter(p => p?.email).length}
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
                  {(patients || []).filter(p => p?.phone || p?.contact).length}
                </p>
              </div>
              <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {finalFilteredPatients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side - Results info and items per page */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-xs text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, finalFilteredPatients.length)} of {finalFilteredPatients.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                      className="px-3 py-1 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={7}>7</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-xs text-slate-600">per page</span>
                  </div>
                </div>

                {/* Right side - Page navigation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white border border-blue-600"
                    >
                      {currentPage}
                    </button>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center justify-center sm:justify-start">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
              Patients List
            </h2>
            <p className="text-slate-600 mt-1 text-xs text-center sm:text-left">
              {finalFilteredPatients.length} of {(patients || []).length} patients
              {showSubSearch && subSearchTerm && (
                <span className="text-blue-600 ml-2">
                  (filtered from {filteredPatients.length} results)
                </span>
              )}
            </p>
          </div>
          
          {/* Mobile Card View */}
          <div className="block lg:hidden p-4">
            {getLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 text-xs">Loading patients...</p>
              </div>
            ) : finalFilteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-xs">
                  {searchTerm ? (
                    subSearchTerm ? 
                      'No patients found matching your refined search.' : 
                      'No patients found matching your search.'
                  ) : 'No patients found.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPatients.map((patient, index) => (
                  <div key={patient?._id || index} className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{patient?.name || 'N/A'}</h3>
                        <p className="text-slate-500 text-xs">#{startIndex + index + 1}</p>
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
                        <span className="text-slate-700 text-xs font-medium">UH ID: {patient?.uhId || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      <span className="text-slate-700 text-xs font-medium">{patient?.address || 'No address'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="text-slate-700 text-xs font-medium">
                        Dr. {patient?.assignedDoctor?.name || 'Not assigned'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className={`text-xs font-medium ${
                        formatRemainingTime(patient).includes('Expired') 
                          ? 'text-red-600' 
                          : 'text-slate-700'
                      }`}>
                        {formatRemainingTime(patient)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => {
                          if (patient?._id) {
                            navigate(`/dashboard/CenterAdmin/patients/profile/ViewProfile/${patient._id}`);
                          } else {
                            alert('Patient ID not found. Please refresh the page and try again.');
                          }
                        }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/CenterAdmin/patients/EditPatient/${patient?._id}`)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient?._id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block p-6">
            {getLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 text-xs">Loading patients...</p>
              </div>
            ) : finalFilteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-xs">
                  {searchTerm ? (
                    subSearchTerm ? 
                      'No patients found matching your refined search.' : 
                      'No patients found matching your search.'
                  ) : 'No patients found.'}
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
                        UH ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Address
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
                    {currentPatients.map((patient, index) => (
                      <tr key={patient?._id || index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{patient?.name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">#{startIndex + index + 1}</div>
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
                            {patient?.uhId || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600 max-w-xs truncate" title={patient?.address || 'No address'}>
                            {patient?.address || 'No address'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-600">
                            {patient?.assignedDoctor?.name || 'Not assigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (patient?._id) {
                                  navigate(`/dashboard/CenterAdmin/patients/profile/ViewProfile/${patient._id}`);
                                } else {
                                  alert('Patient ID not found. Please refresh the page and try again.');
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/CenterAdmin/patients/EditPatient/${patient?._id}`)}
                              className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(patient?._id)}
                              className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
