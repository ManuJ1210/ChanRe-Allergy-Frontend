import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Shield, 
  Users, 
  FileText, 
  Plus,
  Eye,
  Settings,
  TrendingUp,
  UserCheck,
  User,
  Building2,
  Activity
} from 'lucide-react';
import { fetchDashboardStats } from '../../features/superadmin/superadminThunks';

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardStats, loading } = useSelector((state) => state.superadmin);

  // Fetch dashboard stats using Redux
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Add Center',
      description: 'Register a new medical center',
      icon: <Plus className="h-6 w-6" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
              onClick: () => navigate('/dashboard/superadmin/centers/addcenter')
    },
    {
      title: 'Manage Centers',
      description: 'View and manage all centers',
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
              onClick: () => navigate('/dashboard/superadmin/centers/centerslist')
    },
    {
      title: 'Manage Admins',
      description: 'Manage center administrators',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
              onClick: () => navigate('/dashboard/superadmin/centers/manageadmins')
    },
    {
      title: 'Billing Management',
      description: 'Monitor billing across all centers',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
              onClick: () => navigate('/dashboard/superadmin/billing')
    },
    {
      title: 'View Reports',
      description: 'System analytics and reports',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
              onClick: () => navigate('/dashboard/superadmin/followups/viewfollowuppatients')
    },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600">
            System overview and management dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-slate-200 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Total Centers</p>
                    <p className="text-xl font-bold text-slate-800">{dashboardStats.totalCenters}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Center Admins</p>
                    <p className="text-xl font-bold text-slate-800">{dashboardStats.totalAdmins}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                    <p className="text-xl font-bold text-slate-800">{dashboardStats.totalPatients}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Total Tests</p>
                    <p className="text-xl font-bold text-slate-800">{dashboardStats.totalTests}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
            <p className="text-slate-600 mt-1">Common administrative tasks</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} ${action.hoverColor} text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {action.icon}
                    <Plus className="h-4 w-4 opacity-75" />
                  </div>
                  <h3 className="font-semibold text-left">{action.title}</h3>
                  <p className="text-xs opacity-90 text-left mt-1">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Center Management */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-500" />
                Center Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Centers/AddCenter')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Add New Center</span>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">View All Centers</span>
                    <Eye className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Followups/ViewFollowUpPatients')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">View Follow-ups</span>
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Admin Management */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Admin Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Centers/ManageAdmins')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Manage Admins</span>
                    <Settings className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Followups/ViewFollowUpPatients')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">System Reports</span>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Center Analytics</span>
                    <Eye className="h-4 w-4 text-slate-400" />
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
