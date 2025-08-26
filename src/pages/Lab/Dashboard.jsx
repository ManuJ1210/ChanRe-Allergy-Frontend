import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { 
  Microscope, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FileText,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

export default function LabDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Debug logging
  

  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    urgentRequests: 0,
    todayRequests: 0,
    thisWeekRequests: 0
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchDashboardData();
    } else if (user && !user._id && !user.id) {
      // If user exists but no id, stop loading
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from dedicated endpoint
      const [statsResponse, requestsResponse] = await Promise.all([
        API.get('/dashboard/lab/stats'),
        API.get('/test-requests/lab-staff')
      ]);
      
      const statsData = statsResponse.data;
      const requestsData = requestsResponse.data;
      
      // Additional calculations for today and this week
      const today = new Date().toDateString();
      const todayRequests = requestsData.filter(req => 
        new Date(req.createdAt).toDateString() === today
      ).length;
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekRequests = requestsData.filter(req => 
        new Date(req.createdAt) >= weekAgo
      ).length;

      setStats({
        totalRequests: statsData.totalRequests,
        pendingRequests: statsData.pendingRequests,
        completedRequests: statsData.completedRequests,
        urgentRequests: statsData.urgentRequests,
        todayRequests: todayRequests,
        thisWeekRequests: thisWeekRequests
      });

      // Recent requests (last 5)
      setRecentRequests(requestsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching lab dashboard data:', error);
      // Set default stats on error
      setStats({
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        urgentRequests: 0,
        todayRequests: 0,
        thisWeekRequests: 0
      });
      setRecentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'Assigned':
        return 'text-blue-600 bg-blue-50';
      case 'Sample Collected':
        return 'text-purple-600 bg-purple-50';
      case 'In Progress':
        return 'text-orange-600 bg-orange-50';
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'Cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Emergency':
        return 'text-red-600 bg-red-50';
      case 'Urgent':
        return 'text-orange-600 bg-orange-50';
      case 'Normal':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user || (!user._id && !user.id)) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading lab dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Lab Dashboard
          </h1>
          <p className="text-xs text-slate-600">
            Welcome back, {user?.staffName || 'Lab Staff'}! Here's your test request overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Total Requests</p>
                <p className="text-md font-bold text-slate-800">{stats.totalRequests}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Microscope className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Pending</p>
                <p className="text-md font-bold text-slate-800">{stats.pendingRequests}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Completed Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Completed</p>
                <p className="text-md font-bold text-slate-800">{stats.completedRequests}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Urgent Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Urgent</p>
                <p className="text-md font-bold text-slate-800">{stats.urgentRequests}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Today's Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Today's Requests</h3>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-md font-bold text-blue-600">{stats.todayRequests}</p>
            <p className="text-xs text-slate-600 mt-2">New test requests today</p>
          </div>

          {/* This Week's Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">This Week</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-md font-bold text-green-600">{stats.thisWeekRequests}</p>
            <p className="text-xs text-slate-600 mt-2">Requests in the last 7 days</p>
          </div>
        </div>

        {/* Recent Test Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Test Requests
              </h2>
              <button
                onClick={() => navigate('/dashboard/lab/test-requests')}
                className="text-blue-500 hover:text-blue-600 font-medium text-xs"
              >
                View All
              </button>
            </div>
          </div>

          <div className="p-6">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Microscope className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-slate-600 mb-2">No Test Requests</h3>
                <p className="text-xs text-slate-500">You don't have any test requests assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/lab/test-request/${request._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-slate-800">
                            {request.patientName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          <strong>Test:</strong> {request.testType}
                        </p>
                        <p className="text-sm text-slate-600 mb-1">
                          <strong>Doctor:</strong> {request.doctorName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Requested: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-800">
                          {request.testType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/dashboard/lab/test-requests')}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800">View All Requests</p>
                <p className="text-sm text-slate-600">Manage test requests</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/dashboard/lab/pending-requests')}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800">Pending Requests</p>
                <p className="text-sm text-slate-600">Handle pending tests</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/dashboard/lab/completed-requests')}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-slate-800">Completed Tests</p>
                <p className="text-sm text-slate-600">View completed reports</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 