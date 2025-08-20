import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchReceptionistPatients } from "../../features/receptionist/receptionistThunks";
import ReceptionistLayout from './ReceptionistLayout';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Calendar,
  Plus,
  Eye,
  Phone,
  Mail
} from 'lucide-react';

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patients, loading, error, stats } = useSelector((state) => state.receptionist);

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      icon: <UserPlus className="h-6 w-6" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
                  onClick: () => navigate('/dashboard/receptionist/add-patient')
    },
    {
      title: 'View Patients',
      description: 'Manage all patients',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/dashboard/receptionist/patients')
    },
    {
      title: 'Add Test',
      description: 'Select a patient to add test results',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/dashboard/receptionist/patients')
    },
    {
      title: 'Patient History',
      description: 'View all patients and their history',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/dashboard/receptionist/patients')
    }
  ];

  const recentPatients = patients.slice(0, 5);

  if (loading) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  if (error) {
    return (
      <ReceptionistLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </ReceptionistLayout>
    );
  }

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-600">
              Manage your patients and daily tasks
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                  <p className="text-xl font-bold text-slate-800">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Today's Patients</p>
                  <p className="text-xl font-bold text-slate-800">{stats.todayPatients}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Pending Tests</p>
                  <p className="text-xl font-bold text-slate-800">{stats.pendingTests}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Completed Tests</p>
                  <p className="text-xl font-bold text-slate-800">{stats.completedTests}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-500" />
                Quick Actions
              </h2>
              <p className="text-slate-600 mt-1">
                Common tasks and shortcuts
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`${action.color} ${action.hoverColor} text-white p-4 rounded-lg transition-colors flex flex-col items-center gap-3`}
                  >
                    {action.icon}
                    <div className="text-center">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Patients
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Latest registered patients
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/receptionist/patients')}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-600 mb-2">No Patients Yet</h3>
                  <p className="text-slate-500 mb-4">Start by adding your first patient.</p>
                  <button
                    onClick={() => navigate('/dashboard/receptionist/add-patient')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Patient
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{patient.name}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email || 'No email'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone || 'No phone'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/receptionist/profile/${patient._id}`)}
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReceptionistLayout>
  );
} 