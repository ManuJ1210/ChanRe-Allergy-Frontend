import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchTestRequests, downloadTestReport } from '../../features/doctor/doctorThunks';
import { downloadPDFReport, viewPDFReport } from '../../utils/pdfHandler';
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
  TestTube,
  Mail
} from 'lucide-react';

const TestRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { testRequests, testRequestsLoading, testRequestsError } = useSelector((state) => state.doctor);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchTestRequests());
    setLastRefreshTime(new Date());
  }, [dispatch]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(fetchTestRequests());
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
      dispatch(fetchTestRequests());
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  // Filter and sort test requests
  const filteredTestRequests = testRequests
    .filter(test => {
      const matchesSearch = test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.testDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || test.status === filterStatus;
      const matchesUrgency = !filterPriority || test.urgency === filterPriority;
      return matchesSearch && matchesStatus && matchesUrgency;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'urgency':
          const urgencyOrder = { Emergency: 4, Urgent: 3, Normal: 2 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        case 'patient':
          return a.patientName?.localeCompare(b.patientName);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Assigned': return 'bg-orange-100 text-orange-700';
      case 'Sample_Collection_Scheduled': return 'bg-purple-100 text-purple-700';
      case 'Sample_Collected': return 'bg-indigo-100 text-indigo-700';
      case 'In_Lab_Testing': return 'bg-blue-100 text-blue-700';
      case 'Testing_Completed': return 'bg-teal-100 text-teal-700';
      case 'Report_Generated': return 'bg-cyan-100 text-cyan-700';
      case 'Report_Sent': return 'bg-emerald-100 text-emerald-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-100 text-red-700';
      case 'Urgent': return 'bg-orange-100 text-orange-700';
      case 'Normal': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      case 'Assigned': return <Clock className="h-4 w-4" />;
      case 'Sample_Collection_Scheduled': return <Calendar className="h-4 w-4" />;
      case 'Sample_Collected': return <CheckCircle className="h-4 w-4" />;
      case 'In_Lab_Testing': return <TestTube className="h-4 w-4" />;
      case 'Testing_Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Report_Generated': return <FileText className="h-4 w-4" />;
      case 'Report_Sent': return <Mail className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusCount = (status) => {
    switch (status) {
      case 'Pending':
        return testRequests.filter(test => test.status === 'Pending').length;
      case 'Assigned':
        return testRequests.filter(test => test.status === 'Assigned').length;
      case 'In Progress':
        return testRequests.filter(test => 
          ['Sample_Collection_Scheduled', 'Sample_Collected', 'In_Lab_Testing'].includes(test.status)
        ).length;
      case 'Completed':
        return testRequests.filter(test => 
          ['Testing_Completed', 'Report_Generated', 'Report_Sent', 'Completed', 'feedback_sent'].includes(test.status)
        ).length;
      case 'Cancelled':
        return testRequests.filter(test => test.status === 'Cancelled').length;
      default:
        return 0;
    }
  };

  const handleViewReport = async (testRequestId) => {
    try {
      await viewPDFReport(testRequestId);
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error('Failed to view report. Please try again.');
    }
  };

  const handleDownloadReport = async (testRequestId) => {
    try {
      await downloadPDFReport(testRequestId);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };

  if (testRequestsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading test requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/doctor/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
                      <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Test Requests</h1>
                <p className="text-slate-600">
                  Manage and track test requests for your patients ({testRequests.length} total)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    dispatch(fetchTestRequests());
                    setLastRefreshTime(new Date());
                  }}
                  disabled={testRequestsLoading}
                  className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 flex items-center disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${testRequestsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => navigate('/dashboard/doctor/new-test-request')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Test Request
                </button>
              </div>
            </div>
        </div>

        {/* Error Display */}
        {testRequestsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{testRequestsError}</p>
          </div>
        )}

        {/* Status Summary Cards */}


        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Sample_Collection_Scheduled">Sample Collection Scheduled</option>
              <option value="Sample_Collected">Sample Collected</option>
              <option value="In_Lab_Testing">In Lab Testing</option>
              <option value="Testing_Completed">Testing Completed</option>
              <option value="Report_Generated">Report Generated</option>
              <option value="Report_Sent">Report Sent</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Urgency Levels</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="urgency">Sort by Urgency</option>
              <option value="patient">Sort by Patient</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-slate-600">
              <FileText className="h-4 w-4 mr-2" />
              {filteredTestRequests.length} of {testRequests.length} requests
            </div>
          </div>
        </div>

        {/* Test Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          {filteredTestRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg  text-slate-600 mb-2">
                {searchTerm || filterStatus || filterPriority ? 'No test requests found' : 'No test requests'}
              </h3>
              <p className="text-slate-500">
                {searchTerm || filterStatus || filterPriority 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Test requests will appear here once you create them'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Test Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTestRequests.map((test) => (
                    <tr key={test._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className=" text-slate-800">
                              {test.patientName || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-slate-500">
                              Phone: {test.patientPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-800">
                            {test.testType || 'General Test'}
                          </div>
                          {test.testDescription && (
                            <div className="text-sm text-slate-600 mt-1">
                              {test.testDescription.length > 50 ? `${test.testDescription.substring(0, 50)}...` : test.testDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)} flex items-center`}>
                            {getStatusIcon(test.status)}
                            <span className="ml-1">{test.status}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(test.urgency)}`}>
                          {test.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-3 w-3 mr-2" />
                          {new Date(test.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Bulletproof test.patientId conversion - ensure it's always a string
                              const id = typeof test.patientId === 'object' && test.patientId !== null
                                ? test.patientId._id || test.patientId.id || String(test.patientId)
                                : String(test.patientId);
                              navigate(`/dashboard/doctor/patient/${id}`);
                            }}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Patient
                          </button>
                          {(test.status === 'Report_Generated' || test.status === 'Report_Sent' || test.status === 'Completed' || test.status === 'feedback_sent') && (
                            <>
                              <button
                                onClick={() => handleViewReport(test._id)}
                                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Report
                              </button>
                              <button
                                onClick={() => handleDownloadReport(test._id)}
                                className="flex items-center text-green-600 hover:text-green-700 font-medium"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download Report
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

export default TestRequests; 