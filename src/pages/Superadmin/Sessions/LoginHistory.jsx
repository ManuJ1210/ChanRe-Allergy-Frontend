import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import API from '../../../services/api';
import Pagination from '../../../components/Pagination';
import { 
  ComputerDesktopIcon, 
  DevicePhoneMobileIcon, 
  DeviceTabletIcon,
  GlobeAltIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [centers, setCenters] = useState([]);
  const [dateRange, setDateRange] = useState('7'); // Last 7 days
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Bulk selection state
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLoginHistory();
    fetchCenters();
  }, [selectedCenter, selectedRole, dateRange]);

  const fetchLoginHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get('/login-history/recent', {
        params: { limit: 200 }
      });
      setLoginHistory(response.data.recentLogins || []);
    } catch (error) {
      setError('Failed to fetch login history');
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await API.get('/centers');
      setCenters(response.data);
    } catch (error) {
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this login history record?')) {
      setDeleting(true);
      try {
        await API.delete(`/login-history/${recordId}`);
        toast.success('Login history record deleted successfully');
        fetchLoginHistory(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete record');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords([]);
      setSelectAll(false);
    } else {
      const allRecordIds = paginatedHistory.map(record => record._id);
      setSelectedRecords(allRecordIds);
      setSelectAll(true);
    }
  };

  const handleSelectRecord = (recordId) => {
    if (selectedRecords.includes(recordId)) {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedRecords, recordId];
      setSelectedRecords(newSelected);
      setSelectAll(newSelected.length === paginatedHistory.length);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.length === 0) {
      toast.error('Please select records to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedRecords.length} selected login history records?`)) {
      try {
        await API.delete('/login-history/bulk', { data: { ids: selectedRecords } });
        toast.success(`Deleted ${selectedRecords.length} login history records`);
        setSelectedRecords([]);
        setSelectAll(false);
        fetchLoginHistory(); // Refresh the list
      } catch (error) {
        toast.error('Failed to bulk delete records');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL login history records? This action cannot be undone.')) {
      try {
        await API.delete('/login-history/all');
        toast.success('All login history records deleted successfully');
        setSelectedRecords([]);
        setSelectAll(false);
        fetchLoginHistory(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete all records');
      }
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500" />;
      case 'tablet':
        return <DeviceTabletIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'centeradmin':
        return 'bg-purple-100 text-purple-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'receptionist':
        return 'bg-green-100 text-green-800';
      case 'labstaff':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === null || minutes === undefined) return 'Active Session';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Filter login history based on search and filters
  const filteredHistory = loginHistory.filter(login => {
    const matchesSearch = !searchTerm || 
      login.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      login.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      login.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCenter = selectedCenter === 'all' || 
      login.centerId?._id?.toString() === selectedCenter ||
      login.centerId?.toString() === selectedCenter;
    
    const matchesRole = selectedRole === 'all' || 
      login.userRole?.toLowerCase() === selectedRole.toLowerCase();
    
    // Filter by date range
    const loginDate = new Date(login.loginTime);
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    const matchesDateRange = loginDate >= cutoffDate;
    
    return matchesSearch && matchesCenter && matchesRole && matchesDateRange;
  });

  // Pagination calculations
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRecords([]);
    setSelectAll(false);
  }, [selectedCenter, selectedRole, searchTerm, dateRange]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Login History</h1>
            <p className="text-gray-600">Track all user login activities across the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {totalItems} Login Records
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {selectedRecords.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Selected ({selectedRecords.length})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Center</label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Centers</option>
              {centers.map(center => (
                <option key={center._id} value={center._id}>
                  {center.centername || center.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="centeradmin">Center Admin</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="labstaff">Lab Staff</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCenter('all');
                setSelectedRole('all');
                setDateRange('7');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Login History ({totalItems})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Center
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Login Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
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
              {paginatedHistory.map((login) => (
                <tr key={login._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(login._id)}
                      onChange={() => handleSelectRecord(login._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {login.userId?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {login.userId?.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {login.userId?.username || login.userId?.email || 'No contact info'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(login.userRole)}`}>
                      {login.userRole}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{login.centerId?.name || 'No Center'}</div>
                      {login.centerId?.code && (
                        <div className="text-gray-500 text-xs">Code: {login.centerId.code}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDeviceIcon(login.deviceInfo?.device)}
                      <div className="ml-2">
                        <div className="text-sm text-gray-900">{login.deviceInfo?.device || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{login.deviceInfo?.browser || 'Unknown Browser'}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {login.locationInfo?.city || 'Unknown City'}
                          {login.locationInfo?.region && login.locationInfo.region !== 'Unknown' && 
                           login.locationInfo.region !== 'Local' && 
                           `, ${login.locationInfo.region}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {login.locationInfo?.country || 'Unknown Country'}
                          {login.locationInfo?.ip && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({login.locationInfo.ip.includes('Public:') ? 
                                login.locationInfo.ip.split('Public: ')[1] : 
                                login.locationInfo.ip})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        <div className="text-sm text-gray-900">{formatTime(login.loginTime)}</div>
                        <div className="text-sm text-gray-500">{getTimeAgo(login.loginTime)}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(login.sessionDuration)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {login.loginStatus === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`ml-2 text-sm font-medium ${
                        login.loginStatus === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {login.loginStatus}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteRecord(login._id)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete this login history record"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginatedHistory.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No login history found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or date range.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default LoginHistory;
