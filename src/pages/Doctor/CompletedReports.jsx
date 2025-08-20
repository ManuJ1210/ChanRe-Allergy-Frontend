// Front-End/src/pages/Doctor/CompletedReports.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { downloadPDFReport, viewPDFReport, isReportAvailable } from '../../utils/pdfHandler';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  User,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  Download,
  Mail,
  Stethoscope,
  TestTube
} from 'lucide-react';

const CompletedReports = () => {
  const navigate = useNavigate();
  const [completedReports, setCompletedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [downloadingReports, setDownloadingReports] = useState(new Set());
  const [viewingReports, setViewingReports] = useState(new Set());

  useEffect(() => {
    fetchCompletedReports();
  }, []);

  const fetchCompletedReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/test-requests/doctor/completed');
      setCompletedReports(response.data);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error fetching completed reports:', error);
      setError('Failed to load completed reports');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCompletedReports();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCompletedReports();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Filter and sort completed reports
  const filteredReports = completedReports
    .filter(report => {
      const matchesSearch = report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.testDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || report.status === filterStatus;
      
      let matchesDate = true;
      if (filterDate === 'today') {
        const today = new Date().toDateString();
        matchesDate = new Date(report.reportSentDate).toDateString() === today;
      } else if (filterDate === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(report.reportSentDate) >= weekAgo;
      } else if (filterDate === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = new Date(report.reportSentDate) >= monthAgo;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => new Date(b.reportSentDate) - new Date(a.reportSentDate));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Report_Sent': return 'bg-emerald-100 text-emerald-700';
      case 'feedback_sent': return 'bg-green-100 text-green-700'; // Show as completed for doctors
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Report_Sent': return <Mail className="h-4 w-4" />;
      case 'feedback_sent': return <CheckCircle className="h-4 w-4" />; // Show as completed for doctors
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDisplayStatus = (status) => {
    if (status === 'feedback_sent') {
      return 'Completed'; // Hide feedback workflow from doctors
    }
    return status.replace(/_/g, ' ');
  };

  const handleViewReport = (reportId) => {
    navigate(`/dashboard/doctor/test-request/${reportId}`);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      // Add to downloading set
      setDownloadingReports(prev => new Set(prev).add(reportId));
      setError(null);
      
      await downloadPDFReport(reportId);
      
      // Show success message (optional)
      console.log('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      setError(error.message || 'Failed to download report. Please try again.');
    } finally {
      // Remove from downloading set
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleViewReportInBrowser = async (reportId) => {
    try {
      // Add to viewing set
      setViewingReports(prev => new Set(prev).add(reportId));
      setError(null);
      
      const result = await viewPDFReport(reportId);
      
      if (result.fallback) {
        // If popup was blocked, inform user that file was downloaded instead
        console.log('Popup blocked, report downloaded instead');
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      setError(error.message || 'Failed to view report. Please try again.');
    } finally {
      // Remove from viewing set
      setViewingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/doctor')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Completed Test Reports</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-xl font-bold text-gray-900">{completedReports.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-xl font-bold text-gray-900">
                  {completedReports.filter(r => r.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sent</p>
                <p className="text-xl font-bold text-gray-900">
                  {completedReports.filter(r => r.status === 'Report_Sent').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-xl font-bold text-gray-900">
                  {completedReports.filter(r => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return new Date(r.reportSentDate) >= monthAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient name, test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Report_Sent">Report Sent</option>
              </select>
              
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              <button
                onClick={fetchCompletedReports}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Completed Test Reports</h2>
          </div>
          
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed reports found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus || filterDate 
                  ? 'Try adjusting your search criteria.' 
                  : 'Completed test reports will appear here once they are sent by the lab.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lab Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.patientName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.patientId?.phone || report.patientPhone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.testType || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.testDescription || 'No description'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {report._id}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{getDisplayStatus(report.status)}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.reportSentDate 
                          ? new Date(report.reportSentDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.reportSentByName || report.reportSentBy?.staffName || 'N/A'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewReport(report._id)}
                            className="flex items-center text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </button>
                          {isReportAvailable(report) && (
                            <>
                              <button
                                onClick={() => handleViewReportInBrowser(report._id)}
                                disabled={viewingReports.has(report._id)}
                                className="flex items-center text-purple-600 hover:text-purple-900 disabled:opacity-50"
                              >
                                {viewingReports.has(report._id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-1" />
                                ) : (
                                  <Eye className="h-4 w-4 mr-1" />
                                )}
                                View PDF
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report._id)}
                                disabled={downloadingReports.has(report._id)}
                                className="flex items-center text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                {downloadingReports.has(report._id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1" />
                                ) : (
                                  <Download className="h-4 w-4 mr-1" />
                                )}
                                Download
                              </button>
                            </>
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
      </div>
    </div>
  );
};

export default CompletedReports;