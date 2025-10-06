import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  getAllSessions, 
  getSessionStats, 
  logoutSession, 
  forceLogoutUserSessions,
  bulkLogoutSessions,
  logoutAllSessions
} from '../../../features/session/sessionThunks';
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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ActiveSessions = () => {
  const dispatch = useDispatch();
  const { allSessions, sessionStats, loading, error } = useSelector(state => state.session);
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [centers, setCenters] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Bulk selection state
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    dispatch(getAllSessions());
    dispatch(getSessionStats());
    fetchCenters();
  }, [dispatch]);

  const fetchCenters = async () => {
    try {
      const response = await API.get('/centers');
      setCenters(response.data);
    } catch (error) {
    }
  };

  const handleLogoutSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to logout this session?')) {
      await dispatch(logoutSession(sessionId));
      dispatch(getAllSessions()); // Refresh the list
    }
  };

  const handleForceLogoutUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to force logout ALL sessions for ${userName}?`)) {
      await dispatch(forceLogoutUserSessions(userId));
      dispatch(getAllSessions()); // Refresh the list
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSessions([]);
      setSelectAll(false);
    } else {
      const allSessionIds = paginatedSessions.map(session => session.sessionId);
      setSelectedSessions(allSessionIds);
      setSelectAll(true);
    }
  };

  const handleSelectSession = (sessionId) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedSessions, sessionId];
      setSelectedSessions(newSelected);
      setSelectAll(newSelected.length === paginatedSessions.length);
    }
  };

  const handleBulkLogout = async () => {
    if (selectedSessions.length === 0) {
      toast.error('Please select sessions to logout');
      return;
    }
    
    if (window.confirm(`Are you sure you want to logout ${selectedSessions.length} selected sessions?`)) {
      await dispatch(bulkLogoutSessions(selectedSessions));
      setSelectedSessions([]);
      setSelectAll(false);
      dispatch(getAllSessions()); // Refresh the list
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to logout ALL active sessions? This will log out every user from the system.')) {
      await dispatch(logoutAllSessions());
      setSelectedSessions([]);
      setSelectAll(false);
      dispatch(getAllSessions()); // Refresh the list
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

  // Filter sessions based on search and filters
  const filteredSessions = allSessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCenter = selectedCenter === 'all' || 
      session.centerId?._id?.toString() === selectedCenter ||
      session.centerId?.toString() === selectedCenter;
    
    const matchesRole = selectedRole === 'all' || 
      session.userRole?.toLowerCase() === selectedRole.toLowerCase();
    
    return matchesSearch && matchesCenter && matchesRole;
  });

  // Pagination calculations
  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedSessions([]);
    setSelectAll(false);
  }, [selectedCenter, selectedRole, searchTerm]);

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
            <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
            <p className="text-gray-600">Monitor all active user sessions across the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                {allSessions.length} Active Sessions
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {selectedSessions.length > 0 && (
                <button
                  onClick={handleBulkLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout Selected ({selectedSessions.length})
                </button>
              )}
              <button
                onClick={handleLogoutAll}
                className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {sessionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.totalSessions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.activeSessions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Centers Active</p>
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.sessionsByCenter?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Role Types</p>
                <p className="text-2xl font-semibold text-gray-900">{sessionStats.sessionsByRole?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCenter('all');
                setSelectedRole('all');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Active Sessions ({totalItems})
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
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.sessionId)}
                      onChange={() => handleSelectSession(session.sessionId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {session.userId?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {session.userId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.userId?.username || session.userId?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(session.userRole)}`}>
                      {session.userRole}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{session.centerId?.name || 'N/A'}</div>
                      {session.centerId?.code && (
                        <div className="text-gray-500 text-xs">Code: {session.centerId.code}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDeviceIcon(session.deviceInfo?.device)}
                      <div className="ml-2">
                        <div className="text-sm text-gray-900">{session.deviceInfo?.device}</div>
                        <div className="text-sm text-gray-500">{session.deviceInfo?.browser}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {session.locationInfo?.city || 'Unknown City'}
                          {session.locationInfo?.region && session.locationInfo.region !== 'Unknown' && 
                           session.locationInfo.region !== 'Local' && 
                           `, ${session.locationInfo.region}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.locationInfo?.country || 'Unknown Country'}
                          {session.locationInfo?.ip && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({session.locationInfo.ip.includes('Public:') ? 
                                session.locationInfo.ip.split('Public: ')[1] : 
                                session.locationInfo.ip})
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
                        <div className="text-sm text-gray-900">{formatTime(session.loginTime)}</div>
                        <div className="text-sm text-gray-500">{getTimeAgo(session.loginTime)}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getTimeAgo(session.lastActivity)}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLogoutSession(session.sessionId)}
                        className="text-red-600 hover:text-red-900"
                        title="Logout this session"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleForceLogoutUser(session.userId._id, session.userId.name)}
                        className="text-red-800 hover:text-red-900"
                        title="Force logout all sessions for this user"
                      >
                        Force Logout
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginatedSessions.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
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

export default ActiveSessions;
