import { useEffect, useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCenterDetailedInfo } from '../../../features/superadmin/superadminThunks';
import {
  MapPin, Mail, Phone, UserCheck, Building2, User, Users, 
  ArrowLeft, AlertCircle, ChevronDown, ChevronUp,
  Calendar, Clock, FileText, Activity, Search, Filter,
  ChevronLeft, ChevronRight, SortAsc, SortDesc
} from 'lucide-react';

// Memoized FilterControls component to prevent re-renders
const FilterControls = memo(({ sectionType, sortOptions, filters, updateFilter }) => {
  const sectionFilters = filters[sectionType];
  
  const handleSearchChange = useCallback((e) => {
    console.log(`🔍 ${sectionType} search:`, e.target.value);
    updateFilter(sectionType, 'search', e.target.value);
  }, [sectionType, updateFilter]);

  const handleSortByChange = useCallback((e) => {
    updateFilter(sectionType, 'sortBy', e.target.value);
  }, [sectionType, updateFilter]);

  const handleSortOrderToggle = useCallback(() => {
    updateFilter(sectionType, 'sortOrder', 
      sectionFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    );
  }, [sectionType, sectionFilters.sortOrder, updateFilter]);

  const handleClearSearch = useCallback(() => {
    updateFilter(sectionType, 'search', '');
  }, [sectionType, updateFilter]);
  
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${sectionType}...`}
            value={sectionFilters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {sectionFilters.search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={sectionFilters.sortBy}
          onChange={handleSortByChange}
          className="text-xs border border-slate-300 rounded px-2 py-2"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleSortOrderToggle}
          className="p-2 border border-slate-300 rounded hover:bg-slate-50"
        >
          {sectionFilters.sortOrder === 'asc' ? 
            <SortAsc className="h-4 w-4" /> : 
            <SortDesc className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  );
});

export default function ViewCenterInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [expandedSections, setExpandedSections] = useState({
    patients: false,
    doctors: false,
    receptionists: false
  });

  // Pagination state for each section
  const [pagination, setPagination] = useState({
    patients: { currentPage: 1, itemsPerPage: 10 },
    doctors: { currentPage: 1, itemsPerPage: 10 },
    receptionists: { currentPage: 1, itemsPerPage: 10 }
  });

  // Filter state for each section
  const [filters, setFilters] = useState({
    patients: { search: '', sortBy: 'name', sortOrder: 'asc' },
    doctors: { search: '', sortBy: 'name', sortOrder: 'asc' },
    receptionists: { search: '', sortBy: 'name', sortOrder: 'asc' }
  });

  const { 
    centerDetailedInfo, 
    centerDetailedLoading, 
    centerDetailedError 
  } = useSelector((state) => state.superadmin);

  const center = centerDetailedInfo?.center;

  useEffect(() => {
    if (id) {
      dispatch(fetchCenterDetailedInfo(id));
    }
  }, [dispatch, id]);

  // Debug logging
  useEffect(() => {
    if (centerDetailedInfo) {
      console.log('🔍 Center Detailed Info:', centerDetailedInfo);
      console.log('🔍 Patients:', centerDetailedInfo.patients);
      console.log('🔍 Doctors:', centerDetailedInfo.doctors);
      console.log('🔍 Receptionists:', centerDetailedInfo.receptionists);
      
      // Debug patient fields
      if (centerDetailedInfo.patients && centerDetailedInfo.patients.length > 0) {
        console.log('🔍 First Patient Fields:', Object.keys(centerDetailedInfo.patients[0]));
        console.log('🔍 First Patient Data:', centerDetailedInfo.patients[0]);
      }
    }
  }, [centerDetailedInfo]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Utility functions for filtering, sorting, and pagination
  const filterAndSortData = (data, sectionType) => {
    if (!data || data.length === 0) return [];
    
    const sectionFilters = filters[sectionType];
    let filteredData = [...data];

    console.log(`🔍 Filtering ${sectionType}:`, {
      totalItems: data.length,
      searchTerm: sectionFilters.search,
      sortBy: sectionFilters.sortBy,
      sortOrder: sectionFilters.sortOrder
    });

    // Apply search filter
    if (sectionFilters.search && sectionFilters.search.trim()) {
      const searchTerm = sectionFilters.search.toLowerCase().trim();
      console.log(`🔍 Searching for: "${searchTerm}"`);
      
      filteredData = filteredData.filter(item => {
        const searchableFields = getSearchableFields(item, sectionType);
        const matches = searchableFields.some(field => {
          if (!field) return false;
          const fieldStr = field.toString().toLowerCase();
          const matches = fieldStr.includes(searchTerm);
          if (matches) {
            console.log(`✅ Match found in field:`, field, 'for item:', item.name || item._id);
          }
          return matches;
        });
        return matches;
      });
      
      console.log(`🔍 Filtered results: ${filteredData.length} items`);
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      const aValue = getFieldValue(a, sectionFilters.sortBy);
      const bValue = getFieldValue(b, sectionFilters.sortBy);
      
      // Handle numeric sorting for age and experience
      if (sectionFilters.sortBy === 'age' || sectionFilters.sortBy === 'experience') {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sectionFilters.sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String sorting
      if (sectionFilters.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filteredData;
  };

  const getSearchableFields = (item, sectionType) => {
    switch (sectionType) {
      case 'patients':
        return [
          item.name, 
          item.email, 
          item.phone, 
          item.contact, 
          item.mobile, 
          item.address,
          item.age,
          item.gender,
          item.centerCode,
          item.assignedDoctor?.name || item.assignedDoctor
        ];
      case 'doctors':
        return [
          item.name, 
          item.email, 
          item.phone, 
          item.username, 
          item.qualification, 
          item.designation,
          item.kmcNumber,
          item.hospitalName,
          item.experience,
          ...(item.specializations || [])
        ];
      case 'receptionists':
        return [
          item.name, 
          item.email, 
          item.phone, 
          item.mobile, 
          item.username, 
          item.address,
          item.status,
          item.emergencyContact,
          item.emergencyContactName
        ];
      default:
        return [];
    }
  };

  const getFieldValue = (item, field) => {
    const value = item[field];
    return value ? value.toString().toLowerCase() : '';
  };

  const getPaginatedData = (filteredData, sectionType) => {
    const { currentPage, itemsPerPage } = pagination[sectionType];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const updateFilter = useCallback((sectionType, filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        [filterType]: value
      }
    }));
    // Reset to first page when filter changes
    setPagination(prev => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        currentPage: 1
      }
    }));
  }, []);

  const updatePagination = useCallback((sectionType, page) => {
    setPagination(prev => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        currentPage: page
      }
    }));
  }, []);

  const changeItemsPerPage = useCallback((sectionType, itemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        itemsPerPage,
        currentPage: 1
      }
    }));
  }, []);

  // Pagination Controls Component
  const PaginationControls = ({ sectionType, totalItems, filteredItems }) => {
    const { currentPage, itemsPerPage } = pagination[sectionType];
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredItems.length);

    // Always show pagination controls if there are items
    if (filteredItems.length === 0) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-600">
            Showing {startItem}-{endItem} of {filteredItems.length} items
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => changeItemsPerPage(sectionType, parseInt(e.target.value))}
            className="text-xs border border-slate-300 rounded px-2 py-1"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => updatePagination(sectionType, currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs">Previous</span>
          </button>
          
          <div className="flex items-center gap-1">
            {/* Show first page if not in current range */}
            {totalPages > 5 && currentPage > 3 && (
              <>
                <button
                  onClick={() => updatePagination(sectionType, 1)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50"
                >
                  1
                </button>
                {currentPage > 4 && <span className="text-xs text-slate-400">...</span>}
              </>
            )}
            
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => updatePagination(sectionType, pageNum)}
                  className={`px-3 py-1 text-xs rounded font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* Show last page if not in current range */}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-xs text-slate-400">...</span>}
                <button
                  onClick={() => updatePagination(sectionType, totalPages)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => updatePagination(sectionType, currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1"
          >
            <span className="text-xs">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };


  if (centerDetailedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">Loading detailed center information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (centerDetailedError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{centerDetailedError}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!center) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Centers
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Center Information
          </h1>
          <p className="text-slate-600 text-xs">
            Detailed view of healthcare center and its statistics
          </p>
        </div>

        {/* Center Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              {center.name || 'Unnamed Center'}
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Center Code: {center.code || 'N/A'}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {center.address && (
                  <div className="flex items-start gap-3 text-slate-700">
                    <MapPin className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Address</p>
                      <p className="text-xs">{center.address}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {center.email && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Email</p>
                      <p className="text-xs">{center.email}</p>
                    </div>
                  </div>
                )}
                {center.phone && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Phone</p>
                      <p className="text-xs">{center.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                <p className="text-sm font-bold text-slate-800">{centerDetailedInfo?.patients?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Doctors</p>
                <p className="text-sm font-bold text-slate-800">{centerDetailedInfo?.doctors?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Receptionists</p>
                <p className="text-sm font-bold text-slate-800">{centerDetailedInfo?.receptionists?.length || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Admin Information */}
        {center.admin && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                Center Administrator
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Name</p>
                      <p className="text-xs">{center.admin.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {center.admin.email && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Email</p>
                        <p className="text-xs">{center.admin.email}</p>
                      </div>
                    </div>
                  )}
                  {center.admin.phone && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Phone</p>
                        <p className="text-xs">{center.admin.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Information Sections */}
        
        {/* Patients Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div 
            className="p-6 border-b border-blue-100 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleSection('patients')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Patients ({centerDetailedInfo?.patients?.length || 0})
              </h2>
              {expandedSections.patients ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
          {expandedSections.patients && (
            <div className="p-6">
              {centerDetailedInfo?.patients?.length > 0 ? (
                <>
                  <FilterControls 
                    sectionType="patients" 
                    sortOptions={[
                      { value: 'name', label: 'Name' },
                      { value: 'age', label: 'Age' },
                      { value: 'gender', label: 'Gender' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'email', label: 'Email' }
                    ]}
                    filters={filters}
                    updateFilter={updateFilter}
                  />
                  
                  {(() => {
                    const filteredPatients = filterAndSortData(centerDetailedInfo.patients, 'patients');
                    const paginatedPatients = getPaginatedData(filteredPatients, 'patients');
                    
                    return (
                      <>
                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-slate-50 sticky top-0">
                                <tr className="border-b border-slate-200">
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Age</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Gender</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Address</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Doctor</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Center Code</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedPatients.map((patient, index) => (
                                  <tr key={patient._id} className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {patient.name || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {String(patient.age) || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {String(patient.gender) || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {String(patient.phone || patient.contact || patient.mobile) || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {patient.email || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                                      {patient.address || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {patient.assignedDoctor ? 
                                        (typeof patient.assignedDoctor === 'object' ? 
                                          `Dr. ${patient.assignedDoctor.name}` : 
                                          `Dr. ${patient.assignedDoctor}`) : 
                                        'N/A'
                                      }
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {patient.centerCode || 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <PaginationControls 
                          sectionType="patients" 
                          totalItems={centerDetailedInfo.patients.length}
                          filteredItems={filteredPatients}
                        />
                      </>
                    );
                  })()}
                </>
              ) : (
                <p className="text-slate-500 text-xs text-center py-8">No patients found</p>
              )}
            </div>
          )}
        </div>

        {/* Doctors Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div 
            className="p-6 border-b border-blue-100 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleSection('doctors')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                Doctors ({centerDetailedInfo?.doctors?.length || 0})
              </h2>
              {expandedSections.doctors ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
          {expandedSections.doctors && (
            <div className="p-6">
              {centerDetailedInfo?.doctors?.length > 0 ? (
                <>
                  <FilterControls 
                    sectionType="doctors" 
                    sortOptions={[
                      { value: 'name', label: 'Name' },
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'qualification', label: 'Qualification' },
                      { value: 'designation', label: 'Designation' },
                      { value: 'experience', label: 'Experience' }
                    ]}
                    filters={filters}
                    updateFilter={updateFilter}
                  />
                  
                  {(() => {
                    const filteredDoctors = filterAndSortData(centerDetailedInfo.doctors, 'doctors');
                    const paginatedDoctors = getPaginatedData(filteredDoctors, 'doctors');
                    
                    return (
                      <>
                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-green-50 sticky top-0">
                                <tr className="border-b border-green-200">
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Username</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Qualification</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Designation</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Experience</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">KMC Number</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Specializations</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedDoctors.map((doctor, index) => (
                                  <tr key={doctor._id} className={`border-b border-green-100 hover:bg-green-25 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      Dr. {doctor.name || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {doctor.email || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {doctor.phone || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {doctor.username ? `@${doctor.username}` : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                                      {doctor.qualification || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {doctor.designation || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {doctor.experience || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {doctor.kmcNumber || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                                      {doctor.specializations && doctor.specializations.length > 0 ? 
                                        doctor.specializations.join(', ') : 'N/A'
                                      }
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <PaginationControls 
                          sectionType="doctors" 
                          totalItems={centerDetailedInfo.doctors.length}
                          filteredItems={filteredDoctors}
                        />
                      </>
                    );
                  })()}
                </>
              ) : (
                <p className="text-slate-500 text-xs text-center py-8">No doctors found</p>
              )}
            </div>
          )}
        </div>

        {/* Receptionists Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div 
            className="p-6 border-b border-blue-100 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleSection('receptionists')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-purple-500" />
                Receptionists ({centerDetailedInfo?.receptionists?.length || 0})
              </h2>
              {expandedSections.receptionists ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
          {expandedSections.receptionists && (
            <div className="p-6">
              {centerDetailedInfo?.receptionists?.length > 0 ? (
                <>
                  <FilterControls 
                    sectionType="receptionists" 
                    sortOptions={[
                      { value: 'name', label: 'Name' },
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'mobile', label: 'Mobile' },
                      { value: 'username', label: 'Username' },
                      { value: 'status', label: 'Status' }
                    ]}
                    filters={filters}
                    updateFilter={updateFilter}
                  />
                  
                  {(() => {
                    const filteredReceptionists = filterAndSortData(centerDetailedInfo.receptionists, 'receptionists');
                    const paginatedReceptionists = getPaginatedData(filteredReceptionists, 'receptionists');
                    
                    return (
                      <>
                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-purple-50 sticky top-0">
                                <tr className="border-b border-purple-200">
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Username</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Address</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Emergency Contact</th>
                                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedReceptionists.map((receptionist, index) => (
                                  <tr key={receptionist._id} className={`border-b border-purple-100 hover:bg-purple-25 ${index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}`}>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {receptionist.name || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {receptionist.email || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {receptionist.phone || receptionist.mobile || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {receptionist.username ? `@${receptionist.username}` : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                                      {receptionist.address || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {receptionist.emergencyContact ? 
                                        `${receptionist.emergencyContact}${receptionist.emergencyContactName ? ` (${receptionist.emergencyContactName})` : ''}` : 
                                        'N/A'
                                      }
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        receptionist.status === 'active' ? 'bg-green-100 text-green-800' :
                                        receptionist.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {receptionist.status || 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <PaginationControls 
                          sectionType="receptionists" 
                          totalItems={centerDetailedInfo.receptionists.length}
                          filteredItems={filteredReceptionists}
                        />
                      </>
                    );
                  })()}
                </>
              ) : (
                <p className="text-slate-500 text-xs text-center py-8">No receptionists found</p>
              )}
            </div>
          )}
        </div>


        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              Center Actions
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Manage this healthcare center
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenter/${id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <Building2 className="h-4 w-4" />
                Edit Center
              </button>
              <button
                onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenterAdmin/${id}`)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <UserCheck className="h-4 w-4" />
                Manage Admin
              </button>
              <button
                onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
                className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Centers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}