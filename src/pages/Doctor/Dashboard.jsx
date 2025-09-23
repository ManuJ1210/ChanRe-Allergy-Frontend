import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAssignedPatients, fetchTestRequests, fetchDoctorNotifications } from '../../features/doctor/doctorThunks';
import API from '../../services/api';
import { User, Users, FileText, Clock, AlertCircle, CheckCircle, RefreshCw, Bell, Calendar, TrendingUp } from 'lucide-react';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { 
    assignedPatients, 
    testRequests, 
    patientsLoading, 
    testRequestsLoading,
    patientsError,
    testRequestsError,
    unreadNotificationsCount
  } = useSelector((state) => state.doctor);

  const [activeTab, setActiveTab] = useState('patients');
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingTests: 0,
    completedTests: 0,
    recentPatients: 0,
    waitingForConsultationFee: 0
  });

  const fetchStats = async () => {
    try {
      const response = await API.get('/dashboard/doctor/stats');
      const baseStats = response.data;
      
      // Calculate recent patients (assigned today and paid consultation fee)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('🔍 Debug Recent Patients Calculation:');
      console.log('Today:', today.toDateString());
      console.log('Total assigned patients:', assignedPatients.length);
      
      const recentPatients = assignedPatients.filter(patient => {
        if (!patient.assignedAt) {
          console.log(`❌ Patient ${patient.name}: No assignedAt date`);
          return false;
        }
        
        // Check if patient has paid consultation fee
        const hasConsultationFee = patient.billing && patient.billing.some(bill => 
          bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
        );
        const hasPaidConsultationFee = hasConsultationFee && patient.billing.some(bill => 
          (bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')) && 
          (bill.status === 'paid' || bill.status === 'completed')
        );
        
        const assignedDate = new Date(patient.assignedAt);
        assignedDate.setHours(0, 0, 0, 0);
        
        const isToday = assignedDate.getTime() === today.getTime();
        
        console.log(`📋 Patient ${patient.name}:`);
        console.log(`  - Assigned Date: ${assignedDate.toDateString()}`);
        console.log(`  - Is Today: ${isToday}`);
        console.log(`  - Has Consultation Fee: ${hasConsultationFee}`);
        console.log(`  - Has Paid Consultation Fee: ${hasPaidConsultationFee}`);
        console.log(`  - Billing:`, patient.billing);
        
        return isToday && hasPaidConsultationFee;
      }).length;
      
      console.log('✅ Recent patients count:', recentPatients);
      
      // Calculate patients waiting for consultation fee payment
      const waitingForConsultationFee = assignedPatients.filter(patient => {
        const hasConsultationFee = patient.billing && patient.billing.some(bill => 
          bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
        );
        const hasPaidConsultationFee = hasConsultationFee && patient.billing.some(bill => 
          (bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')) && 
          (bill.status === 'paid' || bill.status === 'completed')
        );
        return !hasPaidConsultationFee;
      }).length;
      
      setStats({
        ...baseStats,
        recentPatients,
        waitingForConsultationFee
      });
    } catch (error) {
    }
  };

  useEffect(() => {
    dispatch(fetchAssignedPatients());
    dispatch(fetchTestRequests());
    dispatch(fetchDoctorNotifications());
  }, [dispatch]);

  // Update stats when assignedPatients changes
  useEffect(() => {
    if (assignedPatients.length >= 0) {
      fetchStats();
    }
  }, [assignedPatients]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(fetchAssignedPatients());
        dispatch(fetchTestRequests());
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchAssignedPatients());
      dispatch(fetchTestRequests());
      fetchStats();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  const getPriorityColor = (urgency) => {
    switch (urgency) {
      case 'Emergency': return 'text-red-600 bg-red-100';
      case 'Urgent': return 'text-orange-600 bg-orange-100';
      case 'Normal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Sample Collected': return 'text-purple-600 bg-purple-100';
      case 'Assigned': return 'text-orange-600 bg-orange-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Keep local filters for backward compatibility and display
  const pendingTests = testRequests.filter(test => test.status === 'Pending');
  const completedTests = testRequests.filter(test => test.status === 'Completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">
                Welcome back, Dr. {user?.name}
              </h1>
              <p className="text-slate-600">
                Manage your patients and test requests
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={() => navigate('/dashboard/doctor/notifications')}
                  className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                </button>
              )}
              <button
                onClick={() => {
                  dispatch(fetchAssignedPatients());
                  dispatch(fetchTestRequests());
                  dispatch(fetchDoctorNotifications());
                  fetchStats();
                }}
                disabled={patientsLoading || testRequestsLoading}
                className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(patientsLoading || testRequestsLoading) ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Consultation Fee Notification */}
        {stats.waitingForConsultationFee > 0 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  {stats.waitingForConsultationFee} Patient{stats.waitingForConsultationFee > 1 ? 's' : ''} Waiting for Consultation Fee Payment
                </h3>
                <p className="text-xs text-orange-700 mt-1">
                  These patients need to pay consultation fees before you can view them. Please contact the receptionist.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Patients</p>
                <p className="text-xl font-bold text-slate-800">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => navigate('/dashboard/doctor/recently-assigned-patients')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Recent Patients</p>
                <p className="text-2xl font-bold text-slate-800">{stats.recentPatients}</p>
                <p className="text-xs text-orange-600 mt-1">Assigned today</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pendingTests}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed Tests</p>
                <p className="text-2xl font-bold text-slate-800">{stats.completedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold text-slate-800">{testRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <button
                onClick={() => navigate('/dashboard/doctor/patients/add-patient')}
                className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <User className="h-6 w-6 text-green-600 mr-3" />
                <span className="font-medium text-green-800">Add Patient</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard/doctor/patients')}
                className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <span className="font-medium text-blue-800">Manage Patients</span>
              </button>

              <button
                onClick={() => navigate('/dashboard/doctor/recently-assigned-patients')}
                className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-orange-600 mr-3" />
                <span className="font-medium text-orange-800">Recent Patients</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard/doctor/test-requests')}
                className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <Clock className="h-6 w-6 text-yellow-600 mr-3" />
                <span className="font-medium text-yellow-800">View Test Requests</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard/doctor/completed-reports')}
                className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <span className="font-medium text-green-800">Completed Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="border-b border-blue-100">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'patients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Assigned Patients
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Test Requests
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'patients' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-800">Assigned Patients</h3>
                    {stats.recentPatients > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                          {stats.recentPatients} new today
                        </span>
                        <button
                          onClick={() => navigate('/dashboard/doctor/recently-assigned-patients')}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium underline"
                        >
                          View recent patients
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">
                          No new patients today
                        </span>
                        <button
                          onClick={() => navigate('/dashboard/doctor/recently-assigned-patients')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                        >
                          View all patients
                        </button>
                      </div>
                    )}
                  </div>
                  {patientsLoading && <p className="text-slate-500">Loading...</p>}
                </div>

                {patientsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{patientsError}</p>
                  </div>
                )}

                {assignedPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No patients assigned yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedPatients.map((patient) => (
                      <div
                        key={patient._id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => {
                          // Bulletproof patient._id conversion - ensure it's always a string
                          const id = typeof patient._id === 'object' && patient._id !== null
                            ? patient._id._id || patient._id.id || String(patient._id)
                            : String(patient._id);
                          navigate(`/dashboard/doctor/patients/profile/${id}`);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{patient.name}</h4>
                          <span className="text-xs text-slate-500 capitalize">{patient.gender}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">Age: {patient.age}</p>
                        <p className="text-sm text-slate-600 mb-3">Phone: {patient.phone}</p>
                        <button className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Test Requests</h3>
                  {testRequestsLoading && <p className="text-slate-500">Loading...</p>}
                </div>

                {testRequestsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{testRequestsError}</p>
                  </div>
                )}

                {testRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No test requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testRequests.map((test) => (
                      <div
                        key={test._id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">
                            {test.patientName || 'Unknown Patient'}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Test: {test.testType || 'General Test'}
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                          Date: {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                        {test.testDescription && (
                          <p className="text-sm text-slate-600 mb-2">
                            Description: {test.testDescription}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(test.urgency)}`}>
                            {test.urgency}
                          </span>
                          <button
                            onClick={() => {
                              // Bulletproof test.patientId conversion - ensure it's always a string
                              const id = typeof test.patientId === 'object' && test.patientId !== null
                                ? test.patientId._id || test.patientId.id || String(test.patientId)
                                : String(test.patientId);
                              navigate(`/dashboard/doctor/patients/profile/${id}`);
                            }}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                          >
                            View Patient
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 