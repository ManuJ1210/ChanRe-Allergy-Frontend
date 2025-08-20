import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  User, 
  UserCheck, 
  FileText, 
  Building, 
  Settings,
  Plus,
  Eye
} from 'lucide-react';

export default function CenterAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalTests: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/dashboard/centeradmin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = response.data;
          setStats(data);
        } else {
          console.error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
              onClick: () => navigate('/dashboard/centeradmin/patients/addpatient')
    },
    {
      title: 'Add Doctor',
      description: 'Add a new doctor to your center',
      icon: <User className="h-6 w-6" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
              onClick: () => navigate('/dashboard/centeradmin/doctors/adddoctor')
    },
    {
      title: 'Add Receptionist',
      description: 'Add a new receptionist',
      icon: <UserCheck className="h-6 w-6" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
              onClick: () => navigate('/dashboard/centeradmin/receptionist/addreceptionist')
    },
    {
      title: 'View Patients',
      description: 'Manage all patients',
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
              onClick: () => navigate('/dashboard/centeradmin/patients/patientlist')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600 text-xs">
            Manage your center, patients, and staff
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
                    <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                    <p className="text-sm font-bold text-slate-800">{stats.totalPatients}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Doctors</p>
                    <p className="text-sm font-bold text-slate-800">{stats.totalDoctors}</p>
                  </div>
                  <User className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Receptionists</p>
                    <p className="text-sm font-bold text-slate-800">{stats.totalReceptionists}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs font-medium">Total Tests</p>
                    <p className="text-sm font-bold text-slate-800">{stats.totalTests}</p>
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
            <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
            <p className="text-slate-600 mt-1 text-xs">Common tasks to get you started</p>
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
                  <h3 className="font-semibold text-left text-xs">{action.title}</h3>
                  <p className="text-xs opacity-90 text-left mt-1">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Management */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Patient Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/centeradmin/patients/addpatient')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">Add New Patient</span>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/centeradmin/patients/patientlist')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">View All Patients</span>
                    <Eye className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('CenterAdmin/patients/ManagePatients')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">Manage Patients</span>
                    <Settings className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Staff Management */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                Staff Management
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/centeradmin/doctors/adddoctor')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">Add Doctor</span>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/centeradmin/doctors/doctorlist')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">View Doctors</span>
                    <Eye className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/centeradmin/receptionist/addreceptionist')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">Add Receptionist</span>
                    <Plus className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/centeradmin/receptionist/managereceptionists')}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-xs">Manage Receptionists</span>
                    <Settings className="h-4 w-4 text-slate-400" />
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
