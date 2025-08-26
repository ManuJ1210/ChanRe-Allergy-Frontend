import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllFollowUps, fetchPatientDetails } from '../../../../features/centerAdmin/centerAdminThunks';
import { 
  Calendar, 
  User, 
  Activity, 
  Eye, 
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle
} from 'lucide-react';

const FollowUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { followUps, loading, error } = useSelector(state => state.centerAdmin);
  const { patientDetails } = useSelector(state => state.centerAdmin);

  useEffect(() => {
    dispatch(fetchAllFollowUps());
  }, [dispatch]);

  const handleViewPatient = (patientId) => {
    dispatch(fetchPatientDetails(patientId));
    navigate(`/dashboard/CenterAdmin/patients/ViewProfile/${patientId}`);
  };

  const handleAddFollowUp = (patientId) => {
    navigate(`/dashboard/CenterAdmin/patients/FollowUp/add/${patientId}`);
  };

  const handleViewFollowUp = (patientId, followUpType) => {
    navigate(`/dashboard/CenterAdmin/patients/FollowUp/${followUpType}/view/${patientId}`);
  };

  const filteredFollowUps = followUps?.filter(followUp => {
    const matchesSearch = followUp.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         followUp.patientId?.phone?.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || followUp.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowUpTypeIcon = (type) => {
    switch (type) {
      case 'allergic-rhinitis':
        return '🤧';
      case 'allergic-conjunctivitis':
        return '👁️';
      case 'allergic-bronchitis':
        return '🫁';
      case 'atopic-dermatitis':
        return '🦠';
      case 'gpe':
        return '🏥';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-md font-semibold text-gray-800 mb-2">Error Loading Follow-ups</h3>
              <p className="text-gray-600 mb-4 text-xs">{error}</p>
              <button
                onClick={() => dispatch(fetchAllFollowUps())}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-md font-bold text-gray-800 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-blue-600" />
                Patient Follow-ups
              </h1>
              <p className="text-gray-600 mt-1 text-xs">Manage and track patient follow-up appointments</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Follow-ups List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {filteredFollowUps.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-gray-800 mb-2">No Follow-ups Found</h3>
              <p className="text-gray-600 text-xs">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No follow-up appointments have been scheduled yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow-up Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFollowUps.map((followUp) => (
                    <tr key={followUp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-xs font-medium text-gray-900">
                              {followUp.patientId?.name || 'Unknown Patient'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {followUp.patientId?.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm mr-2">
                            {getFollowUpTypeIcon(followUp.followUpType)}
                          </span>
                          <span className="text-xs text-gray-900 capitalize">
                            {followUp.followUpType?.replace('-', ' ') || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-xs text-gray-900">
                            {followUp.scheduledDate ? new Date(followUp.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(followUp.status)}`}>
                          {followUp.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-xs text-gray-500">
                            {followUp.updatedAt ? new Date(followUp.updatedAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewPatient(followUp.patientId?._id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Patient"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAddFollowUp(followUp.patientId?._id)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Add Follow-up"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          {followUp.followUpType && (
                            <button
                              onClick={() => handleViewFollowUp(followUp.patientId?._id, followUp.followUpType)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="View Follow-up Details"
                            >
                              <Activity className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredFollowUps.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600">Total Follow-ups</p>
                  <p className="text-sm font-bold text-gray-900">{filteredFollowUps.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-sm font-bold text-gray-900">
                    {filteredFollowUps.filter(f => f.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600">Completed</p>
                  <p className="text-sm font-bold text-gray-900">
                    {filteredFollowUps.filter(f => f.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600">Overdue</p>
                  <p className="text-sm font-bold text-gray-900">
                    {filteredFollowUps.filter(f => f.status === 'overdue').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUp; 