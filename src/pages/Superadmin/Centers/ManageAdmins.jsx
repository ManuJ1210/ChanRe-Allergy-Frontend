import { useEffect, useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCenterAdmins, deleteCenterAdmin } from '../../../features/superadmin/superadminThunks';
import { Trash2, Edit, UserCheck, Plus, Search, Filter, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Memoized FilterControls component to prevent re-renders
const FilterControls = memo(({ filters, updateFilter }) => {
  const handleSearchChange = useCallback((e) => {
    console.log('🔍 admin search:', e.target.value);
    updateFilter('search', e.target.value);
  }, [updateFilter]);

  const handleSortByChange = useCallback((e) => {
    updateFilter('sortBy', e.target.value);
  }, [updateFilter]);

  const handleSortOrderToggle = useCallback(() => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  }, [filters.sortOrder, updateFilter]);

  const handleClearSearch = useCallback(() => {
    updateFilter('search', '');
  }, [updateFilter]);
  
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search admins..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
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
          value={filters.sortBy}
          onChange={handleSortByChange}
          className="text-xs border border-slate-300 rounded px-2 py-2"
        >
          <option value="adminName">Name</option>
          <option value="centerName">Center Name</option>
          <option value="centerCode">Center Code</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="createdAt">Registration Date</option>
        </select>
        
        <button
          onClick={handleSortOrderToggle}
          className="p-2 border border-slate-300 rounded hover:bg-slate-50"
        >
          {filters.sortOrder === 'asc' ? 
            <SortAsc className="h-4 w-4" /> : 
            <SortDesc className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  );
});

export default function ManageAdmins() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { centerAdmins = [], loading, deleteSuccess } = useSelector((state) => state.superadmin);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'adminName',
    sortOrder: 'asc'
  });

  useEffect(() => {
    dispatch(fetchCenterAdmins());
  }, [dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      // Refresh the list after successful deletion
      dispatch(fetchCenterAdmins());
    }
  }, [deleteSuccess, dispatch]);

  const handleDelete = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      dispatch(deleteCenterAdmin(adminId));
    }
  };

  // Utility functions for filtering, sorting, and pagination
  const filterAndSortData = useCallback((data) => {
    if (!data || data.length === 0) return [];
    
    let filteredData = [...data];

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredData = filteredData.filter(admin => {
        const searchableFields = [
          admin.adminName,
          admin.centerName,
          admin.centerCode,
          admin.email,
          admin.phone
        ];
        return searchableFields.some(field => {
          if (!field) return false;
          const fieldStr = field.toString().toLowerCase();
          return fieldStr.includes(searchTerm);
        });
      });
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue, bValue;
      
      if (filters.sortBy === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        aValue = (a[filters.sortBy] || '').toString().toLowerCase();
        bValue = (b[filters.sortBy] || '').toString().toLowerCase();
        return filters.sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
    });

    return filteredData;
  }, [filters]);

  const getPaginatedData = useCallback((filteredData) => {
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [pagination]);

  const updateFilter = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    // Reset to first page when filter changes
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  const updatePagination = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  const changeItemsPerPage = useCallback((itemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
  }, []);

  // Pagination Controls Component
  const PaginationControls = ({ filteredItems }) => {
    const { currentPage, itemsPerPage } = pagination;
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
            onChange={(e) => changeItemsPerPage(parseInt(e.target.value))}
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
            onClick={() => updatePagination(currentPage - 1)}
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
                  onClick={() => updatePagination(1)}
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
                  onClick={() => updatePagination(pageNum)}
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
                  onClick={() => updatePagination(totalPages)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => updatePagination(currentPage + 1)}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
            Center Admins Management
          </h1>
          <p className="text-xs text-slate-600 text-center sm:text-left">
            Manage and monitor all center administrators
          </p>
        </div>

        {/* Success Message */}
        {deleteSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center">
            <UserCheck className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-xs">Admin deleted successfully</span>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center justify-center sm:justify-start">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
                  Center Administrators
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Total: {centerAdmins.length} admins
                </p>
              </div>
              <button
                onClick={() => {
                  // TODO: AddAdmin route doesn't exist yet
                  alert('Add Admin functionality not implemented yet');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add New Admin
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="p-6">
            <FilterControls filters={filters} updateFilter={updateFilter} />
            
            {(() => {
              const filteredAdmins = filterAndSortData(centerAdmins);
              const paginatedAdmins = getPaginatedData(filteredAdmins);
              
              return (
                <>
                  <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Admin Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Center Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Center Code</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Registered</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                  <p className="text-slate-600 text-xs">Loading admins...</p>
                                </div>
                              </td>
                            </tr>
                          ) : paginatedAdmins.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8">
                                <div className="text-center">
                                  <UserCheck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                                    {centerAdmins.length === 0 ? 'No Admins Found' : 'No Results Found'}
                                  </h3>
                                  <p className="text-slate-500 mb-4 text-xs">
                                    {centerAdmins.length === 0 
                                      ? 'Get started by adding your first center administrator.'
                                      : 'Try adjusting your search or filter criteria.'
                                    }
                                  </p>
                                  {centerAdmins.length === 0 && (
                                    <button
                                      onClick={() => {
                                        // TODO: AddAdmin route doesn't exist yet
                                        alert('Add Admin functionality not implemented yet');
                                      }}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto text-xs"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add Admin
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedAdmins.map((admin, index) => (
                              <tr key={admin._id} className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                <td className="py-3 px-4 font-medium text-slate-800">
                                  {admin.adminName || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {admin.centerName || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {admin.centerCode || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {admin.email || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {admin.phone || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-center items-center gap-2">
                                    <button
                                      onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenterAdmin/${admin._id}`)}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
                                    >
                                      <Edit className="h-3 w-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(admin._id)}
                                      disabled={loading}
                                      className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      {loading ? 'Deleting...' : 'Delete'}
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
                  
                  <PaginationControls filteredItems={filteredAdmins} />
                </>
              );
            })()}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 mb-4">
            <FilterControls filters={filters} updateFilter={updateFilter} />
          </div>
          
          <div className="space-y-4">
            {(() => {
              const filteredAdmins = filterAndSortData(centerAdmins);
              const paginatedAdmins = getPaginatedData(filteredAdmins);
              
              return (
                <>
                  {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-slate-600 text-xs">Loading admins...</p>
                    </div>
                  ) : paginatedAdmins.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 text-center">
                      <UserCheck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-slate-600 mb-2">
                        {centerAdmins.length === 0 ? 'No Admins Found' : 'No Results Found'}
                      </h3>
                      <p className="text-slate-500 mb-4 text-xs">
                        {centerAdmins.length === 0 
                          ? 'Get started by adding your first center administrator.'
                          : 'Try adjusting your search or filter criteria.'
                        }
                      </p>
                      {centerAdmins.length === 0 && (
                        <button
                          onClick={() => {
                            // TODO: AddAdmin route doesn't exist yet
                            alert('Add Admin functionality not implemented yet');
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto text-xs"
                        >
                          <Plus className="h-4 w-4" />
                          Add Admin
                        </button>
                      )}
                    </div>
                  ) : (
                    paginatedAdmins.map((admin) => (
                      <div key={admin._id} className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                          {/* Admin Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-slate-800 text-xs">{admin.adminName || 'N/A'}</h3>
                                <p className="text-slate-500 text-xs">{admin.centerName || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                {admin.centerCode || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 w-16">Email:</span>
                              <span className="text-slate-700">{admin.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 w-16">Phone:</span>
                              <span className="text-slate-700">{admin.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 w-16">Joined:</span>
                              <span className="text-slate-700">
                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenterAdmin/${admin._id}`)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(admin._id)}
                              disabled={loading}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              {loading ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                    <PaginationControls filteredItems={filteredAdmins} />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
