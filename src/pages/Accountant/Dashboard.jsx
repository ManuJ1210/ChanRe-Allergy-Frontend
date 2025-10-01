import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserMd, 
  FaUserTie, 
  FaChartLine, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileInvoice,
  FaClipboardList
} from 'react-icons/fa';
// Remove this import as it's not needed - user data comes from Redux store
import { getAccountantDashboard } from '../../services/api';

const AccountantDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    recentPatients: 0,
    centerId: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getAccountantDashboard();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const stats = [
    {
      title: 'Total Patients',
      value: dashboardData?.totalPatients || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Doctors',
      value: dashboardData?.totalDoctors || 0,
      icon: FaUserMd,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Receptionists',
      value: dashboardData?.totalReceptionists || 0,
      icon: FaUserTie,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Recent Patients (7 days)',
      value: dashboardData?.recentPatients || 0,
      icon: FaCalendarAlt,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'View Billing',
      description: 'Access billing information and reports',
      icon: FaMoneyBillWave,
      color: 'bg-green-100 hover:bg-green-200',
      textColor: 'text-green-600',
      onClick: () => navigate('/dashboard/accountant/billing')
    },
    {
      title: 'Financial Reports',
      description: 'Generate and view financial reports',
      icon: FaChartLine,
      color: 'bg-blue-100 hover:bg-blue-200',
      textColor: 'text-blue-600',
      onClick: () => navigate('/dashboard/accountant/reports')
    },
    {
      title: 'Invoice Management',
      description: 'Manage invoices and payments',
      icon: FaFileInvoice,
      color: 'bg-purple-100 hover:bg-purple-200',
      textColor: 'text-purple-600',
      onClick: () => navigate('/dashboard/accountant/invoices')
    },
    {
      title: 'Transaction History',
      description: 'View transaction history and logs',
      icon: FaClipboardList,
      color: 'bg-orange-100 hover:bg-orange-200',
      textColor: 'text-orange-600',
      onClick: () => navigate('/dashboard/accountant/transactions')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accountant Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}. Here's an overview of your center's financial data.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                className={`${action.color} ${action.textColor} rounded-lg p-6 cursor-pointer transition-colors duration-200`}
                onClick={action.onClick}
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="h-8 w-8 mr-3" />
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm opacity-80">{action.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button
            onClick={() => navigate('/dashboard/accountant/billing')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-4">
                <FaUsers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">New patients registered</p>
                <p className="text-sm text-gray-600">Last 7 days: {dashboardData?.recentPatients || 0} patients</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Recent</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-4">
                <FaMoneyBillWave className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Financial reports available</p>
                <p className="text-sm text-gray-600">Access billing and payment information</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
